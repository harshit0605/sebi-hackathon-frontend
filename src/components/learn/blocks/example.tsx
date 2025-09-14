import type { ContentBlock, Anchor } from '@/lib/learn/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Markdown from '@/components/learn/markdown';

export default function ExampleBlock({
  block,
  anchors,
}: {
  block: Extract<ContentBlock, { type: 'example' }>;
  anchors?: Record<string, Anchor>;
}) {
  return (
    <Card className="backdrop-blur bg-gradient-to-br from-white/60 via-amber-50/40 to-white/60 border-transparent shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{block.payload.scenario_title}</CardTitle>
        {block.payload.qa_pairs?.length ? (
          <CardDescription>{block.payload.qa_pairs.length} Q&A</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        <Markdown className="prose prose-sm max-w-none text-muted-foreground">
          {block.payload.scenario_md}
        </Markdown>
        {block.payload.qa_pairs?.length ? (
          <div className="mt-4">
            <Accordion type="single" collapsible className="w-full rounded-md border">
              {block.payload.qa_pairs.map((qa, i) => (
                <AccordionItem key={i} value={`qa-${i}`}>
                  <AccordionTrigger className="px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-muted-foreground">Q{i + 1}:</span>
                      <Markdown className="prose prose-sm max-w-none">
                        {qa.question}
                      </Markdown>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 text-muted-foreground">
                    <Markdown className="prose prose-sm max-w-none">
                      {qa.answer}
                    </Markdown>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
