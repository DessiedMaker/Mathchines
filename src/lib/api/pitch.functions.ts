import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import * as fs from "node:fs";
import * as path from "node:path";
import { parseMarkdownToDecks } from "../pitchParser";

export const getDecks = createServerFn({ method: "GET" }).handler(async () => {
  try {
    let filePath = path.resolve(process.cwd(), "PITCH.md");
    if (!fs.existsSync(filePath)) {
      filePath = path.resolve(process.cwd(), "PITCH_DECK.md");
    }
    if (!fs.existsSync(filePath)) {
      console.error(`Neither PITCH.md nor PITCH_DECK.md found`);
      throw new Error("Pitch deck markdown file not found");
    }

    const markdown = fs.readFileSync(filePath, "utf-8");
    const decks = parseMarkdownToDecks(markdown);
    return decks;
  } catch (error) {
    console.error("Failed to read or parse pitch decks:", error);
    throw new Error("Failed to load pitch decks from disk");
  }
});

export const generateDeckFromDocument = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: { documentText: string } }) => {
    const documentText = data?.documentText;
    if (!documentText || typeof documentText !== "string" || documentText.length < 10) {
      throw new Error("Document must be at least 10 characters long");
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not configured.");
      throw new Error("GEMINI_API_KEY is not configured on the server.");
    }

    const systemPrompt = `You are a professional presentation designer and content writer. 
Your task is to take the provided document text and convert it into a structured, high-impact slide deck.
Format the output strictly as a Marp-compatible Markdown presentation.

Markdown Rules:
- Separate each slide with a line containing exactly "---" (surrounded by empty lines).
- Use slide styling comments at the beginning of slides if appropriate, e.g.:
  <!-- bg: #0b1329 -->
  <!-- color: #ffffff -->
- The first slide should be a Title slide.
- For each slide, define:
  1. A title using "# Title"
  2. A subtitle using "### Subtitle" (optional but recommended)
  3. Key points using list items "- Point" or a Markdown table if comparing items.
  4. Speaker / Presenter Notes at the end of the slide, prefixed with "> ", e.g.:
     > Welcome everyone. Today we are discussing...
- Keep the number of slides between 5 and 10 depending on content length.
- Make the slides visually cohesive. Keep the content clear, concise, and professional.
- Do NOT output any markdown code blocks wrapping the whole response. Output the RAW markdown text directly.

Document Text to convert:
"""
${data.documentText}
"""`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: systemPrompt }],
              },
            ],
            generationConfig: {
              maxOutputTokens: 2500,
              temperature: 0.7,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const json = (await response.json()) as any;
      let text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("Invalid response format from Gemini API");
      }

      // Clean up markdown block wraps if Gemini wrapped it despite prompt
      text = text.trim();
      if (text.startsWith("```markdown")) {
        text = text.replace(/^```markdown\n/, "").replace(/\n```$/, "");
      } else if (text.startsWith("```")) {
        text = text.replace(/^```\n/, "").replace(/\n```$/, "");
      }

      return { markdown: text.trim() };
    } catch (error) {
      console.error("Failed to generate AI pitch deck:", error);
      throw new Error("AI deck generation failed. Please try again.");
    }
  });
