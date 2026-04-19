
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BrainCircuit,
  Library,
  Shield,
  User as UserIcon,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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

const roles: { icon: React.ElementType; title: Role }[] = [
  {
    icon: Shield,
    title: 'Administrator',
  },
  {
    icon: Library,
    title: 'Professor',
  },
  {
    icon: UserIcon,
    title: 'Student',
  },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();

  const openRegistration = (event: React.MouseEvent) => {
    event.preventDefault();
    setShowRegistration(true);
  };

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedRole) {
      return;
    }

    const result = await login(email, password, selectedRole === 'Administrator' ? 'admin' : selectedRole.toLowerCase() as 'student' | 'professor' | 'admin');

    if (!result.success) {
      toast({
        variant: 'destructive',
        title: selectedRole === 'Administrator' ? 'Invalid Credentials' : 'Login Failed',
        description: result.error || 'Please check your email and password.',
      });
      return;
    }

    const roleToRoute = result.user?.role || (selectedRole === 'Administrator' ? 'admin' : selectedRole.toLowerCase());

    if (roleToRoute === 'admin') {
      router.push('/dashboard/admin');
      return;
    }

    if (roleToRoute === 'professor') {
      router.push('/dashboard/professor');
      return;
    }

    router.push('/dashboard/student');
  };

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6">

      <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
        <DialogContent className="max-h-[90vh] sm:max-w-[500px] overflow-y-auto">
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

      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md items-center">
        <Card className="w-full border-border/80 shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">AdaptiveLearnAI</CardTitle>
                <CardDescription>Sign in to continue</CardDescription>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/40 p-1">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.title;

                return (
                  <button
                    key={role.title}
                    type="button"
                    onClick={() => setSelectedRole(role.title)}
                    className={`rounded-md px-2 py-2 text-center text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Icon className="h-4 w-4" />
                      <span>{role.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardHeader>

          {selectedRole ? (
            <>
              <CardContent className="px-6 pb-6 pt-0">
                <form className="space-y-4" onSubmit={handleSignIn}>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="text"
                      placeholder="Enter your email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-11"
                    />
                  </div>
                  <Button type="submit" className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Sign in
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="justify-center border-t px-6 py-4 text-sm">
                {selectedRole !== 'Administrator' ? (
                  <p className="text-center text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link href="#" className="font-semibold text-primary underline-offset-4 hover:underline" onClick={openRegistration}>
                      Request an account
                    </Link>
                  </p>
                ) : (
                  <p className="text-center text-muted-foreground">Use approved administrator credentials.</p>
                )}
              </CardFooter>
            </>
          ) : (
            <CardContent className="px-6 pb-8 pt-2 text-center text-sm text-muted-foreground">
              Select a role above, then sign in.
            </CardContent>
          )}
        </Card>
      </div>
    </main>
  );
}
