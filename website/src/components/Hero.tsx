"use client"

import { ArrowRight, Sparkles, Check, Rocket, Zap } from "lucide-react"
import Link from "next/link"
import HeroDemo from "./HeroDemo"

const BADGES = [
  { label: "Roman ↔ Urdu", isTechnical: false },
  { label: "English → Urdu", isTechnical: false },
  { label: "10K+ Dictionary", isTechnical: true },
  { label: "Next.js & SSR", isTechnical: true },
  { label: "React Hooks", isTechnical: true },
  { label: "Offline First", isTechnical: false },
  { label: "RTL Ready", isTechnical: true },
  { label: "TypeScript", isTechnical: true },
  { label: "MIT License", isTechnical: true },
]

const STATS = [
  { value: "16 KB", label: "Core Library" },
  { value: "10,000+", label: "Dictionary Entries" },
  { value: "100%", label: "Offline First" },
  { value: "v0.4.0", label: "Latest Release" },
]

const SHOWCASES = [
  { roman: "theek hai", urdu: "ٹھیک ہے" },
  { roman: "khubsoorat", urdu: "خوبصورت" },
  { roman: "mohabbat", urdu: "محبت" },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-20 overflow-hidden bg-gradient-to-b from-[#0f172a] to-[#1e3a5f]">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-dot-pattern opacity-[0.04] pointer-events-none" />

      {/* Glowing Blobs */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#d97706] opacity-[0.12] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[600px] h-[600px] bg-[#1e3a8f] opacity-[0.3] blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">

          {/* Version Badge */}
          <div dir="ltr" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/90 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
            <Rocket className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span><span data-no-translate className="bidi-isolate">v0.4.0</span> is now available</span>
          </div>

          {/* Heading */}
          <h1 className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <span className="block text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Add <span data-no-translate className="bidi-isolate">UrduMagic</span> to your website
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/70 mb-8 leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
            Translate websites into Urdu instantly—offline, secure, and developer-friendly.
            The easiest way to add Urdu support to any JavaScript application.
          </p>

          {/* Feature Badges Strip */}
          <div dir="ltr" className="flex flex-wrap justify-center gap-2 mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
            {BADGES.map((badge) => (
              <span
                key={badge.label}
                {...(badge.isTechnical ? { "data-no-translate": true } : {})}
                className="px-3 py-1.5 rounded-lg bg-white/[0.07] border border-white/[0.12] text-white/85 text-sm font-medium hover:bg-white/[0.12] hover:border-[#f59e0b]/40 hover:text-white transition-all duration-200 cursor-default"
              >
                {badge.label}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-250">
            <Link href="/docs/quickstart">
              <button
                id="hero-get-started"
                dir="ltr"
                className="px-10 py-3.5 rounded-lg bg-[#d97706] text-[#0f172a] font-bold text-lg hover:bg-[#f59e0b] transition-all flex items-center gap-2 shadow-lg shadow-[#d97706]/30 hover:shadow-[#f59e0b]/40 hover:-translate-y-0.5"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/playground">
              <button
                id="hero-playground"
                dir="ltr"
                className="px-10 py-3.5 rounded-lg bg-transparent border border-white/40 text-white font-semibold text-lg hover:bg-white hover:text-[#0f172a] hover:border-white transition-all hover:-translate-y-0.5"
              >
                Live Playground
              </button>
            </Link>
          </div>

          {/* Social Proof */}
          <div dir="ltr" className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-12 animate-in fade-in duration-700 delay-300">
            <span className="flex items-center gap-1.5 text-sm text-white/55">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              Works Offline
            </span>
            <span className="flex items-center gap-1.5 text-sm text-white/55">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              No <span data-no-translate className="bidi-isolate">API</span> Keys
            </span>
            <span className="flex items-center gap-1.5 text-sm text-white/55">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              No Internet Required
            </span>
            <span className="flex items-center gap-1.5 text-sm text-white/55">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span data-no-translate className="bidi-isolate">XSS</span> Protected
            </span>
          </div>

          {/* Live Demo */}
          <HeroDemo />

          {/* Showcase Strip */}
          <div dir="ltr" className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mt-12 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
            {SHOWCASES.map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-sm group hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Roman → Urdu</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1e3a8a] text-white/80 text-[8px] font-bold uppercase tracking-tighter">
                    <Zap className="w-2.5 h-2.5 text-amber-400" />
                    Offline
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span dir="ltr" lang="ro" className="text-sm font-mono text-white/60 text-left">{item.roman}</span>
                  <span dir="rtl" lang="ur" className="urdu-script text-2xl font-bold text-[#f59e0b] text-right">{item.urdu}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Bar */}
          <div dir="ltr" className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 mt-16 w-full max-w-3xl animate-in fade-in duration-700 delay-600">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div data-no-translate className="bidi-isolate text-3xl md:text-4xl font-bold text-[#f59e0b] mb-1">{stat.value}</div>
                <div className="text-xs text-white/45 uppercase tracking-widest leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
