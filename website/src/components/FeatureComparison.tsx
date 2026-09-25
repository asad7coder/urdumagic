import { Check } from "lucide-react"

const FEATURES = [
  { name: "Roman Urdu → Urdu", supported: true },
  { name: "English → Urdu", supported: true },
  { name: "10K+ Offline Dictionary", supported: true },
  { name: "Missing Word Collector & Tracker", supported: true },
  { name: "Custom Vocabularies (`extendDictionary`)", supported: true },
  { name: <><span data-no-translate className="bidi-isolate">RTL</span> Support & Typography</>, supported: true },
  { name: "Magic Mode (Whole-site DOM)", supported: true },
  { name: "Offline First (Zero-latency)", supported: true },
  { name: <><span data-no-translate className="bidi-isolate">TypeScript</span> Support</>, supported: true },
  { name: <><span data-no-translate className="bidi-isolate">React</span> Hooks & Provider (`urdumagic/react`)</>, supported: true },
  { name: <><span data-no-translate className="bidi-isolate">Next.js</span> App Router & SSR (`urdumagic/next`)</>, supported: true },
  { name: <><span data-no-translate className="bidi-isolate">MIT</span> License</>, supported: true },
  { name: <><span data-no-translate className="bidi-isolate">XSS</span> Protection</>, supported: true },
  { name: <>No <span data-no-translate className="bidi-isolate">API</span> Keys Required</>, supported: true },
]

export default function FeatureComparison() {
  return (
    <section className="py-20 bg-[#0f172a]">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-[#1e3a8a]/60 border border-[#1e3a8a] text-[#93c5fd] text-xs font-semibold uppercase tracking-widest mb-4">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="text-white/55 max-w-xl mx-auto">
            <span data-no-translate className="bidi-isolate">UrduMagic</span> is a complete solution. No plugins, no extra services, no <span data-no-translate className="bidi-isolate">API</span> bills.
          </p>
        </div>

        <div dir="ltr" className="rounded-2xl border border-white/[0.08] overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-3 bg-white/[0.05] border-b border-white/[0.08] px-6 py-4">
            <div className="col-span-2 text-xs font-bold uppercase tracking-widest text-white/40">Feature</div>
            <div className="text-center text-xs font-bold uppercase tracking-widest text-[#f59e0b]"><span data-no-translate className="bidi-isolate">UrduMagic</span></div>
          </div>

          {/* Rows */}
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className={`grid grid-cols-3 px-6 py-3.5 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.03] transition-colors ${
                i % 2 === 0 ? "bg-white/[0.015]" : ""
              }`}
            >
              <div className="col-span-2 text-white/80 text-sm font-medium flex items-center gap-2">
                {feature.name}
              </div>
              <div className="flex justify-center items-center">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
