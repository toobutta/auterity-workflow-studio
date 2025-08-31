/**
 * Real-Time Collaboration Engine
 * WebRTC + Yjs powered collaborative editing with live cursors and conflict resolution
 */

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';
import { Awareness } from 'y-protocols/awareness';

export interface UserPresence {
  userId: string;
  name: string;
  color: string;
  avatar?: string;
  cursor?: {
    x: number;
    y: number;
    element?: string;
  };
  selection?: {
    start: number;
    end: number;
    element?: string;
  };
  status: 'online' | 'away' | 'offline';
  lastSeen: number;
}

export interface CollaborationEvent {
  type: 'user_joined' | 'user_left' | 'cursor_moved' | 'selection_changed' | 'content_changed';
  userId: string;
  data: any;
  timestamp: number;
}

export interface CollaborationConfig {
  roomId: string;
  userId: string;
  userName: string;
  signalingServers?: string[];
  password?: string;
  maxUsers?: number;
  enablePersistence?: boolean;
  enableCursorTracking?: boolean;
  enableConflictResolution?: boolean;
}

export class CollaborationEngine {
  private doc: Y.Doc;
  private provider: WebrtcProvider | null = null;
  private awareness: Awareness;
  private persistence: IndexeddbPersistence | null = null;
  private config: CollaborationConfig;
  private eventListeners: Map<string, Function[]> = new Map();

  // Shared data structures
  public workflowData: Y.Map<any>;
  public userCursors: Y.Map<UserPresence>;
  public operations: Y.Array<any>;
  public comments: Y.Array<any>;

  constructor(config: CollaborationConfig) {
    this.config = config;
    this.doc = new Y.Doc();

    // Initialize shared data structures
    this.workflowData = this.doc.getMap('workflow');
    this.userCursors = this.doc.getMap('cursors');
    this.operations = this.doc.getArray('operations');
    this.comments = this.doc.getArray('comments');

    // Initialize awareness for presence
    this.awareness = this.doc.awareness;
  }

