import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, Clock, CheckCircle2, Tag as TagIcon, Layers, GraduationCap, Landmark, ShieldCheck, ExternalLink, Sparkles } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { notFound } from 'next/navigation';
import type { Lesson, LearningJourney } from '@/lib/learn/types';

function difficultyBadge(d?: string) {
  switch (d) {
    case 'easy':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'hard':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function levelBadge(level?: string) {
  switch (level) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800';
    case 'advanced':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default async function JourneyPage({ params }: { params: Promise<{ journey: string }> }) {
  const { journey: journeySlug } = await params;
  let journey: LearningJourney | null = null;
  let lessons: Lesson[] = [];
  let loadError: string | null = null;
  try {
    const { fetchJourneyBySlug, fetchLessonsByJourney } = await import('@/lib/learn/loaders');
    journey = await fetchJourneyBySlug(journeySlug);
    if (journey) lessons = await fetchLessonsByJourney(journey._id, false);
  } catch (err: any) {
    loadError = err?.message || 'Failed to load this module';
  }
  if (loadError) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardHeader>
              <CardTitle>Unable to load module</CardTitle>
              <CardDescription>
                {loadError}. Ensure MongoDB is configured (MONGODB_URI) and dependencies are installed.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </MainLayout>
    );
  }
  if (!journey) return notFound();

  // Derived metadata
  const lessonCount = journey.lesson_count ?? lessons.length;
  const totalMinutes = lessons?.length
    ? lessons.reduce((acc, l) => acc + (l.estimated_minutes ?? 0), 0)
    : (journey.avg_lesson_duration ?? 0) * lessonCount;
  const derivedHours = journey.estimated_hours ?? Math.max(0, Math.round((totalMinutes / 60) * 10) / 10);
  const outcomes: string[] = (journey.outcomes ?? [])
    .map((o: any) => (typeof o === 'string' ? o : o?.outcome))
    .filter(Boolean);
  const prerequisites: string[] = (journey.prerequisites ?? [])
    .map((p: any) => (typeof p === 'string' ? p : p?.text || p?.title || p?.requirement))
    .filter(Boolean);
  const tags: string[] = (journey.tags ?? []).filter(Boolean);
  const topics: string[] = (journey.sebi_topics ?? []).filter(Boolean);
  // Merge tags & topics to avoid duplicates in UI
  const topicTagChips: string[] = Array.from(new Set([...(topics || []), ...(tags || [])]));

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/learn">Learn</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/learn/modules">Modules</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{journey.slug}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Button asChild variant="outline">
            <Link href="/learn/modules">Back to Modules</Link>
          </Button>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{journey.title}</h1>
            <div className="mt-2 flex items-center gap-2 text-xs md:text-sm">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1">
                <ShieldCheck className="h-3.5 w-3.5" /> SEBI-aligned curriculum
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-1">
                <Sparkles className="h-3.5 w-3.5" /> Beginner friendly
              </span>
            </div>
            {journey.description ? (
              <p className="text-muted-foreground mt-3 max-w-3xl text-base md:text-lg leading-relaxed">{journey.description}</p>
            ) : null}
            <div className="h-1 w-28 md:w-32 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 mt-4" />
          </div>
          <div className="text-sm md:text-base text-muted-foreground flex items-center gap-3">
            <span className="flex items-center gap-1 rounded-full border px-3 py-1 bg-white/50">
              <BookOpen className="h-4 w-4" /> {lessonCount} lessons
            </span>
            <span className="flex items-center gap-1 rounded-full border px-3 py-1 bg-white/50">
              <Clock className="h-4 w-4" /> ~{derivedHours}h total
            </span>
          </div>
        </div>

        {/* At-a-glance section */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 rounded-2xl border-emerald-100/60 bg-gradient-to-br from-white to-emerald-50/20 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl font-semibold flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-emerald-600" /> What you'll learn
              </CardTitle>
              <CardDescription>
                Key outcomes from this module
              </CardDescription>
            </CardHeader>
            <CardContent>
              {outcomes.length ? (
                <ul className="grid sm:grid-cols-2 gap-3">
                  {outcomes.map((o, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{o}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground">Outcomes will be available soon.</div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-emerald-100/60 bg-gradient-to-br from-white to-emerald-50/20 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Prerequisites</CardTitle>
              <CardDescription>Before you start</CardDescription>
            </CardHeader>
            <CardContent>
              {prerequisites.length ? (
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {prerequisites.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground">No prior knowledge required.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Course content - Accordion */}
        {lessons.length ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 rounded-2xl border-emerald-100/60 bg-gradient-to-br from-white to-emerald-50/20 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-600" /> Course content
                </CardTitle>
                <CardDescription>Browse lessons and start anywhere</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {lessons.map((l) => (
                    <AccordionItem key={l._id} value={String(l.slug)}>
                      <AccordionTrigger className="px-2">
                        <div className="grid w-full grid-cols-[1fr_auto] items-center gap-4">
                          <div className="flex flex-col min-h-6 justify-center">
                            <span className="font-medium leading-tight">{l.title}</span>
                            {l.subtitle ? (
                              <span className="text-xs text-muted-foreground leading-tight">{l.subtitle}</span>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={difficultyBadge(l.difficulty)}>{l.difficulty}</Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-4 w-4" /> {l.estimated_minutes} min
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="text-sm text-muted-foreground">
                            {l.subtitle || 'No additional description'}
                          </div>
                          <Button asChild>
                            <Link href={`/learn/modules/${journey.slug}/lesson/${l.slug}`}>Start Lesson</Link>
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {/* SEBI Recommended Topics */}
              <Card className="rounded-2xl border-emerald-100/60 bg-gradient-to-br from-white to-emerald-50/20 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                    <Landmark className="h-5 w-5 text-emerald-600" /> SEBI Recommended Topics
                  </CardTitle>
                  <CardDescription>Aligned to SEBI's Investor Education framework</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topicTagChips.length ? (
                    <div className="flex flex-wrap gap-2">
                      {topicTagChips.map((t, i) => (
                        <Badge
                          key={`chip-${i}`}
                          variant="secondary"
                          className="rounded-full border border-emerald-200/70 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs px-2.5 py-1 shadow-[0_1px_0_rgba(16,185,129,0.15)]"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No topics or tags listed.</div>
                  )}
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <ExternalLink className="h-3.5 w-3.5" /> Reference: <a href="https://www.sebi.gov.in/" target="_blank" rel="noreferrer" className="underline underline-offset-2">sebi.gov.in</a>
                  </div>
                </CardContent>
              </Card>

              {/* This course includes */}
              <Card className="rounded-2xl border-emerald-100/60 bg-gradient-to-br from-white to-emerald-50/20 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                    <Layers className="h-5 w-5 text-emerald-600" /> This course includes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-emerald-600" /> <span><strong>{lessonCount}</strong> lessons</span></div>
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-emerald-600" /> ~{derivedHours}h total</div>
                    {journey.level ? (
                      <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-emerald-600" /> <span className="capitalize">{journey.level}</span></div>
                    ) : null}
                    <div className="flex items-center gap-2"><Layers className="h-4 w-4 text-emerald-600" /> {topicTagChips.length} topics</div>
                  </div>
                </CardContent>
              </Card>

              {/* About SEBI Education */}
              <Card className="rounded-2xl border-emerald-100/60 bg-gradient-to-br from-white to-emerald-50/20 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                    <Landmark className="h-5 w-5 text-emerald-600" /> About SEBI Education
                  </CardTitle>
                  <CardDescription>Why SEBI alignment matters</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>Investor-first principles and compliant learning outcomes.</li>
                    <li>Focus on financial literacy, risk awareness, and protection.</li>
                    <li>Modules curated to reflect SEBI’s recommended topic areas.</li>
                  </ul>
                  <a href="https://www.sebi.gov.in/investors" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 underline underline-offset-2 text-sm">
                    Learn more on SEBI Investor Education <ExternalLink className="h-4 w-4" />
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}

        {loadError ? (
          <Card>
            <CardHeader>
              <CardTitle>Unable to load module</CardTitle>
              <CardDescription>
                {loadError}. Ensure MongoDB is configured (MONGODB_URI) and dependencies are installed.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : lessons.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No lessons yet</CardTitle>
              <CardDescription>Check back soon for new lessons in this module.</CardDescription>
            </CardHeader>
          </Card>
        ) : null}
      </div>
    </MainLayout>
  );
}
