'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/auth-context';
import { Trophy, Medal, Award, TrendingUp, Loader2, Crown, Star, Flame } from 'lucide-react';

interface StudentRanking {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    rollNo: string;
    avatarUrl?: string;
  };
  batch: string;
  section: string;
  totalScore: number;
  averageScore: number;
  quizzesAttempted: number;
  quizzesPassed: number;
  classRank: number;
  batchRank: number;
  overallRank: number;
  currentStreak: number;
  subjectScores: {
    subject: string;
    averageScore: number;
    quizzesAttempted: number;
    rank: number;
  }[];
}

export default function RankingsPage() {
  const [rankings, setRankings] = useState<StudentRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('class');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchRankings();
  }, [activeTab]);

  const fetchRankings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/rankings?type=${activeTab}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRankings(data);
      }
    } catch (error) {
      console.error('Failed to fetch rankings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 text-yellow-50">🥇 Gold</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400 text-gray-50">🥈 Silver</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600 text-amber-50">🥉 Bronze</Badge>;
    if (rank <= 10) return <Badge variant="secondary">Top 10</Badge>;
    return null;
  };

  const subjects = rankings.length > 0 && rankings[0].subjectScores
    ? [...new Set(rankings.flatMap(r => r.subjectScores.map(s => s.subject)))]
    : [];

  // Get current user's ranking
  const myRanking = rankings.find(r => r.studentId._id === user?.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">See how you stack up against your peers</p>
      </div>

      {/* My Ranking Card */}
      {myRanking && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Your Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="text-3xl font-bold">#{myRanking.classRank}</span>
                </div>
                <p className="text-sm text-muted-foreground">Class Rank</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-3xl font-bold">{myRanking.averageScore.toFixed(1)}%</span>
                </div>
                <p className="text-sm text-muted-foreground">Average Score</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-3xl font-bold">{myRanking.quizzesPassed}/{myRanking.quizzesAttempted}</span>
                </div>
                <p className="text-sm text-muted-foreground">Quizzes Passed</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-3xl font-bold">{myRanking.currentStreak}</span>
                </div>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 Podium */}
      {rankings.length >= 3 && (
        <div className="flex justify-center items-end gap-4 py-6">
          {/* 2nd Place */}
          <div className="flex flex-col items-center">
            <Avatar className="w-16 h-16 border-4 border-gray-300">
              <AvatarImage src={rankings[1]?.studentId.avatarUrl} />
              <AvatarFallback>{rankings[1]?.studentId.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="mt-2 text-center">
              <p className="font-semibold text-sm">{rankings[1]?.studentId.name}</p>
              <p className="text-xs text-muted-foreground">{rankings[1]?.averageScore.toFixed(1)}%</p>
            </div>
            <div className="w-20 h-20 bg-gray-200 rounded-t-lg flex items-center justify-center mt-2">
              <span className="text-2xl font-bold text-gray-600">2</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <Crown className="w-8 h-8 text-yellow-500 mb-1" />
            <Avatar className="w-20 h-20 border-4 border-yellow-400">
              <AvatarImage src={rankings[0]?.studentId.avatarUrl} />
              <AvatarFallback className="text-xl">{rankings[0]?.studentId.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="mt-2 text-center">
              <p className="font-bold">{rankings[0]?.studentId.name}</p>
              <p className="text-sm text-muted-foreground">{rankings[0]?.averageScore.toFixed(1)}%</p>
            </div>
            <div className="w-24 h-28 bg-yellow-100 rounded-t-lg flex items-center justify-center mt-2">
              <span className="text-3xl font-bold text-yellow-600">1</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center">
            <Avatar className="w-14 h-14 border-4 border-amber-400">
              <AvatarImage src={rankings[2]?.studentId.avatarUrl} />
              <AvatarFallback>{rankings[2]?.studentId.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="mt-2 text-center">
              <p className="font-semibold text-sm">{rankings[2]?.studentId.name}</p>
              <p className="text-xs text-muted-foreground">{rankings[2]?.averageScore.toFixed(1)}%</p>
            </div>
            <div className="w-16 h-16 bg-amber-100 rounded-t-lg flex items-center justify-center mt-2">
              <span className="text-xl font-bold text-amber-600">3</span>
            </div>
          </div>
        </div>
      )}

      {/* Rankings Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Full Rankings</CardTitle>
              <CardDescription>Complete leaderboard with detailed stats</CardDescription>
            </div>
            <div className="flex gap-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="class">Class</TabsTrigger>
                  <TabsTrigger value="batch">Batch</TabsTrigger>
                  <TabsTrigger value="overall">Overall</TabsTrigger>
                </TabsList>
              </Tabs>
              {subjects.length > 0 && (
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {rankings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No rankings available yet</p>
              <p className="text-sm">Complete quizzes to appear on the leaderboard!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-right">Avg Score</TableHead>
                  <TableHead className="text-right">Quizzes</TableHead>
                  <TableHead className="text-right">Pass Rate</TableHead>
                  <TableHead className="text-right">Streak</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankings.map((ranking, index) => {
                  const rank = activeTab === 'class' ? ranking.classRank 
                    : activeTab === 'batch' ? ranking.batchRank 
                    : ranking.overallRank;
                  const isCurrentUser = ranking.studentId._id === user?.id;
                  const passRate = ranking.quizzesAttempted > 0 
                    ? Math.round((ranking.quizzesPassed / ranking.quizzesAttempted) * 100) 
                    : 0;

                  return (
                    <TableRow 
                      key={ranking._id} 
                      className={isCurrentUser ? 'bg-primary/5 font-medium' : ''}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRankIcon(rank)}
                          {getRankBadge(rank)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={ranking.studentId.avatarUrl} />
                            <AvatarFallback>{ranking.studentId.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {ranking.studentId.name}
                              {isCurrentUser && <span className="text-primary ml-2">(You)</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">{ranking.studentId.rollNo}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {ranking.averageScore.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right">
                        {ranking.quizzesAttempted}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={passRate >= 70 ? 'default' : passRate >= 50 ? 'secondary' : 'destructive'}>
                          {passRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {ranking.currentStreak > 0 && (
                          <div className="flex items-center justify-end gap-1">
                            <Flame className="w-4 h-4 text-orange-500" />
                            {ranking.currentStreak}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
