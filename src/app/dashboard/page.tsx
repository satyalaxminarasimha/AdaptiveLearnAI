
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';

export default function DashboardRedirect() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace('/');
      return;
    }

    router.replace(`/dashboard/${user.role}`);
  }, [isLoading, user, router]);

  return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-background">
        <h1 className="text-xl font-medium text-muted-foreground">Loading Your Dashboard...</h1>
        <div className="w-64 space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-4/5" />
        </div>
      </div>
  );
}
