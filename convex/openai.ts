import { action } from "./_generated/server";
import { v } from "convex/values";

import OpenAI from "openai";
import { SpeechCreateParams } from "openai/resources/audio/speech.mjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const generateAudioAction = action({
  args: { input: v.string(), voice: v.string() },
  handler: async (_, { voice, input }) => {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice as SpeechCreateParams['voice'],
      input,
    });

    const buffer = await mp3.arrayBuffer();

    return buffer;
  },
});

export const generateThumbnailAction = action({
  args: { prompt: v.string() },
  handler: async (_, { prompt }) => {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      size: '1024x1024',
      quality: 'standard',
      n: 1,
    })

    const url = response.data[0].url;

    if (!url) {
      throw new Error('Error generating thumbnail');
    }

    const imageResponse = await fetch(url);
    const buffer = await imageResponse.arrayBuffer();
    return buffer;
  }
})

export const generateScriptAction = action({
  args: {
    keywords: v.string(),
    template: v.optional(v.string()),
    language: v.optional(v.string()),
    minutes: v.optional(v.number()),
  },
  handler: async (_, { keywords, template, language, minutes }) => {
    const system = `You are a podcast script writer. Write a clear, engaging script suitable for text-to-speech.`;
    const tpl = template || 'Explainer';
    const lang = language || 'English';
    const dur = minutes && minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : '2-4 minutes';
    const userPrompt = `Generate a ${tpl} style podcast script in ${lang} based on these keywords: ${keywords}.
Target length: about ${dur} of spoken audio.
Include an intro hook, 2-3 key points with smooth transitions, and a short outro. Avoid SSML unless necessary.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    });

    const content = completion.choices?.[0]?.message?.content || '';
    return content;
  }
});

export const generateThumbnailPromptAction = action({
  args: {
    script: v.string(),
    title: v.optional(v.string()),
    keywords: v.optional(v.string()),
  },
  handler: async (_, { script, title, keywords }) => {
    const system = `You craft concise, vivid image prompts for podcast thumbnails. You extract key visual elements and style cues from the script, avoid text-in-image, and return a single prompt line suitable for image generation.`;
    const user = `Title: ${title || 'Podcast'}\nKeywords: ${keywords || ''}\nScript:\n${script}\n\nReturn ONE concise prompt describing: main subject, setting, mood, color palette, and 2-3 key visual elements derived from the content. Prefer cinematic, high-contrast, modern flat illustration or photorealistic depending on context. Do NOT include words or typography in the image.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const prompt = completion.choices?.[0]?.message?.content?.trim() || '';
    return prompt;
  }
});