import { Code2, Database, ShieldCheck, Sparkles, Layers, BookMarked } from "lucide-react"

const features = [
  {
    title: "Next.js & React Ready",
    description: "Dedicated subpath exports (`urdumagic/next`, `urdumagic/react`, `urdumagic/server`) supporting App Router, SSR, and dynamic hooks.",
    icon: Code2,
  },
  {
    title: "10K+ Offline Engine",
    description: "Proprietary 10,000+ entry dictionary providing instant, zero-latency lookups for English terms and common Urdu phrases.",
    icon: Database,
  },
  {
    title: "Missing Word Collector",
    description: "Built-in runtime collector automatically tracks untranslated terms so developers can discover and extend site vocabularies.",
    icon: BookMarked,
  },
  {
    title: "Custom Vocabularies",
    description: "Inject your own brand names, company terminology, and custom slang seamlessly with the `extendDictionary` API.",
    icon: Sparkles,
  },
  {
    title: "Hardened 5-Layer Security",
    description: "Enterprise pipeline with XSS sanitization, HTML entity encoding, and prototype pollution protection baked into the core.",
    icon: ShieldCheck,
  },
  {
    title: "Zero-Config Magic Mode",
    description: "Automatically translate full DOM trees, toggle RTL layout, and inject crisp Google Noto Nastaliq Urdu typography.",
    icon: Layers,
  },
]

export default function Features() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-[#1e3a8a]/60 border border-[#1e3a8a] text-[#93c5fd] text-xs font-semibold uppercase tracking-widest mb-4">
            Capabilities
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why choose <span data-no-translate className="bidi-isolate">UrduMagic</span>?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to make your modern web applications accessible to Urdu speakers, without heavy i18n overhead.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <div 
              key={i}
              className="p-7 rounded-2xl border bg-card hover:border-primary/50 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#1e3a8a] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-[#1e3a8a]/20">
                  <feature.icon className="w-6 h-6 text-[#93c5fd]" />
                </div>
                <h3 className="text-lg font-bold mb-2.5 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

