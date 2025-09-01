import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, FileText, Video, Headphones, Languages, Sparkles, GraduationCap, CheckCircle2 } from 'lucide-react';

export default async function LearnLandingPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-10">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-emerald-50 to-sky-50 p-6 md:p-10">
          <div className="relative z-10 max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" /> New: Official SEBI/NISM Guides now in multiple languages
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Learn Trading the Right Way</h1>
            <p className="text-muted-foreground text-base md:text-lg">
              A modern learning experience with structured modules, hands‑on lessons, and official SEBI/NISM guides
              transformed into interactive content. Available in English and Hindi for broader inclusion.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/learn/modules">Explore Modules</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/learn/guides">Browse Guides</Link>
              </Button>
            </div>
          </div>
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/40 blur-3xl" />
        </section>

        {/* What you get */}
        <section className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-2xl border-emerald-100/60 bg-gradient-to-br from-white to-emerald-50/30 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-emerald-600" /> Modular learning path
              </CardTitle>
              <CardDescription>Journeys and lessons designed for outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" /> Guided journeys with clear objectives, prerequisites, and time estimates</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" /> Lessons include quizzes, interactive widgets, concept breakdowns, and reflections</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" /> Trackable structure with difficulty levels and lesson ordering</li>
              </ul>
              <div className="mt-4">
                <Button asChild size="sm">
                  <Link href="/learn/modules">Go to Modules</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-sky-100/60 bg-gradient-to-br from-white to-sky-50/30 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-sky-600" /> Official Guides, reimagined
              </CardTitle>
              <CardDescription>SEBI/NISM sources turned into interactive content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-sm"><Headphones className="h-4 w-4 text-sky-600" /> Audio podcasts</div>
                <div className="flex items-center gap-2 text-sm"><Video className="h-4 w-4 text-sky-600" /> Video summaries</div>
                <div className="flex items-center gap-2 text-sm"><BookOpen className="h-4 w-4 text-sky-600" /> Study guides</div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Languages className="h-3.5 w-3.5" /> English and Hindi support for broader reach and inclusion
              </div>
              <div className="mt-2">
                <Button asChild size="sm" variant="outline">
                  <Link href="/learn/guides">Go to Guides</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Badges */}
        <section className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="secondary" className="rounded-full border border-emerald-200/70 bg-emerald-50 text-emerald-700">SEBI-aligned</Badge>
          <Badge variant="secondary" className="rounded-full border border-sky-200/70 bg-sky-50 text-sky-700">Beginner friendly</Badge>
          <Badge variant="secondary" className="rounded-full">Outcome-focused</Badge>
        </section>
      </div>
    </MainLayout>
  );
}
