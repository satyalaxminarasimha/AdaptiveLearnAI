'use client';

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, XAxis, YAxis } from 'recharts';
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

export default function ViewAnalyticsPage() {
  const [selectedSemester, setSelectedSemester] = useState('1st Semester');
  const syllabusData = syllabusCompletionBySemester[selectedSemester as keyof typeof syllabusCompletionBySemester];
  const isLoadingRequests = false;
  
  return (
    <main className="flex-1 space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Visualizing platform data for students, professors, and syllabus progress.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student Growth</CardTitle>
            <CardDescription>Year-wise growth for students in the CSM department.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={userGrowthChartConfig} className="h-80 w-full">
              <BarChart accessibilityLayer data={studentGrowthData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="year" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="users" fill="var(--color-students)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Professor Growth</CardTitle>
            <CardDescription>Year-wise growth for professors in the CSM department.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={userGrowthChartConfig} className="h-80 w-full">
              <BarChart accessibilityLayer data={professorGrowthData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="year" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="users" fill="var(--color-professors)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
            <CardHeader>
            <CardTitle>Syllabus Completion Analysis</CardTitle>
            <CardDescription>
                Track the percentage of syllabus completed for each subject by semester.
            </CardDescription>
            <div className="pt-4">
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger className="w-[240px]">
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
                <ChartContainer config={syllabusCompletionChartConfig} className="mx-auto aspect-square h-80">
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel formatter={(value, name) => `${value}% - ${name}`}/>}
                        />
                        <Pie data={syllabusData} dataKey="completed" nameKey="subject" innerRadius={60} strokeWidth={5}>
                            {syllabusData.map((entry) => (
                                <Cell key={entry.subject} fill={entry.fill} />
                            ))}
                        </Pie>
                        <ChartLegend
                            content={<ChartLegendContent nameKey="subject" />}
                            className="!p-4"
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Admission Request Analytics</CardTitle>
                <CardDescription>Breakdown of admission requests by role and status.</CardDescription>
            </CardHeader>
            <CardContent>
                 {isLoadingRequests ? (
                    <div className="flex h-80 items-center justify-center">
                        <Skeleton className="h-full w-full" />
                    </div>
                 ) : (
                    <ChartContainer config={requestAnalyticsChartConfig} className="h-80 w-full">
                        <BarChart data={requestAnalyticsData} accessibilityLayer>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="pending" stackId="a" fill="var(--color-pending)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="approved" stackId="a" fill="var(--color-approved)" radius={[4, 4, 0, 0]} />
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
