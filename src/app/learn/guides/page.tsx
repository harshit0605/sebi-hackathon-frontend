import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, Video, Headphones, ArrowLeft, ExternalLink } from 'lucide-react';
import type { Guide } from '@/lib/learn/guides';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Image from 'next/image';
import { getLocale } from 'next-intl/server';

// Normalize cover images:
// - If given a Google Drive preview/uc link, transform to a thumbnail image URL
// - If prefixed with /public, strip it (Next serves from root)
// - Fallback to a local placeholder
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
        // Drive thumbnail endpoint returns an actual image; sz controls size
        return `https://drive.google.com/thumbnail?id=${id}&sz=w1200`;
    } catch {
        return null;
    }
}

function typeMeta(source_type: Guide['source_type']) {
    if (source_type === 'pdf') return { Icon: FileText, label: 'PDF' };
    if (source_type === 'video') return { Icon: Video, label: 'Video' };
    return { Icon: Headphones, label: 'Audio' };
}

export default async function GuidesPage() {
    let guides: Guide[] = [];
    let loadError: string | null = null;
    try {
        const { fetchOfficialGuidesFromDb } = await import('@/lib/learn/loaders');
        guides = await fetchOfficialGuidesFromDb();
    } catch (err: any) {
        loadError = err?.message || 'Failed to load guides';
    }

    const locale = await getLocale();
    const uiLang = (locale as string) || 'en';

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-2 space-y-4">
                <section className="relative overflow-hidden rounded-2xl p-6 md:p-5 bg-white/30 dark:bg-white/10 backdrop-blur-lg shadow-lg">
                    <div className="relative z-10 flex items-start justify-between gap-4">
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Official Learning Guides</h1>
                            <p className="text-muted-foreground">Curated SEBI/NISM resources transformed into interactive, easy-to-learn formats.</p>
                            <p className="text-md text-muted-foreground">
                                Open a guide to watch a short video overview, listen to an audio summary, or study with a concise, markdown-based guide derived from official sources.
                            </p>
                        </div>
                        <Button asChild variant="ghost" size="sm" className="rounded-full gap-2">
                            <Link href="/learn"><ArrowLeft className="h-4 w-4" /> Back to Learn</Link>
                        </Button>
                    </div>
                    <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br from-brand-100 to-transparent blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-gradient-to-tr from-cyan-100 to-transparent blur-2xl" />
                </section>

                {loadError ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Unable to load guides</CardTitle>
                            <CardDescription>
                                {loadError}. Ensure MongoDB is configured (MONGODB_URI) and the guides collection is accessible.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : guides.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>No guides yet</CardTitle>
                            <CardDescription>When guides are available, they will appear here.</CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                        {guides.map((g) => {
                            const preferred = g.variants.find((v) => v.language === (uiLang as any))
                                ?? g.variants.find((v) => v.language === 'en')
                                ?? g.variants[0];
                            const title = preferred?.title ?? g.title ?? 'Guide';
                            const summary = preferred?.summary ?? g.summary;
                            const { Icon, label } = typeMeta(g.source_type);
                            const langCodes = Array.from(new Set(g.variants.map((v) => v.language.toUpperCase())));
                            const coverImage = normalizeCoverImage(g.cover_image);
                            return (
                                <Card key={g.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full pt-0">
                                    <div className="relative aspect-video">
                                        <Image
                                            src={coverImage}
                                            alt={title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover"
                                            priority={false}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-black/0" />
                                        <div className="absolute left-2 top-2 flex gap-1">
                                            {langCodes.map((lc) => (
                                                <Badge key={lc} variant="secondary" className="bg-brand-600 text-white border-0 shadow px-2.5 py-0.5 text-[10px] font-bold rounded-full">
                                                    {lc}
                                                </Badge>
                                            ))}
                                        </div>

                                    </div>
                                    <CardHeader className="pb-1">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-2">
                                                <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
                                                {summary ? (
                                                    <div className="prose prose-sm max-w-none dark:prose-invert text-muted-foreground line-clamp-4 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-headings:my-1 leading-snug">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                                            {summary}
                                                        </ReactMarkdown>
                                                    </div>
                                                ) : null}
                                            </div>
                                            <Badge className="bg-white/80 text-gray-700 border border-brand-200 shrink-0">{label}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="mt-auto pt-2 flex flex-col gap-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button asChild size="sm" className="w-full">
                                                <Link href={`/learn/guides/${g.id}`}>Open</Link>
                                            </Button>
                                            <Button asChild size="sm" variant="outline" className="w-full border-brand-300 text-brand-700 hover:bg-brand-50 hover:text-brand-900">
                                                <a href={g.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1">
                                                    <span>Source</span>
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </a>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
