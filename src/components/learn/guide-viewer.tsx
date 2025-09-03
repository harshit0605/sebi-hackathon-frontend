"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { Guide, GuideLanguage } from '@/lib/learn/guides';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { FileText, Video, Headphones, ExternalLink, Play, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { MusicCard, DriveMusicEmbedCard } from '@/components/ui/music-card';
import Link from 'next/link';

export type GuideViewerProps = { guide: Guide };

export default function GuideViewer({ guide }: GuideViewerProps) {
    const [lang, setLang] = useState<GuideLanguage>(() => {
        const langs = Array.from(new Set(guide.variants.map((v) => v.language))) as GuideLanguage[];
        return (langs.includes('en') ? 'en' : langs[0]) ?? 'en';
    });

    const byLanguage = useMemo(() => {
        const map: Record<GuideLanguage, typeof guide.variants> = { en: [], hi: [] };
        for (const v of guide.variants) {
            if (v.language === 'en') map.en.push(v);
            if (v.language === 'hi') map.hi.push(v);
        }
        return map;
    }, [guide.variants]);

    const selected = byLanguage[lang][0] ?? guide.variants[0];
    const displayTitle = selected?.title ?? guide.title ?? 'Guide';
    const TypeIcon = guide.source_type === 'pdf' ? FileText : guide.source_type === 'video' ? Video : Headphones;

    type VariantLike = Guide['variants'][number] & { study_markdown?: string };

    function VariantSection({ v }: { v: VariantLike }) {
        return (
            <section className="space-y-4">
                {/* Tags + Summary (no duplicate title here) */}
                {(Array.isArray(v.tags) && v.tags.length) || v.summary ? (
                    <div className="space-y-3">
                        {Array.isArray(v.tags) && v.tags.length ? (
                            <div className="flex flex-wrap gap-2">
                                {v.tags.map((t, i) => (
                                    <Badge
                                        key={i}
                                        variant="outline"
                                        className="rounded-full px-3 py-1 text-sm font-medium bg-white text-gray-800 border border-gray-300 shadow-sm"
                                    >
                                        {t}
                                    </Badge>
                                ))}
                            </div>
                        ) : null}
                        {v.summary ? (
                            <div className="rounded-xl bg-muted/30 p-4">
                                <h4 className="text-sm font-semibold mb-2">Summary</h4>
                                <div className={"prose prose-sm max-w-none dark:prose-invert " + (v.language === 'hi' ? 'font-hindi text-[1.05rem] leading-7' : '')}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                        {v.summary}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ) : null}
                    </div>
                ) : null}

                {/* Video: media left, description right */}
                <div className="grid md:grid-cols-12 gap-10 items-center">
                    <div className="md:col-span-7"><VideoBlock v={v} /></div>
                    <div className="md:col-span-5 space-y-3 flex flex-col justify-center h-full min-h-[240px]">
                        <h4 className="flex items-center gap-2 text-xl font-semibold"><Video className="h-4 w-4" />Educational Video Summary</h4>
                        <p className="text-lg md:text-xl text-muted-foreground">Educational video based on the official reference guide.</p>
                    </div>
                </div>

                {/* Audio: player left, description right (aligned to right) */}
                {v.audio_url ? (
                    <div className="grid md:grid-cols-12 gap-10 items-center">
                        <div className="md:col-span-7 space-y-3 flex flex-col justify-center h-full items-end text-right min-h-[240px]">
                            <h4 className="flex items-center gap-2 text-xl font-semibold"><Headphones className="h-4 w-4" />Educational Podcast</h4>
                            <p className="text-lg md:text-xl text-muted-foreground">Educational Podcast based on the official reference guide.</p>
                        </div>
                        <div className="md:col-span-5 flex items-center justify-center min-h-[240px]">
                            <AudioBlock
                                src={v.audio_url}
                                poster={'/audio-podcast.jpeg'}
                                title={displayTitle}
                                artist={guide.title || 'SEBI Guide'}
                            />
                        </div>

                    </div>
                ) : null}
            </section>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header moved here with prominent language selector and without markdown below title */}
            <section className="relative overflow-hidden rounded-2xl p-6 md:p-8 bg-white/60 dark:bg-white/5">
                <div className="relative z-10 flex flex-col gap-4">
                    {/* Row 1: Title + source */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <TypeIcon className="h-6 w-6 text-brand-700 shrink-0" />
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight truncate">
                                {displayTitle}
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge className="bg-white/80 text-gray-700 border border-brand-200 uppercase tracking-wide">
                                {guide.source_type === 'pdf' ? 'PDF' : guide.source_type === 'video' ? 'VIDEO' : 'AUDIO'}
                            </Badge>
                            <a
                                href={guide.source_url}
                                target="_blank"
                                rel="noreferrer"
                                title="Open source"
                                className="inline-flex items-center gap-2 text-red-600 hover:text-red-700"
                            >
                                {guide.source_type === 'pdf' ? <AcrobatIcon className="h-6 w-6" /> : <span className="text-xl">🌐</span>}
                                <span className="sr-only">Open source</span>
                            </a>
                        </div>
                    </div>
                    {/* Row 2: Back on left; language switch + Show study guide on right */}
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <Link href="/learn/guides">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <ArrowLeft className="h-4 w-4" /> Back to guides
                                </Button>
                            </Link>
                        </div>
                        <div className="flex items-center gap-3">
                            <ToggleGroup
                                type="single"
                                value={lang}
                                onValueChange={(v) => v && setLang(v as GuideLanguage)}
                                className="rounded-full p-1 shadow-inner ring-1 ring-black/5 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/40"
                            >
                                <ToggleGroupItem value="en" aria-label="English" className="rounded-full px-5 py-2.5 text-sm font-semibold text-gray-700 data-[state=on]:bg-brand-600 data-[state=on]:text-white hover:bg-white/80 transition-colors">
                                    EN
                                </ToggleGroupItem>
                                <ToggleGroupItem value="hi" aria-label="Hindi" className="rounded-full px-5 py-2.5 text-sm font-semibold text-gray-700 data-[state=on]:bg-brand-600 data-[state=on]:text-white hover:bg-white/80 transition-colors">
                                    HI
                                </ToggleGroupItem>
                            </ToggleGroup>
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button size="sm">Show study guide</Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
                                    <SheetHeader>
                                        <SheetTitle>Study guide</SheetTitle>
                                    </SheetHeader>
                                    <div className="p-4 overflow-y-auto h-full">
                                        <StudyBlock v={selected as any} showHeader={false} />
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
                <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-brand-100 to-transparent blur-2xl" />
                <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-tr from-cyan-100 to-transparent blur-2xl" />
            </section>

            {/* Selected language content */}
            {selected ? (
                <VariantSection v={selected} />
            ) : (
                <p className="py-6 text-sm text-muted-foreground">No content available for the selected language.</p>
            )}
        </div>
    );
}

function VideoBlock({ v }: { v: { video_url?: string } }) {
    if (!v.video_url) return null;
    const isYT = isYouTubeUrl(v.video_url);
    const isDrive = isGoogleDriveUrl(v.video_url);
    return (
        <div className="relative rounded-2xl overflow-hidden ring-1 ring-black/5 bg-black/5 aspect-video shadow-xl">
            {isYT ? (
                <iframe
                    src={embedUrl(v.video_url!)}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                />
            ) : isDrive ? (
                <iframe
                    src={toGoogleDrivePreviewUrl(v.video_url!)}
                    className="h-full w-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                />
            ) : (
                <video controls className="h-full w-full bg-black">
                    <source src={v.video_url} type="video/mp4" />
                </video>
            )}
        </div>
    );
}

function StudyBlock({ v, showHeader = true }: { v: { study_markdown?: string; study_guide_url?: string; language?: GuideLanguage }; showHeader?: boolean }) {
    const [md, setMd] = useState<string | null>(v.study_markdown ?? null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        let active = true;
        async function load() {
            if (md || !v.study_guide_url) return;
            try {
                setLoading(true);
                // If it's a Google Doc, use export txt; otherwise fetch raw (e.g., markdown file)
                const exportUrl = toGoogleDocExportTextUrl(v.study_guide_url);
                const urlToFetch = exportUrl || v.study_guide_url;
                const res = await fetch(urlToFetch);
                const text = await res.text();
                if (!active) return;
                setMd(text);
            } catch {
                // ignore
            } finally {
                if (active) setLoading(false);
            }
        }
        load();
        return () => {
            active = false;
        };
    }, [v.study_guide_url, md]);

    if (!md && !v.study_guide_url && !loading) return null;
    return (
        <div className="space-y-2">
            {showHeader ? (
                <>
                    <h4 className="text-sm font-semibold mb-2">Study guide</h4>
                    <p className="text-xs text-muted-foreground">Reference derived from the source</p>
                </>
            ) : null}
            {md ? (
                /<\s*(html|head|body)[^>]*>/i.test(md) ? (
                    <div className={"prose prose-sm max-w-none dark:prose-invert " + (v.language === 'hi' ? 'font-hindi text-[1.05rem] leading-7' : '')}
                        dangerouslySetInnerHTML={{ __html: md }} />
                ) : (
                    <div className={"prose prose-sm max-w-none dark:prose-invert " + (v.language === 'hi' ? 'font-hindi text-[1.05rem] leading-7' : '')}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{md}</ReactMarkdown>
                    </div>
                )
            ) : loading ? (
                <div className="h-32 animate-pulse rounded-md bg-muted" />
            ) : (
                <Button asChild>
                    <a href={v.study_guide_url} target="_blank" rel="noreferrer">
                        Open guide <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                </Button>
            )}
        </div>
    );
}

