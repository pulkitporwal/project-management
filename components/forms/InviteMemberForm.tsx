"use client"
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Mail, Send, Loader2, UserCheck, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

const invitationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  role: z.enum(['admin', 'manager', 'employee', 'viewer'])
    .refine(val => !!val, { message: 'Please select a role' }),
  department: z.string().optional(),
  customMessage: z.string().max(500, 'Message cannot exceed 500 characters').optional()
});

type InvitationFormData = z.infer<typeof invitationSchema>

interface InviteMemberFormProps {
  onInviteSent?: () => void
  trigger: React.ReactNode
}

export default function InviteMemberForm({ onInviteSent, trigger }: InviteMemberFormProps) {
  const params = useParams()
  const organisationId = params.organisationId as string
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null)

  const form = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: '',
      name: '',
      role: 'employee',
      department: '',
      customMessage: ''
    }
  })

  const checkUserExists = async (email: string) => {
    try {
      const response = await fetch(`/api/users/check?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      setIsNewUser(!data.exists)
    } catch (error) {
      console.error('Error checking user:', error)
      setIsNewUser(true) // Default to new user if check fails
    }
  }

  const handleEmailChange = (email: string) => {
    form.setValue('email', email)
    if (email && email.includes('@')) {
      checkUserExists(email)
    } else {
      setIsNewUser(null)
    }
  }

  const onSubmit = async (data: InvitationFormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/${organisationId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send invitation')
      }

      toast.success('Invitation sent successfully!')
      form.reset()
      setIsOpen(false)
      setIsNewUser(null)
      onInviteSent?.()
    } catch (error) {
      console.error('Error sending invitation:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInviteMessage = () => {
    if (isNewUser === null) return ''
    if (isNewUser) {
      return 'This user will need to create an account before accepting the invitation.'
    } else {
      return 'This user is already registered and can accept the invitation directly.'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invite Team Member
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Enter email address" 
                        {...field}
                        onChange={(e) => handleEmailChange(e.target.value)}
                      />
                    </FormControl>
                    {isNewUser !== null && (
                      <div className={`mt-1 text-xs flex items-center gap-1 ${isNewUser ? 'text-blue-600' : 'text-green-600'}`}>
                        {isNewUser ? <UserPlus className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                        {getInviteMessage()}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter department" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add a personal message to the invitation..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invite
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
