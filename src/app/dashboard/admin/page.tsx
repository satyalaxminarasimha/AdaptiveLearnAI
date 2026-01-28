'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, UserPlus, Activity, GraduationCap, UserSquare, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminStats } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminStats } from '@/hooks/use-admin-stats';
import { Button } from '@/components/ui/button';

const iconMap: { [key: string]: React.ElementType } = {
    Users: Users,
    UserPlus: UserPlus,
    GraduationCap: GraduationCap,
    UserSquare: UserSquare,
};

export default function AdminDashboardPage() {
  const { stats, isLoading, refetch } = useAdminStats();

  const displayStats = stats ? [
    { title: 'Total Users', value: stats.totalUsers, icon: 'Users' },
    { title: 'Total Professors', value: stats.totalProfessors, icon: 'UserSquare' },
    { title: 'Total Students', value: stats.totalStudents, icon: 'GraduationCap' },
    { title: 'Admission Requests', value: stats.admissionRequests, icon: 'UserPlus' },
  ] : adminStats;

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome Admin</h1>
        <p className="text-muted-foreground">Here's an overview of your platform.</p>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {displayStats.map((stat) => {
            const Icon = iconMap[stat.icon];
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-3xl font-bold">{stat.value}</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </section>

      <section className="space-y-6">
        <Card>
          <CardHeader>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <Activity className="h-5 w-5" />
                 <CardTitle>Recent Activity</CardTitle>
               </div>
               <Button 
                 variant="outline" 
                 size="sm" 
                 onClick={refetch}
                 disabled={isLoading}
                 className="flex items-center gap-2"
               >
                 <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                 Refresh
               </Button>
             </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell><Skeleton className="h-4 w-[300px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                    </TableRow>
                  ))
                ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>{activity.description}</TableCell>
                      <TableCell>{activity.time}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                            activity.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : activity.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          )}
                        >
                          {activity.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No recent activity found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
