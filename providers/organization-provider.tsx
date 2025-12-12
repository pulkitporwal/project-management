'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface Organization {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  userRole: 'admin' | 'manager' | 'employee';
  userPermissions?: string[];
  joinedAt: string;
}

interface OrganizationContextType {
  organizations: Organization[];
  currentOrganization: Organization | null;
  isLoading: boolean;
  switchOrganization: (orgId: string) => Promise<void>;
  refreshOrganizations: () => Promise<void>;
  hasOrganization: boolean;
  userRoleInCurrentOrg: 'admin' | 'manager' | 'employee' | null;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}

interface OrganizationProviderProps {
  children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const { data: session, status } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchOrganizations();
    } else if (status === 'unauthenticated') {
      setOrganizations([]);
      setCurrentOrganization(null);
      setIsLoading(false);
    }
  }, [status, session?.user?.id]);

  const fetchOrganizations = async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/organisations');
      
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations);
        
        // Set current organization based on session or first available
        const current = data.organizations.find((org: Organization) => 
          org._id === session.user?.currentOrganization
        ) || data.organizations[0] || null;
        
        setCurrentOrganization(current);
      } else {
        console.error('Failed to fetch organizations');
        toast.error('Failed to load organizations');
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  };

  const switchOrganization = async (orgId: string) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/organisations/switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organisationId: orgId }),
      });

      if (response.ok) {
        const newOrg = organizations.find(org => org._id === orgId);
        setCurrentOrganization(newOrg || null);
        toast.success(`Switched to ${newOrg?.name}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to switch organization');
      }
    } catch (error) {
      console.error('Error switching organization:', error);
      toast.error('Failed to switch organization');
    }
  };

  const refreshOrganizations = async () => {
    await fetchOrganizations();
  };

  const hasOrganization = organizations.length > 0;
  const userRoleInCurrentOrg = currentOrganization?.userRole || null;

  const value: OrganizationContextType = {
    organizations,
    currentOrganization,
    isLoading,
    switchOrganization,
    refreshOrganizations,
    hasOrganization,
    userRoleInCurrentOrg,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}
