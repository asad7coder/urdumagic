import {
  LayoutDashboard,
  Landmark,
  Bot,
  GraduationCap,
  ShoppingCart,
  PenLine,
  BookOpen,
  Wrench,
} from "lucide-react"

const USE_CASES = [
  {
    icon: LayoutDashboard,
    iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:border-blue-400/40",
    label: <><span data-no-translate className="bidi-isolate">SaaS</span> Dashboards</>,
    desc: "Localize admin panels instantly",
  },
  {
    icon: Landmark,
    iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-400/40",
    label: "Government Websites",
    desc: "Reach citizens in their language",
  },
  {
    icon: Bot,
    iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20 group-hover:border-purple-400/40",
    label: <><span data-no-translate className="bidi-isolate">AI</span> Chatbots</>,
    desc: "Respond in Urdu natively",
  },
  {
    icon: GraduationCap,
    iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20 group-hover:border-amber-400/40",
    label: <><span data-no-translate className="bidi-isolate">LMS</span> Platforms</>,
    desc: "Deliver education in Urdu",
  },
  {
    icon: ShoppingCart,
    iconColor: "text-rose-400 bg-rose-500/10 border-rose-500/20 group-hover:border-rose-400/40",
    label: "E-commerce",
    desc: "Sell to Urdu-speaking markets",
  },
  {
    icon: PenLine,
    iconColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20 group-hover:border-cyan-400/40",
    label: <>Blogs & <span data-no-translate className="bidi-isolate">CMS</span></>,
    desc: "Publish multilingual content",
  },
  {
    icon: BookOpen,
    iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20 group-hover:border-indigo-400/40",
    label: "Documentation",
    desc: "Docs for Urdu developers",
  },
  {
    icon: Wrench,
    iconColor: "text-orange-400 bg-orange-500/10 border-orange-500/20 group-hover:border-orange-400/40",
    label: "Internal Tools",
    desc: "Localize enterprise apps",
  },
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
          {USE_CASES.map((uc, i) => {
            const Icon = uc.icon
            return (
              <div
                key={i}
                className="group p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300 cursor-default text-center flex flex-col items-center"
              >
                <div
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-3.5 transition-transform duration-300 group-hover:scale-110 ${uc.iconColor}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-white font-semibold text-sm mb-1">{uc.label}</div>
                <div className="text-white/40 text-xs leading-relaxed">{uc.desc}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
