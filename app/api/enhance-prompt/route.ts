import { NextResponse } from 'next/server';
import { imageStyles } from '@/components/imagine/ImageStyleSelector';

export const runtime = 'edge';

const getStyleSpecificSystemPrompt = (styleType: string, size: string) => {
  // Get composition guidance based on size
  let compositionGuide = '';
  switch(size) {
    case '1024x1792':
      compositionGuide = 'vertical composition, portrait orientation';
      break;
    case '1792x1024':
      compositionGuide = 'horizontal composition, landscape orientation';
      break;
    default: // 1024x1024
      compositionGuide = 'balanced square composition';
  }

  // Base system prompt with t-shirt design requirements
  const basePrompt = `You are an expert at writing prompts for AI image generation specifically for t-shirt designs.
Your task is to enhance the given prompt while maintaining the specific style and composition requirements.
Follow these guidelines:
- Keep the core subject/idea from the original prompt
- Make the prompt detailed but concise (max 200 words)
- Consider the ${compositionGuide}
- Ensure the design is suitable for t-shirt printing with:
  * White background
  * Isolated elements
  * Print-ready format
  * Scalable graphics
  * No background
  * High resolution (300dpi)
  * CMYK color mode
  * Ready for screen printing
- IMPORTANT: Respond ONLY with the enhanced prompt text
- Do NOT include any explanatory text, prefixes, or suffixes
- Do NOT include phrases like "Enhanced prompt:" or "This prompt provides..."
Do not include negative prompts or technical parameters - only enhance the descriptive content.`;

  // Add style-specific guidance
  switch(styleType) {
    case 'minimalist':
      return `${basePrompt}
Focus on minimalist t-shirt design:
- Use clean lines and simple shapes
- Employ a monochromatic color scheme
- Utilize negative space effectively
- Create modern, geometric patterns
- Maintain a flat design aesthetic
- Ensure design is print-ready for t-shirts
- Use isolated elements on white background`;
    
    case 'vintage':
      return `${basePrompt}
Focus on vintage t-shirt style:
- Incorporate retro design elements
- Add distressed textures and faded colors
- Use classic typography
- Create a weathered, old-school look
- Include hand-drawn elements
- Ensure design is print-ready for t-shirts
- Use isolated elements on white background`;
    
    case 'typography':
      return `${basePrompt}
Focus on typographic t-shirt design:
- Use bold, creative fonts
- Arrange text in innovative ways
- Maintain clean layouts
- Balance text with negative space
- Create modern typographic compositions
- Ensure design is print-ready for t-shirts
- Use isolated elements on white background`;
    
    case 'illustrative':
      return `${basePrompt}
Focus on illustrative t-shirt design:
- Incorporate hand-drawn elements
- Use detailed line work
- Create artistic compositions
- Maintain an artistic style
- Balance detail with overall composition
- Ensure design is print-ready for t-shirts
- Use isolated elements on white background`;
    
    case 'graphic':
      return `${basePrompt}
Focus on graphic t-shirt design:
- Use bold, vibrant colors
- Incorporate geometric shapes
- Create modern patterns
- Develop abstract compositions
- Balance color and shape effectively
- Ensure design is print-ready for t-shirts
- Use isolated elements on white background`;
    
    case 'hand-drawn':
      return `${basePrompt}
Focus on hand-drawn t-shirt style:
- Maintain sketch-like quality
- Use organic shapes
- Incorporate artistic imperfections
- Create creative illustrations
- Balance detail with overall composition
- Ensure design is print-ready for t-shirts
- Use isolated elements on white background`;
    
    default:
      return basePrompt;
  }
};

export async function POST(req: Request) {
  const { prompt, styleType = 'photo-realism', size = '1024x1024' } = await req.json();
  
  if (!process.env.TOGETHER_API_KEY) {
    return NextResponse.json(
      { error: 'Together API key not configured' },
      { status: 500 }
    );
  }

  if (!prompt) {
    return NextResponse.json(
      { error: 'Prompt is required' },
      { status: 400 }
    );
  }

  try {
    const systemPrompt = getStyleSpecificSystemPrompt(styleType, size);
    
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        repetition_penalty: 1,
        stop: ['<|eot_id|>','<|eom_id|>'],
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from Together API');
    }

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data:')) {
              const json = line.slice(5).trim();
              if (json === '[DONE]') {
                // Append style keywords before closing
                if (styleType in imageStyles) {
                  const stylePrompt = imageStyles[styleType as keyof typeof imageStyles].prompt;
                  const encoder = new TextEncoder();
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    content: `, ${stylePrompt}`,
                    done: true
                  })}\n\n`));
                }
                controller.close();
                return;
              }

              try {
                const data = JSON.parse(json);
                const content = data.choices[0]?.delta?.content || '';
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                  content
                })}\n\n`));
              } catch (error) {
                console.error('Error parsing stream data:', error);
              }
            }
          }
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Error in enhance-prompt route:', error);
    return NextResponse.json(
      { error: 'Failed to enhance prompt' },
      { status: 500 }
    );
  }
}
