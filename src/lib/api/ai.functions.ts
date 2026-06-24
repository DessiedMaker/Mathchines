import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getAIExplanation = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      topicTitle: z.string(),
      difficulty: z.string(),
      prompt: z.string(),
      choices: z.array(z.string()),
      answerIndex: z.number(),
      chosenIndex: z.number(),
      gradeLabel: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not configured.");
      return {
        explanation:
          "Our AI Tutor is currently offline as the API key is not configured. But remember, practicing step-by-step is the key to mastering math! Try reviewing the worked examples on the lesson page.",
      };
    }

    const systemPrompt = `You are a supportive, encouraging, and expert AI math tutor for middle and high school students. 
A student is learning "${data.topicTitle}" at a "${data.difficulty}" level.
The student is in grade "${data.gradeLabel}".

Here is the question they just answered:
Question: ${data.prompt}
Choices:
${data.choices.map((c, i) => `${i}: ${c}`).join("\n")}

Correct Answer: Choice ${data.answerIndex} ("${data.choices[data.answerIndex]}")
The student chose: Choice ${data.chosenIndex} ("${data.choices[data.chosenIndex]}")

Please explain step-by-step why the correct answer is correct and, if the student got it wrong, gently explain why their choice was incorrect.
Keep the explanation:
- Very supportive, encouraging, and positive.
- Easy to understand for a ${data.gradeLabel} student.
- Concise (about 1 to 2 short paragraphs).
- Break down the steps clearly. Keep markdown simple.`;

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
              maxOutputTokens: 500,
              temperature: 0.7,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const json = (await response.json()) as any;
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("Invalid response format from Gemini API");
      }

      return { explanation: text.trim() };
    } catch (error) {
      console.error("Failed to generate AI explanation:", error);
      return {
        explanation:
          "Oops! We had a small issue connecting to the AI Tutor. Please review the worked examples in the lesson or try another question!",
      };
    }
  });
