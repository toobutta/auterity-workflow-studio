import { StudioNode, NodeType } from '../../types/studio';
import { apiClient } from '../../services/api';
import { TextGenerationNode } from './TextGenerationNode';
import { ImageGenerationNode } from './ImageGenerationNode';

export interface AIFunctionMetadata {
  name: string;
  description: string;
  category: string;
  version: string;
  schema: {
    input: any;
    output: any;
  };
  capabilities: string[];
  rate_limits: {
    requests_per_minute: number;
    tokens_per_hour?: number;
    images_per_hour?: number;
  };
  cost_per_token?: number;
  cost_per_image?: number;
}

export class AINodeFactory {
  private static instance: AINodeFactory;
  private availableFunctions: Map<string, AIFunctionMetadata> = new Map();
  private nodeTypes: Map<string, new (id: string, position: any, config?: any) => StudioNode> = new Map();

  private constructor() {
    this.registerBuiltInNodes();
  }

  static getInstance(): AINodeFactory {
    if (!AINodeFactory.instance) {
      AINodeFactory.instance = new AINodeFactory();
    }
    return AINodeFactory.instance;
  }

  private registerBuiltInNodes(): void {
    // Register built-in AI node types
    this.nodeTypes.set('ai.text.generate', TextGenerationNode);
    this.nodeTypes.set('ai.image.generate', ImageGenerationNode);
  }

  async discoverFunctions(): Promise<AIFunctionMetadata[]> {
    try {
      const response = await apiClient.getAIFunctions();

      const functions: AIFunctionMetadata[] = [];
      for (const func of response.functions || []) {
        this.availableFunctions.set(func.name, func);
        functions.push(func);
      }

      return functions;
    } catch (error) {
      console.error('Failed to discover AI functions:', error);
      return [];
    }
  }

  createNode(
    functionName: string,
    id: string,
    position: { x: number; y: number },
    config: any = {}
  ): StudioNode | null {
    // Try built-in node types first
    const NodeClass = this.nodeTypes.get(functionName);
    if (NodeClass) {
      return new NodeClass(id, position, config);
    }

    // Try to create from discovered functions
    const metadata = this.availableFunctions.get(functionName);
    if (metadata) {
      return this.createDynamicNode(metadata, id, position, config);
    }

    console.warn(`No node factory found for function: ${functionName}`);
    return null;
  }

  private createDynamicNode(
    metadata: AIFunctionMetadata,
    id: string,
    position: { x: number; y: number },
    config: any = {}
  ): StudioNode {
    // Create a dynamic node based on the function metadata
    const nodeType = `ai.${metadata.name.replace('.', '-')}`;

    // Generate property definitions from schema
    const propertyDefinitions = this.generatePropertyDefinitions(metadata.schema.input);

    const node: StudioNode = {
      id,
      type: nodeType as NodeType,
      position,
      size: { width: 280, height: 200 },
      data: {
        label: this.formatLabel(metadata.name),
        description: metadata.description,
        icon: this.getFunctionIcon(metadata.category),
        properties: this.initializeProperties(metadata.schema.input, config),
        category: 'ai',
        propertyDefinitions
      },
      style: {
        backgroundColor: this.getCategoryColor(metadata.category),
        borderColor: this.getCategoryBorderColor(metadata.category),
        borderWidth: 2,
        borderRadius: 8,
        textColor: 0xffffff,
        fontSize: 12,
        fontWeight: '600',
        shadow: true,
        opacity: 1
      },
      selected: false,
      dragging: false,
      resizing: false,

      async execute(inputs: Record<string, any>): Promise<Record<string, any>> {
        try {
          const response = await apiClient.callAIFunction(metadata.name, inputs);

          const result: Record<string, any> = {};

          // Map response to outputs based on schema
          if (metadata.schema.output.properties) {
            for (const [key, value] of Object.entries(metadata.schema.output.properties)) {
              if (response.result && response.result[key] !== undefined) {
                result[key] = response.result[key];
              }
            }
          }

          // Add metadata
          result.usage = response.result?.usage;
          result.cost = response.metadata?.cost_usd;
          result.model = response.metadata?.model;
          result.processingTime = response.metadata?.processing_time_ms;

          return result;

        } catch (error: any) {
          throw new Error(`${metadata.name} execution failed: ${error.message || 'Unknown error'}`);
        }
      },

      validate(): string[] {
        const errors: string[] = [];
        const requiredFields = metadata.schema.input.required || [];

        for (const field of requiredFields) {
          if (!this.data.properties[field]) {
            errors.push(`${field} is required`);
          }
        }

        return errors;
      },

      getInputs(): string[] {
        return Object.keys(metadata.schema.input.properties || {});
      },

      getOutputs(): string[] {
        const outputs = Object.keys(metadata.schema.output.properties || {});
        return [...outputs, 'usage', 'cost', 'model', 'processingTime'];
      },

      clone(): StudioNode {
        return this.createDynamicNode(metadata, `${id}_copy`, {
          x: position.x + 20,
          y: position.y + 20
        }, config);
      }
    };

    return node;
  }