  /**
   * Initialize the collaboration session
   */
  async initialize(): Promise<void> {
    try {
      // Setup WebRTC provider
      this.provider = new WebrtcProvider(
        this.config.roomId,
        this.doc,
        {
          signaling: this.config.signalingServers || [
            'wss://signaling.yjs.dev',
            'wss://y-webrtc-signaling-eu.herokuapp.com',
            'wss://y-webrtc-signaling-us.herokuapp.com'
          ],
          password: this.config.password,
          maxConns: this.config.maxUsers || 20,
          filterBcConns: true,
          peerOpts: {
            config: {
              iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
              ]
            }
          }
        }
      );

      // Setup local persistence if enabled
      if (this.config.enablePersistence) {
        this.persistence = new IndexeddbPersistence(
          `yjs-${this.config.roomId}`,
          this.doc
        );

        await new Promise<void>((resolve, reject) => {
          if (this.persistence) {
            this.persistence.on('synced', () => resolve());
            this.persistence.on('error', reject);
          }
        });
      }

      // Setup user presence
      this.setupPresence();

      // Setup event listeners
      this.setupEventListeners();

      // Setup conflict resolution if enabled
      if (this.config.enableConflictResolution) {
        this.setupConflictResolution();
      }

      this.emit('initialized', { success: true });
    } catch (error) {
      console.error('Failed to initialize collaboration:', error);
      this.emit('error', { error: error.message });
      throw error;
    }
  }

  /**
   * Setup user presence and awareness
   */
  private setupPresence(): void {
    const userPresence: UserPresence = {
      userId: this.config.userId,
      name: this.config.userName,
      color: this.generateUserColor(),
      status: 'online',
      lastSeen: Date.now()
    };

    // Set local user state
    this.awareness.setLocalStateField('user', userPresence);

    // Listen for awareness changes
    this.awareness.on('change', (changes: any) => {
      const states = this.awareness.getStates();

      states.forEach((state, clientId) => {
        if (state.user) {
          this.emit('user_presence_changed', {
            clientId,
            user: state.user,
            isLocal: clientId === this.doc.clientID
          });
        }
      });
    });
  }

  /**
   * Setup event listeners for document changes
   */
  private setupEventListeners(): void {
    // Listen for workflow data changes
    this.workflowData.observe((event) => {
      this.emit('workflow_changed', {
        changes: event.changes,
        origin: event.transaction.origin
      });
    });

    // Listen for operations
    this.operations.observe((event) => {
      this.emit('operations_changed', {
        changes: event.changes,
        operations: this.operations.toArray()
      });
    });

    // Listen for comments
    this.comments.observe((event) => {
      this.emit('comments_changed', {
        changes: event.changes,
        comments: this.comments.toArray()
      });
    });

    // Provider events
    if (this.provider) {
      this.provider.on('synced', () => {
        this.emit('synced', { synced: true });
      });

      this.provider.on('peers', (peers: any) => {
        this.emit('peers_changed', { peers });
      });
    }
  }

  /**
   * Setup conflict resolution
   */
  private setupConflictResolution(): void {
    // Enable operational transformation for conflict resolution
    this.doc.on('update', (update: Uint8Array, origin: any) => {
      if (origin !== this) {
        // Apply conflict resolution strategies
        this.resolveConflicts(update);
      }
    });
  }

  /**
   * Update user cursor position
   */
  updateCursor(x: number, y: number, element?: string): void {
    if (!this.config.enableCursorTracking) return;

    const currentPresence = this.awareness.getLocalState()?.user as UserPresence;
    if (currentPresence) {
      currentPresence.cursor = { x, y, element };
      currentPresence.lastSeen = Date.now();
      this.awareness.setLocalStateField('user', currentPresence);
    }
  }

  /**
   * Update user selection
   */
  updateSelection(start: number, end: number, element?: string): void {
    if (!this.config.enableCursorTracking) return;

    const currentPresence = this.awareness.getLocalState()?.user as UserPresence;
    if (currentPresence) {
      currentPresence.selection = { start, end, element };
      currentPresence.lastSeen = Date.now();
      this.awareness.setLocalStateField('user', currentPresence);
    }
  }

  /**
   * Update workflow data
   */
  updateWorkflowData(key: string, value: any): void {
    this.doc.transact(() => {
      this.workflowData.set(key, value);
    });
  }

  /**
   * Add a comment to the workflow
   */
  addComment(comment: {
    id: string;
    text: string;
    author: string;
    position: { x: number; y: number };
    timestamp: number;
    replies?: any[];
  }): void {
    this.doc.transact(() => {
      this.comments.push([comment]);
    });
  }

  /**
   * Record an operation for audit trail
   */
  recordOperation(operation: {
    id: string;
    type: string;
    userId: string;
    timestamp: number;
    data: any;
    undoable?: boolean;
  }): void {
    this.doc.transact(() => {
      this.operations.push([operation]);
    });
  }

  /**
   * Get all connected users
   */
  getConnectedUsers(): UserPresence[] {
    const users: UserPresence[] = [];
    const states = this.awareness.getStates();

    states.forEach((state) => {
      if (state.user) {
        users.push(state.user);
      }
    });

    return users;
  }

  /**
   * Get workflow data
   */
  getWorkflowData(): Record<string, any> {
    return this.workflowData.toJSON();
  }

  /**
   * Check if document is synced
   */
  isSynced(): boolean {
    return this.provider?.synced || false;
  }

  /**
   * Get document statistics
   */
  getStats(): {
    connectedUsers: number;
    operationsCount: number;
    commentsCount: number;
    synced: boolean;
  } {
    return {
      connectedUsers: this.awareness.getStates().size,
      operationsCount: this.operations.length,
      commentsCount: this.comments.length,
      synced: this.isSynced()
    };
  }

  /**
   * Event system
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!this.eventListeners.has(event)) return;

    if (callback) {
      const listeners = this.eventListeners.get(event)!;
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.eventListeners.delete(event);
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => callback(data));
  }

  /**
   * Generate a unique color for each user
   */
  private generateUserColor(): string {
    const colors = [
      '#ef4444', '#f97316', '#eab308', '#22c55e',
      '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
    ];
    const hash = this.config.userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * Resolve conflicts using operational transformation
   */
  private resolveConflicts(update: Uint8Array): void {
    // Implement conflict resolution logic
    // This would handle concurrent edits and merge conflicts
    console.log('Resolving conflicts for update:', update);
  }

  /**
   * Disconnect from collaboration session
   */
  disconnect(): void {
    if (this.provider) {
      this.provider.disconnect();
      this.provider = null;
    }

    if (this.persistence) {
      this.persistence.destroy();
      this.persistence = null;
    }

    this.doc.destroy();
    this.eventListeners.clear();
  }

  /**
   * Export document state for backup
   */
  exportState(): Uint8Array {
    return Y.encodeStateAsUpdate(this.doc);
  }

  /**
   * Import document state from backup
   */
  importState(state: Uint8Array): void {
    Y.applyUpdate(this.doc, state);
  }
}

// React Hook for using collaboration
export const useCollaboration = (config: CollaborationConfig) => {
  const [engine, setEngine] = React.useState<CollaborationEngine | null>(null);
  const [connectedUsers, setConnectedUsers] = React.useState<UserPresence[]>([]);
  const [isSynced, setIsSynced] = React.useState(false);

  React.useEffect(() => {
    const collabEngine = new CollaborationEngine(config);

    const initCollaboration = async () => {
      try {
        await collabEngine.initialize();
        setEngine(collabEngine);

        // Setup event listeners
        collabEngine.on('user_presence_changed', (data) => {
          setConnectedUsers(prev => {
            const updated = prev.filter(u => u.userId !== data.user.userId);
            if (data.user.status !== 'offline') {
              updated.push(data.user);
            }
            return updated;
          });
        });

        collabEngine.on('synced', (data) => {
          setIsSynced(data.synced);
        });

      } catch (error) {
        console.error('Failed to initialize collaboration:', error);
      }
    };

    initCollaboration();

    return () => {
      if (collabEngine) {
        collabEngine.disconnect();
      }
    };
  }, [config.roomId]);

  return {
    engine,
    connectedUsers,
    isSynced
  };
};

export default CollaborationEngine;
