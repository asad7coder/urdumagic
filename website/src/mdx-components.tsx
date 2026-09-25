import type { MDXComponents } from 'mdx/types'
import React from 'react'
import { CodeBlock } from './components/CodeBlock'
import { AIPromptBuilder } from './components/AIPromptBuilder'
import { PromptCard } from './components/PromptCard'
import { MethodCard } from './components/MethodCard'
import { FeatureGrid } from './components/FeatureGrid'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    AIPromptBuilder,
    PromptCard,
    MethodCard,
    FeatureGrid,
    h1: ({ children }) => (
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 mt-8 scroll-m-20 bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-5 mt-12 scroll-m-20 pb-2 border-b border-border/40 text-foreground flex items-center gap-2">
        <span className="w-1.5 h-6 rounded-full bg-primary inline-block" />
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl md:text-2xl font-semibold tracking-tight mb-3 mt-8 scroll-m-20 text-foreground">
        {children}
      </h3>
    ),
    hr: () => (
      <hr className="my-10 border-0 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
    ),
    p: ({ children }) => (
      <p className="leading-7 [&:not(:first-child)]:mt-4 mb-4 text-muted-foreground text-base">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="my-5 ml-6 list-disc [&>li]:mt-2 text-muted-foreground text-sm leading-relaxed">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="my-5 ml-6 list-decimal [&>li]:mt-2 text-muted-foreground text-sm leading-relaxed">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="mt-2 text-foreground/90">
        {children}
      </li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-4 border-primary pl-5 py-3 italic text-muted-foreground bg-primary/5 dark:bg-primary/10 rounded-r-2xl border-y border-r border-border/30">
        {children}
      </blockquote>
    ),
    table: ({ children }) => (
      <div className="my-6 w-full overflow-y-auto rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl shadow-md">
        <table className="w-full border-collapse text-sm">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-muted/60 border-b border-border/60">
        {children}
      </thead>
    ),
    tr: ({ children }) => (
      <tr className="m-0 border-b border-border/40 p-0 last:border-0 hover:bg-muted/30 transition-colors">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 text-left font-semibold text-foreground [&[align=center]]:text-center [&[align=right]]:text-right">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 text-left text-muted-foreground [&[align=center]]:text-center [&[align=right]]:text-right">
        {children}
      </td>
    ),
    code: (props) => {
      const { children, className } = props
      // Inline code
      if (typeof children === 'string' && !className) {
        return (
          <code className="relative rounded-md bg-muted/80 px-[0.4rem] py-[0.15rem] font-mono text-xs font-semibold text-primary border border-border/50">
            {children}
          </code>
        )
      }
      
      // Block code (pre > code)
      return <CodeBlock className={className}>{children as string}</CodeBlock>
    },
    pre: ({ children }) => <>{children}</>,
    ...components,
  }
}
