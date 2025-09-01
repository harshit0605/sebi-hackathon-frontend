import type { ContentBlock, Anchor } from '@/lib/learn/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Markdown from '@/components/learn/markdown';

const styleMap: Record<string, string> = {
  warning: 'border-yellow-300',
  info: 'border-blue-300',
  compliance: 'border-purple-300',
  tip: 'border-green-300',
  sebi_guideline: 'border-emerald-300',
};

export default function CalloutBlock({
  block,
  anchors,
}: {
  block: Extract<ContentBlock, { type: 'callout' }>;
  anchors?: Record<string, Anchor>;
}) {
  const style = styleMap[block.payload.style] ?? 'border-gray-200';
  return (
    <Card className={`${style} backdrop-blur bg-white/60 border-white/50 shadow-sm`}>
      <CardHeader>
        <CardTitle className="text-lg">{block.payload.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Markdown className="prose prose-sm max-w-none text-muted-foreground">
          {block.payload.text_md}
        </Markdown>
      </CardContent>
    </Card>
  );
}
