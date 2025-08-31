/**
 * CORRECTED APPROACH: Leveraging Existing Auterity Infrastructure
 *
 * Instead of building new routing components, we should extend the existing
 * Layout component and integrate with existing contexts.
 */

import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext'; // Leverage existing
import { useNotifications } from './components/notifications/NotificationSystem'; // Leverage existing

// Extend existing Layout instead of creating new navigation shell
export const ExtendedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth(); // Use existing auth
  const { addNotification } = useNotifications(); // Use existing notifications
  const location = useLocation();
  const navigate = useNavigate();

  // Cross-app navigation using existing patterns
  const navigateToApp = (appId: string, route?: string) => {
    const appUrls = {
      'error-iq': 'https://error-iq.auterity.com',
      'ai-hub': 'https://ai-hub.auterity.com',
      'analytics': 'https://analytics.auterity.com'
    };

    if (appUrls[appId]) {
      window.open(`${appUrls[appId]}${route || ''}`, '_blank');
    }
  };

  // Workspace context (should integrate with existing tenancy)
  const currentWorkspace = user?.organization?.currentWorkspace;

  return (
    <div className="extended-layout">
      {/* Extend existing Layout component instead of replacing it */}
      <ExistingLayout>

        {/* Add cross-app navigation to existing sidebar */}
        <div className="cross-app-nav">
          <button onClick={() => navigateToApp('error-iq', '/dashboard')}>
            Error IQ
          </button>
          <button onClick={() => navigateToApp('ai-hub', '/functions')}>
            AI Hub
          </button>
          <button onClick={() => navigateToApp('analytics', '/dashboard')}>
            Analytics
          </button>
        </div>

        {/* Add workspace context to existing header */}
        {currentWorkspace && (
          <div className="workspace-context">
            <span>{currentWorkspace.name}</span>
            <span>{currentWorkspace.currentProject?.name}</span>
          </div>
        )}

        {children}
      </ExistingLayout>
    </div>
  );
};

// Integration with existing Workflow Studio
export const WorkflowStudioWithExistingNav = () => {
  return (
    <AuthProvider> {/* Use existing AuthProvider */}
      <ErrorProvider> {/* Use existing ErrorProvider */}
        <ThemeProvider> {/* Use existing ThemeProvider */}
          <NotificationProvider> {/* Use existing NotificationProvider */}
            <Router> {/* Use existing Router setup */}
              <ExtendedLayout>
                <Routes>
                  {/* Extend existing routes instead of replacing */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/workflows" element={<Workflows />} />
                  <Route path="/workflows/builder/:id" element={<WorkflowBuilder />} />
                  {/* ... existing routes ... */}
                </Routes>
              </ExtendedLayout>
            </Router>
          </NotificationProvider>
        </ThemeProvider>
      </ErrorProvider>
    </AuthProvider>
  );
};
