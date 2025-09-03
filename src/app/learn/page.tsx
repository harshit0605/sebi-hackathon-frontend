import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, FileText, Video, Headphones, Languages, Sparkles, GraduationCap, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export default async function LearnLandingPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 pt-2 space-y-5">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-transparent bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-cyan-50/70 backdrop-blur-md p-6 md:p-6 shadow-sm">
          <div className="relative z-10 space-y-4">
            {/* <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 backdrop-blur px-3 py-1 text-xs text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" /> New: Official SEBI/NISM Guides now in multiple languages
            </div> */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Learn Trading the Right Way</h1>
              <div className="flex flex-wrap items-center gap-2 text-xs md:mt-0">
                <Badge variant="secondary" className="rounded-full border border-emerald-200/70 bg-emerald-50 text-emerald-700">SEBI-aligned</Badge>
                <Badge variant="secondary" className="rounded-full border border-sky-200/70 bg-sky-50 text-sky-700">Beginner friendly</Badge>
                <Badge variant="secondary" className="rounded-full">Outcome-focused</Badge>
              </div>

            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 backdrop-blur px-3 py-1 text-xs text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" /> <span className='text-sm'>New: Official SEBI/NISM Guides now in multiple languages</span>
            </div>
            <p className="text-muted-foreground text-base md:text-lg">
              A modern learning experience with structured modules, hands‑on lessons, and official SEBI/NISM guides
              transformed into interactive content. <span className='text-brand-700 font-semibold'>Available in English and Hindi for broader inclusion.</span>
            </p>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/learn/modules">Explore Modules</Link>
                </Button>
                <Button asChild size="lg">
                  <Link href="/learn/guides">Browse Guides</Link>
                </Button>
              </div>

            </div>
          </div>
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/40 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-56 w-56 rounded-full bg-white/30 blur-3xl" />
        </section>

        {/* What you get */}
        <section className="grid gap-6 md:grid-cols-2 mb-4">
          {/* Modular learning path card (top image style) */}
          <Card className="rounded-2xl overflow-hidden border-transparent backdrop-blur-md bg-white/60 shadow-sm h-full flex flex-col pt-0">
            <div className="relative h-48 md:h-56 bg-emerald-50/40 p-2 md:p-3">
              <Image src="/learning-modules.jpeg" alt="Modular learning path" fill sizes="(min-width: 768px) 100vw, 100vw" className="object-contain" />
              <div className="absolute right-3 top-3">
                <Badge className="rounded-full bg-white/80 text-emerald-700 border border-emerald-200">SEBI aligned</Badge>
              </div>
            </div>
            <CardHeader className="">
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-emerald-600" /> Financial education modules
              </CardTitle>
              <CardDescription><span className='text-brand-700 font-semibold'>Structured journeys and lessons designed to foster informed trading decisions</span></CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex-1 flex flex-col">
              <div className="flex flex-col flex-1">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" /> Guided journeys with clear objectives, prerequisites, and time estimates</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" /> Lessons include quizzes, interactive widgets, concept breakdowns, and reflections</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" /> Trackable structure with difficulty levels and lesson ordering</li>
                </ul>
                <div className="mt-auto pt-4">
                  <Button asChild size="sm" className="self-start">
                    <Link href="/learn/modules">Go to Modules</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Official guides card (top image style) */}
          <Card className="rounded-2xl overflow-hidden border-transparent backdrop-blur-md bg-white/60 shadow-sm h-full flex flex-col pt-0">
            <div className="relative h-48 md:h-56 bg-sky-50/40 p-2 md:p-3">
              <Image src="/study-guides.jpeg" alt="Official guides reimagined" fill sizes="(min-width: 768px) 100vw, 100vw" className="object-contain" />
              <div className="absolute right-3 top-3">
                <Badge className="rounded-full bg-white/80 text-sky-700 border border-sky-200"><span className="text-md">Bilingual</span></Badge>
              </div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-sky-600" /> Official SEBI & NISM Guides, <span className='text-teal-500 font-bold'>Reimagined !</span><Sparkles className="h-3.5 w-3.5 text-teal-500" />
              </CardTitle>
              <CardDescription><span className='text-brand-700 font-semibold'>SEBI/NISM sources turned into interactive content</span> </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex-1 flex flex-col">
              <div className="flex flex-col flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2"><Headphones className="h-4 w-4 text-pink-500" /> <span className='text-brand-700 font-semibold'>Audio podcasts</span></div>
                  <div className="flex items-center gap-2"><Video className="h-4 w-4 text-pink-500" /> <span className='text-brand-700 font-semibold'>Video summaries</span></div>
                  <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-pink-500" /> <span className='text-brand-700 font-semibold'>Study guides</span></div>
                </div>
                <div className="flex items-center gap-2 text-md text-muted-foreground mt-3">
                  <Languages className="h-3.5 w-3.5" /> <span className='text-brand-700 font-semibold'>English and Hindi support for broader reach and inclusion</span>
                </div>
                <div className="mt-auto pt-4">
                  <Button asChild size="sm" className="self-start">
                    <Link href="/learn/guides">Go to Guides</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Badges moved to hero header */}
      </div>
    </MainLayout>
  );
}
