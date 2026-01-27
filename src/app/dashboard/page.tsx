
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // For the frontend prototype, we'll always redirect to the admin dashboard.
    router.replace('/dashboard/admin');
  }, [router]);

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
