import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function Markdown({
  children,
  className,
}: {
  children?: string;
  className?: string;
}) {
  if (!children) return null;
  // Some content sources store literal "\n" sequences instead of real newlines.
  // Normalize them so markdown renders proper line/paragraph breaks.
  const normalized =
    typeof children === 'string'
      ? children.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n')
      : children;
  // Lightly improve readability for sources that lack blank lines between sections by
  // turning single newlines into paragraph breaks (double newlines) when not already present.
  // This keeps existing double newlines intact and avoids interfering with block elements.
  const withDoubleBreaks =
    typeof normalized === 'string'
      // Insert paragraph breaks for single newlines, but avoid when the next line starts with
      // common markdown block starters (lists/headings/quotes/numeric lists).
      ? normalized.replace(/([^\n])\n(?!\n|[-*#0-9>])/g, '$1\n\n')
      : normalized;
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {withDoubleBreaks}
      </ReactMarkdown>
    </div>
  );
}
