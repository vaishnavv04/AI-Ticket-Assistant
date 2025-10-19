import { inngest } from "../inngest/client.js";
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
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const status = req.query.status?.trim();
    const search = req.query.search?.trim();

    const filter = {};
    if (user.role === "user") {
      filter.createdBy = user._id;
    }

    if (status && status.toLowerCase() !== "all") {
      filter.status = status.toUpperCase();
    }

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ title: regex }, { description: regex }];
    }

    const total = await Ticket.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;

    let query = Ticket.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (user.role !== "user") {
      query = query.populate("assignedTo", ["email", "_id"]);
    } else {
      query = query.select("title description status createdAt");
    }

    const tickets = await query;

    return res.status(200).json({
      tickets,
      page: safePage,
      totalPages,
      total,
      pageSize: limit,
    });
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

export const deleteTicket = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    await ticket.deleteOne();
    return res.json({ message: "Ticket deleted" });
  } catch (error) {
    console.error("Error deleting ticket", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteTicketsBulk = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    const normalizedIds = [...new Set(ids.filter((id) => typeof id === "string" && id.trim()))];

    if (normalizedIds.length === 0) {
      return res.status(400).json({ message: "No ticket IDs provided" });
    }

    const result = await Ticket.deleteMany({ _id: { $in: normalizedIds } });
    const deletedCount = result?.deletedCount || 0;

    return res.json({
      message: `Deleted ${deletedCount} ticket${deletedCount === 1 ? "" : "s"}`,
      deletedCount,
    });
  } catch (error) {
    console.error("Error deleting tickets", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
