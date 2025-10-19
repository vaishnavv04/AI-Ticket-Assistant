import { createAgent, gemini } from "@inngest/agent-kit";
import Groq from "groq-sdk";

const SYSTEM_PROMPT = `You are an expert AI assistant that processes technical support tickets. 

Your job is to:
1. Summarize the issue.
2. Estimate its priority.
3. Provide helpful notes and resource links for human moderators.
4. List relevant technical skills required.

IMPORTANT:
- Respond with *only* valid raw JSON.
- Do NOT include markdown, code fences, comments, or any extra formatting.
- The format must be a raw JSON object.

Repeat: Do not wrap your output in markdown or code fences.`;

const buildUserPrompt = (ticket) => {
  return `You are a ticket triage agent. Only return a strict JSON object with no extra text, headers, or markdown.
        
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
- Description: ${ticket.description}`;
};

const analyzeTicket = async (ticket) => {
  if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
    throw new Error("Either GEMINI_API_KEY or GROQ_API_KEY is required for ticket analysis");
  }

  const userPrompt = buildUserPrompt(ticket);
  let response;
  let lastError;

  // Try Gemini first if API key is available
  if (process.env.GEMINI_API_KEY) {
    try {
      const geminiAgent = createAgent({
        model: gemini({
          model: "gemini-2.5-flash",
          apiKey: process.env.GEMINI_API_KEY,
        }),
        name: "AI Ticket Triage Assistant",
        system: SYSTEM_PROMPT,
      });

      response = await geminiAgent.run(userPrompt);
      console.log("✓ Successfully used Gemini API");
    } catch (error) {
      const status = error?.response?.status || error?.status;
      const message = error?.response?.data?.error?.message || error?.message || "Unknown Gemini error";
      lastError = { provider: "Gemini", status, message };
      console.log(`✗ Gemini failed (${status}): ${message}`);
    }
  }

  // Fallback to Groq if Gemini failed or wasn't available
  if (!response && process.env.GROQ_API_KEY) {
    try {
      const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 1024,
      });

      response = {
        output: chatCompletion.choices[0]?.message?.content || "",
      };
      console.log("✓ Successfully used Groq API (fallback)");
    } catch (error) {
      const status = error?.response?.status || error?.status;
      const message = error?.response?.data?.error?.message || error?.message || "Unknown Groq error";
      
      if (lastError) {
        throw new Error(`Both AI providers failed. Gemini: ${lastError.message}. Groq: ${message}`);
      }
      throw new Error(`Groq request failed: ${message}`);
    }
  }

  if (!response) {
    if (lastError) {
      throw new Error(`AI request failed (${lastError.provider}): ${lastError.message}`);
    }
    throw new Error("No AI provider available");
  }

  // Normalize output across agent-kit versions
  const possibleStrings = [];
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

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error("Failed to parse JSON from Gemini response");
  }
};

export default analyzeTicket;
