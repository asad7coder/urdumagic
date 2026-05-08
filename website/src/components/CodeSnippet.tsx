"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"

export default function CodeSnippet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group rounded-xl border bg-zinc-950 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <span className="text-xs font-mono text-zinc-400">Terminal</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-zinc-400 hover:text-white"
          onClick={copy}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </Button>
      </div>
      <div className="p-4 font-mono text-sm overflow-x-auto text-zinc-100">
        <span className="text-primary">$</span> {code}
      </div>
    </div>
  )
}
