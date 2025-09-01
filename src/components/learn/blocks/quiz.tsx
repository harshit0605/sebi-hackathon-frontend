import type { ContentBlock, Anchor } from '@/lib/learn/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function QuizBlock({
  block,
  anchors,
}: {
  block: Extract<ContentBlock, { type: 'quiz' }>;
  anchors?: Record<string, Anchor>;
}) {
  const total = block.payload.items.length;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quiz</CardTitle>
        <CardDescription>
          {total} question{total > 1 ? 's' : ''} • pass at {block.payload.pass_threshold}%
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {block.payload.items.map((q, idx) => (
          <div key={idx} className="rounded-md border p-3 space-y-2">
            <div className="font-medium">Q{idx + 1}. {q.stem}</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {q.choices.map((c, i) => (
                <div key={i} className="text-sm text-muted-foreground rounded border p-2">
                  {c.text}
                </div>
              ))}
            </div>
            {q.rationale ? (
              <div className="text-xs text-muted-foreground">Hint: {q.rationale}</div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
