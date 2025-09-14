"use client";
import type { ContentBlock, Anchor } from '@/lib/learn/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Markdown from '@/components/learn/markdown';
import { useTranslations } from 'next-intl';

export default function ReflectionBlock({
  block,
  anchors,
}: {
  block: Extract<ContentBlock, { type: 'reflection' }>;
  anchors?: Record<string, Anchor>;
}) {
  const t = useTranslations('lesson');
  return (
    <Card className="backdrop-blur bg-gradient-to-br from-white/60 via-rose-50/40 to-white/60 border-transparent shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{t('type.reflection')}</CardTitle>
        {block.payload.guidance_md ? (
          <CardDescription>{t('guidance')}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        <Markdown className="prose prose-sm max-w-none text-muted-foreground">
          {block.payload.prompt_md}
        </Markdown>
        {block.payload.guidance_md ? (
          <Markdown className="prose prose-xs max-w-none text-muted-foreground">
            {block.payload.guidance_md}
          </Markdown>
        ) : null}
      </CardContent>
    </Card>
  );
}
