
import { GoogleGenAI, Type } from "@google/genai";
import { SprintStats, EngineerInsight } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getRaceEngineerInsight = async (sprint: SprintStats): Promise<EngineerInsight> => {
  const prompt = `
    Act as an F1 Race Engineer analyzing a Jira Sprint. 
    Sprint Name: ${sprint.name}
    Total Points: ${sprint.totalPoints}
    Completed: ${sprint.completedPoints}
    Remaining Days: ${sprint.remainingDays}
    Issues: ${JSON.stringify(sprint.issues)}

    Analyze sprint health and guide the team.
    - Behavior: Summarize status in < 120 words.
    - Identify top 3 risks.
    - Recommend actionable steps.
    - Style: Use racing metaphors (pit stops, tire wear, DRS, yellow flags) lightly but professionally.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            risks: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["summary", "risks", "recommendations"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Race Engineer failed to respond:", error);
    return {
      summary: "Communication breakdown on the radio. Stand by for telemetry restoration.",
      risks: ["Sector 1 (Database) issues", "Fuel load (Backlog) too heavy", "Tire degradation (Developer burnout)"],
      recommendations: ["Box this lap for planning", "Activate DRS on critical tasks", "Monitor track limits (Scope creep)"]
    };
  }
};
