
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SprintStats, EngineerInsight, ImageSize, AspectRatio } from "./types";

// Helper for multimodal analysis
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

/**
 * TECHNICAL DIRECTOR INSIGHT (Rovo Dev specialized)
 * Task: Complex coding/logic analysis.
 * Model: gemini-3-pro-preview with thinkingBudget.
 */
export const getTechnicalDirectorInsight = async (context: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Act as an F1 Technical Director analyzing a technical failure or code logic.
    Context: "${context}"
    
    Provide a detailed Root Cause Analysis (RCA) and a tactical recommendation.
    Use terms like 'aerodynamic drag' for tech debt and 'engine mapping' for logic flow.
    Be precise and technical.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { 
      thinkingConfig: { thinkingBudget: 32768 } // Max reasoning for technical tasks
    }
  });

  return response.text || "Telemetry link severed. No diagnosis available.";
};

/**
 * TEST CIRCUIT GENERATION (Rovo Dev specialized)
 * Task: Code generation.
 * Model: gemini-3-pro-preview.
 */
export const generateCodeTests = async (code: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Generate a comprehensive unit test suite (test circuit) for the following code:
    \`\`\`
    ${code}
    \`\`\`
    Focus on corner-case handling and performance reliability.
    Output in a standard test format (Jest/Vitest).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt
  });

  return response.text || "// Failed to generate test circuit.";
};

/**
 * RACE ENGINEER INSIGHT
 * Task: Summarization/Planning.
 * Model: gemini-3-flash-preview.
 */
export const getRaceEngineerInsight = async (sprint: SprintStats): Promise<EngineerInsight> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Analyze this Jira Sprint telemetry and provide tactical race engineer feedback.
    Sprint: ${sprint.name}
    Issues: ${JSON.stringify(sprint.issues)}
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
            risks: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["summary", "risks", "recommendations"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { summary: "Radio static.", risks: [], recommendations: [] };
  }
};

/**
 * STRATEGY CHAT
 * Model: gemini-3-flash-preview or gemini-3-pro-preview if thinking is enabled.
 */
export const strategyChat = async (message: string, useSearch = false, useMaps = false, useThinking = false) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const tools: any[] = [];
  if (useSearch) tools.push({ googleSearch: {} });
  if (useMaps) tools.push({ googleMaps: {} });
  
  const config: any = { tools: tools.length > 0 ? tools : undefined };
  if (useThinking) config.thinkingConfig = { thinkingBudget: 32768 };

  const model = useThinking ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

  const response = await ai.models.generateContent({
    model: model,
    contents: message,
    config
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => {
    if (chunk.web) return { title: chunk.web.title, uri: chunk.web.uri };
    if (chunk.maps) return { title: chunk.maps.title, uri: chunk.maps.uri };
    return null;
  }).filter(Boolean);

  return { text: response.text, sources };
};

/**
 * IMAGE GENERATION
 */
export const generateImage = async (prompt: string, size: ImageSize, ratio: AspectRatio) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { imageSize: size as any, aspectRatio: ratio as any } }
  });
  const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return imagePart?.inlineData?.data ? `data:image/png;base64,${imagePart.inlineData.data}` : null;
};

/**
 * IMAGE EDITING
 */
export const editImage = async (base64: string, prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64, mimeType: 'image/png' } },
        { text: prompt },
      ],
    },
  });
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part?.inlineData?.data ? `data:image/png;base64,${part.inlineData.data}` : null;
};

/**
 * MEDIA ANALYSIS
 */
export const analyzeMedia = async (file: File, prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const part = await fileToGenerativePart(file);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [part, { text: prompt }] },
  });
  return response.text || "Telemetry analysis failed.";
};

/**
 * AUDIO TRANSCRIPTION
 */
export const transcribeAudio = async (file: File) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const part = await fileToGenerativePart(file);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [part, { text: "Provide a precise transcription of this audio. Retain technical jargon." }] },
  });
  return response.text || "Transcription failed.";
};

/**
 * VIDEO GENERATION (Supports optional starting image)
 */
export const generateVideo = async (prompt: string, ratio: '16:9' | '9:16', imageBytes?: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    image: imageBytes ? { imageBytes, mimeType: 'image/png' } : undefined,
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: ratio }
  });
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

/**
 * SPEECH GENERATION
 */
export const speakInsight = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
    },
  });
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const binary = atob(base64Audio);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const buffer = await decodeAudioData(bytes, audioCtx, 24000, 1);
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();
  }
};

/**
 * AUDIO DECODING HELPER
 */
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}
