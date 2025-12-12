'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { OrganizationCreationForm } from './organization-creation-form';
import { toast } from 'sonner';

interface OrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (organization: any) => void;
}

export function OrganizationDialog({ 
  open, 
  onOpenChange, 
  onSuccess 
}: OrganizationDialogProps) {
  const handleSuccess = (organization: any) => {
    toast.success('Organization created successfully!');
    onSuccess?.(organization);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Organization</DialogTitle>
        </DialogHeader>
        
        <OrganizationCreationForm 
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
