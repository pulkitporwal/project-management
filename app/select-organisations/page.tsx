"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building2, Plus, Settings } from "lucide-react";
import { toast } from "sonner";

interface Organization {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  userRole: 'admin' | 'manager' | 'employee';
  userPermissions?: string[];
  joinedAt: string;
}

export default function SelectOrganizationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchOrganizations();
    }
  }, [status, router]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/organisations');
      
      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }

      const data = await response.json();
      setOrganizations(data.organizations || []);

      // If user has a current organization, redirect directly
      if (session?.user?.currentOrganization) {
        const currentOrg = data.organizations?.find((org: Organization) => 
          org._id === session.user.currentOrganization
        );
        // if (currentOrg) {
        //   router.push(`/${session.user.currentOrganization}/dashboard`);
        //   return;
        // }
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrganization = async (orgId: string) => {
    try {
      setSwitching(orgId);
      const response = await fetch('/api/organisations/switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organisationId: orgId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to switch organization');
      }

      toast.success('Organization selected successfully');
      router.push(`/${orgId}/dashboard`);
    } catch (error) {
      console.error('Error switching organization:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to select organization');
    } finally {
      setSwitching(null);
    }
  };

  const handleCreateOrganization = () => {
    router.push('/create-organisations');
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Select Your Organization
          </h1>
          <p className="text-gray-600">
            Choose an organization to continue working with your projects and team
          </p>
        </div>

        {organizations.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>No Organizations Found</CardTitle>
              <CardDescription>
                You don't have access to any organizations yet. Create your first organization to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={handleCreateOrganization} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Organization</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <Card 
                key={org._id} 
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => handleSelectOrganization(org._id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={org.logo} />
                      <AvatarFallback>
                        <Building2 className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{org.name}</CardTitle>
                      {org.description && (
                        <CardDescription className="text-sm truncate">
                          {org.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="secondary" 
                      className={`${getRoleColor(org.userRole)} text-white`}
                    >
                      {getRoleLabel(org.userRole)}
                    </Badge>
                    {switching === org._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Button variant="ghost" size="sm">
                        Select →
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Joined {new Date(org.joinedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
            
            {/* Create New Organization Card */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-dashed"
              onClick={handleCreateOrganization}
            >
              <CardHeader className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-gray-600" />
                </div>
                <CardTitle className="text-lg">Create New Organization</CardTitle>
                <CardDescription>
                  Start a new organization and invite your team
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        <div className="mt-8 text-center">
          <Button 
            variant="outline" 
            onClick={() => router.push('/auth/signout')}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
