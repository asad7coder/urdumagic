"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navigation = [
  {
    title: "Getting Started",
    links: [
      { title: "Introduction", href: "/docs" },
      { title: "Quick Start", href: "/docs/quickstart" },
    ],
  },
  {
    title: "API Reference",
    links: [
      { title: "Full Reference", href: "/docs/api-reference" },
    ],
  },
  {
    title: "Examples",
    links: [
      { title: "React", href: "/docs/examples/react" },
      { title: "Next.js", href: "/docs/examples/nextjs" },
      { title: "Plain HTML", href: "/docs/examples/html" },
    ],
  },
  {
    title: "Customization",
    links: [
      { title: "Custom Translator", href: "/docs/custom-translator" },
    ],
  },
]

export function DocsSidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-10", className)}>
      {navigation.map((group, index) => (
        <div key={index} className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {group.title}
          </h2>
          <div className="space-y-1">
            {group.links.map((link, linkIndex) => (
              <Link
                key={linkIndex}
                href={link.href}
                className={cn(
                  "group flex w-full items-center rounded-md border border-transparent px-4 py-2 hover:bg-muted hover:text-foreground",
                  pathname === link.href
                    ? "bg-muted font-medium text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
