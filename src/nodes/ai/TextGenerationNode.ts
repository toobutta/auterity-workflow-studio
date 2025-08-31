import { StudioNode, NodeData, NodeStyle } from '../../types/studio';
import { apiClient } from '../../services/api';

export interface TextGenerationConfig {
  model: 'gpt-4' | 'claude-3' | 'gemini-pro' | 'gpt-3.5-turbo';
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  streaming: boolean;
  outputVariable: string;
}

export class TextGenerationNode implements StudioNode {
  id: string;
  type: string = 'ai.text.generate';
  position: { x: number; y: number };
  size: { width: number; height: number };
  data: NodeData;
  style: NodeStyle;
  selected: boolean = false;
  dragging: boolean = false;
  resizing: boolean = false;

  constructor(id: string, position: { x: number; y: number }, config: Partial<TextGenerationConfig> = {}) {
    this.id = id;
    this.position = position;
    this.size = { width: 280, height: 200 };

    this.data = {
      label: 'AI Text Generation',
      description: 'Generate text using advanced AI models',
      icon: '🤖',
      properties: {
        model: config.model || 'gpt-4',
        temperature: config.temperature || 0.7,
        maxTokens: config.maxTokens || 1000,
        systemPrompt: config.systemPrompt || '',
        streaming: config.streaming || false,
        outputVariable: config.outputVariable || 'generatedText',
      },
      category: 'ai',
      propertyDefinitions: [
        {
          key: 'model',
          label: 'AI Model',
          type: 'select',
          required: true,
          defaultValue: 'gpt-4',
          options: [
            { value: 'gpt-4', label: 'GPT-4 (Most Capable)' },
            { value: 'claude-3', label: 'Claude 3 (Balanced)' },
            { value: 'gemini-pro', label: 'Gemini Pro (Fast)' },
            { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Cost Effective)' }
          ]
        },
        {
          key: 'temperature',
          label: 'Creativity (Temperature)',
          type: 'range',
          required: true,
          defaultValue: 0.7,
          min: 0,
          max: 2,
          step: 0.1,
          description: 'Higher values make output more creative but less predictable'
        },
        {
          key: 'maxTokens',
          label: 'Max Length',
          type: 'number',
          required: true,
          defaultValue: 1000,
          min: 1,
          max: 4096,
          description: 'Maximum number of tokens to generate'
        },
        {
          key: 'systemPrompt',
          label: 'System Instructions',
          type: 'textarea',
          required: false,
          defaultValue: '',
          placeholder: 'You are a helpful assistant...',
          description: 'Instructions for the AI model behavior'
        },
        {
          key: 'streaming',
          label: 'Stream Response',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Stream the response in real-time'
        },
        {
          key: 'outputVariable',
          label: 'Output Variable',
          type: 'text',
          required: true,
          defaultValue: 'generatedText',
          description: 'Name of the variable to store the generated text'
        }
      ]
    };

    this.style = {
      backgroundColor: 0x4f46e5,
      borderColor: 0x3730a3,
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
    const { model, temperature, maxTokens, systemPrompt, streaming, outputVariable } = this.data.properties;
    const prompt = inputs.prompt || inputs.text || '';

    if (!prompt) {
      throw new Error('TextGenerationNode: No prompt provided. Connect a text input or set the "prompt" input.');
    }

    try {
      const parameters: any = {
        prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
        model,
        temperature,
        max_tokens: maxTokens
      };

      const response = await apiClient.callAIFunction('text.generate', parameters);

      const result: Record<string, any> = {
        [outputVariable]: response.result.text,
        usage: response.result.usage,
        cost: response.metadata?.cost_usd,
        model: response.metadata?.model,
        processingTime: response.metadata?.processing_time_ms
      };

      // Add usage tracking for billing
      if (response.result.usage) {
        result.inputTokens = response.result.usage.input_tokens;
        result.outputTokens = response.result.usage.output_tokens;
        result.totalTokens = response.result.usage.total_tokens;
      }

      return result;

    } catch (error: any) {
      // Enhanced error handling with specific error types
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        throw new Error(`AI rate limit exceeded. Try again in ${error.details?.retry_after_seconds || 30} seconds.`);
      } else if (error.code === 'QUOTA_EXCEEDED') {
        throw new Error('AI usage quota exceeded. Please upgrade your plan or contact support.');
      } else if (error.code === 'FUNCTION_ERROR') {
        throw new Error(`AI service error: ${error.message || 'Unknown error occurred'}`);
      } else {
        throw new Error(`Text generation failed: ${error.message || 'Unknown error'}`);
      }
    }
  }

  validate(): string[] {
    const errors: string[] = [];
    const { model, temperature, maxTokens, outputVariable } = this.data.properties;

    if (!model) {
      errors.push('AI model must be selected');
    }

    if (temperature < 0 || temperature > 2) {
      errors.push('Temperature must be between 0 and 2');
    }

    if (maxTokens < 1 || maxTokens > 4096) {
      errors.push('Max tokens must be between 1 and 4096');
    }

    if (!outputVariable || outputVariable.trim() === '') {
      errors.push('Output variable name is required');
    }

    return errors;
  }

  getInputs(): string[] {
    return ['prompt', 'text'];
  }

  getOutputs(): string[] {
    const { outputVariable } = this.data.properties;
    return [outputVariable, 'usage', 'cost', 'model', 'processingTime'];
  }

  clone(): TextGenerationNode {
    const cloned = new TextGenerationNode(
      `${this.id}_copy`,
      { x: this.position.x + 20, y: this.position.y + 20 },
      this.data.properties
    );
    return cloned;
  }
}
