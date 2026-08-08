const USE_CASES = [
  { emoji: "⚙️", label: <><span data-no-translate className="bidi-isolate">SaaS</span> Dashboards</>, desc: "Localize admin panels instantly" },
  { emoji: "🏛️", label: "Government Websites", desc: "Reach citizens in their language" },
  { emoji: "🤖", label: <><span data-no-translate className="bidi-isolate">AI</span> Chatbots</>, desc: "Respond in Urdu natively" },
  { emoji: "🎓", label: <><span data-no-translate className="bidi-isolate">LMS</span> Platforms</>, desc: "Deliver education in Urdu" },
  { emoji: "🛒", label: "E-commerce", desc: "Sell to Urdu-speaking markets" },
  { emoji: "✍️", label: <>Blogs & <span data-no-translate className="bidi-isolate">CMS</span></>, desc: "Publish multilingual content" },
  { emoji: "📖", label: "Documentation", desc: "Docs for Urdu developers" },
  { emoji: "🔧", label: "Internal Tools", desc: "Localize enterprise apps" },
]

export default function PerfectFor() {
  return (
    <section className="py-20 bg-gradient-to-b from-[#0f172a] to-[#0f1f3a]">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-[#1e3a8a]/60 border border-[#1e3a8a] text-[#93c5fd] text-xs font-semibold uppercase tracking-widest mb-4">
            Perfect For
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Built for every web project
          </h2>
          <p className="text-white/55 max-w-xl mx-auto">
            Whether you ship SaaS, government portals, or personal blogs—UrduMagic fits right in.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {USE_CASES.map((uc, i) => (
            <div
              key={i}
              className="group p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] hover:border-[#f59e0b]/30 transition-all duration-300 cursor-default text-center"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {uc.emoji}
              </div>
              <div className="text-white font-semibold text-sm mb-1">{uc.label}</div>
              <div className="text-white/40 text-xs leading-relaxed">{uc.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
