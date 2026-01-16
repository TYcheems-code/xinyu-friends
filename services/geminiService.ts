
import { GoogleGenAI, Modality } from "@google/genai";

/**
 * Manual base64 decoding helper as per guidelines.
 */
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * PCM audio decoding helper as per guidelines.
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generateImage = async (prompt: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    // Using gemini-2.5-flash-image for generation as per instruction for General Image Generation
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Asset Generation Error:", error);
  }
  return null;
};

export const sendMessageToAI = async (
  consultantName: string,
  history: { role: string; parts: { text: string }[] }[],
  userMessage: string,
  consultantDescription: string,
  systemPrompt?: string
) => {
  // 使用 OpenRouter API
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';

  // Logic to detect if user wants an image (保留图片生成功能，使用 Gemini)
  const imageTriggers = ['画', '图片', '看', '绘', 'draw', 'image', 'picture', 'show me'];
  const wantsImage = imageTriggers.some(trigger => userMessage.toLowerCase().includes(trigger));

  if (wantsImage) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: `You are ${consultantName}. The user asked: "${userMessage}". Generate a peaceful, healing, and beautiful image that matches the emotional tone of our conversation. Style: Anime/Soft Digital Art.` }
          ]
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return {
            image: `data:image/png;base64,${part.inlineData.data}`,
            text: "为你准备了一张特别的画，希望能给你带来好心情。✨"
          };
        }
      }
    } catch (error) {
      console.error("Image generation error:", error);
      // 图片生成失败时，继续使用文本回复
    }
  }

  // 构建系统提示词：优先使用传入的 systemPrompt，否则使用默认模板
  const defaultSystemPrompt = `你是${consultantName}，一位专业的 AI 情感咨询师。
角色设定：${consultantDescription}

重要指南：
- 始终使用中文回复
- 保持温暖、共情、专业的态度
- 回复简洁但有深度，通常2-4句话
- 适当使用可爱的表情符号（如 ✨💕🌸）
- 像朋友一样亲切地交流，而不是机械地回应
- 倾听用户的情感需求，给予支持和建议`;

  const finalSystemPrompt = systemPrompt || defaultSystemPrompt;

  // 使用 OpenRouter API 进行文本对话
  try {
    // 将历史消息转换为 OpenAI 格式
    const openaiMessages = [
      {
        role: 'system' as const,
        content: finalSystemPrompt
      },
      ...history.map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.parts[0]?.text || ''
      })),
      {
        role: 'user' as const,
        content: userMessage
      }
    ];

    console.log('Sending request to OpenRouter...', { model: 'openai/gpt-oss-120b', messageCount: openaiMessages.length });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'Xinyu AI Companion'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: openaiMessages,
        temperature: 0.8,
        max_tokens: 500
      })
    });

    console.log('OpenRouter response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API Error:', response.status, errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenRouter response data:', data);
    const aiResponse = data.choices?.[0]?.message?.content || "对不起，我现在有点走神。";

    return { text: aiResponse };
  } catch (error) {
    console.error("OpenRouter Error:", error);
    return { text: "抱歉，由于连接问题，我暂时无法回应。请稍后再试~ 💕" };
  }
};

export const speakMessage = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    }
  } catch (error) {
    console.error("TTS Error:", error);
  }
  return null;
};
