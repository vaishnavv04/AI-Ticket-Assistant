import { inngest } from "../inngest/client.js";
import analyzeTicket from "../utils/ai.js";
import User from "../models/user.js";
import { sendMail } from "../utils/mailer.js";
import Ticket from "../models/ticket.js";

export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }
    const newTicket = await Ticket.create({
      title,
      description,
      createdBy: req.user._id.toString(),
    });

    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: newTicket._id.toString(),
        title,
        description,
        createdBy: req.user._id.toString(),
      },
    });

    // Optional direct processing without Inngest runner
    if (process.env.ENABLE_DIRECT_TICKET_PROCESSING === "true") {
      try {
        // Mark TODO while processing
        await Ticket.findByIdAndUpdate(newTicket._id, { status: "TODO" });

        const aiResponse = await analyzeTicket(newTicket);
        let relatedSkills = [];
        if (aiResponse) {
          await Ticket.findByIdAndUpdate(newTicket._id, {
            priority: ["low", "medium", "high"].includes(aiResponse.priority)
              ? aiResponse.priority
              : "medium",
            helpfulNotes: aiResponse.helpfulNotes,
            status: "IN_PROGRESS",
            relatedSkills: aiResponse.relatedSkills,
          });
          relatedSkills = aiResponse.relatedSkills || [];
        }

        let moderator = await User.findOne({
          role: "moderator",
          skills: { $elemMatch: { $regex: relatedSkills.join("|"), $options: "i" } },
        });
        if (!moderator) {
          moderator = await User.findOne({ role: "admin" });
        }
        await Ticket.findByIdAndUpdate(newTicket._id, {
          assignedTo: moderator?._id || null,
        });

        if (moderator) {
          const finalTicket = await Ticket.findById(newTicket._id);
          await sendMail(
            moderator.email,
            "Ticket Assigned",
            `A new ticket is assigned to you ${finalTicket.title}`
          );
        }
      } catch (e) {
        console.error("Direct AI processing failed:", e.message);
      }
    }
    return res.status(201).json({
      message: "Ticket created and processing started",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Error creating ticket", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTickets = async (req, res) => {
  try {
    const user = req.user;
    let tickets = [];
    if (user.role !== "user") {
      tickets = await Ticket.find({})
        .populate("assignedTo", ["email", "_id"])
        .sort({ createdAt: -1 });
    } else {
      tickets = await Ticket.find({ createdBy: user._id })
        .select("title description status createdAt")
        .sort({ createdAt: -1 });
    }
    return res.status(200).json({ tickets });
  } catch (error) {
    console.error("Error fetching tickets", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTicket = async (req, res) => {
  try {
    const user = req.user;
    let ticket;

    if (user.role !== "user") {
      ticket = await Ticket.findById(req.params.id).populate("assignedTo", [
        "email",
        "_id",
      ]);
    } else {
      ticket = await Ticket.findOne({
        createdBy: user._id,
        _id: req.params.id,
      }).select("title description status createdAt");
    }

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    return res.status(200).json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const user = req.user;
    if (user.role === "user") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    const { status, priority, helpfulNotes, assignedTo } = req.body;

    const update = {};
    if (typeof status === "string") update.status = status;
    if (typeof priority === "string") update.priority = priority;
    if (typeof helpfulNotes === "string") update.helpfulNotes = helpfulNotes;
    if (assignedTo === null || typeof assignedTo === "string")
      update.assignedTo = assignedTo;

    const ticket = await Ticket.findByIdAndUpdate(id, update, { new: true })
      .populate("assignedTo", ["email", "_id"]);

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    return res.json({ ticket });
  } catch (error) {
    console.error("Error updating ticket", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