  private generatePropertyDefinitions(schema: any): any[] {
    const definitions: any[] = [];

    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        const definition: any = {
          key,
          label: this.formatLabel(key),
          type: this.mapSchemaType(propSchema),
          required: schema.required?.includes(key) || false
        };

        // Add type-specific properties
        if (propSchema.type === 'string' && propSchema.enum) {
          definition.options = propSchema.enum.map((value: string) => ({
            value,
            label: this.formatLabel(value)
          }));
        }

        if (propSchema.type === 'number') {
          definition.min = propSchema.minimum;
          definition.max = propSchema.maximum;
          definition.step = propSchema.multipleOf || 1;
        }

        if (propSchema.type === 'integer') {
          definition.min = propSchema.minimum;
          definition.max = propSchema.maximum;
          definition.step = 1;
        }

        if (propSchema.description) {
          definition.description = propSchema.description;
        }

        definitions.push(definition);
      }
    }

    return definitions;
  }

  private initializeProperties(schema: any, config: any = {}): Record<string, any> {
    const properties: Record<string, any> = {};

    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        properties[key] = config[key] || propSchema.default || this.getDefaultValue(propSchema);
      }
    }

    return properties;
  }

  private mapSchemaType(propSchema: any): string {
    if (propSchema.enum) return 'select';
    if (propSchema.type === 'boolean') return 'boolean';
    if (propSchema.type === 'integer' || propSchema.type === 'number') return 'number';
    if (propSchema.type === 'string' && propSchema.format === 'textarea') return 'textarea';
    if (propSchema.type === 'string') return 'text';
    return 'text';
  }

  private getDefaultValue(propSchema: any): any {
    if (propSchema.default !== undefined) return propSchema.default;
    if (propSchema.type === 'boolean') return false;
    if (propSchema.type === 'number' || propSchema.type === 'integer') return 0;
    if (propSchema.type === 'string') return '';
    if (propSchema.type === 'array') return [];
    if (propSchema.type === 'object') return {};
    return null;
  }

  private formatLabel(str: string): string {
    return str
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getFunctionIcon(category: string): string {
    const icons: Record<string, string> = {
      'text-processing': '📝',
      'image-generation': '🎨',
      'code-analysis': '💻',
      'data-analysis': '📊',
      'audio-processing': '🎵',
      'video-processing': '🎥',
      'translation': '🌍',
      'summarization': '📋',
      'classification': '🏷️',
      'generation': '✨'
    };
    return icons[category] || '🤖';
  }

  private getCategoryColor(category: string): number {
    const colors: Record<string, number> = {
      'text-processing': 0x4f46e5,
      'image-generation': 0x7c3aed,
      'code-analysis': 0x059669,
      'data-analysis': 0xdc2626,
      'audio-processing': 0xea580c,
      'video-processing': 0xc2410c,
      'translation': 0x0891b2,
      'summarization': 0x7c2d12,
      'classification': 0x6b21a8,
      'generation': 0x365314
    };
    return colors[category] || 0x6b7280;
  }

  private getCategoryBorderColor(category: string): number {
    const colors: Record<string, number> = {
      'text-processing': 0x3730a3,
      'image-generation': 0x6d28d9,
      'code-analysis': 0x047857,
      'data-analysis': 0xb91c1c,
      'audio-processing': 0xc2410c,
      'video-processing': 0x9a3412,
      'translation': 0x0e7490,
      'summarization': 0x5b1f0a,
      'classification': 0x581c87,
      'generation': 0x2d5016
    };
    return colors[category] || 0x4b5563;
  }

  getAvailableFunctions(): AIFunctionMetadata[] {
    return Array.from(this.availableFunctions.values());
  }

  getFunctionMetadata(functionName: string): AIFunctionMetadata | undefined {
    return this.availableFunctions.get(functionName);
  }

  canCreateNode(functionName: string): boolean {
    return this.nodeTypes.has(functionName) || this.availableFunctions.has(functionName);
  }
}

// Export singleton instance
export const aiNodeFactory = AINodeFactory.getInstance();
