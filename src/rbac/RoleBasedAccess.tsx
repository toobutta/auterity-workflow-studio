/**
 * Role-Based Access Control (RBAC) System
 * Enterprise-grade permissions and access management
 */

import React, { createContext, useContext, useMemo } from 'react';

export type UserRole =
  | 'super_admin'
  | 'tenant_admin'
  | 'organization_admin'
  | 'department_admin'
  | 'team_lead'
  | 'developer'
  | 'analyst'
  | 'operator'
  | 'viewer'
  | 'guest';

export type Permission =
  // System Administration
  | 'system.admin'
  | 'system.settings'
  | 'system.backup'
  | 'system.restore'

  // User Management
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.invite'
  | 'users.roles.manage'

  // Tenant Management
  | 'tenant.view'
  | 'tenant.edit'
  | 'tenant.delete'
  | 'tenant.billing'
  | 'tenant.security'

  // Workflow Management
  | 'workflows.view'
  | 'workflows.create'
  | 'workflows.edit'
  | 'workflows.delete'
  | 'workflows.execute'
  | 'workflows.approve'
  | 'workflows.publish'
  | 'workflows.template.manage'

  // Data & Analytics
  | 'data.view'
  | 'data.export'
  | 'data.query'
  | 'data.dashboard'
  | 'data.reports'
  | 'analytics.view'
  | 'analytics.create'
  | 'analytics.share'

  // AI & ML
  | 'ai.models.view'
  | 'ai.models.train'
  | 'ai.models.deploy'
  | 'ai.models.delete'
  | 'ai.assistant.use'
  | 'ai.experiments.view'
  | 'ai.experiments.create'

  // Integrations
  | 'integrations.view'
  | 'integrations.configure'
  | 'integrations.webhooks'
  | 'integrations.api'

  // Collaboration
  | 'collaboration.view'
  | 'collaboration.edit'
  | 'collaboration.share'
  | 'collaboration.comments'
  | 'collaboration.reviews'

  // Security & Audit
  | 'security.view'
  | 'security.configure'
  | 'audit.view'
  | 'audit.export'

  // Billing & Usage
  | 'billing.view'
  | 'billing.edit'
  | 'usage.view'
  | 'usage.export';

export interface UserPermissions {
  userId: string;
  tenantId: string;
  organizationId?: string;
  departmentId?: string;
  teamId?: string;
  role: UserRole;
  customPermissions: Permission[];
  restrictions: {
    ipWhitelist?: string[];
    timeRestrictions?: {
      days: number[];
      hours: { start: number; end: number };
    };
    dataClassification?: string[];
  };
}

interface RBACContextType {
  userPermissions: UserPermissions | null;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  canAccessResource: (resourceId: string, action: string) => boolean;
  getEffectivePermissions: () => Permission[];
}

const RBACContext = createContext<RBACContextType>({
  userPermissions: null,
  hasPermission: () => false,
  hasAnyPermission: () => false,
  hasAllPermissions: () => false,
  hasRole: () => false,
  hasAnyRole: () => false,
  canAccessResource: () => false,
  getEffectivePermissions: () => []
});

export const useRBAC = () => useContext(RBACContext);

