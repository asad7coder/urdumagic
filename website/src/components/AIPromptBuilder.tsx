"use client"

import React, { useState, useMemo } from "react"
import { 
  Check, 
  Copy, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Terminal, 
  Cpu, 
  Bot, 
  Code2, 
  Zap, 
  FileCode2, 
  Settings2
} from "lucide-react"
import { Button } from "./ui/button"

type FrameworkType = "universal" | "nextjs" | "react" | "vanilla" | "custom-dict"
type SwitcherType = "floating" | "custom-nav" | "programmatic"

export function AIPromptBuilder() {
  const [framework, setFramework] = useState<FrameworkType>("universal")
  const [switcherType, setSwitcherType] = useState<SwitcherType>("floating")
  const [includeVerification, setIncludeVerification] = useState(true)
  const [includeCustomDict, setIncludeCustomDict] = useState(false)
  const [customWords, setCustomWords] = useState("urduMagic: اردو میجک, fintech: فن ٹیک")
  const [copied, setCopied] = useState(false)
  const [activeCopiedTarget, setActiveCopiedTarget] = useState<string | null>(null)

  const generatedPrompt = useMemo(() => {
    let frameworkDetails = ""

    if (framework === "universal") {
      frameworkDetails = `### 📦 Key Rules & Requirements:
1. **Package**: Use \`urdumagic\` (Install with \`npm install urdumagic\` or use CDN \`https://unpkg.com/urdumagic/dist/urdumagic.js\`).
2. **100% Offline**: UrduMagic runs completely offline with a built-in 10,000+ entry dictionary and transliteration engine. Do NOT configure external translation APIs or cloud keys.
3. **Framework Adaptability**:
   - For **React/Vite**: Use \`import { useUrduMagic, UrduMagicProvider, useUrduMagicContext } from 'urdumagic/react'\`.
   - For **Next.js App Router**: Initialize in a client component (\`'use client'\`) in \`app/layout.tsx\` or use \`renderToString\` from \`urdumagic/server\` for SSR.
   - For **Plain HTML / Static**: Initialize with \`UrduMagic.init({ defaultLang: 'en', modes: ['en', 'ur', 'roman'] })\`.`
    } else if (framework === "nextjs") {
      frameworkDetails = `### 📦 Next.js (App Router / Pages Router) Specifics:
1. **Package**: Install \`urdumagic\` (\`npm install urdumagic\`).
2. **Client Initialization**: Create a client component \`UrduMagicInit.tsx\` with \`'use client'\` calling \`UrduMagic.init({ defaultLang: 'en', modes: ['en', 'ur', 'roman'], showSwitcher: ${switcherType === "floating"} })\` and mount it inside \`app/layout.tsx\`.
3. **SSR Support**: For server-rendered routes or blogs, use \`import { renderToString } from 'urdumagic/server'\` to pre-render translated HTML and inject \`dir="rtl"\`.
4. **Static Generation**: Use \`import { generateUrduParams } from 'urdumagic/next'\` inside \`generateStaticParams\` for multilingual static paths.`
    } else if (framework === "react") {
      frameworkDetails = `### 📦 React / Vite / SPA Specifics:
1. **Package**: Install \`urdumagic\` (\`npm install urdumagic\`).
2. **React Hooks & Provider**:
   - Wrap the application tree with \`<UrduMagicProvider config={{ defaultLang: 'en', modes: ['en', 'ur', 'roman'] }}>\` from \`urdumagic/react\`.
   - Or use the \`useUrduMagic({ defaultLang: 'en', modes: ['en', 'ur', 'roman'], showSwitcher: ${switcherType === "floating"} })\` hook to access \`currentLanguage\`, \`switchLang\`, \`toUrdu\`, \`toRoman\`, and \`translate\`.`
    } else if (framework === "vanilla") {
      frameworkDetails = `### 📦 Vanilla JS & HTML Specifics:
1. **CDN Script**: Include \`<script src="https://unpkg.com/urdumagic/dist/urdumagic.js"></script>\` in the \`<head>\` or before \`</body>\`.
2. **Initialization**: Initialize with \`UrduMagic.init({ defaultLang: 'en', modes: ['en', 'ur', 'roman'], showSwitcher: ${switcherType === "floating"} })\`.
3. **Magic Mode**: The library automatically scans text nodes and translates visible content when language changes.`
    } else if (framework === "custom-dict") {
      frameworkDetails = `### 📦 Custom Vocabulary & Domain Terms:
1. **Package**: Install \`urdumagic\` (\`npm install urdumagic\`).
2. **Extend Dictionary**: Use \`extendDictionary({...})\` before initialization to inject brand names, product titles, technical terms, or industry jargon into the offline dictionary.
3. **O(1) Fast Cache**: All custom injected words are merged into the lookup tree with instant reactivity.`
    }

    let switcherDetails = ""
    if (switcherType === "floating") {
      switcherDetails = `- **Language Switcher**: Enable built-in floating switcher button with \`showSwitcher: true\`.`
    } else if (switcherType === "custom-nav") {
      switcherDetails = `- **Language Switcher**: Set \`showSwitcher: false\` and implement custom toggle buttons or a dropdown in the navigation bar using \`switchLang('ur' | 'en' | 'roman')\`.`
    } else {
      switcherDetails = `- **Language Switcher**: Set \`showSwitcher: false\` and control language switches programmatically via \`app.switchLang(lang)\`.`
    }

    let customDictBlock = ""
    if (includeCustomDict || framework === "custom-dict") {
      customDictBlock = `\n- **Custom Vocabulary**: Call \`extendDictionary({ ${customWords} })\` from \`urdumagic\` to ensure custom domain words are accurately translated.`
    }

    let verificationBlock = ""
    if (includeVerification) {
      verificationBlock = `\n---

### 🧪 Verification & Post-Implementation Testing:
After writing the code, please verify the implementation:
1. **Build Validation**: Run \`npm run build\` (or run the dev server) to ensure zero compilation or bundler errors.
2. **Dictionary Lookup Test**: Verify that \`UrduMagic.fromEnglish('welcome')\` or \`translate('welcome', 'ur')\` yields \`'خوش آمدید'\`.
3. **Transliteration Test**:
   - Test \`UrduMagic.toUrdu('salam')\` → returns \`'سلام'\`.
   - Test \`UrduMagic.toRoman('سلام')\` → returns \`'salam'\`.
4. **Script Detection**: Verify \`UrduMagic.detectScript('سلام')\` evaluates to \`'arabic'\` and \`UrduMagic.detectScript('salam')\` evaluates to \`'roman-urdu'\`.
5. **RTL & Layout Check**: Ensure changing language sets \`dir="rtl"\` on Urdu and preserves untranslatable elements marked with \`data-no-translate\`.`
    }

    return `You are an expert web developer. Please integrate UrduMagic into our project to provide 100% offline, privacy-first Urdu, Roman Urdu, and English language support.

### 🎯 Objective:
Implement seamless multilingual support (English, Urdu script, Roman Urdu) using the \`urdumagic\` package with zero external network dependencies.

${frameworkDetails}

### 📐 Layout & DOM Rules:
- Ensure the \`<html>\` or main container receives \`dir="rtl"\` when Urdu (\`ur\`) is active, and \`dir="ltr"\` for English/Roman.
- Wrap brand names, usernames, code blocks, and acronyms with \`data-no-translate\` to prevent unwanted translation.
${switcherDetails}${customDictBlock}

### 🛠️ Step-by-Step Instructions:
1. Install \`urdumagic\` as a dependency (or include the CDN script).
2. Setup the initialization wrapper / Provider at the application root layout.
3. Configure the language switching mechanism according to the specified switcher preference.
4. Protect non-translatable text elements using \`data-no-translate\`.
5. If custom terms are specified, register them with \`extendDictionary\`.${verificationBlock}`
  }, [framework, switcherType, includeVerification, includeCustomDict, customWords])

  const copyPrompt = (targetName = "default") => {
    navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    setActiveCopiedTarget(targetName)
    setTimeout(() => {
      setCopied(false)
      setActiveCopiedTarget(null)
    }, 2500)
  }

  return (
    <div className="relative my-8 rounded-3xl border border-white/10 dark:border-white/10 bg-card/60 dark:bg-zinc-950/70 p-6 md:p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300">
      {/* Decorative top accent glow */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-24 bg-primary/20 blur-3xl rounded-full pointer-events-none" />

      {/* Header with Badges */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/40 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary mb-3">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Interactive AI Agent Integrator</span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            Master Prompt Generator
          </h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
            Pick your tech stack or fine-tune options. One click copies a tailored prompt ready to paste into <span className="font-semibold text-foreground">Cursor</span>, <span className="font-semibold text-foreground">Claude</span>, <span className="font-semibold text-foreground">ChatGPT</span>, or <span className="font-semibold text-foreground">Copilot</span>.
          </p>
        </div>

        {/* Main CTA Copy Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <Button
            onClick={() => copyPrompt("main")}
            className="relative inline-flex items-center justify-center gap-2.5 px-6 py-5 rounded-2xl font-semibold bg-gradient-to-r from-primary via-amber-500 to-amber-600 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            size="lg"
          >
            {copied && activeCopiedTarget === "main" ? (
              <>
                <Check className="h-5 w-5 text-white animate-in zoom-in" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="h-5 w-5" />
                <span>Copy Ready Prompt</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 1. Framework Selection Pills */}
      <div className="relative z-10 mt-6 space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <span>Step 1: Select Your Stack Preset</span>
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {[
            { id: "universal", icon: Sparkles, label: "Universal", desc: "Works for all stacks" },
            { id: "nextjs", icon: Zap, label: "Next.js", desc: "App Router / SSR" },
            { id: "react", icon: Code2, label: "React / Vite", desc: "Hooks & Context" },
            { id: "vanilla", icon: Cpu, label: "Plain HTML", desc: "CDN Script" },
            { id: "custom-dict", icon: FileCode2, label: "Custom Dict", desc: "Domain vocabulary" },
          ].map((item) => {
            const Icon = item.icon
            const isSelected = framework === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFramework(item.id as FrameworkType)}
                className={`relative group p-3.5 text-left rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? "border-primary/80 bg-primary/10 dark:bg-primary/15 text-foreground ring-1 ring-primary/60 shadow-md shadow-primary/10"
                    : "border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-border text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                  {isSelected && <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                </div>
                <div>
                  <span className={`block font-bold text-sm ${isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                    {item.label}
                  </span>
                  <span className="text-[11px] opacity-75">{item.desc}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Customization Controls */}
      <div className="relative z-10 mt-6 pt-5 border-t border-border/40">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-primary" />
          <span>Step 2: Customize Options & Preferences</span>
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-muted/20 dark:bg-zinc-900/40 p-4 rounded-2xl border border-border/40">
          {/* Switcher Style */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-foreground">Language Switcher UI:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "floating", label: "Floating Button (Built-in)" },
                { id: "custom-nav", label: "Custom Navbar Toggle" },
                { id: "programmatic", label: "Programmatic" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSwitcherType(s.id as SwitcherType)}
                  className={`px-3 py-1.5 text-xs rounded-xl border transition-all duration-200 ${
                    switcherType === s.id
                      ? "border-primary bg-primary/15 text-primary font-semibold shadow-xs"
                      : "border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Checkbox Options */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-foreground">Prompt Enhancements:</span>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-xs cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                <input
                  type="checkbox"
                  checked={includeVerification}
                  onChange={(e) => setIncludeVerification(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                />
                <span>Include verification commands (`npm run build`, offline tests)</span>
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                <input
                  type="checkbox"
                  checked={includeCustomDict}
                  onChange={(e) => setIncludeCustomDict(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                />
                <span>Include custom brand vocabulary mappings</span>
              </label>
            </div>
          </div>
        </div>

        {/* Custom Vocabulary Field */}
        {(includeCustomDict || framework === "custom-dict") && (
          <div className="mt-3 p-3.5 bg-primary/5 dark:bg-zinc-900/60 rounded-2xl border border-primary/20 animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="text-xs font-semibold text-foreground block mb-1.5">
              Custom Brand Dictionary Terms (key: value):
            </label>
            <input
              type="text"
              value={customWords}
              onChange={(e) => setCustomWords(e.target.value)}
              placeholder="e.g. urduMagic: اردو میجک, fintech: فن ٹیک"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-background/80 border border-border/80 text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        )}
      </div>

      {/* 3. Live Prompt Preview Terminal */}
      <div className="relative z-10 mt-6 pt-5 border-t border-border/40">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>urdu-magic-prompt.md</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyPrompt("cursor")}
              className="h-7 text-xs px-2.5 gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg"
            >
              <Bot className="h-3.5 w-3.5 text-primary" />
              <span>{copied && activeCopiedTarget === "cursor" ? "Copied!" : "Cursor (Cmd+I)"}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyPrompt("copilot")}
              className="h-7 text-xs px-2.5 gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg"
            >
              <Terminal className="h-3.5 w-3.5 text-primary" />
              <span>{copied && activeCopiedTarget === "copilot" ? "Copied!" : "Copilot / Claude"}</span>
            </Button>
          </div>
        </div>

        {/* Code View Area */}
        <div className="relative group rounded-2xl border border-zinc-800/80 bg-zinc-950/90 dark:bg-black/80 backdrop-blur-xl p-4 md:p-5 font-mono text-xs leading-relaxed text-zinc-300 max-h-80 overflow-y-auto whitespace-pre-wrap break-words [overflow-wrap:anywhere] selection:bg-primary/40 shadow-inner">
          {generatedPrompt}
        </div>
      </div>

      {/* 4. Visual 3-Step Guide */}
      <div className="relative z-10 mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-muted/20 dark:bg-zinc-900/30 border border-border/40 backdrop-blur-sm">
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold block text-foreground mb-0.5">1. Copy Prompt</span>
            <span className="text-muted-foreground">Click the Copy button to grab the ready prompt with your options.</span>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-muted/20 dark:bg-zinc-900/30 border border-border/40 backdrop-blur-sm">
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold block text-foreground mb-0.5">2. Paste in AI</span>
            <span className="text-muted-foreground">Paste into Cursor Composer (Cmd+I), Claude, Copilot, or ChatGPT.</span>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-muted/20 dark:bg-zinc-900/30 border border-border/40 backdrop-blur-sm">
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold block text-foreground mb-0.5">3. 100% Offline Done</span>
            <span className="text-muted-foreground">The AI generates the exact, hardened implementation.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
