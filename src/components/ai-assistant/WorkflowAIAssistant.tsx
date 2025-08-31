/**
 * WORKFLOW STUDIO AI ASSISTANT
 * 
 * Integrates Auterity's existing AI chat and cognitive features with workflow-specific
 * capabilities for contextual assistance, optimization suggestions, and automated workflow generation.
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from '../../../auterity-error-iq/frontend/src/contexts/AuthContext';
import { useNotifications } from '../../../auterity-error-iq/frontend/src/components/notifications/NotificationSystem';

// Enhanced interfaces for workflow AI integration
interface WorkflowAIMessage {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'suggestion';
  content: string;
  timestamp: Date;
  workflowContext?: {
    workflowId?: string;
    nodeId?: string;
    canvasState?: any;
  };
  suggestions?: WorkflowSuggestion[];
  metadata?: Record<string, any>;
}

interface WorkflowSuggestion {
  id: string;
  type: 'node' | 'connection' | 'optimization' | 'template' | 'query';
  title: string;
  description: string;
  confidence: number;
  action: {
    type: 'add_node' | 'connect_nodes' | 'optimize_workflow' | 'apply_template' | 'create_query';
    data: any;
  };
  preview?: string;
}

interface AIInsight {
  id: string;
  type: 'performance' | 'optimization' | 'error' | 'suggestion';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
  workflowId?: string;
  nodeId?: string;
}

interface WorkflowAIAssistantProps {
  workflowId?: string;
  currentNode?: string;
  canvasState?: any;
  onSuggestionApply?: (suggestion: WorkflowSuggestion) => void;
  onWorkflowGenerate?: (prompt: string) => void;
  className?: string;
}

export const WorkflowAIAssistant: React.FC<WorkflowAIAssistantProps> = ({
  workflowId,
  currentNode,
  canvasState,
  onSuggestionApply,
  onWorkflowGenerate,
  className = ''
}) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // State management
  const [messages, setMessages] = useState<WorkflowAIMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'suggestions'>('chat');
  const [suggestions, setSuggestions] = useState<WorkflowSuggestion[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: WorkflowAIMessage = {
      id: 'welcome',
      type: 'assistant',
      content: `👋 Hi ${user?.name || 'there'}! I'm your Workflow AI Assistant. I can help you:

🔧 **Build workflows** - "Create a customer onboarding workflow"
🔍 **Optimize performance** - "How can I make this workflow faster?"
📊 **Generate queries** - "Show me all orders from last week"
🎯 **Suggest improvements** - I'll analyze your workflow and suggest enhancements

What would you like to work on today?`,
      timestamp: new Date(),
      workflowContext: { workflowId }
    };

    setMessages([welcomeMessage]);
    generateContextualInsights();
  }, [user, workflowId]);

  // Generate contextual insights based on workflow state
  const generateContextualInsights = useCallback(async () => {
    if (!workflowId) return;

    // Mock insights generation - in real implementation, this would call AI service
    const mockInsights: AIInsight[] = [
      {
        id: 'perf_1',
        type: 'performance',
        severity: 'medium',
        title: 'Database Query Optimization',
        description: 'Multiple database queries detected in sequence',
        recommendation: 'Consider batching queries or using JOIN operations to reduce database calls',
        confidence: 0.85,
        workflowId,
        nodeId: 'query_node_1'
      },
      {
        id: 'opt_1',
        type: 'optimization',
        severity: 'low',
        title: 'Parallel Execution Opportunity',
        description: 'Independent tasks found that can run in parallel',
        recommendation: 'Use parallel execution to reduce overall workflow time by ~30%',
        confidence: 0.92,
        workflowId
      },
      {
        id: 'sug_1',
        type: 'suggestion',
        severity: 'low',
        title: 'Error Handling Enhancement',
        description: 'Missing error handling in critical path',
        recommendation: 'Add try-catch blocks and retry logic for external API calls',
        confidence: 0.78,
        workflowId
      }
    ];

    setInsights(mockInsights);

    // Generate contextual suggestions
    const mockSuggestions: WorkflowSuggestion[] = [
      {
        id: 'sug_node_1',
        type: 'node',
        title: 'Add Email Notification Node',
        description: 'Send notification when workflow completes',
        confidence: 0.88,
        action: {
          type: 'add_node',
          data: {
            type: 'email_notification',
            position: { x: 400, y: 200 },
            config: {
              template: 'workflow_complete',
              recipients: ['user@example.com']
            }
          }
        },
        preview: 'Email notification node with workflow completion template'
      },
      {
        id: 'sug_opt_1',
        type: 'optimization',
        title: 'Optimize Database Queries',
        description: 'Combine multiple queries into a single optimized query',
        confidence: 0.92,
        action: {
          type: 'optimize_workflow',
          data: {
            optimizationType: 'query_optimization',
            targetNodes: ['query_1', 'query_2', 'query_3']
          }
        },
        preview: 'Reduces database calls from 3 to 1, improving performance by ~60%'
      }
    ];

    setSuggestions(mockSuggestions);
  }, [workflowId]);

  // Process user input and generate AI response
  const processUserInput = useCallback(async (input: string) => {
    if (!input.trim()) return;

    const userMessage: WorkflowAIMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: input,
      timestamp: new Date(),
      workflowContext: { workflowId, nodeId: currentNode, canvasState }
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsProcessing(true);

    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate contextual AI response
      const aiResponse = await generateAIResponse(input, userMessage.workflowContext);
      
      setMessages(prev => [...prev, aiResponse]);

      // Generate suggestions if applicable
      if (aiResponse.suggestions && aiResponse.suggestions.length > 0) {
        setSuggestions(prev => [...prev, ...aiResponse.suggestions!]);
      }

    } catch (error) {
      const errorMessage: WorkflowAIMessage = {
        id: `error_${Date.now()}`,
        type: 'system',
        content: '❌ Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [workflowId, currentNode, canvasState]);

  // Generate AI response based on input and context
  const generateAIResponse = async (input: string, context?: any): Promise<WorkflowAIMessage> => {
    const lowerInput = input.toLowerCase();

    // Workflow creation requests
    if (lowerInput.includes('create') || lowerInput.includes('build') || lowerInput.includes('generate')) {
      if (lowerInput.includes('workflow')) {
        return {
          id: `ai_${Date.now()}`,
          type: 'assistant',
          content: `🔧 I'll help you create a workflow! Based on your request "${input}", I can suggest:

1. **Start with a template** - Choose from our library of pre-built workflows
2. **Build from scratch** - I'll guide you step-by-step
3. **Generate automatically** - Describe what you want and I'll create it

Which approach would you prefer? Or would you like me to suggest some relevant templates?`,
          timestamp: new Date(),
          workflowContext: context,
          suggestions: [
            {
              id: 'template_suggestion',
              type: 'template',
              title: 'Customer Onboarding Template',
              description: 'Pre-built workflow for customer onboarding process',
              confidence: 0.9,
              action: { type: 'apply_template', data: { templateId: 'customer_onboarding' } },
              preview: 'Includes email verification, profile setup, and welcome sequence'
            }
          ]
        };
      }
    }

    // Query building requests
    if (lowerInput.includes('query') || lowerInput.includes('database') || lowerInput.includes('sql')) {
      return {
        id: `ai_${Date.now()}`,
        type: 'assistant',
        content: `📊 I can help you build database queries! Here are some options:

🔍 **Visual Query Builder** - Use our no-code interface to build queries
📝 **Natural Language** - Describe what data you need and I'll generate the SQL
🎯 **Query Templates** - Choose from common query patterns

What kind of data are you looking for? For example:
- "Show me all customers who signed up last month"
- "Find orders with status 'pending' over $100"
- "Get product sales by category"`,
        timestamp: new Date(),
        workflowContext: context,
        suggestions: [
          {
            id: 'query_builder',
            type: 'query',
            title: 'Open Query Builder',
            description: 'Launch the visual query builder interface',
            confidence: 0.95,
            action: { type: 'create_query', data: { openBuilder: true } },
            preview: 'Visual drag-and-drop query building interface'
          }
        ]
      };
    }

    // Optimization requests
    if (lowerInput.includes('optimize') || lowerInput.includes('improve') || lowerInput.includes('faster')) {
      return {
        id: `ai_${Date.now()}`,
        type: 'assistant',
        content: `⚡ I've analyzed your workflow and found several optimization opportunities:

🔍 **Performance Issues Detected:**
- Multiple sequential database queries (can be batched)
- Missing parallel execution opportunities
- Inefficient data processing steps

🎯 **Recommended Improvements:**
1. **Batch Database Operations** - Reduce query count by 70%
2. **Enable Parallel Processing** - Cut execution time by 30%
3. **Add Caching Layer** - Improve response time for repeated operations

Would you like me to apply these optimizations automatically?`,
        timestamp: new Date(),
        workflowContext: context,
        suggestions: [
          {
            id: 'auto_optimize',
            type: 'optimization',
            title: 'Auto-Optimize Workflow',
            description: 'Apply all recommended optimizations automatically',
            confidence: 0.87,
            action: { type: 'optimize_workflow', data: { applyAll: true } },
            preview: 'Estimated 50% performance improvement'
          }
        ]
      };
    }

    // General help or unclear requests
    return {
      id: `ai_${Date.now()}`,
      type: 'assistant',
      content: `🤔 I understand you're asking about "${input}". Here's how I can help:

🔧 **Workflow Building**
- Create new workflows from templates or scratch
- Add nodes, connections, and configure properties
- Generate workflows from natural language descriptions

📊 **Data & Queries**
- Build SQL queries with visual interface
- Connect to databases and APIs
- Transform and process data

⚡ **Optimization**
- Analyze workflow performance
- Suggest improvements and bottleneck fixes
- Implement best practices automatically

💡 **Smart Suggestions**
- Context-aware recommendations
- Error prevention and handling
- Industry-specific templates

What specific aspect would you like help with?`,
      timestamp: new Date(),
      workflowContext: context
    };
  };

  // Handle suggestion application
  const handleApplySuggestion = useCallback((suggestion: WorkflowSuggestion) => {
    if (onSuggestionApply) {
      onSuggestionApply(suggestion);
    }

    addNotification({
      type: 'success',
      title: 'Suggestion Applied',
      message: `Applied: ${suggestion.title}`
    });

    // Add confirmation message to chat
    const confirmationMessage: WorkflowAIMessage = {
      id: `confirm_${Date.now()}`,
      type: 'system',
      content: `✅ Applied suggestion: ${suggestion.title}`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, confirmationMessage]);
  }, [onSuggestionApply, addNotification]);

  // Handle input submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    processUserInput(currentInput);
  }, [currentInput, processUserInput]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processUserInput(currentInput);
    }
  }, [currentInput, processUserInput]);

  return (
    <div className={`workflow-ai-assistant ${className}`}>
      {/* Header */}
      <div className="ai-assistant-header">
        <div className="header-title">
          <h3>🤖 AI Assistant</h3>
          <span className="status-indicator online">Online</span>
        </div>
        <div className="header-tabs">
          <button
            className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 Chat
          </button>
          <button
            className={`tab ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            💡 Insights ({insights.length})
          </button>
          <button
            className={`tab ${activeTab === 'suggestions' ? 'active' : ''}`}
            onClick={() => setActiveTab('suggestions')}
          >
            ✨ Suggestions ({suggestions.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="ai-assistant-content">
        {activeTab === 'chat' && (
          <div className="chat-interface">
            {/* Messages */}
            <div className="messages-container">
              {messages.map(message => (
                <div key={message.id} className={`message ${message.type}`}>
                  <div className="message-content">
                    <div className="message-text">{message.content}</div>
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="inline-suggestions">
                        {message.suggestions.map(suggestion => (
                          <button
                            key={suggestion.id}
                            className="suggestion-button"
                            onClick={() => handleApplySuggestion(suggestion)}
                          >
                            {suggestion.title}
                            <span className="confidence">{Math.round(suggestion.confidence * 100)}%</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="message-timestamp">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="message assistant processing">
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="chat-input-form">
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about workflows, queries, or optimizations..."
                disabled={isProcessing}
                className="chat-input"
              />
              <button
                type="submit"
                disabled={!currentInput.trim() || isProcessing}
                className="send-button"
              >
                📤
              </button>
            </form>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="insights-panel">
            <h4>🔍 Workflow Insights</h4>
            {insights.length === 0 ? (
              <div className="empty-state">
                <p>No insights available yet. I'll analyze your workflow and provide suggestions as you build.</p>
              </div>
            ) : (
              <div className="insights-list">
                {insights.map(insight => (
                  <div key={insight.id} className={`insight-card ${insight.severity}`}>
                    <div className="insight-header">
                      <h5>{insight.title}</h5>
                      <span className="confidence">{Math.round(insight.confidence * 100)}%</span>
                    </div>
                    <p className="insight-description">{insight.description}</p>
                    <div className="insight-recommendation">
                      <strong>Recommendation:</strong> {insight.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="suggestions-panel">
            <h4>✨ Smart Suggestions</h4>
            {suggestions.length === 0 ? (
              <div className="empty-state">
                <p>No suggestions yet. Start building your workflow and I'll provide contextual recommendations!</p>
              </div>
            ) : (
              <div className="suggestions-list">
                {suggestions.map(suggestion => (
                  <div key={suggestion.id} className="suggestion-card">
                    <div className="suggestion-header">
                      <h5>{suggestion.title}</h5>
                      <span className="confidence">{Math.round(suggestion.confidence * 100)}%</span>
                    </div>
                    <p className="suggestion-description">{suggestion.description}</p>
                    {suggestion.preview && (
                      <div className="suggestion-preview">
                        <strong>Preview:</strong> {suggestion.preview}
                      </div>
                    )}
                    <button
                      onClick={() => handleApplySuggestion(suggestion)}
                      className="apply-button"
                    >
                      Apply Suggestion
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowAIAssistant;
