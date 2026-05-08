"use client"

import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { Github, Twitter, Globe } from "lucide-react"

export default function Footer() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const logoSrc = mounted && resolvedTheme === "dark" 
    ? "/urdumagic-dark.png" 
    : "/urdumagic-light.png"

  return (
    <footer className="border-t py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="relative w-32 h-10 overflow-hidden rounded-lg border bg-background shadow-sm group-hover:border-primary/50 transition-colors">
                {mounted ? (
                  <Image 
                    src={logoSrc} 
                    alt="UrduMagic Logo" 
                    fill 
                    sizes="128px"
                    className="object-contain p-1"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 animate-pulse" />
                )}
              </div>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Empowering developers to build multilingual experiences for Urdu speakers worldwide.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="flex flex-col gap-3">
              <span className="font-bold text-sm">Project</span>
              <Link href="/docs" className="text-sm text-muted-foreground hover:text-primary">Docs</Link>
              <Link href="/playground" className="text-sm text-muted-foreground hover:text-primary">Playground</Link>
              <Link href="https://github.com/asad7coder/urdumagic" className="text-sm text-muted-foreground hover:text-primary">GitHub</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-bold text-sm">Community</span>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Twitter</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Discord</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-bold text-sm">Legal</span>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">MIT License</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy</Link>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} UrduMagic. Built with ❤️ for the Urdu community.</p>
          <div className="flex gap-4">
            <Link href="https://github.com/asad7coder/urdumagic" target="_blank" className="hover:text-primary"><Github className="w-5 h-5" /></Link>
            <Link href="#" target="_blank" className="hover:text-primary"><Twitter className="w-5 h-5" /></Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
