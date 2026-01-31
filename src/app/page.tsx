
'use client';

import { useState } from 'react';
import { BrainCircuit, Shield, Library, User as UserIcon, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfessorRegistrationForm } from '@/components/auth/professor-registration-form';
import { StudentRegistrationForm } from '@/components/auth/student-registration-form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

type Role = 'Administrator' | 'Professor' | 'Student';

const roles: { icon: React.ElementType; title: Role; description: string }[] = [
  {
    icon: Shield,
    title: 'Administrator',
    description: 'Manage knowledge base & users',
  },
  {
    icon: Library,
    title: 'Professor',
    description: 'Create syllabus & auto-quizzes',
  },
  {
    icon: UserIcon,
    title: 'Student',
    description: 'Learn with adaptive AI tutor',
  },
];

const passwordValidation = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
);
const professorEmailValidation = new RegExp(/^[a-zA-Z0-9_.-]+.csm@anits\.edu\.in$/);


export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleRoleClick = (role: Role) => {
    setSelectedRole(role);
  };
  
  const openRegistration = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowRegistration(true);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    // For admin, use the same API login as other roles
    if (selectedRole === 'Administrator') {
      const result = await login(email, password);
      if (result.success) {
        router.push('/dashboard/admin');
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid Credentials',
          description: result.error || 'Please check your email and password.',
        });
      }
      return;
    }

    // For professor and student, use API login
    if (selectedRole === 'Professor') {
      if (!professorEmailValidation.test(email)) {
        toast({
          variant: 'destructive',
          title: 'Invalid Email Format',
          description: "Professor email must be in the format 'name.csm@anits.edu.in'",
        });
        return;
      }
      if (!passwordValidation.test(password)) {
        toast({
          variant: 'destructive',
          title: 'Invalid Password Format',
          description: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special characters.',
        });
        return;
      }

      const result = await login(email, password);
      if (result.success) {
        router.push('/dashboard/professor');
      } else {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: result.error,
        });
      }
      return;
    }

    if (selectedRole === 'Student') {
      const studentEmailValidation = /^[a-zA-Z0-9_.-]+\.(\d{2})\.csm@anits\.edu\.in$/;
      const rollNoValidation = /^A(\d{2})\d{9}$/;

      const emailMatch = email.match(studentEmailValidation);
      if (!emailMatch) {
        toast({
          variant: 'destructive',
          title: 'Invalid Email Format',
          description: "Student email must be in the format 'name.YY.csm@anits.edu.in'",
        });
        return;
      }

      const rollNoMatch = password.match(rollNoValidation);
      if (!rollNoMatch) {
        toast({
          variant: 'destructive',
          title: 'Invalid Password',
          description: "Password must be your Roll Number in the format 'A<YY><9 digits>'.",
        });
        return;
      }

      const yearFromEmail = emailMatch[1];
      const yearFromRollNo = rollNoMatch[1];

      if (yearFromEmail !== yearFromRollNo) {
        toast({
          variant: 'destructive',
          title: 'Login Error',
          description: 'The batch year in your email does not match the year in your Roll Number.',
        });
        return;
      }

      const result = await login(email, password);
      if (result.success) {
        router.push('/dashboard/student');
      } else {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: result.error,
        });
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/20 p-4">
      <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Request an Account</DialogTitle>
              <DialogDescription>
                Fill out the form below to request an account. Your request will be sent to the administrator for approval.
              </DialogDescription>
            </DialogHeader>
            {selectedRole === 'Professor' && <ProfessorRegistrationForm />}
            {selectedRole === 'Student' && <StudentRegistrationForm />}
          </DialogContent>
        </Dialog>
      <div className="grid w-full max-w-6xl grid-cols-1 gap-16 rounded-lg bg-background p-8 shadow-2xl md:grid-cols-2 md:p-12">
        {/* Left Side */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BrainCircuit className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-4xl font-bold text-primary">LearnAI</h1>
            </div>
            <p className="mb-10 text-lg text-muted-foreground">
              Adaptive LLM-powered learning platform with personalized AI tutoring.
            </p>

            <h2 className="mb-4 text-xl font-semibold">Quick Demo Access</h2>
            <div className="space-y-4">
              {roles.map((role) => (
                <div 
                  key={role.title}
                  className="group flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all hover:border-primary hover:shadow-md"
                  onClick={() => handleRoleClick(role.title)}
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-md bg-primary/10 p-3">
                      <role.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{role.title}</h3>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
              ))}
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-muted-foreground md:text-left">
            Powered by RAG-based AI • Adaptive Learning • Real-time Quiz Generation
          </p>
        </div>

        {/* Right Side */}
        {selectedRole && (
            <div className="flex items-center justify-center">
            <Card className="w-full max-w-md border-0 shadow-none md:border md:shadow-lg">
                <CardHeader>
                <CardTitle className="text-2xl">Sign In</CardTitle>
                <CardDescription>Enter your credentials to access your dashboard as a {selectedRole?.toLowerCase()}.</CardDescription>
                </CardHeader>
                <CardContent>
                <form className="space-y-4" onSubmit={handleSignIn}>
                    <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@university.edu" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>


                    
                    <div className="pt-2">
                      <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                          Sign In
                      </Button>
                    </div>
                </form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm">
                    {selectedRole !== 'Administrator' && (
                        <p>
                        Don't have an account?{' '}
                        <Link href="#" className="font-semibold text-primary hover:underline" onClick={openRegistration}>
                            Request an account
                        </Link>
                        </p>
                    )}
                </CardFooter>
            </Card>
            </div>
        )}
      </div>
    </main>
  );
}
