'use client';

import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useCoAgent } from '@copilotkit/react-core';
import { Loader2, Play, Square, RotateCcw } from 'lucide-react';

// Local types for form and agent state snapshot

type ChunkingMode = 'auto' | 'manual';

type ManualRange = {
    from: number;
    to: number;
    label?: string;
};

type ChunkOrchestrationState = {
    messages: { [key: string]: unknown }[];
    // Input
    pdf_source?: string; // local path or http(s) URL
    source_type?: string; // e.g., 'SEBI_PDF'
    chunk_mode?: 'auto' | 'manual' | 'smart';
    pages_per_chunk?: number;
    manual_ranges?: Array<Record<string, any>>;
    session_id?: string;

    // Derived chunking data (persisted only in parent graph)
    pdf_local_path?: string;
    chunks?: Array<Record<string, any>>; // {content: string, pages: number[], chunk_id: string, label?: string}
    current_index?: number;
    total_chunks?: number;

    // Shared keys with subgraph
    pdf_content?: string;
    page_numbers?: number[];
    chunk_id?: string;
    source_url?: string;

    // Execution tracking
    last_run_status?: string;
    errors?: string[];
    done?: boolean;
};

export default function CreateCoursePage() {
    const [pdfUrl, setPdfUrl] = useState<string>('');
    const [chunkingMode, setChunkingMode] = useState<ChunkingMode>('auto');
    const [manualRangesJson, setManualRangesJson] = useState<string>('');

    // Build configurable config for the agent based on form fields
    const initialState = useMemo(() => {
        let manual_ranges: ManualRange[] | undefined = undefined;
        try {
            if (chunkingMode === 'manual' && manualRangesJson.trim().length > 0) {
                const parsed = JSON.parse(manualRangesJson);
                if (Array.isArray(parsed)) {
                    manual_ranges = parsed as ManualRange[];
                }
            }
        } catch {
            // ignore here; we will validate on submit
        }

        return {
            messages: [
                {
                    role: 'user',
                    content: `Please create a course from the following PDF: ${pdfUrl}`,
                },
            ],
            pdf_source: pdfUrl || undefined,
            source_type: 'SEBI_PDF',
            chunk_mode: chunkingMode,
            manual_ranges,
        } as ChunkOrchestrationState;
    }, [pdfUrl, chunkingMode, manualRangesJson]);

    const agent = useCoAgent<ChunkOrchestrationState>({
        name: 'chunking_orchestrator',
        initialState,
        // config: { configurable },
    });

    // Auto-start if navigated via Copilot action
    useEffect(() => {
        try {
            const raw = localStorage.getItem('createCourseParams');
            if (raw) {
                const params = JSON.parse(raw) as {
                    pdfUrl?: string;
                    chunkingMode?: ChunkingMode;
                    manualRangesJson?: string;
                    autoStart?: boolean;
                };
                if (params.pdfUrl) setPdfUrl(params.pdfUrl);
                if (params.chunkingMode) setChunkingMode(params.chunkingMode);
                if (typeof params.manualRangesJson === 'string') setManualRangesJson(params.manualRangesJson);
                // default to autoStart when invoked by action
                const shouldStart = params.autoStart !== false;
                // clear the stash to avoid duplicate runs
                localStorage.removeItem('createCourseParams');
                if (shouldStart) {
                    // small delay to ensure state has applied
                    setTimeout(() => void handleStart(), 50);
                }
            }
        } catch {
            // noop
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const validateUrl = (url: string) => {
        try {
            const u = new URL(url);
            return u.protocol === 'http:' || u.protocol === 'https:';
        } catch {
            return false;
        }
    };

    const validateManualJson = (json: string) => {
        if (chunkingMode !== 'manual') return true;
        if (!json.trim()) return false;
        try {
            const parsed = JSON.parse(json);
            if (!Array.isArray(parsed)) return false;
            return parsed.every(
                (r: ManualRange) =>
                    typeof r === 'object' &&
                    r !== null &&
                    typeof r.from === 'number' &&
                    typeof r.to === 'number' &&
                    r.from >= 1 &&
                    r.to >= r.from,
            );
        } catch {
            return false;
        }
    };

    const handleStart = async () => {
        if (!pdfUrl || !validateUrl(pdfUrl)) {
            toast.error('Please enter a valid PDF URL (http/https).');
            return;
        }
        if (!validateManualJson(manualRangesJson)) {
            toast.error('Manual page ranges JSON is invalid. Expect an array of { from, to, label? } objects.');
            return;
        }

        try {
            await agent.start();
            toast.success('Course creation started');
        } catch (e: any) {
            toast.error('Failed to start agent');
            // optional: console for devs
            console.error(e);
        }
    };

    const handleStop = async () => {
        try {
            await agent.stop();
            toast.info('Agent stopped');
        } catch (e: any) {
            toast.error('Failed to stop agent');
        }
    };

    const handleReset = () => {
        // Soft reset of form and local state
        setPdfUrl('');
        setChunkingMode('auto');
        setManualRangesJson('');
        toast.info('Form reset');
    };

    const currentNode = agent.nodeName || 'idle';
    const running = agent.running;

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Create Course from PDF</h1>
                        <p className="text-sm text-muted-foreground">Provide a PDF URL and chunking strategy. The agent will stream progress here.</p>
                    </div>
                    <Badge variant="secondary">Agent: enhanced_lesson_creator</Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Input</CardTitle>
                            <CardDescription>PDF source and chunking configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="pdfUrl">PDF URL</Label>
                                <Input
                                    id="pdfUrl"
                                    placeholder="https://example.com/file.pdf"
                                    value={pdfUrl}
                                    onChange={(e) => setPdfUrl(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Chunking Mode</Label>
                                <Select value={chunkingMode} onValueChange={(v: ChunkingMode) => setChunkingMode(v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select chunking mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="auto">Auto</SelectItem>
                                        <SelectItem value="manual">Manual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {chunkingMode === 'manual' && (
                                <div className="space-y-2">
                                    <Label htmlFor="ranges">Manual Page Ranges (JSON)</Label>
                                    <Textarea
                                        id="ranges"
                                        className="min-h-32 font-mono text-sm"
                                        placeholder='Example: [{"from": 1, "to": 4, "label": "Intro"}]'
                                        value={manualRangesJson}
                                        onChange={(e) => setManualRangesJson(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">Must be an array of objects with "from" and "to" page numbers.</p>
                                </div>
                            )}

                            <div className="flex items-center gap-2 pt-2">
                                <Button onClick={handleStart} disabled={running}>
                                    {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />} Start
                                </Button>
                                <Button variant="secondary" onClick={handleStop} disabled={!running}>
                                    <Square className="mr-2 h-4 w-4" /> Stop
                                </Button>
                                <Button variant="ghost" onClick={handleReset}>
                                    <RotateCcw className="mr-2 h-4 w-4" /> Reset
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Progress</CardTitle>
                            <CardDescription>Live updates from the agent</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`h-2.5 w-2.5 rounded-full ${running ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                                    <span className="text-sm">{running ? 'Running' : 'Idle'}</span>
                                </div>
                                <Badge variant="outline">Node: {currentNode}</Badge>
                            </div>

                            <Progress value={running ? 30 : 0} />

                            <div className="space-y-2">
                                <Label>State Snapshot</Label>
                                <pre className="bg-muted rounded-md p-3 text-xs overflow-auto max-h-80">
                                    {JSON.stringify(
                                        {
                                            nodeName: agent.nodeName,
                                            // content_analysis: agent.state?.content_analysis ?? null,
                                            // lessons_count: Array.isArray(agent.state?.lessons) ? agent.state.lessons.length : undefined,
                                            // validation_errors: agent.state?.validation_errors ?? [],
                                        },
                                        null,
                                        2,
                                    )}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
