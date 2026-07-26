import {cn} from "@/lib/utils";

export const guideMdxComponents = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="type-h3 mt-16 scroll-mt-28 text-text" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="type-h5 mt-10 scroll-mt-28 text-text" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="type-body mt-6 max-w-[68ch] leading-relaxed text-muted" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mt-6 max-w-[68ch] list-disc space-y-2 pl-6 text-muted" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="mt-6 max-w-[68ch] list-decimal space-y-2 pl-6 text-muted" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => <li className="type-body leading-relaxed" {...props} />,
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={cn(
        "mt-10 max-w-[66ch] rounded-xl border border-border bg-surface px-6 py-5",
        "type-small italic leading-relaxed text-text",
      )}
      {...props}
    />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-text underline decoration-border underline-offset-4 transition-colors duration-200 hover:text-accent"
      {...props}
    />
  ),
  hr: () => <hr className="my-12 border-border" />,
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="rounded bg-surface px-1.5 py-0.5 text-sm text-text" {...props} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="mt-10 overflow-x-auto rounded-xl border border-border bg-surface p-4" {...props} />
  ),
};
