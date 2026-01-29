'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, UserPlus, Activity, GraduationCap, UserSquare, RefreshCw, TrendingUp, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminStats } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminStats } from '@/hooks/use-admin-stats';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const iconMap: { [key: string]: React.ElementType } = {
    Users: Users,
    UserPlus: UserPlus,
    GraduationCap: GraduationCap,
    UserSquare: UserSquare,
};

const colorMap: { [key: string]: string } = {
    Users: 'from-blue-500 to-blue-600',
    UserPlus: 'from-green-500 to-green-600',
    GraduationCap: 'from-purple-500 to-purple-600',
    UserSquare: 'from-orange-500 to-orange-600',
};

export default function AdminDashboardPage() {
  const { stats, isLoading, refetch } = useAdminStats();

  const displayStats = stats ? [
    { title: 'Total Users', value: stats.totalUsers, icon: 'Users', change: '+12%' },
    { title: 'Total Professors', value: stats.totalProfessors, icon: 'UserSquare', change: '+5%' },
    { title: 'Total Students', value: stats.totalStudents, icon: 'GraduationCap', change: '+18%' },
    { title: 'Admission Requests', value: stats.admissionRequests, icon: 'UserPlus', change: 'New' },
  ] : adminStats.map(s => ({ ...s, change: '' }));

  return (
    <main className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Welcome Admin
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Here's an overview of your platform.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refetch}
          disabled={isLoading}
          className="w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          Refresh Data
        </Button>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4 stagger-children">
          {displayStats.map((stat, index) => {
            const Icon = iconMap[stat.icon];
            const gradientClass = colorMap[stat.icon];
            return (
              <Card 
                key={stat.title} 
                className="group relative overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br",
                  gradientClass
                )} />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  {Icon && (
                    <div className={cn(
                      "p-1.5 sm:p-2 rounded-lg bg-gradient-to-br text-white transition-transform group-hover:scale-110",
                      gradientClass
                    )}>
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  {isLoading ? (
                    <Skeleton className="h-7 sm:h-8 w-16 sm:w-20" />
                  ) : (
                    <div className="flex items-end gap-2">
                      <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
                      {stat.change && (
                        <Badge variant="secondary" className="text-[10px] sm:text-xs mb-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5" />
                          {stat.change}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </section>

      <section className="space-y-4 sm:space-y-6">
        <Card className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <CardHeader className="pb-3 sm:pb-4">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
               <div className="flex items-center gap-2">
                 <div className="p-2 rounded-lg bg-primary/10">
                   <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                 </div>
                 <div>
                   <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
                   <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Latest platform updates</p>
                 </div>
               </div>
               <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                 <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                 <span>Updated just now</span>
               </div>
             </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell">Time</TableHead>
                    <TableHead className="font-semibold text-right sm:text-left">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`} className="animate-pulse">
                        <TableCell><Skeleton className="h-4 w-full max-w-[300px]" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell className="text-right sm:text-left"><Skeleton className="h-6 w-[80px] ml-auto sm:ml-0" /></TableCell>
                      </TableRow>
                    ))
                  ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((activity, index) => (
                      <TableRow 
                        key={activity.id} 
                        className="group cursor-pointer animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="line-clamp-1">{activity.description}</span>
                            <span className="text-xs text-muted-foreground sm:hidden">{activity.time}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">{activity.time}</TableCell>
                        <TableCell className="text-right sm:text-left">
                          <Badge
                            className={cn(
                              'transition-all duration-200 group-hover:scale-105',
                              activity.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : activity.status === 'approved'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                            )}
                          >
                            {activity.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                          <Activity className="h-8 w-8 opacity-50" />
                          <span>No recent activity found.</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
