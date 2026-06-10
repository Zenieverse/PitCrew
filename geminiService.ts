
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SprintStats, EngineerInsight, ImageSize, AspectRatio, RovoActionType } from "./types.js";

const handleApiError = (error: any) => {
  console.error("Gemini API Error:", error);
  const errorMessage = error?.message || "";
  if (errorMessage.includes("403") || errorMessage.toLowerCase().includes("permission")) {
    throw new Error("ACCESS_DENIED: Selected key lacks permissions. Enable billing at ai.google.dev/gemini-api/docs/billing.");
  }
  if (errorMessage.includes("Requested entity was not found")) {
    throw new Error("KEY_RESET_REQUIRED: Key no longer valid. Re-authenticate in Mission Control.");
  }
  throw error;
};

/**
 * ROVO AGENT: race-engineer
 * Purpose: Analyze Jira sprint health and guide the team like an F1 race engineer.
 */
export const getRaceEngineerInsight = async (sprint: SprintStats): Promise<EngineerInsight> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Extracting workload and transitions for context
    const workload = sprint.issues.reduce((acc: any, issue) => {
      acc[issue.assignee] = (acc[issue.assignee] || 0) + issue.storyPoints;
      return acc;
    }, {});

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are the ROVO AGENT: race-engineer. 
      Analyze the following Jira sprint telemetry:
      Sprint Name: ${sprint.name}
      Active Issues: ${sprint.issues.length}
      Points Completed: ${sprint.completedPoints} / ${sprint.totalPoints}
      Days Remaining: ${sprint.remainingDays}
      Workload per Driver: ${JSON.stringify(workload)}
      
      BEHAVIOR:
      1. Summarize sprint status in < 120 words.
      2. Identify top 3 risks (track hazards).
      3. Recommend actionable steps (tactical adjustments).
      4. Use professional F1 racing metaphors.
      
      DATA: ${JSON.stringify(sprint.issues)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Sprint status summary, under 120 words." },
            risks: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "Exactly top 3 risks/hazards." 
            },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "List of actionable steps." 
            }
          },
          required: ["summary", "risks", "recommendations"]
        }
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (e) { 
    return { 
      summary: "Radio static. Telemetry link degraded. Please check your connection to the pit wall.", 
      risks: ["Signal loss in Sector 2", "Intermittent telemetry data", "Communication blackout"], 
      recommendations: ["Attempt neural link re-sync", "Manual status check required"] 
    }; 
  }
};

/**
 * ROVO ACTIONS: Execute tactical adjustments
 */
export const executeRovoAction = async (action: RovoActionType, params: any): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const actionPrompts = {
      pit_reassign_issue: `Reassign issue ${params.issueId} to driver ${params.assignee} to optimize workload balance.`,
      adjust_priority: `Change priority of ${params.issueId} to ${params.priority} to manage track position.`,
      create_escalation_ticket: `Create a linked escalation ticket for ${params.parentId} due to critical engine failure.`,
      update_race_log: `Writing sprint summary to the Confluence race log archive: ${params.summary}`
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform Rovo Action: ${action}. Context: ${actionPrompts[action] || 'Generic adjustment'}. 
      Provide a high-energy, authoritative F1 race engineer confirmation message (max 15 words).`,
    });
    return response.text || "Action confirmed. Push now.";
  } catch (e) { return handleApiError(e); }
};

export const checkApiPermissions = async () => {
  const start = Date.now();
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "ping",
      config: { maxOutputTokens: 1, thinkingConfig: { thinkingBudget: 0 } }
    });
    return { proAccess: true, billingActive: true, latency: Date.now() - start };
  } catch (e: any) {
    const isBillingError = e.message?.toLowerCase().includes('billing');
    return { proAccess: false, billingActive: !isBillingError, latency: Date.now() - start };
  }
};

export const getTechnicalDirectorInsight = async (context: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Act as an F1 Technical Director. Analyze this code/log failure for root cause and provide a tactical, high-performance fix: "${context}"`,
      config: { 
        thinkingConfig: { thinkingBudget: 32768 } 
      }
    });
    return response.text || "Telemetry severed. Could not synthesize a fix.";
  } catch (e) { return handleApiError(e); }
};

export const getLaunchBriefing = async (sprint: SprintStats): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Lead Race Strategist briefing for sprint "${sprint.name}". Points Target: ${sprint.totalPoints}. Current completion: ${sprint.completedPoints}. Laps remaining: ${sprint.remainingDays} days. Deliver an intense, tactical 2-sentence briefing for a Grand Prix start.`,
    });
    return response.text || "Lights out. Focus on Sector 1.";
  } catch (e) { return handleApiError(e); }
};

export const strategyChat = async (message: string, useSearch = false, useMaps = false, useThinking = false, location?: { latitude: number; longitude: number }) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let model = 'gemini-3-flash-preview';
    const tools: any[] = [];
    
    if (useSearch) tools.push({ googleSearch: {} });
    if (useMaps) {
      tools.push({ googleMaps: {} });
      model = 'gemini-2.5-flash'; 
    } else if (useThinking) {
      model = 'gemini-3-pro-preview';
    }

    const config: any = { 
      tools: tools.length > 0 ? tools : undefined,
      thinkingConfig: (useThinking && model.includes('pro')) ? { thinkingBudget: 32768 } : undefined
    };
    
    if (useMaps && location) {
      config.toolConfig = { 
        retrievalConfig: { 
          latLng: { latitude: location.latitude, longitude: location.longitude } 
        } 
      };
    }

    const response = await ai.models.generateContent({
      model,
      contents: message,
      config
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => {
      if (c.web) return { title: c.web.title, uri: c.web.uri };
      if (c.maps) return { title: c.maps.title, uri: c.maps.uri };
      return null;
    }).filter(Boolean);

    return { text: response.text, sources };
  } catch (e) { return handleApiError(e); }
};

export const generateImage = async (prompt: string, size: ImageSize, ratio: AspectRatio) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: `Photorealistic Formula 1 style high-performance visualization of: ${prompt}` }] },
      config: { imageConfig: { imageSize: size as any, aspectRatio: ratio as any } }
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) { return handleApiError(e); }
};

export const generateVideo = async (prompt: string, ratio: '16:9' | '9:16', imageBytes?: string, imageMimeType?: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let op = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Cinematic high-speed F1 racing footage: ${prompt}`,
      image: imageBytes ? { imageBytes, mimeType: imageMimeType || 'image/png' } : undefined,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: ratio }
    });
    while (!op.done) {
      await new Promise(r => setTimeout(r, 10000));
      op = await ai.operations.getVideosOperation({ operation: op });
    }
    const downloadUri = op.response?.generatedVideos?.[0]?.video?.uri;
    const res = await fetch(`${downloadUri}&key=${process.env.API_KEY}`);
    return URL.createObjectURL(await res.blob());
  } catch (e) { return handleApiError(e); }
};

export const speakInsight = async (text: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say with tactical F1 race engineer urgency: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
      },
    });
    const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    }
  } catch (e) { console.error("Radio Comms Failure", e); }
};

export const generateCodeTests = async (code: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Construct a robust Jest test circuit for this high-performance code: \n\n${code}`,
      config: { thinkingConfig: { thinkingBudget: 16384 } }
    });
    return response.text || "// Engineering failed to synthesize test suite.";
  } catch (e) { return handleApiError(e); }
};
