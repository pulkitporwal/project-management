'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Settings, Users, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Organization {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  userRole: 'admin' | 'manager' | 'employee';
  userPermissions?: string[];
  joinedAt: string;
}

interface OrganizationSwitcherProps {
  onCreateNew?: () => void;
  onOrganizationChange?: (orgId: string) => void;
}

export function OrganizationSwitcher({
  onOrganizationChange
}: OrganizationSwitcherProps) {
  const { data: session } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, [session?.user?.id]);

  const fetchOrganizations = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/organisations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations);

        // Find current organization (you might want to store this in session or context)
        const current = data.organizations.find((org: Organization) =>
          org._id === session.user?.currentOrganization
        );
        setCurrentOrganization(current || data.organizations[0] || null);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchOrganization = async (orgId: string) => {
    try {
      const response = await fetch('/api/organisations/switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organisationId: orgId }),
      });

      if (response.ok) {
        const data = await response.json();
        const newOrg = organizations.find(org => org._id === orgId);
        setCurrentOrganization(newOrg || null);
        onOrganizationChange?.(orgId);
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'manager': return 'bg-blue-500';
      case 'employee': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'manager': return 'Manager';
      case 'employee': return 'Employee';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 animate-pulse rounded-md bg-gray-200" />
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  if (!organizations || organizations.length === 0) {
    return (
      <Link
        href={"/create-organisations"}
        className="flex items-center space-x-2 bg-gray-100 p-2 rounded-md"
      >
        <Plus className="h-4 w-4" />
        <span>Create Organization</span>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center justify-between w-full p-2 hover:bg-gray-100"
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentOrganization?.logo} />
              <AvatarFallback>
                <Building2 className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium truncate max-w-[150px]">
                {currentOrganization?.name || 'Select Organization'}
              </span>
              {/* {currentOrganization && (
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getRoleColor(currentOrganization.userRole)} text-white`}
                >
                  {getRoleLabel(currentOrganization.userRole)[0]}
                </Badge>
              )} */}
            </div>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80" align="start">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-gray-900">Organizations</p>
          <p className="text-xs text-gray-500">Switch between your organizations</p>
        </div>

        <DropdownMenuSeparator />

        {organizations.map((org) => (
          <DropdownMenuItem
            key={org._id}
            className="flex items-center justify-between p-2 cursor-pointer"
            onClick={() => handleSwitchOrganization(org._id)}
          >
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={org.logo} />
                <AvatarFallback>
                  <Building2 className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{org.name}</span>
                {org.description && (
                  <span className="text-xs text-gray-500 truncate max-w-[150px]">
                    {org.description}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant="secondary"
                className={`text-xs ${getRoleColor(org.userRole)} text-white`}
              >
                {getRoleLabel(org.userRole)}
              </Badge>
              {currentOrganization?._id === org._id && (
                <div className="h-2 w-2 rounded-full bg-blue-500" />
              )}
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <Link href="/create-organisations">

          <DropdownMenuItem
            className="flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Organization</span>
          </DropdownMenuItem></Link>

        {currentOrganization?.userRole === 'admin' && (
          <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            <span>Organization Settings</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer">
          <Users className="h-4 w-4" />
          <span>Invite Members</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
