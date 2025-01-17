import { NextResponse } from 'next/server';
import OpenAI from 'openai';

type ImageSize = '1024x1024' | '1024x1792' | '1792x1024';

// Define custom parameters interface for Together API
interface TogetherImageGenerateParams {
  model: string;
  prompt: string;
  negative_prompt?: string;
  n?: number;
  size?: string;
  num_inference_steps?: number;
  guidance_scale?: number;
  seed?: number;
  max_sequence_length?: number;
  num_images_per_prompt?: number;
  response_format?: string;
}

// Initialize the OpenAI client with Together's configuration
const client = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: "https://api.together.xyz/v1",
}) as OpenAI & {
  images: {
    generate: (params: TogetherImageGenerateParams) => Promise<{
      data: Array<{ url: string }>;
    }>;
  }
};

// Helper function for better prompt formatting
const formatEnhancedPrompt = (
  mainPrompt: string,
  size: ImageSize,
  style?: string
): { prompt: string; negative_prompt: string } => {
  // T-shirt design focused prompt
  const enhancedPrompt = `
    ${mainPrompt},
    vector art, clean lines, simple shapes, bold colors, high contrast,
    white background, isolated elements, print-ready, scalable graphics,
    professional t-shirt design, commercial use, no background,
    high resolution, 300dpi, CMYK color mode, ready for screen printing,
    modern graphic design, professional quality, clean and crisp lines
  `.trim();

  // Negative prompt for t-shirt designs
  const enhancedNegativePrompt = `
    photorealistic, hyperrealistic, 3D render, complex shading,
    detailed textures, intricate details, realistic lighting,
    natural background, environmental elements, photographic style,
    depth of field, bokeh effect, camera artifacts, lens flare,
    film grain, noise, blur, soft focus, vignetting,
    complex patterns, busy backgrounds, cluttered composition,
    low contrast, muted colors, gradient backgrounds,
    transparent elements, semi-transparent elements,
    watermarks, signatures, text, logos, copyright symbols
  `.trim();

  return {
    prompt: enhancedPrompt,
    negative_prompt: enhancedNegativePrompt
  };
};

export async function POST(request: Request) {
  try {
    const { prompt, model = 'black-forest-labs/FLUX.1-schnell-Free', size = '1200x1200', style = 'photo-realism' } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const { prompt: enhancedPrompt, negative_prompt } = formatEnhancedPrompt(prompt, size as ImageSize, style);

    // Use the OpenAI client to generate image with improved parameters
    const response = await client.images.generate({
      model: model,
      prompt: enhancedPrompt,
      negative_prompt: negative_prompt,
      n: 1,
      size: size,
      num_inference_steps: 30,
      guidance_scale: 7.5,
      seed: Math.floor(Math.random() * 2147483647),
      max_sequence_length: 256,
      num_images_per_prompt: 1,
      response_format: 'url',
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('No image generated');
    }

    return NextResponse.json({
      success: true,
      data: [{
        url: response.data[0].url
      }]
    });

  } catch (error: any) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to generate image'
      },
      { status: 500 }
    );
  }
} 