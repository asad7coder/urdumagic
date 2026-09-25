"use client"

import * as React from "react"
import { Check, Copy as CopyIcon } from "lucide-react"
import { Button } from "./ui/button"

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 px-2.5 text-xs text-zinc-400 hover:text-white hover:bg-white/10 flex items-center gap-1.5 rounded-lg transition-all"
      onClick={copy}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-medium">Copied</span>
        </>
      ) : (
        <>
          <CopyIcon className="h-3.5 w-3.5" />
          <span>Copy</span>
        </>
      )}
    </Button>
  )
}
