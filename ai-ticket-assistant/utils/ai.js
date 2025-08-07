import { createAgent, gemini } from "@inngest/agent-kit";

function heuristicAnalyze(ticket) {
  const text = `${ticket.title} ${ticket.description}`.toLowerCase();
  const highHints = ["crash", "critical", "down", "security", "data loss", "urgent", "production"];
  const lowHints = ["typo", "minor", "feature request", "css", "style"];
  let priority = "medium";
  if (highHints.some((w) => text.includes(w))) {
    priority = "high";
  }
  if (lowHints.some((w) => text.includes(w))) {
    priority = "low";
  }

  const knownSkills = [
    "react",
    "node",
    "node.js",
    "express",
    "mongodb",
    "mongoose",
    "vite",
    "tailwind",
    "auth",
    "jwt",
    "email",
    "api",
    "docker",
  ];
  const relatedSkills = Array.from(
    new Set(knownSkills.filter((s) => text.includes(s.replace(".", ""))).map((s) => s.replace(".js", ".js")))
  );
  const helpfulNotes =
    "AI service unavailable; generated using heuristic analysis. Provide logs, steps to reproduce, and expected behavior.";
  const summary = ticket.description?.slice(0, 160) || ticket.title || "Ticket";
  return { summary, priority, helpfulNotes, relatedSkills };
}

const analyzeTicket = async (ticket) => {
  if (!process.env.GEMINI_API_KEY) {
    return heuristicAnalyze(ticket);
  }

  const supportAgent = createAgent({
    model: gemini({
      model: "gemini-1.5-flash-8b",
      apiKey: process.env.GEMINI_API_KEY,
    }),
    name: "AI Ticket Triage Assistant",
    system: `You are an expert AI assistant that processes technical support tickets. 

Your job is to:
1. Summarize the issue.
2. Estimate its priority.
3. Provide helpful notes and resource links for human moderators.
4. List relevant technical skills required.

IMPORTANT:
- Respond with *only* valid raw JSON.
- Do NOT include markdown, code fences, comments, or any extra formatting.
- The format must be a raw JSON object.

Repeat: Do not wrap your output in markdown or code fences.`,
  });

  const response = await supportAgent.run(`You are a ticket triage agent. Only return a strict JSON object with no extra text, headers, or markdown.
        
Analyze the following support ticket and provide a JSON object with:

- summary: A short 1-2 sentence summary of the issue.
- priority: One of "low", "medium", or "high".
- helpfulNotes: A detailed technical explanation that a moderator can use to solve this issue. Include useful external links or resources if possible.
- relatedSkills: An array of relevant skills required to solve the issue (e.g., ["React", "MongoDB"]).

Respond ONLY in this JSON format and do not include any other text or markdown in the answer:

{
"summary": "Short summary of the ticket",
"priority": "high",
"helpfulNotes": "Here are useful tips...",
"relatedSkills": ["React", "Node.js"]
}

---

Ticket information:

- Title: ${ticket.title}
- Description: ${ticket.description}`);

  // Normalize output across agent-kit versions
  const possibleStrings = [];
  try {
    if (response?.output) {
      if (Array.isArray(response.output)) {
        for (const item of response.output) {
          if (typeof item === "string") {
            possibleStrings.push(item);
          }
          if (typeof item?.text === "string") {
            possibleStrings.push(item.text);
          }
          if (typeof item?.context === "string") {
            possibleStrings.push(item.context);
          }
          if (typeof item?.content === "string") {
            possibleStrings.push(item.content);
          }
        }
      } else if (typeof response.output === "string") {
        possibleStrings.push(response.output);
      }
    }
    if (typeof response?.text === "string") {
      possibleStrings.push(response.text);
    }
    if (typeof response?.content === "string") {
      possibleStrings.push(response.content);
    }
    if (typeof response?.outputString === "string") {
      possibleStrings.push(response.outputString);
    }

    const raw = possibleStrings.find((s) => !!s) || "";
    const match = raw.match(/```json\s*([\s\S]*?)\s*```/i);
    const jsonString = match ? match[1] : raw.trim();
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (e) {
    console.log("Failed to parse JSON from AI response: " + e.message);
    return heuristicAnalyze(ticket);
  }
};

export default analyzeTicket;
