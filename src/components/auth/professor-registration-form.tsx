
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const passwordValidation = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
);

const professorFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }).regex(
    /^[a-zA-Z0-9_.+-]+@anits\.edu\.in$/,
    "Email must be a valid @anits.edu.in address"
  ),
  phoneNumber: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }).regex(passwordValidation, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  }),
  confirmPassword: z.string(),
  dob: z.string().min(1, { message: 'Date of birth is required.' }),
  department: z.string().min(2, { message: 'Department is required.' }),
  yearsOfExperience: z.coerce.number().min(0, { message: 'Years of experience cannot be negative.' }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfessorFormValues = z.infer<typeof professorFormSchema>;

const defaultValues: Partial<ProfessorFormValues> = {
  name: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  dob: '',
  department: 'CSM',
  yearsOfExperience: 0,
};

export function ProfessorRegistrationForm() {
  const { toast } = useToast();

  const form = useForm<ProfessorFormValues>({
    resolver: zodResolver(professorFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  async function onSubmit(data: ProfessorFormValues) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: 'professor',
          dob: data.dob,
          department: data.department,
          phoneNumber: data.phoneNumber,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Registration Request Submitted',
          description: 'Your request has been sent to the administrator for approval.',
        });
        form.reset();
      } else {
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: result.error || 'Something went wrong.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: 'Network error. Please try again.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Dr. Alan Turing" {...field} />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="yourname@anits.edu.in" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="(123) 456-7890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dob"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Input placeholder="CSM" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="yearsOfExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Years of Experience</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Submit Request</Button>
      </form>
    </Form>
  );
}