function AudioBlock({ src, poster, title, artist }: { src?: string; poster: string; title: string; artist: string }) {
    if (!src) return null;
    const isDrive = isGoogleDriveUrl(src);
    return (
        <div className="w-full">
            {isDrive ? (
                <DriveMusicEmbedCard src={src} poster={poster} title={title} artist={artist} />
            ) : (
                <MusicCard src={src} poster={poster} title={title} artist={artist} showSkip={false} />
            )}
        </div>
    );
}

function embedUrl(url: string) {
    // Basic YouTube URL transform to embed form, fallback to original
    try {
        const u = new URL(url, 'http://x');
        if (u.hostname.includes('youtube.com')) {
            const v = u.searchParams.get('v');
            if (v) return `https://www.youtube.com/embed/${v}`;
        }
        if (u.hostname === 'youtu.be') {
            return `https://www.youtube.com/embed${u.pathname}`;
        }
    } catch { }
    return url;
}

function isYouTubeUrl(url: string) {
    try {
        const u = new URL(url, 'http://x');
        return u.hostname.includes('youtube.com') || u.hostname === 'youtu.be';
    } catch {
        return false;
    }
}

function isGoogleDriveUrl(url: string) {
    try {
        const u = new URL(url, 'http://x');
        return u.hostname.includes('drive.google.com');
    } catch {
        return false;
    }
}

