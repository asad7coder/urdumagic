"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Github, Menu, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

export default function Navbar() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const logoSrc = mounted && resolvedTheme === "dark" 
    ? "/urdumagic-dark.png" 
    : "/urdumagic-light.png"

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-t-[3px] border-t-primary bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-48 h-16 overflow-hidden rounded-xl border bg-background shadow-sm group-hover:border-primary/50 transition-colors">
               {mounted ? (
                 <Image 
                   src={logoSrc} 
                   alt="UrduMagic Logo" 
                   fill 
                   priority
                   sizes="(max-width: 768px) 160px, 160px"
                   className="object-contain p-1"
                 />
               ) : (
                 <div className="w-full h-full bg-primary/10 animate-pulse" />
               )}
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link>
            <Link href="/docs/quickstart" className="hover:text-primary transition-colors">Quickstart</Link>
            <Link href="/playground" className="hover:text-primary transition-colors">Playground</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button variant="outline" size="sm" className="hidden md:flex gap-2" asChild>
            <Link href="https://github.com/asad7coder/urdumagic" target="_blank">
              <Github className="w-4 h-4" />
              GitHub
            </Link>
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t bg-background p-6 flex flex-col gap-6 text-base font-medium animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative w-32 h-10 overflow-hidden rounded-lg border">
              {mounted && <Image src={logoSrc} alt="UrduMagic" fill sizes="128px" className="object-contain p-1" />}
            </div>
          </div>
          <Link href="/docs" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors">Documentation</Link>
          <Link href="/docs/quickstart" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors">Quickstart</Link>
          <Link href="/playground" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors">Playground</Link>
          <hr />
          <Link href="https://github.com/asad7coder/urdumagic" target="_blank" className="flex items-center gap-2">
            <Github className="w-4 h-4" />
            GitHub
          </Link>
        </div>
      )}
    </nav>
  )
}
