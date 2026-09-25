"use client"

import React from "react"
import { 
  BookOpen, 
  Search, 
  Type, 
  WifiOff, 
  AlignRight, 
  Sparkles, 
  Database, 
  ShieldCheck, 
  LucideIcon 
} from "lucide-react"

interface FeatureItem {
  icon: LucideIcon
  title: string
  description: string
}

const features: FeatureItem[] = [
  {
    icon: BookOpen,
    title: "Custom Vocabularies",
    description: "Easily inject your own brand names or website-specific terms using extendDictionary.",
  },
  {
    icon: Search,
    title: "Missing Word Collector",
    description: "Built-in, privacy-focused tool to track and discover missing translations on your site.",
  },
  {
    icon: Type,
    title: "Beautiful Typography",
    description: "Automatically injects and applies Google's Noto Nastaliq Urdu font for perfect readability.",
  },
  {
    icon: WifiOff,
    title: "100% Offline First",
    description: "Transliteration logic and dictionary lookups run entirely in the browser with zero cloud dependencies.",
  },
  {
    icon: AlignRight,
    title: "RTL by Design",
    description: "Automatic Right-to-Left bidirectional layout switching with full DOM subtree isolation.",
  },
  {
    icon: Sparkles,
    title: "Smart Script Detection",
    description: "Automatically detects whether input text is English, Urdu script, or Roman Urdu.",
  },
  {
    icon: Database,
    title: "Dictionary Driven",
    description: "Powered by a local 10,000+ entry English-Urdu mapping with O(1) instant memory lookup.",
  },
  {
    icon: ShieldCheck,
    title: "MIT Licensed & Secure",
    description: "Free and open source for everyone with built-in XSS protection and prototype pollution defense.",
  },
]

export function FeatureGrid() {
  return (
    <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-4">
      {features.map((f, i) => {
        const Icon = f.icon
        return (
          <div
            key={i}
            className="group relative rounded-2xl border border-border/60 bg-card/50 dark:bg-zinc-950/60 p-4 backdrop-blur-sm transition-all duration-200 hover:border-primary/50 hover:bg-card/80 hover:shadow-md"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0 group-hover:scale-105 transition-transform">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground mb-1">
                  {f.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
