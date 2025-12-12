'use client';

import { useState, ReactNode } from 'react';
import { useOrganization } from '@/providers/organization-provider';
import { OrganizationDialog } from '@/components/organization/organization-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Plus, Users } from 'lucide-react';

interface OrganizationGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function OrganizationGuard({ children, fallback }: OrganizationGuardProps) {
  const { hasOrganization, isLoading, currentOrganization } = useOrganization();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasOrganization) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return <NoOrganizationScreen />;
  }

  return <>{children}</>;
}

function NoOrganizationScreen() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Welcome to Project Manager</CardTitle>
            <CardDescription>
              You're not part of any organization yet. Create your first organization to get started.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Collaborate with Teams</p>
                  <p className="text-xs text-gray-600">Work together with your team members</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Building2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Manage Projects</p>
                  <p className="text-xs text-gray-600">Organize and track your projects efficiently</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="w-full"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Organization
            </Button>
          </CardContent>
        </Card>
      </div>

      <OrganizationDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
}
