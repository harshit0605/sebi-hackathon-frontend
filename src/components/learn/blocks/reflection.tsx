import type { ContentBlock, Anchor } from '@/lib/learn/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Markdown from '@/components/learn/markdown';

export default function ReflectionBlock({
  block,
  anchors,
}: {
  block: Extract<ContentBlock, { type: 'reflection' }>;
  anchors?: Record<string, Anchor>;
}) {
  return (
    <Card className="backdrop-blur bg-white/60 border-white/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Reflection</CardTitle>
        {block.payload.guidance_md ? (
          <CardDescription>Guidance</CardDescription>
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
