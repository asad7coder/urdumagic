import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PerfectFor from "@/components/PerfectFor";
import Features from "@/components/Features";
import FeatureComparison from "@/components/FeatureComparison";
import Footer from "@/components/Footer";
import CodeSnippet from "@/components/CodeSnippet";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />

      {/* Perfect For section — who uses it */}
      <PerfectFor />

      {/* Quick Install Section — how to use it */}
      <section className="py-20 bg-[#0f1f3a]">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 rounded-full bg-[#1e3a8a]/60 border border-[#1e3a8a] text-[#93c5fd] text-xs font-semibold uppercase tracking-widest mb-4">
              Installation
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Up and running in 30 seconds
            </h2>
            <p className="text-white/55 max-w-xl mx-auto">
              Install the package, import one function, and you&apos;re translating.
            </p>
          </div>

          <div className="space-y-4">
            <CodeSnippet code="npm install urdumagic" />

            {/* Code example */}
            <div dir="ltr" data-no-translate className="rounded-xl border border-white/[0.08] bg-zinc-950 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                <span className="text-xs font-mono text-zinc-400">example.ts</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1e3a8a] text-[#93c5fd] uppercase tracking-wider">TypeScript</span>
              </div>
              <div className="p-5 font-mono text-sm text-zinc-100 overflow-x-auto">
                <div><span className="text-[#93c5fd]">import</span> <span className="text-[#fbbf24]">{"{ translate }"}</span> <span className="text-[#93c5fd]">from</span> <span className="text-emerald-400">&quot;urdumagic&quot;</span><span>;</span></div>
                <div className="mt-3"><span className="text-[#93c5fd]">const</span> <span className="text-white">result</span> <span className="text-zinc-400">=</span> <span className="text-[#fbbf24]">await</span> <span className="text-white">translate</span><span className="text-zinc-400">(</span><span className="text-emerald-400">&quot;Pakistan is beautiful&quot;</span><span className="text-zinc-400">);</span></div>
                <div className="mt-1 text-zinc-500 pl-0"><span className="text-zinc-600">{"// "}</span><span className="text-[#f59e0b]" dir="rtl" style={{fontFamily: "serif"}}>پاکستان خوبصورت ہے</span></div>
                <div className="mt-3"><span className="text-[#93c5fd]">const</span> <span className="text-white">roman</span> <span className="text-zinc-400">=</span> <span className="text-white">translate</span><span className="text-zinc-400">(</span><span className="text-emerald-400">&quot;mujhe Pakistan se pyar hai&quot;</span><span className="text-zinc-400">);</span></div>
                <div className="mt-1 text-zinc-500"><span className="text-zinc-600">{"// "}</span><span className="text-[#f59e0b]" dir="rtl" style={{fontFamily: "serif"}}>مجھے پاکستان سے پیار ہے</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why choose — how it works */}
      <Features />

      {/* Feature comparison table */}
      <FeatureComparison />

      {/* CTA Section */}
      <section className="py-22 relative overflow-hidden bg-[#0f172a] text-white">
        <div className="absolute inset-0 bg-primary/5 -skew-y-3 origin-right scale-110 pointer-events-none" />
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to make your site multilingual?</h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join developers building more inclusive Urdu experiences across the web.
          </p>
          <div className="flex justify-center gap-4">
             <a href="/docs" className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
               Read the Docs
             </a>
             <a href="https://github.com/asad7coder/urdumagic" target="_blank" className="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-3 rounded-lg font-medium hover:bg-white/20 transition-colors">
               View on GitHub
             </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