// Role hierarchy and default permissions
const ROLE_HIERARCHY: Record<UserRole, { level: number; permissions: Permission[] }> = {
  super_admin: {
    level: 100,
    permissions: [
      // All permissions
      'system.admin', 'system.settings', 'system.backup', 'system.restore',
      'users.view', 'users.create', 'users.edit', 'users.delete', 'users.invite', 'users.roles.manage',
      'tenant.view', 'tenant.edit', 'tenant.delete', 'tenant.billing', 'tenant.security',
      'workflows.view', 'workflows.create', 'workflows.edit', 'workflows.delete', 'workflows.execute', 'workflows.approve', 'workflows.publish', 'workflows.template.manage',
      'data.view', 'data.export', 'data.query', 'data.dashboard', 'data.reports',
      'analytics.view', 'analytics.create', 'analytics.share',
      'ai.models.view', 'ai.models.train', 'ai.models.deploy', 'ai.models.delete', 'ai.assistant.use', 'ai.experiments.view', 'ai.experiments.create',
      'integrations.view', 'integrations.configure', 'integrations.webhooks', 'integrations.api',
      'collaboration.view', 'collaboration.edit', 'collaboration.share', 'collaboration.comments', 'collaboration.reviews',
      'security.view', 'security.configure', 'audit.view', 'audit.export',
      'billing.view', 'billing.edit', 'usage.view', 'usage.export'
    ]
  },
  tenant_admin: {
    level: 90,
    permissions: [
      'users.view', 'users.create', 'users.edit', 'users.invite', 'users.roles.manage',
      'tenant.view', 'tenant.edit', 'tenant.billing',
      'workflows.view', 'workflows.create', 'workflows.edit', 'workflows.delete', 'workflows.execute', 'workflows.approve', 'workflows.publish', 'workflows.template.manage',
      'data.view', 'data.export', 'data.query', 'data.dashboard', 'data.reports',
      'analytics.view', 'analytics.create', 'analytics.share',
      'ai.models.view', 'ai.models.train', 'ai.models.deploy', 'ai.models.delete', 'ai.assistant.use', 'ai.experiments.view', 'ai.experiments.create',
      'integrations.view', 'integrations.configure', 'integrations.webhooks', 'integrations.api',
      'collaboration.view', 'collaboration.edit', 'collaboration.share', 'collaboration.comments', 'collaboration.reviews',
      'security.view', 'audit.view', 'audit.export',
      'billing.view', 'usage.view', 'usage.export'
    ]
  },
  organization_admin: {
    level: 80,
    permissions: [
      'users.view', 'users.create', 'users.edit', 'users.invite',
      'workflows.view', 'workflows.create', 'workflows.edit', 'workflows.execute', 'workflows.approve',
      'data.view', 'data.export', 'data.query', 'data.dashboard',
      'analytics.view', 'analytics.create', 'analytics.share',
      'ai.models.view', 'ai.assistant.use', 'ai.experiments.view',
      'integrations.view', 'integrations.configure',
      'collaboration.view', 'collaboration.edit', 'collaboration.share', 'collaboration.comments', 'collaboration.reviews',
      'usage.view'
    ]
  },
  department_admin: {
    level: 70,
    permissions: [
      'users.view', 'users.create', 'users.edit',
      'workflows.view', 'workflows.create', 'workflows.edit', 'workflows.execute',
      'data.view', 'data.export', 'data.query', 'data.dashboard',
      'analytics.view', 'analytics.create',
      'ai.models.view', 'ai.assistant.use',
      'integrations.view',
      'collaboration.view', 'collaboration.edit', 'collaboration.share', 'collaboration.comments'
    ]
  },
  team_lead: {
    level: 60,
    permissions: [
      'workflows.view', 'workflows.create', 'workflows.edit', 'workflows.execute',
      'data.view', 'data.query', 'data.dashboard',
      'analytics.view',
      'ai.assistant.use',
      'collaboration.view', 'collaboration.edit', 'collaboration.share', 'collaboration.comments'
    ]
  },
  developer: {
    level: 50,
    permissions: [
      'workflows.view', 'workflows.create', 'workflows.edit', 'workflows.execute',
      'data.view', 'data.query',
      'ai.assistant.use',
      'collaboration.view', 'collaboration.edit', 'collaboration.comments'
    ]
  },
  analyst: {
    level: 40,
    permissions: [
      'data.view', 'data.export', 'data.query', 'data.dashboard', 'data.reports',
      'analytics.view', 'analytics.create', 'analytics.share',
      'ai.assistant.use'
    ]
  },
  operator: {
    level: 30,
    permissions: [
      'workflows.view', 'workflows.execute',
      'data.view', 'data.query', 'data.dashboard',
      'analytics.view',
      'ai.assistant.use'
    ]
  },
  viewer: {
    level: 20,
    permissions: [
      'workflows.view',
      'data.view', 'data.dashboard',
      'analytics.view'
    ]
  },
  guest: {
    level: 10,
    permissions: [
      'workflows.view',
      'data.view'
    ]
  }
};

interface RBACProviderProps {
  children: React.ReactNode;
  userPermissions: UserPermissions | null;
}

export const RBACProvider: React.FC<RBACProviderProps> = ({
  children,
  userPermissions
}) => {
  const rbacContext = useMemo((): RBACContextType => {
    const hasPermission = (permission: Permission): boolean => {
      if (!userPermissions) return false;

      // Check custom permissions first
      if (userPermissions.customPermissions.includes(permission)) {
        return true;
      }

      // Check role-based permissions
      const rolePermissions = ROLE_HIERARCHY[userPermissions.role]?.permissions || [];
      return rolePermissions.includes(permission);
    };

    const hasAnyPermission = (permissions: Permission[]): boolean => {
      return permissions.some(permission => hasPermission(permission));
    };

    const hasAllPermissions = (permissions: Permission[]): boolean => {
      return permissions.every(permission => hasPermission(permission));
    };

    const hasRole = (role: UserRole): boolean => {
      return userPermissions?.role === role;
    };

    const hasAnyRole = (roles: UserRole[]): boolean => {
      return roles.includes(userPermissions?.role || 'guest');
    };

    const canAccessResource = (resourceId: string, action: string): boolean => {
      if (!userPermissions) return false;

      // Resource-based access control logic
      const permission = `${action}.${resourceId}` as Permission;
      return hasPermission(permission);
    };

    const getEffectivePermissions = (): Permission[] => {
      if (!userPermissions) return [];

      const rolePermissions = ROLE_HIERARCHY[userPermissions.role]?.permissions || [];
      return [...new Set([...rolePermissions, ...userPermissions.customPermissions])];
    };

    return {
      userPermissions,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasRole,
      hasAnyRole,
      canAccessResource,
      getEffectivePermissions
    };
  }, [userPermissions]);

  return (
    <RBACContext.Provider value={rbacContext}>
      {children}
    </RBACContext.Provider>
  );
};

// Higher-order component for permission-based rendering
export const withPermission = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermission: Permission | Permission[]
) => {
  return (props: P) => {
    const { hasPermission, hasAnyPermission } = useRBAC();

    const hasAccess = Array.isArray(requiredPermission)
      ? hasAnyPermission(requiredPermission)
      : hasPermission(requiredPermission);

    if (!hasAccess) {
      return null; // Or render an access denied component
    }

    return <WrappedComponent {...props} />;
  };
};

// Hook for conditional rendering based on permissions
export const usePermissionGuard = (permission: Permission | Permission[]) => {
  const { hasPermission, hasAnyPermission } = useRBAC();

  const canAccess = Array.isArray(permission)
    ? hasAnyPermission(permission)
    : hasPermission(permission);

  return canAccess;
};

// Component for access control
export const PermissionGuard: React.FC<{
  permission: Permission | Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ permission, fallback = null, children }) => {
  const canAccess = usePermissionGuard(permission);

  return canAccess ? <>{children}</> : <>{fallback}</>;
};

export default RBACProvider;
