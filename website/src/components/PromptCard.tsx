"use client"

import React, { useState } from "react"
import { Check, Copy, Sparkles, Zap, Code2, Globe, LucideIcon } from "lucide-react"
import { Button } from "./ui/button"

interface PromptCardProps {
  title: string
  iconType?: "universal" | "nextjs" | "react" | "vanilla" | "custom"
  badge?: string
  description: string
  prompt: string
}

const iconMap: Record<string, LucideIcon> = {
  universal: Sparkles,
  nextjs: Zap,
  react: Code2,
  vanilla: Globe,
  custom: Sparkles,
}

export function PromptCard({ title, iconType = "universal", badge, description, prompt }: PromptCardProps) {
  const [copied, setCopied] = useState(false)
  const Icon = iconMap[iconType] || Sparkles

  const copy = () => {
    navigator.clipboard.writeText(prompt.trim())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative my-8 rounded-2xl border border-white/10 dark:border-white/10 bg-card/60 dark:bg-zinc-950/70 backdrop-blur-xl p-6 shadow-xl overflow-hidden transition-all duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {badge && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                {badge}
              </span>
            )}
            <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              <span>{title}</span>
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        </div>

        <Button
          onClick={copy}
          size="sm"
          className="relative inline-flex items-center gap-2 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-sm self-start sm:self-auto shrink-0 transition-all active:scale-95"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-300" />
              <span>Copied Prompt!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy Prompt</span>
            </>
          )}
        </Button>
      </div>

      {/* Titlebar */}
      <div className="mt-4 flex items-center justify-between px-3.5 py-2 rounded-t-xl bg-zinc-900 border-t border-x border-zinc-800 text-[11px] font-mono text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-2">prompt.md</span>
        </div>
        <span className="text-[10px] text-zinc-500">Ready to paste</span>
      </div>

      {/* Prompt Body */}
      <div className="rounded-b-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-300 max-h-72 overflow-y-auto whitespace-pre-wrap break-words [overflow-wrap:anywhere] shadow-inner selection:bg-primary/30">
        {prompt.trim()}
      </div>
    </div>
  )
}
