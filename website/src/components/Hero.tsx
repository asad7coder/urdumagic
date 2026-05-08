"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Globe, Languages, MousePointer2, Zap } from "lucide-react"
import Link from "next/link"
import HeroDemo from "./HeroDemo"

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
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/90 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-3 duration-1000">
            <Sparkles className="w-4 h-4 text-[#f59e0b]" />
            <span>v0.2.0 is out! Now with:</span>
          </div>
          
          {/* Heading */}
          <h1 className="flex flex-col gap-2 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
            <span className="text-3xl md:text-4xl font-normal text-white">Add Urdu Magic to your site</span>
            <span className="text-6xl md:text-8xl font-bold text-[#f59e0b]">UrduMagic</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg text-white/70 mb-12 leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
            One-click whole-site translation for the Urdu web. High-performance, secure, and 100% offline-first with a massive 10,000+ entry dictionary.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16 text-left animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            {[
              {
                title: "Enterprise Middleware",
                description: "Built on a robust 5-layer pipeline (Security → Cache → Routing → Execution → Persistence) for production stability.",
                icon: Zap,
              },
              {
                title: "10K+ Entry Dictionary",
                description: "Instant $O(1)$ local lookups for common words and phrases. 100% offline and blazingly fast.",
                icon: MousePointer2,
              },
              {
                title: "Hardened Security",
                description: "Automatic XSS sanitization and prototype pollution protection keep your translation pipeline secure.",
                icon: Globe,
              },
              {
                title: "Performance Monitoring",
                description: "Granular async timing and metrics for every stage of the translation lifecycle.",
                icon: Languages,
              }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <feature.icon className="w-6 h-6 text-[#f59e0b] mb-3" />
                <h3 className="text-white font-bold mb-1">{feature.title}</h3>
                <p className="text-white/60 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 mb-16 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            <Link href="/docs/quickstart">
              <button className="h-14 px-10 rounded-lg bg-[#d97706] text-[#0f172a] font-bold text-lg hover:bg-[#f59e0b] transition-all flex items-center gap-2 shadow-lg shadow-[#d97706]/20">
                Get Started <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/playground">
              <button className="h-14 px-10 rounded-lg bg-transparent border border-white text-white font-semibold text-lg hover:bg-white hover:text-[#0f172a] transition-all">
                Live Playground
              </button>
            </Link>
          </div>

          {/* Live Demo Core Component */}
          <HeroDemo />

          {/* Showcase Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mt-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-700">
             {[
               { roman: "theek hai", urdu: "ٹھیک ہے" },
               { roman: "khubsoorat", urdu: "خوبصورت" },
               { roman: "mohabbat", urdu: "محبت" }
             ].map((item, i) => (
               <div key={i} className="p-4 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-sm group hover:bg-white/[0.05] transition-all">
                 <div className="flex justify-between items-start mb-3">
                   <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Roman → Urdu</span>
                   <span className="px-1.5 py-0.5 rounded bg-[#1e3a8a] text-white/80 text-[8px] font-bold uppercase tracking-tighter">Offline ⚡</span>
                 </div>
                 <div className="flex flex-col gap-1">
                   <span className="text-sm font-mono text-white/60 text-left">{item.roman}</span>
                   <span className="text-2xl font-urdu text-[#f59e0b] text-right" dir="rtl">{item.urdu}</span>
                 </div>
               </div>
             ))}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-8 md:gap-20 mt-16 animate-in fade-in duration-1000 delay-800">
             <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#f59e0b] mb-1">16KB</div>
                <div className="text-sm text-white/50 uppercase tracking-widest">Bundle Size</div>
             </div>
             <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#f59e0b] mb-1">10K+</div>
                <div className="text-sm text-white/50 uppercase tracking-widest">Dict Entries</div>
             </div>
             <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#f59e0b] mb-1">3</div>
                <div className="text-sm text-white/50 uppercase tracking-widest">Languages</div>
             </div>
          </div>
        </div>
      </div>
    </section>
  )
}
