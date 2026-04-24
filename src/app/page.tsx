
import Link from 'next/link';
import {
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Library,
  Sparkles,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
const roleCards = [
  {
    icon: UserIcon,
    title: 'Students',
    summary: 'Take adaptive quizzes, track weak areas, and get AI-guided study plans.',
  },
  {
    icon: Library,
    title: 'Professors',
    summary: 'Create class quizzes, review analytics, and run real-time discussions.',
  },
  {
    icon: Shield,
    title: 'Administrators',
    summary: 'Manage admissions, users, content moderation, and campus-wide insights.',
  },
];

const highlights = [
  'AI-powered tutor with role-aware responses',
  'Unit-wise quiz generation from syllabus and textbooks',
  'Progress tracking, rankings, and weak-area analytics',
  'Live class discussions for student engagement',
];

export default function HomePage() {

  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/10 via-primary/5 to-transparent">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:py-20">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Personalized Campus Learning Platform
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Learn Smarter with AdaptiveLearnAI
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              Discover a unified learning space where students, professors, and admins collaborate using adaptive quizzes,
              analytics, and AI tutoring tailored to your syllabus.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link href="/login">
                  Start Learning
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>

          <Card className="w-full max-w-xl border-primary/20 bg-card/80 shadow-xl backdrop-blur">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">What You Can Do Here</h2>
                  <p className="text-sm text-muted-foreground">Built for outcomes, not just content delivery.</p>
                </div>
              </div>
              <ul className="space-y-3">
                {highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {roleCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="border-border/80 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="space-y-3 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{card.title}</h3>
                <p className="text-sm text-muted-foreground">{card.summary}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="border-t bg-muted/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            Ready to begin your adaptive learning journey?
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link href="/login">
              Continue to Login
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
