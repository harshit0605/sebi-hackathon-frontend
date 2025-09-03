import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
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
  // Render "\n\n" as exactly two visible line breaks (<br/><br/>)
  // We replace the double newline sequence with HTML breaks (no extra newlines)
  // so remark-breaks won't add additional <br> around them.
  const withDoubleBreaks =
    typeof normalized === 'string' ? normalized.replace(/\n\n/g, '<br/><br/>') : normalized;
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
        {withDoubleBreaks}
      </ReactMarkdown>
    </div>
  );
}
