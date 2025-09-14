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
  // Keep markdown semantics intact for headings and lists by avoiding forced <br/> injections.
  const withDoubleBreaks = normalized;
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {withDoubleBreaks}
      </ReactMarkdown>
    </div>
  );
}
