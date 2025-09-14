import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Clock, ArrowLeft } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import type { LearningJourney } from '@/lib/learn/types';

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

// Normalize cover images (Google Drive links -> thumbnail; strip /public; fallback)
function normalizeCoverImage(src?: string): string {
    if (!src) return '/guides/sebi-financial-education.jpeg';
    let url = src;
    if (url.startsWith('/public/')) url = url.replace(/^\/public/, '');
    const driveThumb = toGoogleDriveThumbnailUrl(url);
    return driveThumb || url;
}

function toGoogleDriveThumbnailUrl(url?: string): string | null {
    if (!url) return null;
    try {
        const u = new URL(url, 'http://x');
        if (!u.hostname.includes('drive.google.com')) return null;
        const parts = u.pathname.split('/');
        const idx = parts.indexOf('d');
        const id = idx >= 0 && parts[idx + 1] ? parts[idx + 1] : (u.searchParams.get('id') || '');
        if (!id) return null;
        return `https://drive.google.com/thumbnail?id=${id}&sz=w1200`;
    } catch {
        return null;
    }
}

function labelFromSource(j?: Pick<LearningJourney, 'source_title' | 'source_url'>): string {
    const t = (j as any)?.source_title as string | undefined;
    if (t && t.trim()) return t.trim();
    const url = (j as any)?.source_url as string | undefined;
    if (!url) return 'Unknown source';
    try {
        const u = new URL(url, 'http://x');
        const host = u.hostname.replace(/^www\./, '');
        return host || url;
    } catch {
        return url;
    }
}

export default async function ModulesPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
    let journeys: LearningJourney[] = [];
    let loadError: string | null = null;
    try {
        const { fetchJourneys } = await import('@/lib/learn/loaders');
        journeys = await fetchJourneys();
    } catch (err: any) {
        loadError = err?.message || 'Failed to load modules';
    }

    // Resolve current UI language from next-intl and apply UI-level fallback to 'en'
    const locale = await getLocale();
    const uiLang = (locale as string) || 'en';
    const t = await getTranslations('modulesIndex');
    const tm = await getTranslations('modulesPage');

    const resolvedSearchParams = await searchParams;

    const rawSource = Array.isArray(resolvedSearchParams?.source)
        ? resolvedSearchParams?.source[0]
        : (resolvedSearchParams?.source as string | undefined);
    const selectedSource = rawSource || '';

    // Build unique sources from journeys (keyed by source_url)
    const sourceMap = new Map<string, { title: string }>();
    for (const j of journeys) {
        const url = (j as any)?.source_url as string | undefined;
        if (!url) continue;
        if (!sourceMap.has(url)) sourceMap.set(url, { title: labelFromSource(j) });
    }
    const sources = Array.from(sourceMap.entries()).map(([url, meta]) => ({ url, title: meta.title }));

    // When "All sources" is selected (no query) or `source=all`, include everything
    const normalizedSource = (selectedSource || '').trim();
    const filteredJourneys = normalizedSource && normalizedSource.toLowerCase() !== 'all'
        ? journeys.filter((j) => (j as any)?.source_url === normalizedSource)
        : journeys;

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-8 space-y-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/learn">Learn</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Modules</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <section className="relative overflow-hidden rounded-2xl p-6 md:p-5 bg-white/30 dark:bg-white/10 backdrop-blur-lg shadow-lg">
                    <div className="relative z-10 flex items-start justify-between gap-4">
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight">{t('title')}</h1>
                            <p className="text-muted-foreground">{t('subtitle')}</p>
                        </div>
                        <Button asChild variant="ghost" size="sm" className="rounded-full gap-2">
                            <Link href="/learn"><ArrowLeft className="h-4 w-4" /> {t('backToLearn')}</Link>
                        </Button>
                    </div>
                    <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br from-brand-100 to-transparent blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-gradient-to-tr from-cyan-100 to-transparent blur-2xl" />
                </section>

                {/* Source filter bar */}
                {sources.length > 0 ? (
                    <div className="flex flex-wrap gap-2 items-center">
                        <Link href="/learn/modules" prefetch>
                            <Button
                                variant={!selectedSource || selectedSource.toLowerCase() === 'all' ? 'default' : 'outline'}
                                size="sm"
                                className="rounded-full"
                            >
                                {t('allSources')}
                            </Button>
                        </Link>
                        {sources.map((s) => {
                            const isActive = selectedSource === s.url;
                            const href = `/learn/modules?source=${encodeURIComponent(s.url)}`;
                            return (
                                <Link key={s.url} href={href} prefetch>
                                    <Button variant={isActive ? 'default' : 'outline'} size="sm" className="rounded-full">
                                        {s.title}
                                    </Button>
                                </Link>
                            );
                        })}
                    </div>
                ) : null}

                {loadError ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('unableTitle')}</CardTitle>
                            <CardDescription>
                                {loadError}. Ensure MongoDB is configured (MONGODB_URI) and the journeys collection is accessible.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : journeys.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('noModulesTitle')}</CardTitle>
                            <CardDescription>{t('noModulesDesc')}</CardDescription>
                        </CardHeader>
                    </Card>
                ) : filteredJourneys.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('noSourceTitle')}</CardTitle>
                            <CardDescription>{t('noSourceDesc')}</CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                        {filteredJourneys.map((j) => {
                            const langData = (j as any)?.languages?.[uiLang] || (j as any)?.languages?.en || {};
                            const title = (langData?.title as string | undefined) ?? (j as any)?.title ?? j.slug;
                            const description = (langData?.description as string | undefined) ?? (j as any)?.description ?? '';
                            return (
                            <Card key={j._id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full pt-0">
                                <div className="relative aspect-video">
                                    <Image
                                        src={normalizeCoverImage((j as any).cover_image)}
                                        alt={title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover"
                                        priority={false}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-black/0" />
                                    <div className="absolute right-2 top-2">
                                        <Badge className="bg-white/80 text-gray-700 border border-brand-200 capitalize">{j.level ?? 'level'}</Badge>
                                    </div>
                                </div>
                                <CardHeader className="pb-1">
                                    <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
                                    {description ? (
                                        <CardDescription className="text-sm text-muted-foreground line-clamp-4">{description}</CardDescription>
                                    ) : null}
                                </CardHeader>
                                <CardContent className="mt-auto pt-2 flex flex-col gap-2">
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <BookOpen className="h-4 w-4" />
                                            {j.lesson_count ?? 0} {tm('lessonsLabel')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {j.avg_lesson_duration ? `${Math.round((j.avg_lesson_duration * (j.lesson_count ?? 0)) / 60)}h` : '—'}
                                        </span>
                                    </div>

                                    <Button asChild className="w-full">
                                        <Link href={`/learn/modules/${j.slug}`}>{t('openModule')}</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        );})}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
