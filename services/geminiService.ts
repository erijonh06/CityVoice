import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface AnalysisResult {
  title: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  summary: string;
}

export const analyzeReport = async (description: string, imageBase64?: string): Promise<AnalysisResult> => {
  try {
    const parts: any[] = [{ text: `Analyze this civic issue report for the CityVoice platform. Description: "${description}".` }];

    if (imageBase64) {
      // Remove data URL prefix if present
      const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        systemInstruction: "You are a helpful civic assistant for 'CityVoice'. Analyze the user's report about a city issue. Extract a short title, categorize it, assign a priority based on urgency, and provide a polite 1-sentence summary for the admin.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A short, punchy title for the report (max 5 words)" },
            category: { type: Type.STRING, description: "One of: Infrastructure, Cleanliness, Safety, Noise, Other" },
            priority: { type: Type.STRING, enum: ["Low", "Medium", "High"], description: "Urgency level" },
            summary: { type: Type.STRING, description: "A one sentence summary of the issue." }
          },
          required: ["title", "category", "priority", "summary"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    // Fallback if AI fails
    return {
      title: "New Report",
      category: "Other",
      priority: "Medium",
      summary: description.substring(0, 50) + "..."
    };
  }
};

export const generateAdminSummary = async (reports: any[]): Promise<string> => {
  try {
    const reportsText = reports.map(r => `- ${r.category}: ${r.title} (${r.status})`).join('\n');
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a brief, encouraging weekly summary for the City Mayor based on these reports on the CityVoice platform:\n${reportsText}`,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for simple summary
      }
    });
    
    return response.text || "Summary unavailable.";
  } catch (e) {
    return "Could not generate summary at this time.";
  }
};

// Chat Functionality for Civic Assistant using recommended Gemini 3 model
export const chatWithCivicBuddy = async (history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are 'CityVoice AI', a friendly and knowledgeable assistant for city residents. You help with questions about city services, reporting issues, and general civic engagement. Keep answers concise, polite, and emoji-friendly. If asked about emergency situations, advise calling 911 immediately.",
      },
      history: history
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I'm having trouble thinking right now. Try again?";
  } catch (error) {
    console.error("Chat error:", error);
    return "Oops! My connection to the city grid is a bit fuzzy. Please try again later.";
  }
};