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
import { getLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';

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
  const t = await getTranslations('modulesPage');
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
  const locale = await getLocale();
  const uiLang = ((locale as string) || 'en').split('-')[0];
  const jLang: any = (journey as any)?.languages?.[uiLang] || (journey as any)?.languages?.en || {};

  const lessonCount = journey.lesson_count ?? lessons.length;
  const totalMinutes = lessons?.length
    ? lessons.reduce((acc, l) => acc + (l.estimated_minutes ?? 0), 0)
    : (journey.avg_lesson_duration ?? 0) * lessonCount;
  const derivedHours = journey.estimated_hours ?? Math.max(0, Math.round((totalMinutes / 60) * 10) / 10);
  const outcomes: string[] = (
    Array.isArray((jLang as any)?.outcomes) ? (jLang as any).outcomes : ((journey as any)?.outcomes ?? [])
  )
    .map((o: any) => (typeof o === 'string' ? o : o?.outcome))
    .filter(Boolean);
  const prerequisites: string[] = (journey.prerequisites ?? [])
    .map((p: any) => (typeof p === 'string' ? p : p?.text || p?.title || p?.requirement))
    .filter(Boolean);
  // Prefer localized tags if present; otherwise fallback to SEBI topics (English) only for en locale,
  // or to English tags as a last resort. This avoids mixing English chips when Hindi is selected.
  const localizedTags: string[] = Array.isArray((jLang as any)?.tags) ? (jLang as any).tags.filter(Boolean) : [];
  const enTags: string[] = Array.isArray((journey as any)?.tags) ? (journey as any).tags.filter(Boolean) : [];
  const topics: string[] = Array.isArray(journey.sebi_topics) ? journey.sebi_topics.filter(Boolean) : [];
  // Show only localized tags when available; otherwise, show SEBI topics.
  // Avoid falling back to English tags in non-English locales to prevent mixed-language chips.
  const topicTagChips: string[] = localizedTags.length ? localizedTags : topics;

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
            <Link href="/learn/modules">{t('backToModules')}</Link>
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] items-start">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">{(jLang?.title as string) || (journey as any)?.title || journey.slug}</h1>
            <div className="mt-2 flex items-center gap-2 text-xs md:text-sm">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1">
                <ShieldCheck className="h-3.5 w-3.5" /> {t('badgeSebiAligned')}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-1">
                <Sparkles className="h-3.5 w-3.5" /> {t('badgeBeginnerFriendly')}
              </span>
            </div>
            {(jLang?.description as string) ? (
              <p className="text-muted-foreground mt-3 max-w-3xl text-base md:text-lg leading-relaxed">{jLang.description as string}</p>
            ) : null}
            <div className="h-1 w-28 md:w-32 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 mt-4" />
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-start lg:justify-end">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 ring-1 ring-emerald-200 px-3 py-1 shadow-sm">
              <BookOpen className="h-4 w-4 text-emerald-600" />
              <span className="text-sm md:text-base font-medium">{lessonCount}</span>
              <span className="text-xs text-muted-foreground">{t('lessonsLabel')}</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 ring-1 ring-sky-200 px-3 py-1 shadow-sm">
              <Clock className="h-4 w-4 text-sky-600" />
              <span className="text-sm md:text-base font-medium">~{derivedHours}h</span>
              <span className="text-xs text-muted-foreground">{t('totalLabel')}</span>
            </span>
          </div>
        </div>

        {/* At-a-glance section */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 rounded-2xl border-emerald-100/60 bg-gradient-to-br from-white to-emerald-50/20 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 space-y-1">
              <CardTitle className="text-xl md:text-2xl font-semibold flex items-center gap-2 leading-tight">
                <GraduationCap className="h-5 w-5 text-emerald-600" /> {t('whatYoullLearnTitle')}
              </CardTitle>
              <CardDescription>
                {t('keyOutcomes')}
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
              <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                <Landmark className="h-5 w-5 text-emerald-600" /> {t('sebiTopicsTitle')}
              </CardTitle>
              <CardDescription>{t('sebiTopicsSub')}</CardDescription>
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
                <div className="text-sm text-muted-foreground">{t('noTopics')}</div>
              )}
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <ExternalLink className="h-3.5 w-3.5" /> Reference: <a href="https://www.sebi.gov.in/" target="_blank" rel="noreferrer" className="underline underline-offset-2">sebi.gov.in</a>
              </div>
            </CardContent>
          </Card>

          {/* <Card className="rounded-2xl border-emerald-100/60 bg-gradient-to-br from-white to-emerald-50/20 shadow-sm hover:shadow-md transition-shadow">
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
          </Card> */}
        </div>

        {/* Course content - Accordion */}
        {lessons.length ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 rounded-2xl border-emerald-100/60 bg-gradient-to-br from-white to-emerald-50/20 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-600" /> {t('courseContentTitle')}
                </CardTitle>
                <CardDescription>{t('courseContentSub')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {lessons.map((l) => {
                    const lLang: any = (l as any)?.languages?.[uiLang] || (l as any)?.languages?.en || {};
                    const lTitle = (lLang?.title as string) || (l as any)?.title || l.slug;
                    const lObjectives: string[] = Array.isArray(lLang?.learning_objectives)
                      ? (lLang.learning_objectives as string[])
                      : (Array.isArray((l as any)?.learning_objectives) ? (l as any).learning_objectives : []);
                    const lSubtitle: string | undefined = (lLang?.subtitle as string) || (l as any)?.subtitle;
                    return (
                    <AccordionItem key={l._id} value={String(l.slug)} className="relative">
                      <AccordionTrigger className="pl-2 pr-32">
                        <div className="grid w-full grid-cols-[1fr_auto] items-center gap-4">
                          <div className="flex flex-col min-h-6 justify-center">
                            <span className="text-base md:text-md font-semibold leading-tight">{lTitle}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={difficultyBadge(l.difficulty)}>{t(`difficulty.${l.difficulty}` as any)}</Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-4 w-4" /> {l.estimated_minutes} min
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <div className="absolute right-0 top-2">
                        <Button asChild size="sm" className="rounded-full px-3 py-1 text-xs">
                          <Link href={`/learn/modules/${journey.slug}/lesson/${l.slug}`}>{t('startLesson')}</Link>
                        </Button>
                      </div>
                      <AccordionContent>
                        {Array.isArray(lObjectives) && lObjectives.length ? (
                          <ul className="space-y-2">
                            {lObjectives.map((obj, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-sm text-muted-foreground">{lSubtitle || 'No additional description'}</div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );})}
                </Accordion>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {/* SEBI Recommended Topics */}


              {/* This course includes */}
              <Card className="rounded-2xl border-emerald-100/60 bg-gradient-to-br from-white to-emerald-50/20 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                    <Layers className="h-5 w-5 text-emerald-600" /> {t('includesTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-emerald-600" /> <span><strong>{lessonCount}</strong> {t('lessonsLabel')}</span></div>
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-emerald-600" /> ~{derivedHours}h {t('totalLabel')}</div>
                    {journey.level ? (
                      <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-emerald-600" /> <span className="capitalize">{t(`level.${journey.level}` as any)}</span></div>
                    ) : null}
                    <div className="flex items-center gap-2"><Layers className="h-4 w-4 text-emerald-600" /> {topicTagChips.length} {t('topicsLabel')}</div>
                  </div>
                </CardContent>
              </Card>

              {/* About SEBI Education */}
              <Card className="rounded-2xl border-emerald-100/60 bg-gradient-to-br from-white to-emerald-50/20 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                    <Landmark className="h-5 w-5 text-emerald-600" /> {t('aboutSebiTitle')}
                  </CardTitle>
                  <CardDescription>{t('aboutSebiSub')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>{t('aboutSebiBullet1')}</li>
                    <li>{t('aboutSebiBullet2')}</li>
                    <li>{t('aboutSebiBullet3')}</li>
                  </ul>
                  <a href="https://www.sebi.gov.in/investors" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 underline underline-offset-2 text-sm">
                    {t('learnMoreSebi')} <ExternalLink className="h-4 w-4" />
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
              <CardTitle>{t('noLessons')}</CardTitle>
              <CardDescription>{t('noLessonsSub')}</CardDescription>
            </CardHeader>
          </Card>
        ) : null}
      </div>
    </MainLayout>
  );
}
