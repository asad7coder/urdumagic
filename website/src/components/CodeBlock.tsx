import { getSingletonHighlighter } from 'shiki'
import { CopyButton } from './CopyButton'

export async function CodeBlock({ children, className }: { children: string, className?: string }) {
  const lang = className?.replace('language-', '') || 'text'
  const highlighter = await getSingletonHighlighter({
    themes: ['github-dark'],
    langs: ['typescript', 'javascript', 'tsx', 'jsx', 'html', 'css', 'bash', 'json']
  })

  const html = highlighter.codeToHtml(children.trim(), {
    lang,
    theme: 'github-dark'
  })

  return (
    <div className="relative group my-6 rounded-xl border bg-zinc-950 overflow-hidden">
      <CopyButton code={children.trim()} />
      <div 
        className="p-4 overflow-x-auto text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }} 
      />
    </div>
  )
}
