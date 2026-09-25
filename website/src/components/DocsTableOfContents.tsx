"use client"

import React, { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { AlignLeft, ArrowUp, Github } from "lucide-react"
import { cn } from "@/lib/utils"

interface TOCItem {
  id: string
  text: string
  level: number
}

export function DocsTableOfContents() {
  const pathname = usePathname()
  const [headings, setHeadings] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>("")

  // Extract headings from main content on mount & route change
  useEffect(() => {
    const extractHeadings = () => {
      const mainEl = document.querySelector("main")
      if (!mainEl) return

      const headingEls = mainEl.querySelectorAll("h2, h3")
      const items: TOCItem[] = []

      headingEls.forEach((el, index) => {
        // Ensure element has an ID
        let id = el.id
        if (!id) {
          const rawText = el.textContent || `heading-${index}`
          id = rawText
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-")
          el.id = id
        }

        const text = el.textContent || ""
        // Skip empty or generic utility texts
        if (text && text.trim().length > 0) {
          items.push({
            id,
            text: text.replace(/[^\w\s-–—&]/g, "").trim(),
            level: el.tagName.toLowerCase() === "h2" ? 2 : 3,
          })
        }
      })

      setHeadings(items)
      if (items.length > 0) {
        setActiveId(items[0].id)
      }
    }

    // Short delay to ensure MDX/DOM has painted
    const timer = setTimeout(extractHeadings, 200)

    // Intersection observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "0px 0px -65% 0px", threshold: 0.1 }
    )

    const observeHeadings = () => {
      document.querySelectorAll("main h2, main h3").forEach((h) => observer.observe(h))
    }

    const obsTimer = setTimeout(observeHeadings, 300)

    return () => {
      clearTimeout(timer)
      clearTimeout(obsTimer)
      observer.disconnect()
    }
  }, [pathname])

  const scrollToHeading = (id: string) => {
    const target = document.getElementById(id)
    if (target) {
      const navOffset = 80
      const elementPosition = target.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - navOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
      setActiveId(id)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (headings.length === 0) {
    return null
  }

  return (
    <div className="space-y-4 text-sm">
      {/* Header */}
      <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-foreground">
        <AlignLeft className="h-4 w-4 text-primary" />
        <span>On This Page</span>
      </div>

      {/* Heading List */}
      <nav className="space-y-1.5 border-l border-border/50 pl-3">
        {headings.map((item) => {
          const isActive = activeId === item.id
          return (
            <button
              key={item.id}
              onClick={() => scrollToHeading(item.id)}
              className={cn(
                "group relative block w-full text-left text-xs transition-colors duration-200 line-clamp-1",
                item.level === 3 ? "pl-3 text-[11px]" : "font-medium",
                isActive
                  ? "text-primary font-bold -ml-[13px] pl-[13px] border-l-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.text}
            </button>
          )
        })}
      </nav>

      {/* Helpful Links */}
      <div className="pt-4 border-t border-border/40 space-y-2 text-xs text-muted-foreground">
        <button
          onClick={scrollToTop}
          className="flex items-center gap-1.5 hover:text-primary transition-colors text-[11px]"
        >
          <ArrowUp className="h-3.5 w-3.5" />
          <span>Scroll to top</span>
        </button>

        <a
          href="https://github.com/asad7coder/urdumagic"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 hover:text-primary transition-colors text-[11px]"
        >
          <Github className="h-3.5 w-3.5" />
          <span>GitHub Repository</span>
        </a>
      </div>
    </div>
  )
}
