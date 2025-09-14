import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Clock } from 'lucide-react';
import { notFound } from 'next/navigation';
import LessonViewer from '@/components/learn/lesson-viewer';
import type { Lesson, ContentBlock, Anchor } from '@/lib/learn/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';

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

export default async function LessonPage({ params }: { params: Promise<{ journey: string; slug: string }> }) {
  const { journey: journeySlug, slug } = await params;
  const t = await getTranslations('lesson');
  let lesson: Lesson | null = null;
  let loadError: string | null = null;
  try {
    const { fetchLessonBySlug } = await import('@/lib/learn/loaders');
    lesson = await fetchLessonBySlug(slug, true);
  } catch (err: any) {
    loadError = err?.message || 'Failed to load lesson';
  }
  if (loadError) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardHeader>
              <CardTitle>Unable to load lesson</CardTitle>
              <CardDescription>
                {loadError}. Ensure MongoDB is configured (MONGODB_URI) and dependencies are installed.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </MainLayout>
    );
  }
  if (!lesson) return notFound();

  // Resolve current UI language and compute language-specific fields with fallback to 'en'
  const locale = await getLocale();
  const uiLang = (locale as string) || 'en';
  const lLang: any = (lesson as any)?.languages?.[uiLang] || (lesson as any)?.languages?.en || {};

  // Sanitize nested data for client component (remove Mongo/ObjectId/Buffer etc.)
  const safeBlocks: ContentBlock[] = (lesson.content_blocks ?? []).map((b: any) => ({
    _id: String(b._id ?? b.id ?? `${lesson!.slug}-${b.order ?? 0}`),
    lesson_id: String(b.lesson_id ?? lesson!.slug),
    order: Number(b.order ?? 0),
    type: b.type,
    anchor_ids: Array.isArray(b.anchor_ids) ? b.anchor_ids.map((x: any) => String(x)) : [],
    // Localize payload from languages[uiLang].payload with fallback to English, then legacy payload
    payload: (b.languages?.[uiLang]?.payload) ?? (b.languages?.en?.payload) ?? b.payload,
  }));

  const safeAnchors: Anchor[] = (lesson.anchor_details ?? []).map((a: any) => ({
    _id: String(a._id ?? a.id ?? a.short_label ?? Math.random().toString(36).slice(2)),
    source_type: a.source_type,
    source_url: a.source_url,
    relevance_tags: Array.isArray(a.relevance_tags) ? a.relevance_tags : undefined,
    confidence_score: typeof a.confidence_score === 'number' ? a.confidence_score : undefined,
    last_verified_at: a.last_verified_at ? new Date(a.last_verified_at).toISOString() : undefined,
    title: (a.languages?.[uiLang]?.title) ?? (a.languages?.en?.title) ?? a.title,
    short_label: a.short_label,
    excerpt: (a.languages?.[uiLang]?.excerpt) ?? (a.languages?.en?.excerpt) ?? a.excerpt,
    document_title: a.document_title,
    section: a.section,
    created_at: a.created_at ? new Date(a.created_at).toISOString() : undefined,
    usage_count: typeof a.usage_count === 'number' ? a.usage_count : undefined,
    used_in_lessons: Array.isArray(a.used_in_lessons) ? a.used_in_lessons.map((x: any) => String(x)) : undefined,
  }));

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
                <BreadcrumbLink asChild>
                  <Link href={`/learn/modules/${journeySlug}`}>{journeySlug}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{slug}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Link href={`/learn/modules/${journeySlug}`} className="inline-flex">
            <Button className="rounded-full bg-white/40 hover:bg-white/60 text-emerald-800 border border-white/60 backdrop-blur px-3 py-1 h-8">
              <ChevronLeft className="h-4 w-4 mr-1" /> {t('backToJourney')}
            </Button>
          </Link>
        </div>
        <section className="rounded-2xl border border-transparent bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-cyan-50/70 backdrop-blur-md p-5 shadow-sm">
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">{(lLang?.title as string) || (lesson as any)?.title || lesson.slug}</h1>
              {(lLang?.subtitle as string) ? (
                <p className="text-muted-foreground mt-2 max-w-3xl text-sm md:text-base">{lLang.subtitle as string}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <span className="backdrop-blur-sm bg-white/60 border border-white/60 rounded-full px-3 py-1 text-sm text-gray-700 flex items-center gap-2">
                <Clock className="h-4 w-4" /> {lesson.estimated_minutes} min
              </span>
              <span className={`backdrop-blur-sm bg-white/60 border border-white/60 rounded-full px-3 py-1 text-sm capitalize ${difficultyBadge(lesson.difficulty)}`}>
                {lesson.difficulty}
              </span>
            </div>
          </div>
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/40 blur-3xl" />
        </section>

        {/* Objectives/References moved into LessonViewer as the first menu entry */}

        {lesson.content_blocks && lesson.content_blocks.length > 0 ? (
          <LessonViewer
            lesson={{
              slug: lesson.slug,
              title: (lLang?.title as string) || (lesson as any)?.title || lesson.slug,
              learning_objectives: Array.isArray(lLang?.learning_objectives) ? (lLang?.learning_objectives as string[]) : (lesson.learning_objectives ?? []),
              content_blocks: safeBlocks,
              anchor_details: safeAnchors,
            }}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t('empty.noBlocks')}</CardTitle>
              <CardDescription>
                {/* Keep this explanation in English for developers; can be translated later if needed */}
                This lesson has no content blocks. If you expect content, verify the
                <code className="mx-1">content_blocks</code> collection links to this lesson via
                <code className="mx-1">lesson_id</code> (slug or id).
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
