'use client';

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  professorGrowthData,
  requestAnalyticsChartConfig,
  studentGrowthData,
  syllabusCompletionBySemester,
  syllabusCompletionChartConfig,
  userGrowthChartConfig,
  requestAnalyticsData
} from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, PieChartIcon, TrendingUp, Users } from 'lucide-react';

export default function ViewAnalyticsPage() {
  const [selectedSemester, setSelectedSemester] = useState('1st Semester');
  const syllabusData = syllabusCompletionBySemester[selectedSemester as keyof typeof syllabusCompletionBySemester];
  const isLoadingRequests = false;
  
  return (
    <main className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Visualizing platform data for students, professors, and syllabus progress.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base">Student Growth</CardTitle>
                <CardDescription className="text-xs sm:text-sm hidden sm:block">Year-wise growth for students in the CSM department.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pl-0 sm:pl-2">
            <ChartContainer config={userGrowthChartConfig} className="h-56 sm:h-72 md:h-80 w-full">
              <BarChart accessibilityLayer data={studentGrowthData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="year" tickLine={false} tickMargin={10} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize={12} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="users" fill="var(--color-students)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base">Professor Growth</CardTitle>
                <CardDescription className="text-xs sm:text-sm hidden sm:block">Year-wise growth for professors in the CSM department.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pl-0 sm:pl-2">
            <ChartContainer config={userGrowthChartConfig} className="h-56 sm:h-72 md:h-80 w-full">
              <BarChart accessibilityLayer data={professorGrowthData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="year" tickLine={false} tickMargin={10} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize={12} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="users" fill="var(--color-professors)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <Card className="animate-fade-in" style={{ animationDelay: '300ms' }}>
            <CardHeader className="pb-2 sm:pb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <PieChartIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-sm sm:text-base">Syllabus Completion Analysis</CardTitle>
                  <CardDescription className="text-xs sm:text-sm hidden sm:block">
                    Track the percentage of syllabus completed for each subject.
                  </CardDescription>
                </div>
              </div>
            <div className="pt-3 sm:pt-4">
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger className="w-full sm:w-[240px] text-sm">
                        <SelectValue placeholder="Select Semester" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(syllabusCompletionBySemester).map(semester => (
                            <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
                <ChartContainer config={syllabusCompletionChartConfig} className="mx-auto aspect-square h-56 sm:h-72 md:h-80">
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel formatter={(value, name) => `${value}% - ${name}`}/>}
                        />
                        <Pie data={syllabusData} dataKey="completed" nameKey="subject" innerRadius={50} strokeWidth={5}>
                            {syllabusData.map((entry) => (
                                <Cell key={entry.subject} fill={entry.fill} />
                            ))}
                        </Pie>
                        <ChartLegend
                            content={<ChartLegendContent nameKey="subject" />}
                            className="!p-2 sm:!p-4 text-xs sm:text-sm"
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '400ms' }}>
            <CardHeader className="pb-2 sm:pb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-sm sm:text-base">Admission Request Analytics</CardTitle>
                  <CardDescription className="text-xs sm:text-sm hidden sm:block">Breakdown of admission requests by role and status.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                 {isLoadingRequests ? (
                    <div className="flex h-56 sm:h-72 md:h-80 items-center justify-center">
                        <Skeleton className="h-full w-full rounded-lg" />
                    </div>
                 ) : (
                    <ChartContainer config={requestAnalyticsChartConfig} className="h-56 sm:h-72 md:h-80 w-full">
                        <BarChart data={requestAnalyticsData} accessibilityLayer>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} fontSize={12} />
                            <YAxis fontSize={12} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Bar dataKey="pending" stackId="a" fill="var(--color-pending)" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="approved" stackId="a" fill="var(--color-approved)" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="rejected" stackId="a" fill="var(--color-rejected)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                 )}
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
