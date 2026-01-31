
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const studentFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
  confirmPassword: z.string(),
  year: z.coerce.number().min(2000, { message: 'Please enter a valid year.' }),
  department: z.string().min(2, { message: 'Department is required.' }),
  rollNo: z.string().min(1, { message: 'Roll number is required.' }),
  section: z.string().min(1, { message: 'Section is required.' }),
  branch: z.string().min(2, { message: 'Branch is required.' }),
  semester: z.coerce.number().min(1).max(8, { message: 'Semester must be between 1-8.' }),
  phoneNumber: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  fatherName: z.string().min(2, { message: 'Father\'s name is required.' }),
  motherName: z.string().min(2, { message: 'Mother\'s name is required.' }),
  parentPhoneNumber: z.string().min(10, { message: 'Please enter a valid parent phone number.' }),
  address: z.string().min(5, { message: 'Address is required.' }),
  dateOfBirth: z.string().min(1, { message: 'Date of birth is required.' }),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Please select gender.' }),
  bloodGroup: z.string().optional(),
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
    const emailRegex = /^[a-zA-Z0-9_.+-]+@anits\.edu\.in$/;
    return emailRegex.test(data.email);
}, {
    message: "Email must be a valid @anits.edu.in address",
    path: ['email'],
});


type StudentFormValues = z.infer<typeof studentFormSchema>;

const defaultValues: Partial<StudentFormValues> = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  year: new Date().getFullYear(),
  department: 'CSM',
  rollNo: '',
  section: '',
  branch: 'CSM',
  semester: 1,
  phoneNumber: '',
  fatherName: '',
  motherName: '',
  parentPhoneNumber: '',
  address: '',
  dateOfBirth: '',
  gender: undefined,
  bloodGroup: '',
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
          section: data.section,
          branch: data.branch,
          semester: data.semester,
          phoneNumber: data.phoneNumber,
          fatherName: data.fatherName,
          motherName: data.motherName,
          parentPhoneNumber: data.parentPhoneNumber,
          address: data.address,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          bloodGroup: data.bloodGroup,
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
                <Input placeholder="yourname@anits.edu.in" {...field} />
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
              <FormLabel>Batch Year (e.g., 2022)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="2022" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="section"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                    <SelectItem value="C">Section C</SelectItem>
                    <SelectItem value="D">Section D</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="semester"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semester</FormLabel>
                <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="branch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch</FormLabel>
                <FormControl>
                  <Input placeholder="CSM" {...field} />
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
        </div>
        
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="9876543210" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dateOfBirth"
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
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bloodGroup"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Blood Group (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fatherName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Father&apos;s Name</FormLabel>
                <FormControl>
                  <Input placeholder="Father's full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="motherName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mother&apos;s Name</FormLabel>
                <FormControl>
                  <Input placeholder="Mother's full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="parentPhoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent/Guardian Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="9876543210" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full address" {...field} />
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
