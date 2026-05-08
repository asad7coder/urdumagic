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
      size="icon"
      className="absolute right-4 top-4 h-8 w-8 text-zinc-400 hover:text-white"
      onClick={copy}
    >
      {copied ? <Check className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
    </Button>
  )
}
