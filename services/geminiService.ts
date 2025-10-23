
import { GoogleGenAI, Modality } from "@google/genai";
import { SPEECH_TYPES } from '../constants';

export const generateSpeech = async (text: string, voiceName: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
      },
    },
  });
  
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("No audio data returned from API.");
  }
  return base64Audio;
};


export const detectSpeechType = async (text: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const speechTypeOptions = SPEECH_TYPES.map(t => t.id).join(', ');
    const prompt = `Analyze the following text and classify its most likely speech type. Choose only from these options: ${speechTypeOptions}. Return only the single ID for the chosen type, for example: 'narration'.

Text: "${text}"`;

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const detectedType = response.text.trim();
        
        if (SPEECH_TYPES.some(t => t.id === detectedType)) {
            return detectedType;
        }
        return SPEECH_TYPES[0].id; // fallback to default
    } catch (error) {
        console.error("Error detecting speech type:", error);
        return SPEECH_TYPES[0].id; // fallback to default on error
    }
};
