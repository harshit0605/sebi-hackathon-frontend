import type { ContentBlock, Anchor } from '@/lib/learn/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Markdown from '@/components/learn/markdown';

export default function ConceptBlock({
  block,
  anchors,
}: {
  block: Extract<ContentBlock, { type: 'concept' }>;
  anchors?: Record<string, Anchor>;
}) {
  const aCount = block.anchor_ids?.length ?? 0;
  return (
    <Card className="w-3/4 backdrop-blur bg-white/60 border-white/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{block.payload.heading}</CardTitle>
        {aCount > 0 ? (
          <CardDescription>{aCount} reference{aCount > 1 ? 's' : ''}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        <Markdown className="prose prose-sm max-w-none text-muted-foreground">
          {block.payload.rich_text_md}
        </Markdown>
      </CardContent>
    </Card>
  );
}
