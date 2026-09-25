import { getSingletonHighlighter } from 'shiki'
import { CopyButton } from './CopyButton'

export async function CodeBlock({ children, className }: { children: string, className?: string }) {
  let lang = className?.replace('language-', '') || 'text'
  if (lang === 'md') lang = 'markdown'
  
  let html = ''
  try {
    const highlighter = await getSingletonHighlighter({
      themes: ['github-dark'],
      langs: ['typescript', 'javascript', 'tsx', 'jsx', 'html', 'css', 'bash', 'json', 'markdown']
    })

    const loadedLangs = highlighter.getLoadedLanguages()
    const targetLang = loadedLangs.includes(lang) ? lang : 'text'

    html = highlighter.codeToHtml(children.trim(), {
      lang: targetLang,
      theme: 'github-dark'
    })
  } catch {
    html = `<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8"><code>${children.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
  }

  return (
    <div className="relative group my-6 rounded-2xl border border-white/10 dark:border-white/10 bg-zinc-950/80 dark:bg-zinc-950/90 backdrop-blur-xl overflow-hidden shadow-xl shadow-black/20">
      {/* Frosted Titlebar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/5 dark:bg-white/5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="ml-2 text-[11px] font-mono font-medium uppercase tracking-wider text-zinc-400">
            {lang}
          </span>
        </div>
        <CopyButton code={children.trim()} />
      </div>

      <div 
        className="p-4 md:p-5 overflow-x-auto text-xs md:text-sm leading-relaxed [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0 [&_pre]:!whitespace-pre-wrap [&_pre]:!break-words [&_code]:!whitespace-pre-wrap [&_code]:!break-words"
        dangerouslySetInnerHTML={{ __html: html }} 
      />
    </div>
  )
}
