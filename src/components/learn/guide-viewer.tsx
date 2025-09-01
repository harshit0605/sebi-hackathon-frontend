"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { Guide, GuideLanguage } from '@/lib/learn/guides';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { FileText, Video, Headphones, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

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
                                    <Badge key={i} variant="secondary">
                                        {t}
                                    </Badge>
                                ))}
                            </div>
                        ) : null}
                        {v.summary ? (
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                    {v.summary}
                                </ReactMarkdown>
                            </div>
                        ) : null}
                    </div>
                ) : null}

                <div className="grid md:grid-cols-12 gap-6">
                    <div className="md:col-span-7">{renderVideoBlock(v)}</div>
                    <div className="md:col-span-5 space-y-6">
                        <AudioBlock v={v} />
                        <StudyBlock v={v} />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header moved here with prominent language selector and without markdown below title */}
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-brand-50 to-cyan-50 p-6 md:p-8">
                <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <TypeIcon className="h-6 w-6 text-brand-700 shrink-0" />
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight truncate">{displayTitle}</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge className="bg-white/80 text-gray-700 border border-brand-200 uppercase tracking-wide">
                                {guide.source_type === 'pdf' ? 'PDF' : guide.source_type === 'video' ? 'VIDEO' : 'AUDIO'}
                            </Badge>
                            <Button asChild variant="outline">
                                <a href={guide.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center">
                                    <ExternalLink className="mr-2 h-4 w-4" /> Open source
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Prominent language selector aligned with title (top-left area) */}
                    <div className="flex items-center gap-3">
                        <ToggleGroup
                            type="single"
                            value={lang}
                            onValueChange={(v) => v && setLang(v as GuideLanguage)}
                            className="rounded-full bg-white/70 p-1 shadow-sm ring-1 ring-brand-200"
                        >
                            <ToggleGroupItem value="en" aria-label="English" className="rounded-full px-4 py-2 text-sm font-semibold">
                                EN
                            </ToggleGroupItem>
                            <ToggleGroupItem value="hi" aria-label="Hindi" className="rounded-full px-4 py-2 text-sm font-semibold">
                                HI
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </div>
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/40 blur-3xl" />
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

function VideoIconHeader() {
    return (
        <h4 className="flex items-center gap-2 text-sm font-semibold">
            <Video className="h-4 w-4" /> Video overview
        </h4>
    );
}

function renderVideoBlock(v: { video_url?: string }) {
    if (!v.video_url) return null;
    const isYT = isYouTubeUrl(v.video_url);
    const isDrive = isGoogleDriveUrl(v.video_url);
    return (
        <div className="space-y-2 rounded-2xl border bg-white shadow-sm p-3">
            <VideoIconHeader />
            <p className="text-xs text-muted-foreground">Watch a quick walkthrough</p>
            <div className="rounded-xl overflow-hidden ring-1 ring-black/5 bg-black/5 aspect-video">
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
        </div>
    );
}

function AudioBlock({ v }: { v: { audio_url?: string } }) {
    if (!v.audio_url) return null;
    const isDrive = isGoogleDriveUrl(v.audio_url);
    return (
        <div className="space-y-2 rounded-2xl border bg-white shadow-sm p-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold">
                <Headphones className="h-4 w-4" /> Audio overview
            </h4>
            <p className="text-xs text-muted-foreground">Listen to a concise summary</p>
            {isDrive ? (
                <div className="rounded-xl overflow-hidden ring-1 ring-black/5 bg-black/60 p-4 flex items-center justify-center">
                    {/* Fallback embed for Drive */}
                    <iframe src={toGoogleDrivePreviewUrl(v.audio_url!)} className="w-full h-44 rounded-md" allow="autoplay" />
                    {/* Decorative bars to suggest a visualizer when Drive preview blocks audio stream */}
                </div>
            ) : (
                <AudioVisualizer src={v.audio_url} />
            )}
        </div>
    );
}

function StudyBlock({ v }: { v: { study_markdown?: string; study_guide_url?: string } }) {
    const [md, setMd] = useState<string | null>(v.study_markdown ?? null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        let active = true;
        async function load() {
            if (md || !v.study_guide_url) return;
            const exportUrl = toGoogleDocExportTextUrl(v.study_guide_url);
            if (!exportUrl) return;
            try {
                setLoading(true);
                const res = await fetch(exportUrl);
                const text = await res.text();
                if (active) setMd(text);
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

    if (!md && !v.study_guide_url) return null;
    return (
        <div className="space-y-2 rounded-2xl border bg-white shadow-sm p-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4" /> Study guide
            </h4>
            <p className="text-xs text-muted-foreground">Reference derived from the source</p>
            {md ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{md}</ReactMarkdown>
                </div>
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

function AudioVisualizer({ src }: { src?: string }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationRef = useRef<number | null>(null);

    const draw = useCallback((analyser: AnalyserNode) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const render = () => {
            analyser.getByteFrequencyData(dataArray);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const w = canvas.width;
            const h = canvas.height;
            const barWidth = (w / bufferLength) * 2.5;
            let x = 0;
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * h;
                ctx.fillStyle = `hsl(${200 + (i / bufferLength) * 60} 80% 60%)`;
                ctx.fillRect(x, h - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
            animationRef.current = requestAnimationFrame(render);
        };
        render();
    }, []);

    useEffect(() => {
        if (!audioRef.current || !src) return;
        const audio = audioRef.current;
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = context.createMediaElementSource(audio);
        const analyser = context.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyser.connect(context.destination);
        draw(analyser);
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            source.disconnect();
            analyser.disconnect();
            context.close();
        };
    }, [src, draw]);

    return (
        <div className="rounded-xl overflow-hidden ring-1 ring-black/5 bg-black/80">
            <canvas ref={canvasRef} className="w-full h-24 block" />
            <audio ref={audioRef} controls className="w-full">
                <source src={src} />
            </audio>
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
