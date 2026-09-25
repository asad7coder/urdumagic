"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Rocket, BookOpen, Code2, Sliders } from "lucide-react"

const navigation = [
  {
    title: "Getting Started",
    icon: Rocket,
    links: [
      { title: "Introduction", href: "/docs" },
      { title: "Quick Start", href: "/docs/quickstart" },
      { title: "AI Integration Prompt", href: "/docs/ai-prompt" },
    ],
  },
  {
    title: "API Reference",
    icon: BookOpen,
    links: [
      { title: "Full Reference", href: "/docs/api-reference" },
    ],
  },
  {
    title: "Examples",
    icon: Code2,
    links: [
      { title: "React", href: "/docs/examples/react" },
      { title: "Next.js", href: "/docs/examples/nextjs" },
      { title: "Plain HTML", href: "/docs/examples/html" },
    ],
  },
  {
    title: "Customization",
    icon: Sliders,
    links: [
      { title: "Custom Words & Dictionary", href: "/docs/custom-translator" },
    ],
  },
]

export function DocsSidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-10 space-y-5", className)}>
      {navigation.map((group, index) => {
        const Icon = group.icon
        return (
          <div key={index} className="px-2 py-1">
            <h2 className="mb-2.5 px-3 text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" />
              <span className="font-bold text-foreground tracking-wide">{group.title}</span>
            </h2>
            <div className="space-y-1">
              {group.links.map((link, linkIndex) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={linkIndex}
                    href={link.href}
                    className={cn(
                      "group relative flex w-full items-center rounded-xl px-3 py-2 text-sm transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold shadow-xs border border-primary/20"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-1.5 h-4 w-1 rounded-full bg-primary" />
                    )}
                    <span className={cn(isActive && "pl-2")}>{link.title}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
