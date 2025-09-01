import { MainLayout } from '@/components/layout/main-layout';
import GuideViewer from '@/components/learn/guide-viewer';
import type { Guide } from '@/lib/learn/guides';
import { fetchGuideByIdFromDb } from '@/lib/learn/loaders';
import { notFound } from 'next/navigation';

export default async function GuidePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const guide = await fetchGuideByIdFromDb(id);
    if (!guide) return notFound();

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-6 space-y-6">
                <GuideViewer guide={guide} />
            </div>
        </MainLayout>
    );
}
