"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkFootnotes from "remark-footnotes";
import rehypeKatex from "rehype-katex";
import hljs from "highlight.js";

type MarkdownViewerProps = {
  content: string;
};

function MermaidDiagram({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("mermaid")
      .then((mermaid) => {
        if (cancelled || !containerRef.current) return;
        const renderId = `mermaid-${Math.random().toString(36).slice(2)}`;
        const mermaidApi = (mermaid as any).default ?? mermaid;
        try {
          mermaidApi.initialize({ startOnLoad: false, theme: "base" });
          mermaidApi.render(renderId, code, (svgCode: string) => {
            if (containerRef.current) containerRef.current.innerHTML = svgCode;
          });
        } catch (err) {
          console.error(err);
          setError("Failed to render Mermaid diagram.");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load Mermaid renderer.");
      });

    return () => {
      cancelled = true;
    };
  }, [code]);

  if (error) {
    return (
      <pre className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {error}
      </pre>
    );
  }

  return <div ref={containerRef} className="my-6 overflow-x-auto" />;
}

function flattenChildren(children: any): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map((child) => flattenChildren(child)).join("");
  if (children && typeof children === "object") return flattenChildren(children.props?.children);
  return "";
}

function MarkdownCodeBlock({ inline, className, children, ...props }: any) {
  const language = /language-(\w+)/.exec(className || "")?.[1];
  const code = flattenChildren(children).replace(/\n$/, "");

  if (!inline && language === "mermaid") {
    return <MermaidDiagram code={code} />;
  }

  const highlighted = !inline && language
    ? hljs.highlight(code, { language }).value
    : !inline
    ? hljs.highlightAuto(code).value
    : "";

  if (inline) {
    return (
      <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-sm text-slate-800" {...props}>
        {code}
      </code>
    );
  }

  return (
    <code className={className} dangerouslySetInnerHTML={{ __html: highlighted || code }} {...props} />
  );
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  const remarkPlugins = useMemo(() => [remarkGfm, remarkMath, remarkFootnotes], []);
  const rehypePlugins = useMemo(() => [rehypeKatex], []);

  return (
    <div className="markdown-body max-w-none text-slate-800">
      <ReactMarkdown
        remarkPlugins={remarkPlugins as any}
        rehypePlugins={rehypePlugins as any}
        components={{
          code: MarkdownCodeBlock,
          pre: ({ node, ...props }: any) => (
            <pre className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-800 overflow-x-auto" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
