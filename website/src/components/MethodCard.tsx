"use client"

import React from "react"
import { Code2, ArrowRight, Sparkles, Box } from "lucide-react"

interface Parameter {
  name: string
  type: string
  description: string
  optional?: boolean
}

interface MethodCardProps {
  name: string
  signature: string
  returns: string
  description: string
  parameters?: Parameter[]
  example?: string
  badge?: string
}

export function MethodCard({
  name,
  signature,
  returns,
  description,
  parameters,
  example,
  badge = "Method"
}: MethodCardProps) {
  return (
    <div className="relative my-6 rounded-2xl border border-white/10 dark:border-white/10 bg-card/60 dark:bg-zinc-950/70 backdrop-blur-xl p-5 md:p-6 shadow-lg hover:border-primary/40 transition-all duration-200">
      {/* Top Bar with Name and Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-primary/10 text-primary border border-primary/20">
            {badge}
          </span>
          <h4 className="font-mono text-base md:text-lg font-bold text-foreground">
            {name}
          </h4>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-lg border border-border/40">
          <ArrowRight className="h-3.5 w-3.5 text-primary" />
          <span className="text-zinc-400">returns</span>
          <span className="font-semibold text-primary">{returns}</span>
        </div>
      </div>

      {/* Signature Code Banner */}
      <div className="mt-3 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-amber-400 overflow-x-auto whitespace-pre">
        {signature}
      </div>

      {/* Description */}
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>

      {/* Parameters */}
      {parameters && parameters.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border/30">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
            Parameters
          </span>
          <div className="space-y-1.5">
            {parameters.map((p, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 text-xs">
                <span className="font-mono font-semibold text-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/50">
                  {p.name}{p.optional ? "?" : ""}
                </span>
                <span className="font-mono text-primary text-[11px]">{p.type}</span>
                <span className="text-muted-foreground">— {p.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Example Snippet */}
      {example && (
        <div className="mt-4 pt-3 border-t border-border/30">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
            Example
          </span>
          <pre className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
            {example}
          </pre>
        </div>
      )}
    </div>
  )
}
