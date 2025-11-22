import { GoogleGenAI, Type } from "@google/genai";
import { Poll, PollOption, AIPollSuggestion } from "../types";

// Initialize the client
// CRITICAL: Using process.env.API_KEY as required
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates poll ideas based on a user-provided topic.
 */
export const generatePollFromTopic = async (topic: string): Promise<AIPollSuggestion> => {
  const modelId = "gemini-2.5-flash";
  
  const response = await ai.models.generateContent({
    model: modelId,
    contents: `Create a creative and engaging poll about the topic: "${topic}". 
               Provide a clear question, a short description, and 3-5 distinct voting options.`,
    config: {
      systemInstruction: "You are an expert poll creator for a social app. You generate neutral, engaging, and clear options.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          description: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["question", "options"]
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as AIPollSuggestion;
  }
  
  throw new Error("Failed to generate poll from AI");
};

/**
 * Analyzes the results of a poll.
 */
export const analyzePollResults = async (poll: Poll): Promise<string> => {
  const modelId = "gemini-2.5-flash";
  
  // Format the data for the prompt
  const stats = poll.options.map(o => `- ${o.text}: ${o.votes} votes`).join("\n");
  const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);

  const prompt = `
    Here are the results for the poll: "${poll.question}"
    Total votes: ${totalVotes}
    
    Results Breakdown:
    ${stats}
    
    Please provide a brief, witty, and insightful analysis of these results. 
    Highlight the winner and any surprising trends. Keep it under 100 words.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
        temperature: 0.7,
    }
  });

  return response.text || "No analysis available.";
};