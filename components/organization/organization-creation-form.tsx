'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Building2, Globe, Users, Clock, Settings, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface OrganizationFormData {
  name: string;
  description: string;
  industry: string;
  size: string;
  website: string;
  contact: {
    email: string;
    phone: string;
    supportEmail: string;
  };
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    timezone: string;
  };
  settings: {
    allowUserRegistration: boolean;
    requireEmailVerification: boolean;
    defaultUserRole: string;
    workingHours: {
      start: string;
      end: string;
    };
    dateFormat: string;
    timeFormat: string;
    currency: string;
    language: string;
  };
  billing?: {
    billingEmail: string;
    billingAddress: string;
    taxId: string;
  };
}

interface OrganizationCreationFormProps {
  onSuccess?: (organization: any) => void;
  onCancel?: () => void;
}

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 
  'Manufacturing', 'Consulting', 'Real Estate', 'Hospitality', 'Other'
];

const timezones = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
  'Australia/Sydney', 'Asia/Kolkata', 'America/Toronto', 'America/Mexico_City'
];

const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY'];

export function OrganizationCreationForm({ 
  onSuccess, 
  onCancel 
}: OrganizationCreationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    description: '',
    industry: '',
    size: '1-10',
    website: '',
    contact: {
      email: '',
      phone: '',
      supportEmail: ''
    },
    location: {
      address: '',
      city: '',
      state: '',
      country: '',
      timezone: 'UTC'
    },
    settings: {
      allowUserRegistration: false,
      requireEmailVerification: true,
      defaultUserRole: 'employee',
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      currency: 'USD',
      language: 'en'
    },
    billing: {
      billingEmail: '',
      billingAddress: '',
      taxId: ''
    }
  });

  const steps = [
    { title: 'Basic Info', icon: Building2 },
    { title: 'Contact & Location', icon: Globe },
    { title: 'Settings', icon: Settings },
    { title: 'Billing', icon: CreditCard }
  ];

  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return formData.name.trim() !== '' && formData.contact.email.trim() !== '';
      case 1:
        return formData.contact.email.trim() !== '';
      case 2:
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const onSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/organisations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Organization created successfully!');
        onSuccess?.(result.organization);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create organization');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Failed to create organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Organization Name *</label>
              <Input 
                placeholder="Enter organization name" 
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea 
                placeholder="Brief description of your organization"
                className="resize-none"
                rows={3}
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Industry</label>
                <Select value={formData.industry} onValueChange={(value) => updateFormData('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Organization Size</label>
                <Select value={formData.size} onValueChange={(value) => updateFormData('size', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="500+">500+ employees</SelectItem>
                    <SelectItem value="1000+">1000+ employees</SelectItem>
                    <SelectItem value="5000+">5000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Website</label>
              <Input 
                placeholder="https://example.com" 
                value={formData.website}
                onChange={(e) => updateFormData('website', e.target.value)}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Email *</label>
                  <Input 
                    placeholder="contact@example.com" 
                    value={formData.contact.email}
                    onChange={(e) => updateFormData('contact.email', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input 
                    placeholder="+1 (555) 123-4567" 
                    value={formData.contact.phone}
                    onChange={(e) => updateFormData('contact.phone', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Support Email</label>
                  <Input 
                    placeholder="support@example.com" 
                    value={formData.contact.supportEmail}
                    onChange={(e) => updateFormData('contact.supportEmail', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Location</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <Input 
                    placeholder="123 Main St" 
                    value={formData.location.address}
                    onChange={(e) => updateFormData('location.address', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <Input 
                      placeholder="New York" 
                      value={formData.location.city}
                      onChange={(e) => updateFormData('location.city', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">State</label>
                    <Input 
                      placeholder="NY" 
                      value={formData.location.state}
                      onChange={(e) => updateFormData('location.state', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Country</label>
                    <Input 
                      placeholder="USA" 
                      value={formData.location.country}
                      onChange={(e) => updateFormData('location.country', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <Select value={formData.location.timezone} onValueChange={(value) => updateFormData('location.timezone', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((timezone) => (
                        <SelectItem key={timezone} value={timezone}>
                          {timezone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">General Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Allow User Registration</label>
                    <p className="text-sm text-gray-500">
                      Let users register themselves for your organization
                    </p>
                  </div>
                  <Switch
                    checked={formData.settings.allowUserRegistration}
                    onCheckedChange={(checked) => updateFormData('settings.allowUserRegistration', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Require Email Verification</label>
                    <p className="text-sm text-gray-500">
                      Users must verify their email before accessing
                    </p>
                  </div>
                  <Switch
                    checked={formData.settings.requireEmailVerification}
                    onCheckedChange={(checked) => updateFormData('settings.requireEmailVerification', checked)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Default User Role</label>
                  <Select value={formData.settings.defaultUserRole} onValueChange={(value) => updateFormData('settings.defaultUserRole', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select default role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Working Hours & Format</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Working Hours Start</label>
                    <Input 
                      type="time" 
                      value={formData.settings.workingHours.start}
                      onChange={(e) => updateFormData('settings.workingHours.start', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Working Hours End</label>
                    <Input 
                      type="time" 
                      value={formData.settings.workingHours.end}
                      onChange={(e) => updateFormData('settings.workingHours.end', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date Format</label>
                    <Select value={formData.settings.dateFormat} onValueChange={(value) => updateFormData('settings.dateFormat', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Time Format</label>
                    <Select value={formData.settings.timeFormat} onValueChange={(value) => updateFormData('settings.timeFormat', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour</SelectItem>
                        <SelectItem value="24h">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Currency</label>
                    <Select value={formData.settings.currency} onValueChange={(value) => updateFormData('settings.currency', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Billing Information</h3>
              <p className="text-sm text-gray-500 mb-6">
                This information is optional and can be added later
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Billing Email</label>
                <Input 
                  placeholder="billing@example.com" 
                  value={formData.billing?.billingEmail || ''}
                  onChange={(e) => updateFormData('billing.billingEmail', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Billing Address</label>
                <Textarea 
                  placeholder="Enter billing address"
                  className="resize-none"
                  rows={3}
                  value={formData.billing?.billingAddress || ''}
                  onChange={(e) => updateFormData('billing.billingAddress', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tax ID</label>
                <Input 
                  placeholder="Tax identification number" 
                  value={formData.billing?.taxId || ''}
                  onChange={(e) => updateFormData('billing.taxId', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Organization</CardTitle>
        <CardDescription>
          Set up your organization to start managing projects and teams
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                index <= currentStep 
                  ? 'border-blue-500 bg-blue-50 text-blue-600' 
                  : 'border-gray-300 text-gray-400'
              }`}>
                <step.icon className="h-5 w-5" />
              </div>
              <span className={`ml-2 text-sm font-medium ${
                index <= currentStep ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  index < currentStep ? 'bg-blue-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {renderStepContent()}

          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <div className="flex space-x-2">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={isSubmitting}
                >
                  Previous
                </Button>
              )}

              <Button onClick={onSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentStep < steps.length - 1 ? 'Next' : 'Create Organization'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
