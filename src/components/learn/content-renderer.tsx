import type { Anchor, ContentBlock } from '@/lib/learn/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ConceptBlock from './blocks/concept';
import ExampleBlock from './blocks/example';
import InteractiveBlock from './blocks/interactive';
import QuizBlock from './blocks/quiz';
import ReflectionBlock from './blocks/reflection';
import CalloutBlock from './blocks/callout';

export default function ContentRenderer({
  block,
  anchors,
}: {
  block: ContentBlock;
  anchors?: Anchor[];
}) {
  // Map anchor ids for quick lookup if needed in child components
  const anchorMap: Record<string, Anchor> = Object.fromEntries(
    (anchors ?? []).map((a) => [a._id, a])
  );

  switch (block.type) {
    case 'concept':
      return <ConceptBlock block={block} anchors={anchorMap} />;
    case 'example':
      return <ExampleBlock block={block} anchors={anchorMap} />;
    case 'interactive':
      return <InteractiveBlock block={block} anchors={anchorMap} />;
    case 'quiz':
      return <QuizBlock block={block} anchors={anchorMap} />;
    case 'reflection':
      return <ReflectionBlock block={block} anchors={anchorMap} />;
    case 'callout':
      return <CalloutBlock block={block} anchors={anchorMap} />;
    default:
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Unsupported block</CardTitle>
            <CardDescription>Type: {(block as any).type}</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                This content type isn't supported yet.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      );
  }
}
