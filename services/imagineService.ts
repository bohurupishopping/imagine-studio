'use client';

interface GenerateImageParams {
  prompt: string;
  model?: string;
  size?: string;
  style?: string;
}

interface GenerateImageResponse {
  success: boolean;
  data: {
    url: string;
  }[];
  error?: string;
}

export class ImagineService {
  private static instance: ImagineService;
  private baseUrl = '/api/imagine';

  private constructor() {}

  public static getInstance(): ImagineService {
    if (!ImagineService.instance) {
      ImagineService.instance = new ImagineService();
    }
    return ImagineService.instance;
  }

  async generateImage(params: GenerateImageParams): Promise<GenerateImageResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `${params.prompt}, ${params.style}`,
          model: params.model || 'black-forest-labs/FLUX.1-schnell-Free',
          size: params.size || '1200x1200',
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error
        });
        throw new Error(data.error || 'Failed to generate image');
      }

      if (!data.success) {
        console.error('API Response Error:', data);
        throw new Error(data.error || 'Invalid response from server');
      }

      return data;
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }
}

export const imagineService = ImagineService.getInstance();