
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
- 回复简洁但有深度，一次回复只提供一个建议
- 适当使用可爱的表情符号（如 ✨💕🌸）
- 像朋友一样亲切地交流，不要使用列表或机械的结构化回复
- 倾听用户的情感需求，给予支持和建议`;

  const finalSystemPrompt = systemPrompt || defaultSystemPrompt;

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

  // API 配置 - 优先使用硅基流动（国内可直接访问），备用 OpenRouter
  const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY || '';
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

  // 尝试使用硅基流动 API（国内可访问）
  if (SILICONFLOW_API_KEY) {
    try {
      console.log('Sending request to SiliconFlow (China accessible)...', {
        model: 'deepseek-ai/DeepSeek-V3',  // DeepSeek V3 高性能模型
        messageCount: openaiMessages.length
      });

      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SILICONFLOW_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-ai/DeepSeek-V3',  // DeepSeek V3 高性能模型
          messages: openaiMessages,
          temperature: 0.8,
          max_tokens: 500
        })
      });

      console.log('SiliconFlow response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('SiliconFlow response data:', data);
        const aiResponse = data.choices?.[0]?.message?.content || "对不起，我现在有点走神。";
        return { text: aiResponse };
      } else {
        console.error('SiliconFlow API Error:', response.status, await response.text());
        // 继续尝试 OpenRouter
      }
    } catch (error) {
      console.error("SiliconFlow Error:", error);
      // 继续尝试 OpenRouter
    }
  }

  // 备用：使用 OpenRouter API（需要科学上网）
  if (OPENROUTER_API_KEY) {
    try {
      const referer = typeof window !== 'undefined' ? window.location.origin : 'https://xinyu-companion.vercel.app';

      console.log('Falling back to OpenRouter...', {
        model: 'google/gemini-2.0-flash-exp:free',
        messageCount: openaiMessages.length,
        referer
      });

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': referer,
          'X-Title': 'Xinyu AI Companion'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-exp:free',
          messages: openaiMessages,
          temperature: 0.8,
          max_tokens: 500
        })
      });

      console.log('OpenRouter response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('OpenRouter response data:', data);
        const aiResponse = data.choices?.[0]?.message?.content || "对不起，我现在有点走神。";
        return { text: aiResponse };
      } else {
        const errorText = await response.text();
        console.error('OpenRouter API Error:', response.status, errorText);
      }
    } catch (error) {
      console.error("OpenRouter Error:", error);
    }
  }

  // 所有 API 都失败时的回退响应
  console.error("All AI APIs failed. No valid API key configured.");
  return { text: "抱歉，由于连接问题，我暂时无法回应。请检查网络连接或稍后再试~ 💕" };
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
