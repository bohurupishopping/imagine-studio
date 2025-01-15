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
  // Add composition guidance based on aspect ratio
  let compositionGuide = '';
  switch(size) {
    case '1024x1792':
      compositionGuide = 'vertical composition, portrait orientation, full body shot, strong vertical lines, elegant vertical framing';
      break;
    case '1792x1024':
      compositionGuide = 'horizontal composition, landscape orientation, panoramic view, wide angle perspective, cinematic aspect ratio';
      break;
    default: // 1024x1024
      compositionGuide = 'balanced square composition, centered framing, symmetrical arrangement';
  }

  // Enhance positive prompt based on style
  const enhancedPrompt = style === 't-shirt-design' ? `
    ${mainPrompt}
    ${compositionGuide},
    vector art, clean lines, simple shapes, bold colors, high contrast,
    white background, isolated elements, print-ready, scalable graphics,
    professional t-shirt design, commercial use, no background,
    high resolution, 300dpi, CMYK color mode, ready for screen printing,
    modern graphic design, professional quality, clean and crisp lines
  `.trim() : `
    ${mainPrompt}
    ${compositionGuide},
    (photorealistic:1.4), (hyperrealistic:1.3), masterpiece,
    8k resolution, highly detailed, sharp focus, HDR,
    cinematic lighting, volumetric lighting, ambient occlusion, ray tracing,
    professional color grading, dramatic atmosphere,
    shot on Hasselblad H6D-400C, 100mm f/2.8 lens, golden hour photography,
    detailed textures, intricate details, pristine quality, award-winning photography
  `.trim();

  // Enhanced negative prompt based on style
  const enhancedNegativePrompt = style === 't-shirt-design' ? `
    photorealistic, hyperrealistic, 3D render, complex shading,
    detailed textures, intricate details, realistic lighting,
    natural background, environmental elements, photographic style,
    depth of field, bokeh effect, camera artifacts, lens flare,
    film grain, noise, blur, soft focus, vignetting,
    complex patterns, busy backgrounds, cluttered composition,
    low contrast, muted colors, gradient backgrounds,
    transparent elements, semi-transparent elements,
    watermarks, signatures, text, logos, copyright symbols
  `.trim() : `
    cartoon, anime, illustration, painting, drawing, art,
    low quality, low resolution, blurry, noisy, grainy,
    oversaturated, overexposed, underexposed,
    deformed, distorted, disfigured,
    watermark, signature, text, logo,
    bad anatomy, bad proportions, amateur, unprofessional,
    wrong aspect ratio, stretched image, poorly cropped,
    without face tattoo, without text, without design on t-shirt,
    flat lighting, awkward poses, lack of emotion, unclear symbolism,
    generic patterns, bland textures, messy composition, pixelation,
    amateurish expressions, disproportionate figures, artificial poses,
    unnatural shadows, inconsistent style, overused symbols,
    overemphasis on detail, clichéd lighting, poor resolution,
    disconnected elements, unclear focal point, generic font,
    repetitive poses, lack of depth, chaotic composition,
    misaligned elements, dull colour palette, off-balance,
    crowded, overused tropes
  `.trim();

  return {
    prompt: enhancedPrompt,
    negative_prompt: enhancedNegativePrompt
  };
};

export async function POST(request: Request) {
  try {
    const { prompt, model, size = '1024x1024' } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const { prompt: enhancedPrompt, negative_prompt } = formatEnhancedPrompt(prompt, size as ImageSize, model);

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