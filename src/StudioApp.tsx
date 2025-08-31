import React, { useEffect, useState } from 'react';
import { StudioLayout } from './components/studio/StudioLayout';
import { LoginForm } from './components/auth/LoginForm';
import { useStudioStore } from './hooks/useStudioStore';
import { createNode } from './utils/nodeFactory';
import { authService } from './services/authService';
import './StudioApp.css';

export const StudioApp: React.FC = () => {
  const { state, actions } = useStudioStore();
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        actions.setAuthLoading(true);

        // Check if user is already authenticated
        if (authService.isAuthenticated()) {
          const user = authService.getUser();
          const token = await authService.getToken();

          if (user && token) {
            actions.setAuthUser(user, token);
          } else {
            // Clear any stale auth state
            actions.clearAuth();
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        actions.setAuthError('Failed to initialize authentication');
      } finally {
        actions.setAuthLoading(false);
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [actions]);

  // Create sample nodes for demonstration (only when authenticated)
  useEffect(() => {
    if (state.auth.isAuthenticated && !state.auth.isLoading) {
      // Create some sample nodes to demonstrate the canvas
      const startNode = createNode('start', { x: 100, y: 100 }, 'sample-start');
      const actionNode = createNode('action', { x: 300, y: 100 }, 'sample-action');
      const decisionNode = createNode('decision', { x: 500, y: 100 }, 'sample-decision');
      const endNode = createNode('end', { x: 700, y: 100 }, 'sample-end');

      actions.addNode(startNode);
      actions.addNode(actionNode);
      actions.addNode(decisionNode);
      actions.addNode(endNode);

      // Save initial state
      actions.saveState();
    }
  }, [state.auth.isAuthenticated, state.auth.isLoading, actions]);

  const handleLoginSuccess = () => {
    // Authentication successful, user state is already updated by LoginForm
    console.log('Login successful');
  };

  const handleLoginError = (error: string) => {
    console.error('Login error:', error);
    actions.setAuthError(error);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      actions.clearAuth();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading spinner during initialization
  if (isInitializing || state.auth.isLoading) {
    return (
      <div className="studio-app-loading">
        <div className="loading-spinner"></div>
        <p>Initializing Auterity Workflow Studio...</p>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!state.auth.isAuthenticated) {
    return (
      <div className="studio-app">
        <LoginForm
          onLoginSuccess={handleLoginSuccess}
          onLoginError={handleLoginError}
        />
      </div>
    );
  }

  // Show main studio interface when authenticated
  return (
    <div className="studio-app">
      <StudioLayout onLogout={handleLogout} />
    </div>
  );
};
