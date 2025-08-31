// Temporary stub for @auterity/workflow-contracts
// This file provides minimal type definitions to fix build issues

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  version?: string;
  metadata?: Record<string, any>;
}

export interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  metadata?: Record<string, any>;
}

export const WorkflowSchema = {
  parse: (data: any): Workflow => data as Workflow,
  safeParse: (data: any) => ({ success: true, data: data as Workflow }),
};

export function reactflowToCanonical(reactflowData: any): Workflow {
  // Minimal implementation for build compatibility
  return {
    id: reactflowData.id || 'temp-id',
    name: reactflowData.name || 'Untitled Workflow',
    nodes: reactflowData.nodes || [],
    edges: reactflowData.edges || [],
  };
}

export function canonicalToReactflow(workflow: Workflow): any {
  // Minimal implementation for build compatibility
  return {
    nodes: workflow.nodes,
    edges: workflow.edges,
  };
}