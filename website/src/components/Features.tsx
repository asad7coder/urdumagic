import { Globe, Languages, MousePointer2, Zap } from "lucide-react"

const features = [
  {
    title: "Enterprise Middleware",
    description: "Built on a robust 5-layer pipeline (Security → Cache → Routing → Execution → Persistence) ensuring absolute production stability and predictable results.",
    icon: Zap,
  },
  {
    title: "Massive Offline Engine",
    description: "Our proprietary 10,000+ entry dictionary provides instant, offline lookups for a vast range of English terms and common Urdu phrases.",
    icon: MousePointer2,
  },
  {
    title: "Hardened Security",
    description: "Advanced XSS sanitization, HTML entity encoding, and prototype pollution protection are baked into the core translation lifecycle.",
    icon: Globe,
  },
  {
    title: "Granular Monitoring",
    description: "Built-in performance trackers provide detailed async timing and metrics for every stage of your translation pipeline.",
    icon: Languages,
  },
]

export default function Features() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why choose UrduMagic?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to make your website accessible to Urdu speakers, without the complexity of heavy i18n libraries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <div 
              key={i}
              className="p-8 rounded-2xl border bg-card hover:border-primary/50 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#1e3a8a] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-[#1e3a8a]/20">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
