
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


const studentFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
  confirmPassword: z.string(),
  year: z.coerce.number().min(2000, { message: 'Please enter a valid year.' }),
  department: z.string().min(2, { message: 'Department is required.' }),
  rollNo: z.string().min(1, { message: 'Roll number is required.' }),
})
.refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})
.refine(data => data.password === data.rollNo, {
    message: "Password must be your full Roll Number.",
    path: ['password'],
})
.refine(data => {
    const emailRegex = /^[a-zA-Z0-9_.-]+\.(\d{2})\.csm@anits\.edu\.in$/;
    return emailRegex.test(data.email);
}, {
    message: "Invalid email format. Expected: 'name.YY.csm@anits.edu.in'",
    path: ['email'],
})
.refine(data => {
    const emailRegex = /^[a-zA-Z0-9_.-]+\.(\d{2})\.csm@anits\.edu\.in$/;
    const match = data.email.match(emailRegex);
    if (!match) return false;
    const yearFromEmail = parseInt(`20${match[1]}`, 10);
    return yearFromEmail === data.year;
}, {
    message: "The year in your email does not match the academic year entered.",
    path: ['year'],
})
.refine(data => {
    const emailRegex = /^[a-zA-Z0-9_.-]+\.(\d{2})\.csm@anits\.edu\.in$/;
    const match = data.email.match(emailRegex);
    if (!match) return false;
    const yearDigits = match[1];
    const rollNoRegex = new RegExp(`^A${yearDigits}\\d{9}$`);
    return rollNoRegex.test(data.rollNo);
}, {
    message: "Roll number must match the year in your email and the format A<YY><9 digits>.",
    path: ['rollNo'],
})
.refine(data => {
    return data.department.toLowerCase() === 'csm';
}, {
    message: "Only students from the CSM department can register.",
    path: ['department'],
});


type StudentFormValues = z.infer<typeof studentFormSchema>;

const defaultValues: Partial<StudentFormValues> = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  year: new Date().getFullYear(),
  department: 'csm',
  rollNo: '',
};

export function StudentRegistrationForm() {
  const { toast } = useToast();

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  async function onSubmit(data: StudentFormValues) {
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
          role: 'student',
          rollNo: data.rollNo,
          batch: data.year.toString(),
          section: '', // Will be set later or by admin
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
                <Input placeholder="John Doe" {...field} />
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
                <Input placeholder="john.doe.22.csm@anits.edu.in" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="rollNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Roll No.</FormLabel>
              <FormControl>
                <Input placeholder="A22126552167" {...field} />
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
              <FormLabel>Password (must be your Roll No.)</FormLabel>
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
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Academic Year (e.g., 2022)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="2022" {...field} />
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
                <Input placeholder="csm" {...field} />
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
