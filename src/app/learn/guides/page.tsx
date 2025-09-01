import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, Video, Headphones } from 'lucide-react';
import type { Guide } from '@/lib/learn/guides';

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

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-8 space-y-6">
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold">Official Learning Guides</h1>
                        <p className="text-muted-foreground mt-1">SEBI/NISM content transformed into interactive formats.</p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/learn">Back to Learn</Link>
                    </Button>
                </div>

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
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {guides.map((g) => {
                            const preferred = g.variants.find((v) => v.language === 'en') ?? g.variants[0];
                            const title = preferred?.title ?? g.title ?? 'Guide';
                            const summary = preferred?.summary ?? g.summary;
                            const { Icon, label } = typeMeta(g.source_type);
                            const langs = g.variants.map((v) => v.language.toUpperCase()).join(' / ');
                            return (
                                <Card key={g.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="aspect-video bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                                        <Icon className="h-12 w-12 text-brand-700" />
                                    </div>
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
                                                {summary ? (
                                                    <CardDescription className="text-sm line-clamp-3">{summary}</CardDescription>
                                                ) : null}
                                            </div>
                                            <Badge className="bg-white/80 text-gray-700 border border-brand-200">{label}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="text-xs text-muted-foreground">Languages: {langs}</div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button asChild size="sm" className="w-full">
                                                <Link href={`/learn/guides/${g.id}`}>Open</Link>
                                            </Button>
                                            <Button asChild size="sm" variant="outline" className="w-full">
                                                <a href={g.source_url} target="_blank" rel="noreferrer">
                                                    Source
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
