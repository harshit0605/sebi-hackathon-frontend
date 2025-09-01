import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { BookOpen, Clock } from 'lucide-react';
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

export default async function ModulesPage() {
    let journeys: LearningJourney[] = [];
    let loadError: string | null = null;
    try {
        const { fetchJourneys } = await import('@/lib/learn/loaders');
        journeys = await fetchJourneys();
    } catch (err: any) {
        loadError = err?.message || 'Failed to load modules';
    }

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
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold">Learning Modules</h1>
                        <p className="text-muted-foreground mt-1">Structured journeys with outcomes, prerequisites, and time estimates.</p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/learn">Back to Learn</Link>
                    </Button>
                </div>

                {loadError ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Unable to load modules</CardTitle>
                            <CardDescription>
                                {loadError}. Ensure MongoDB is configured (MONGODB_URI) and the journeys collection is accessible.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : journeys.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>No modules yet</CardTitle>
                            <CardDescription>When journeys are available, they will appear here.</CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {journeys.map((j) => (
                            <Card key={j._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="aspect-video bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                                    <BookOpen className="h-12 w-12 text-brand-600" />
                                </div>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg">{j.title}</CardTitle>
                                            {j.description ? (
                                                <CardDescription className="text-sm">{j.description}</CardDescription>
                                            ) : null}
                                        </div>
                                        <Badge className={levelBadge(j.level)}>{j.level ?? 'level'}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <BookOpen className="h-4 w-4" />
                                            {j.lesson_count ?? 0} lessons
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {j.avg_lesson_duration ? `${Math.round((j.avg_lesson_duration * (j.lesson_count ?? 0)) / 60)}h` : '—'}
                                        </span>
                                    </div>

                                    <Button asChild className="w-full">
                                        <Link href={`/learn/modules/${j.slug}`}>Open Module</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
