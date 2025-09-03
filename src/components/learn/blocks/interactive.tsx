import type { ContentBlock, Anchor } from '@/lib/learn/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Markdown from '@/components/learn/markdown';
import NetWorthCalculator from '@/components/widgets/calculator';
import SmartGoalSetter from '@/components/widgets/scenario-builder';
import DecisionTreeSelector from '@/components/widgets/decision-tree';

export default function InteractiveBlock({
  block,
  anchors,
}: {
  block: Extract<ContentBlock, { type: 'interactive' }>;
  anchors?: Record<string, Anchor>;
}) {
  const cfg = block.payload.widget_config;
  const kind = block.payload.widget_kind;
  const effectiveCfg = cfg ?? { title: block.payload.widget_kind };

  return (
    <Card className="backdrop-blur bg-white/60 border-white/50 shadow-sm w-3/4">
      <CardHeader>
        <CardTitle className="text-lg">{cfg?.title ?? block.payload.widget_kind}</CardTitle>
        {cfg?.description ? <CardDescription>{cfg.description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {block.payload.instructions_md ? (
          <Markdown className="prose prose-sm max-w-none text-muted-foreground">
            {block.payload.instructions_md}
          </Markdown>
        ) : null}
        {kind === 'calculator' ? (
          <NetWorthCalculator config={effectiveCfg} />
        ) : kind === 'scenario_builder' ? (
          <SmartGoalSetter config={effectiveCfg} />
        ) : kind === 'decision_tree' ? (
          <DecisionTreeSelector config={effectiveCfg} />
        ) : (
          <>
            <Alert>
              <AlertDescription>
                Interactive widget "{block.payload.widget_kind}" coming soon. Fallback content below.
              </AlertDescription>
            </Alert>
            {block.payload.fallback_content ? (
              <Markdown className="prose prose-sm max-w-none text-muted-foreground">
                {block.payload.fallback_content}
              </Markdown>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