function toGoogleDrivePreviewUrl(url: string) {
    // Accepts Drive links like:
    // - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    // - https://drive.google.com/uc?id=FILE_ID&export=download
    // Returns embeddable preview:
    // - https://drive.google.com/file/d/FILE_ID/preview
    try {
        const u = new URL(url, 'http://x');
        // Try path-based pattern first
        const parts = u.pathname.split('/');
        const idx = parts.indexOf('d');
        if (idx >= 0 && parts[idx + 1]) {
            const id = parts[idx + 1];
            return `https://drive.google.com/file/d/${id}/preview`;
        }
        // Fallback to query param id (uc?id= or open?id=)
        const qid = u.searchParams.get('id');
        if (qid) {
            return `https://drive.google.com/file/d/${qid}/preview`;
        }
    } catch { }
    return url;
}

function toGoogleDocExportTextUrl(url: string): string | null {
    // Transforms Google Docs URL to export text endpoint
    try {
        const u = new URL(url, 'http://x');
        if (!u.hostname.includes('docs.google.com')) return null;
        const parts = u.pathname.split('/');
        const idx = parts.indexOf('d');
        if (idx >= 0 && parts[idx + 1]) {
            const id = parts[idx + 1];
            return `https://docs.google.com/document/d/${id}/export?format=txt`;
        }
    } catch { }
    return null;
}

function toGoogleDriveDownloadUrl(url?: string): string | undefined {
    if (!url) return url;
    try {
        const u = new URL(url, 'http://x');
        if (!u.hostname.includes('drive.google.com')) return url;
        // Try path-based pattern /file/d/ID/...
        const parts = u.pathname.split('/');
        const idx = parts.indexOf('d');
        const id = idx >= 0 ? parts[idx + 1] : (u.searchParams.get('id') || '');
        if (id) return `https://drive.google.com/uc?id=${id}&export=download`;
    } catch { }
    return url;
}

// Simple Adobe Acrobat PDF icon
function AcrobatIcon({ className = "" }: { className?: string }) {
    return (
        <svg viewBox="0 0 256 256" className={className} aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EC1C24" d="M28 0h200c15.5 0 28 12.5 28 28v200c0 15.5-12.5 28-28 28H28C12.5 256 0 243.5 0 228V28C0 12.5 12.5 0 28 0z" />
            <path fill="#fff" d="M166.4 167.6c-9.2 0-20.4-5.8-31.7-16.5c-7.9 2.6-15.9 4.4-23.8 5.5c-8.3 13.7-16.3 23.1-24.1 27.9c-5.9 3.6-11.4 4.5-15.6 2.6c-3.7-1.7-5.7-5.2-5.6-9.8c.1-7.9 6-15.8 17.4-23.5c4.9-3.3 10.7-6.5 17.2-9.3c-4.2-12.1-6.8-24.2-7.5-35.1c-.6-9.2.7-16.3 3.9-21c2.5-3.8 6.4-5.8 11.1-5.8c8.2 0 14.8 6.4 19.6 19.1c2.5 6.6 4.6 14.9 6.2 24.4c11.2-1.9 21.9-4.8 31.6-8.5c9.2-3.6 16.2-7.8 20.7-12.4c3.7-3.8 5.5-7.8 5.5-11.7c0-3.2-1.2-5.7-3.5-7.3c-3.8-2.7-10.1-2.5-18.5.5c-7.1 2.6-14.9 7.1-23.1 13.2c-7.3 5.4-14.7 12-22 19.7c1.5 9.3 2.5 18.4 3 27c14.7 13.5 26.8 20.5 35.6 20.5c3.8 0 6.8-1 9.2-3c2.1-1.8 3.2-4.1 3.2-6.7c0-3-1.5-5.4-4.4-7.1c-2.7-1.6-6.6-2.4-11.3-2.4z" />
        </svg>
    );
}
