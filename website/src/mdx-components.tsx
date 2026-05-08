import type { MDXComponents } from 'mdx/types'
import React from 'react'
import { CodeBlock } from './components/CodeBlock'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold tracking-tight mb-8 mt-12 scroll-m-20 border-b pb-2">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-semibold tracking-tight mb-6 mt-10 scroll-m-20 border-b pb-1 text-primary">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-semibold tracking-tight mb-4 mt-8 scroll-m-20">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="leading-7 [&:not(:first-child)]:mt-6 mb-4">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="mt-2">
        {children}
      </li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-4 border-primary pl-6 italic text-muted-foreground">
        {children}
      </blockquote>
    ),
    table: ({ children }) => (
      <div className="my-6 w-full overflow-y-auto">
        <table className="w-full border-collapse border">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-muted">
        {children}
      </thead>
    ),
    tr: ({ children }) => (
      <tr className="m-0 border-t p-0 even:bg-muted/50">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
        {children}
      </td>
    ),
    code: (props) => {
      const { children, className } = props
      // Inline code
      if (typeof children === 'string' && !className) {
        return (
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
            {children}
          </code>
        )
      }
      
      // Block code (pre > code)
      // @ts-expect-error - CodeBlock is a server component
      return <CodeBlock className={className}>{children as string}</CodeBlock>
    },
    pre: ({ children }) => <>{children}</>,
    ...components,
  }
}
