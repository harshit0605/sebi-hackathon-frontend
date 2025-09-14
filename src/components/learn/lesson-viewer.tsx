"use client"

import { useEffect, useMemo, useState } from 'react';
import type { ContentBlock, Anchor, QuizItem } from '@/lib/learn/types';
import ContentRenderer from '@/components/learn/content-renderer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { BookOpen, ChevronRight, ChevronLeft, FileText, HelpCircle, ListChecks, Sparkles, CheckCircle2, ArrowRight, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

// Local storage helpers for quiz attempts
const quizKey = (lessonSlug: string, blockId: string) => `learn:quiz:${lessonSlug}:${blockId}`;
const completedKey = (lessonSlug: string) => `learn:completed:${lessonSlug}`;

type LessonForViewer = {
    slug: string;
    title: string;
    learning_objectives: string[];
    content_blocks: ContentBlock[];
    anchor_details?: Anchor[];
};

export type LessonViewerProps = {
    lesson: LessonForViewer;
};

type QuizAttempt = {
    attempts: number;
    best: number; // percent 0-100
    last: number; // last percent
    ts: number;
};

export default function LessonViewer({ lesson }: LessonViewerProps) {
    const t = useTranslations('lesson');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const blocks = lesson.content_blocks ?? [];

    // Build menu: Objectives first, then all blocks
    const menu = useMemo(
        () => [{ kind: 'objectives' as const, id: '__obj__' }, ...blocks.map((b) => ({ kind: 'block' as const, id: b._id, block: b }))],
        [blocks]
    );

    const selectedMenu = menu[selectedIndex] ?? menu[0];
    const selected = selectedMenu.kind === 'block' ? selectedMenu.block : undefined;

    // Quiz sheet state
    const [open, setOpen] = useState(false);
    const [answers, setAnswers] = useState<number[]>([]); // index of selected choice per question
    const [submitting, setSubmitting] = useState(false);
    const [attempt, setAttempt] = useState<QuizAttempt | null>(null);

    // Completion map persisted in localStorage: { [blockId]: true }
    const [completed, setCompleted] = useState<Record<string, boolean>>({});

    // Load completion map on mount/lesson change
    useEffect(() => {
        try {
            const raw = localStorage.getItem(completedKey(lesson.slug));
            setCompleted(raw ? JSON.parse(raw) : {});
        } catch {
            setCompleted({});
        }
    }, [lesson.slug]);

    const isCompleted = (id?: string) => (id ? !!completed[id] : false);
    const markCompleted = (id?: string) => {
        if (!id) return;
        setCompleted((prev) => {
            if (prev[id]) return prev;
            const next = { ...prev, [id]: true };
            try { localStorage.setItem(completedKey(lesson.slug), JSON.stringify(next)); } catch { }
            return next;
        });
    };

    // Load saved quiz attempt for selected quiz
    useEffect(() => {
        if (selected?.type === 'quiz') {
            try {
                const raw = localStorage.getItem(quizKey(lesson.slug, selected._id));
                setAttempt(raw ? JSON.parse(raw) : null);
            } catch {
                setAttempt(null);
            }
        } else {
            setAttempt(null);
        }
    }, [lesson.slug, selected?._id, selected?.type]);

    // Define icon renderer before using in Sidebar to avoid temporal dead zone
    function typeIcon(t: ContentBlock['type']) {
        switch (t) {
            case 'concept':
                return <FileText className="h-4 w-4" />;
            case 'example':
                return <Sparkles className="h-4 w-4" />;
            case 'interactive':
                return <ListChecks className="h-4 w-4" />;
            case 'quiz':
                return <HelpCircle className="h-4 w-4" />;
            case 'reflection':
                return <BookOpen className="h-4 w-4" />;
            case 'callout':
                return <Sparkles className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    }

    // Sidebar style mapping per content type
    function getTypeStyles(t: ContentBlock['type'], isActive: boolean) {
        switch (t) {
            case 'interactive':
                return {
                    button: `group w-full text-left mb-2 rounded-xl border px-3 py-2 flex items-center justify-between gap-2 transition ${isActive ? 'bg-gradient-to-r from-emerald-50 to-emerald-100/70 border-emerald-200 shadow-sm' : 'bg-emerald-50/40 hover:bg-emerald-50 border-emerald-200/60'}`,
                    icon: `${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-50 text-emerald-700'}`,
                    chip: { label: tIntl('type.interactive'), className: 'bg-emerald-100 text-emerald-700' },
                } as const;
            case 'quiz':
                return {
                    button: `group w-full text-left mb-2 rounded-xl border px-3 py-2 flex items-center justify-between gap-2 transition ${isActive ? 'bg-gradient-to-r from-violet-50 to-fuchsia-50 border-violet-200 shadow-sm' : 'bg-violet-50/40 hover:bg-violet-50 border-violet-200/60'}`,
                    icon: `${isActive ? 'bg-violet-100 text-violet-700' : 'bg-violet-50 text-violet-700'}`,
                    chip: { label: tIntl('type.quiz'), className: 'bg-violet-100 text-violet-700' },
                } as const;
            case 'concept':
                return {
                    button: `group w-full text-left mb-2 rounded-xl border px-3 py-2 flex items-center justify-between gap-2 transition ${isActive ? 'bg-blue-50/70 border-blue-200' : 'bg-blue-50/40 hover:bg-blue-50 border-blue-200/60'}`,
                    icon: `${isActive ? 'bg-blue-100 text-blue-700' : 'bg-blue-50 text-blue-700'}`,
                } as const;
            case 'example':
                return {
                    button: `group w-full text-left mb-2 rounded-xl border px-3 py-2 flex items-center justify-between gap-2 transition ${isActive ? 'bg-amber-50/70 border-amber-200' : 'bg-amber-50/40 hover:bg-amber-50 border-amber-200/60'}`,
                    icon: `${isActive ? 'bg-amber-100 text-amber-700' : 'bg-amber-50 text-amber-700'}`,
                } as const;
            case 'reflection':
                return {
                    button: `group w-full text-left mb-2 rounded-xl border px-3 py-2 flex items-center justify-between gap-2 transition ${isActive ? 'bg-rose-50/70 border-rose-200' : 'bg-rose-50/40 hover:bg-rose-50 border-rose-200/60'}`,
                    icon: `${isActive ? 'bg-rose-100 text-rose-700' : 'bg-rose-50 text-rose-700'}`,
                } as const;
            case 'callout':
                return {
                    button: `group w-full text-left mb-2 rounded-xl border px-3 py-2 flex items-center justify-between gap-2 transition ${isActive ? 'bg-sky-50/70 border-sky-200' : 'bg-sky-50/40 hover:bg-sky-50 border-sky-200/60'}`,
                    icon: `${isActive ? 'bg-sky-100 text-sky-700' : 'bg-sky-50 text-sky-700'}`,
                } as const;
            default:
                return {
                    button: `group w-full text-left mb-2 rounded-xl border px-3 py-2 flex items-center justify-between gap-2 transition-colors ${isActive ? 'bg-gray-50/70 border-gray-200' : 'bg-white hover:bg-gray-50'}`,
                    icon: `${isActive ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-600'}`,
                } as const;
        }
    }

    const startQuiz = () => {
        if (selected?.type !== 'quiz') return;
        setAnswers(new Array(selected.payload.items.length).fill(-1));
        setOpen(true);
    };

    const scoreQuiz = () => {
        if (selected?.type !== 'quiz') return 0;
        const total = selected.payload.items.length;
        let correct = 0;
        selected.payload.items.forEach((q, i) => {
            const picked = answers[i];
            if (picked >= 0 && q.choices[picked]?.correct) correct += 1;
        });
        return Math.round((correct / Math.max(1, total)) * 100);
    };

    const submitQuiz = async () => {
        if (selected?.type !== 'quiz') return;
        setSubmitting(true);
        const percent = scoreQuiz();
        const prev: QuizAttempt = attempt ?? { attempts: 0, best: 0, last: 0, ts: 0 };
        const next: QuizAttempt = {
            attempts: prev.attempts + 1,
            best: Math.max(prev.best, percent),
            last: percent,
            ts: Date.now(),
        };
        try {
            localStorage.setItem(quizKey(lesson.slug, selected._id), JSON.stringify(next));
            setAttempt(next);
        } catch { }
        // Determine passing threshold: at least 2/3 correct OR configured threshold, whichever is higher
        const required = selected.payload.pass_threshold ? Math.max(67, selected.payload.pass_threshold) : 67;
        if (percent >= required) {
            markCompleted(selected._id);
        }
        setSubmitting(false);
        setOpen(false);
    };

    // Short helper for translations inside helpers where closure on t is awkward
    const tIntl = (key: string, values?: Record<string, any>) => t(key as any, values);

    const Sidebar = (
        <aside className="w-full sm:w-80 shrink-0 rounded-2xl border bg-white/70 backdrop-blur p-3">
            <div className="px-2 py-2">
                <div className="text-md font-semibold text-emerald-700">{t('sidebar.lesson')}</div>
                <div className="text-md font-bold leading-tight">{lesson.title}</div>
            </div>
            <div className="max-h-[70vh] overflow-auto pr-1">
                {menu.map((item, i) => {
                    const isActive = i === selectedIndex;
                    const b = item.kind === 'block' ? item.block : undefined;
                    const isQuiz = b?.type === 'quiz';
                    const quizMeta: QuizAttempt | null = isQuiz && b?._id === selected?._id ? attempt : null;
                    const done = isCompleted(b?._id);
                    const styles = b ? getTypeStyles(b.type, isActive) : undefined;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setSelectedIndex(i)}
                            className={
                                b
                                    ? styles!.button
                                    : `group w-full text-left mb-2 rounded-xl border px-3 py-2 flex items-center justify-between gap-2 transition-colors ${isActive ? 'bg-emerald-50/70 border-emerald-200' : 'bg-white hover:bg-gray-50'}`
                            }
                        >
                            <div className="flex items-center gap-3">
                                <span className={`rounded-md p-1.5 ${b ? styles!.icon : (isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600')}`}>
                                    {item.kind === 'objectives' ? (
                                        <Sparkles className="h-4 w-4" />
                                    ) : done ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                        typeIcon(b!.type)
                                    )}
                                </span>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                        {item.kind === 'objectives' ? t('sidebar.objectives') : labelForBlock(b!, t)}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">
                                        {item.kind === 'objectives'
                                            ? t('sidebar.overview')
                                            : b!.type === 'quiz'
                                                ? (quizMeta ? `${t('type.quiz')} • ${t('quiz.best')}: ${quizMeta.best}%` : t('sidebar.quizNotAttempted'))
                                                : prettyType(b!.type, t)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {b && (b.type === 'interactive' || b.type === 'quiz') ? (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${b.type === 'interactive' ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'}`}>
                                        {b.type === 'interactive' ? t('type.interactive') : t('type.quiz')}
                                    </span>
                                ) : null}
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </button>
                    );
                })}
            </div>
        </aside>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 md:gap-6">
            {Sidebar}
            <section className="space-y-4">

                {/* Objectives panel or block content */}
                {selectedMenu.kind === 'objectives' ? (
                    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                        <ObjectivesPanel objectives={lesson.learning_objectives} />
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground">{t('references', { count: (lesson.anchor_details ?? []).length })}</h3>
                            <div className="space-y-3">
                                {(lesson.anchor_details ?? []).map((a) => (
                                    <AnchorCard key={a._id} anchor={a} />
                                ))}
                                {(!lesson.anchor_details || lesson.anchor_details.length === 0) && (
                                    <div className="text-sm text-muted-foreground">{t('empty.noReferences')}</div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : selected ? (
                    selected.type === 'quiz' ? (
                        <>
                            <Card className="backdrop-blur bg-white/60 border-white/50 shadow-sm  w-3/4">
                                <CardHeader>
                                    <CardTitle className="text-lg">{t('quiz.title')}</CardTitle>
                                    <CardDescription>
                                        {t('quiz.meta', { count: selected.payload.items.length, threshold: Math.max(67, selected.payload.pass_threshold ?? 0) })}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {attempt ? (
                                        <div className="rounded-lg border p-3 bg-emerald-50/40">
                                            <div className="text-sm font-medium">{t('quiz.yourGrade')}</div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-2xl font-bold text-emerald-700">{attempt.last}%</div>
                                                <div className="text-xs text-muted-foreground">{t('quiz.best')}: {attempt.best}% • {t('quiz.attempts')}: {attempt.attempts}</div>
                                            </div>
                                        </div>
                                    ) : null}
                                    <Button onClick={startQuiz} className="">{attempt ? t('quiz.retry') : t('quiz.attempt')}</Button>
                                </CardContent>
                            </Card>
                            <div className="mt-4">
                                <ActionBar
                                    onNext={() => setSelectedIndex(Math.min(selectedIndex + 1, menu.length - 1))}
                                    showNext={selectedIndex < menu.length - 1}
                                    showMark={!isCompleted(selected._id)}
                                    onMark={() => markCompleted(selected._id)}
                                    completed={isCompleted(selected._id)}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <ContentRenderer block={selected} anchors={lesson.anchor_details} />
                            <div className="mt-4">
                                <ActionBar

                                    onNext={() => setSelectedIndex(Math.min(selectedIndex + 1, menu.length - 1))}
                                    showNext={selectedIndex < menu.length - 1}
                                    showMark={!isCompleted(selected._id)}
                                    onMark={() => markCompleted(selected._id)}
                                    completed={isCompleted(selected._id)}
                                />
                            </div>
                        </>
                    )
                ) : (
                    <Card><CardContent className="py-10 text-center text-muted-foreground">{t('empty.noBlocks')}</CardContent></Card>
                )}
            </section>

            {/* Quiz Attempt Sheet */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="right" className="inset-0 w-screen sm:w-screen max-w-none sm:max-w-none">
                    <SheetHeader>
                        <SheetTitle>{t('quiz.title')}</SheetTitle>
                        <SheetDescription>{t('quiz.sheetDesc')}</SheetDescription>
                    </SheetHeader>
                    <div className="p-4 space-y-4">
                        {selected?.type === 'quiz' ? (
                            <div className="space-y-4">
                                {selected.payload.items.map((q, qi) => (
                                    <div key={qi} className="rounded-xl border p-4">
                                        <div className="font-medium">Q{qi + 1}. {q.stem}</div>
                                        <div className="mt-3 grid gap-2">
                                            {q.choices.map((c, ci) => (
                                                <label key={ci} className={`flex items-center gap-2 rounded-md border p-2 cursor-pointer ${answers[qi] === ci ? 'border-emerald-300 bg-emerald-50/40' : ''}`}>
                                                    <input
                                                        type="radio"
                                                        name={`q-${qi}`}
                                                        checked={answers[qi] === ci}
                                                        onChange={() => setAnswers((prev) => prev.map((v, idx) => (idx === qi ? ci : v)))}
                                                    />
                                                    <span className="text-sm">{c.text}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-2">
                                    <div className="text-xs text-muted-foreground mb-1">{t('quiz.progress')}</div>
                                    <Progress value={(answers.filter((a) => a >= 0).length / Math.max(1, selected.payload.items.length)) * 100} />
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button variant="secondary" onClick={() => setOpen(false)}>{t('common.back')}</Button>
                                    <Button disabled={submitting} onClick={submitQuiz}>{submitting ? t('common.loading') : t('common.submit')}</Button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}

function ObjectivesPanel({ objectives }: { objectives: string[] }) {
    const t = useTranslations('lesson');
    return (
        <Card className="backdrop-blur-md bg-gradient-to-br from-white/60 via-emerald-50/40 to-white/60 border-transparent shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">{t('objectives.title')}</CardTitle>
                <CardDescription>{t('objectives.sub')}</CardDescription>
            </CardHeader>
            <CardContent>
                {objectives && objectives.length ? (
                    <ul className="space-y-2">
                        {objectives.map((o, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <span className="inline-flex h-4 w-4 items-center justify-center shrink-0">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
                                </span>
                                <span className="text-sm md:text-md">{o}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-sm text-muted-foreground">{t('empty.noObjectives')}</div>
                )}
            </CardContent>
        </Card>
    );
}

function labelForBlock(b: ContentBlock, t: ReturnType<typeof useTranslations>) {
    switch (b.type) {
        case 'concept':
            return b.payload.heading || t('type.concept');
        case 'example':
            return b.payload.scenario_title || t('type.example');
        case 'interactive':
            return b.payload.widget_config?.title || b.payload.widget_kind || t('type.interactive');
        case 'quiz':
            return t('type.quiz');
        case 'reflection':
            return t('type.reflection');
        case 'callout':
            return b.payload.title || t('type.callout');
        default:
            return 'Block';
    }
}

function prettyType(tp: ContentBlock['type'], t: ReturnType<typeof useTranslations>) {
    switch (tp) {
        case 'concept':
            return t('type.concept');
        case 'example':
            return t('type.example');
        case 'interactive':
            return t('type.interactive');
        case 'quiz':
            return t('type.quiz');
        case 'reflection':
            return t('type.reflection');
        case 'callout':
            return t('type.callout');
        default:
            return 'Block';
    }
}

function AnchorCard({ anchor }: { anchor: Anchor }) {
    const date = anchor.last_verified_at ? new Date(anchor.last_verified_at) : null;
    const isPdf = (anchor.source_type?.toLowerCase()?.includes('pdf') ?? false) || (anchor.source_url?.toLowerCase()?.endsWith('.pdf') ?? false);
    const SourceIcon = isPdf ? FileText : Globe;
    const title = anchor.title || anchor.document_title || anchor.short_label || anchor._id;
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="w-full text-left rounded-2xl border border-white/60 bg-white/50 backdrop-blur-md shadow-sm hover:shadow-md hover:border-brand-200 transition p-4">
                    <div className="flex items-start gap-3">
                        <div className="min-w-0">
                            <div className="text-sm font-semibold truncate">{title}</div>
                            {anchor.excerpt ? (
                                <div className="text-xs text-muted-foreground line-clamp-3 mt-0.5">{anchor.excerpt}</div>
                            ) : null}
                            <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                                <div className="truncate">{anchor.source_type || (isPdf ? 'PDF' : 'Web')}</div>
                                {date ? <div className="truncate">Verified {date.toLocaleDateString()}</div> : null}
                            </div>
                            {anchor.source_url ? (
                                <div className="mt-2 flex items-center gap-2 text-xs">
                                    <SourceIcon className="h-3.5 w-3.5 text-brand-600" />
                                    <span className="truncate">
                                        <span className="text-brand-700 underline-offset-4 hover:underline">{anchor.source_url}</span>
                                    </span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl bg-white/70 backdrop-blur-md border-white/60">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {anchor.document_title ? (
                        <DialogDescription>{anchor.document_title}</DialogDescription>
                    ) : null}
                </DialogHeader>
                <div className="space-y-3">
                    {anchor.excerpt ? (
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">{anchor.excerpt}</div>
                    ) : null}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <SourceIcon className="h-4 w-4 text-brand-600" />
                            <span>{anchor.source_type || (isPdf ? 'PDF' : 'Web')}</span>
                        </div>
                        {date ? <div>Verified {date.toLocaleDateString()}</div> : null}
                    </div>
                    {anchor.source_url ? (
                        <a href={anchor.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-brand-700 hover:underline underline-offset-4 text-sm">
                            <SourceIcon className="h-4 w-4" />
                            <span className="truncate max-w-[520px]">{anchor.source_url}</span>
                        </a>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ActionBar({
    onNext,
    showNext,
    showMark,
    onMark,
    completed,
}: {
    onNext: () => void;
    showNext: boolean;
    showMark?: boolean;
    onMark?: () => void;
    completed?: boolean;
}) {
    const t = useTranslations('lesson');
    return (
        <div className="flex items-center justify-end gap-4 w-3/4">
            {showNext ? (
                <Button onClick={onNext} className="inline-flex items-center gap-2">
                    {t('actions.next')} <ArrowRight className="h-4 w-4" />
                </Button>
            ) : null}
            {completed ? (
                <div className="inline-flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">{t('state.completed')}</span>
                </div>
            ) : showMark ? (
                <Button variant="outline" onClick={onMark} className="inline-flex items-center gap-2">
                    {t('actions.markCompleted')} <CheckCircle2 className="h-4 w-4" />
                </Button>
            ) : null}
        </div>
    );
}
