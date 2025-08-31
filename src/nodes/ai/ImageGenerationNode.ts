import { StudioNode, NodeData, NodeStyle } from '../../types/studio';
import { apiClient } from '../../services/api';

export interface ImageGenerationConfig {
  model: 'dall-e-3' | 'dall-e-2' | 'stable-diffusion' | 'midjourney';
  size: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality: 'standard' | 'hd';
  style?: 'natural' | 'vivid';
  outputVariable: string;
}

export class ImageGenerationNode implements StudioNode {
  id: string;
  type: string = 'ai.image.generate';
  position: { x: number; y: number };
  size: { width: number; height: number };
  data: NodeData;
  style: NodeStyle;
  selected: boolean = false;
  dragging: boolean = false;
  resizing: boolean = false;

  constructor(id: string, position: { x: number; y: number }, config: Partial<ImageGenerationConfig> = {}) {
    this.id = id;
    this.position = position;
    this.size = { width: 280, height: 220 };

    this.data = {
      label: 'AI Image Generation',
      description: 'Generate images using advanced AI models',
      icon: '🎨',
      properties: {
        model: config.model || 'dall-e-3',
        size: config.size || '1024x1024',
        quality: config.quality || 'standard',
        style: config.style || 'vivid',
        outputVariable: config.outputVariable || 'generatedImage',
      },
      category: 'ai',
      propertyDefinitions: [
        {
          key: 'model',
          label: 'AI Model',
          type: 'select',
          required: true,
          defaultValue: 'dall-e-3',
          options: [
            { value: 'dall-e-3', label: 'DALL-E 3 (Highest Quality)' },
            { value: 'dall-e-2', label: 'DALL-E 2 (Fast)' },
            { value: 'stable-diffusion', label: 'Stable Diffusion (Open Source)' },
            { value: 'midjourney', label: 'Midjourney (Artistic)' }
          ]
        },
        {
          key: 'size',
          label: 'Image Size',
          type: 'select',
          required: true,
          defaultValue: '1024x1024',
          options: [
            { value: '256x256', label: '256x256 (Fast, Low Quality)' },
            { value: '512x512', label: '512x512 (Balanced)' },
            { value: '1024x1024', label: '1024x1024 (High Quality)' },
            { value: '1792x1024', label: '1792x1024 (Landscape)' },
            { value: '1024x1792', label: '1024x1792 (Portrait)' }
          ]
        },
        {
          key: 'quality',
          label: 'Quality',
          type: 'select',
          required: true,
          defaultValue: 'standard',
          options: [
            { value: 'standard', label: 'Standard' },
            { value: 'hd', label: 'HD (Higher Detail)' }
          ]
        },
        {
          key: 'style',
          label: 'Style',
          type: 'select',
          required: false,
          defaultValue: 'vivid',
          options: [
            { value: 'natural', label: 'Natural' },
            { value: 'vivid', label: 'Vivid' }
          ]
        },
        {
          key: 'outputVariable',
          label: 'Output Variable',
          type: 'text',
          required: true,
          defaultValue: 'generatedImage',
          description: 'Name of the variable to store the generated image URL'
        }
      ]
    };

    this.style = {
      backgroundColor: 0x7c3aed,
      borderColor: 0x6d28d9,
      borderWidth: 2,
      borderRadius: 8,
      textColor: 0xffffff,
      fontSize: 12,
      fontWeight: '600',
      shadow: true,
      opacity: 1
    };
  }

  async execute(inputs: Record<string, any>): Promise<Record<string, any>> {
    const { model, size, quality, style, outputVariable } = this.data.properties;
    const prompt = inputs.prompt || inputs.description || '';

    if (!prompt) {
      throw new Error('ImageGenerationNode: No prompt provided. Connect a text input describing the image.');
    }

    try {
      const parameters: any = {
        prompt,
        model,
        size,
        quality
      };

      // Add style parameter for DALL-E models
      if (model.startsWith('dall-e') && style) {
        parameters.style = style;
      }

      const response = await apiClient.callAIFunction('image.generate', parameters);

      const result: Record<string, any> = {
        [outputVariable]: response.result.image_url,
        revisedPrompt: response.result.revised_prompt,
        usage: response.result.usage,
        cost: response.metadata?.cost_usd,
        model: response.metadata?.model,
        processingTime: response.metadata?.processing_time_ms
      };

      // Add image metadata
      if (response.result.metadata) {
        result.width = response.result.metadata.width;
        result.height = response.result.metadata.height;
        result.format = response.result.metadata.format;
      }

      return result;

    } catch (error: any) {
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        throw new Error(`AI rate limit exceeded. Try again in ${error.details?.retry_after_seconds || 60} seconds.`);
      } else if (error.code === 'QUOTA_EXCEEDED') {
        throw new Error('AI usage quota exceeded for image generation. Please upgrade your plan.');
      } else if (error.code === 'FUNCTION_ERROR') {
        throw new Error(`Image generation failed: ${error.message || 'AI service error'}`);
      } else {
        throw new Error(`Image generation failed: ${error.message || 'Unknown error'}`);
      }
    }
  }

  validate(): string[] {
    const errors: string[] = [];
    const { model, size, outputVariable } = this.data.properties;

    if (!model) {
      errors.push('AI model must be selected');
    }

    if (!size) {
      errors.push('Image size must be selected');
    }

    if (!outputVariable || outputVariable.trim() === '') {
      errors.push('Output variable name is required');
    }

    // Model-specific validations
    if (model === 'dall-e-3' && size === '256x256') {
      errors.push('DALL-E 3 does not support 256x256 size');
    }

    return errors;
  }

  getInputs(): string[] {
    return ['prompt', 'description'];
  }

  getOutputs(): string[] {
    const { outputVariable } = this.data.properties;
    return [
      outputVariable,
      'revisedPrompt',
      'usage',
      'cost',
      'model',
      'processingTime',
      'width',
      'height',
      'format'
    ];
  }

  clone(): ImageGenerationNode {
    const cloned = new ImageGenerationNode(
      `${this.id}_copy`,
      { x: this.position.x + 20, y: this.position.y + 20 },
      this.data.properties
    );
    return cloned;
  }
}
