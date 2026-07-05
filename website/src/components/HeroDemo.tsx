"use client"

import { useEffect, useState, useRef } from "react"
import { ArrowRightLeft, Sparkles, Info, ArrowDownUp } from "lucide-react"

type BoxType = 'english' | 'roman' | 'urdu' | null

const PRESETS = [
  { en: 'Hello', roman: 'salam', urdu: 'سلام' },
  { en: 'How are you?', roman: 'kya haal hai?', urdu: 'کیا حال ہے؟' },
  { en: 'Pakistan', roman: 'pakistan', urdu: 'پاکستان' },
  { en: 'Beautiful', roman: 'khubsoorat', urdu: 'خوبصورت' },
]

export default function HeroDemo() {
  const [focusBox, setFocusBox] = useState<BoxType>(null)
  const [english, setEnglish] = useState('')
  const [roman, setRoman] = useState('')
  const [urdu, setUrdu] = useState('')
  const [isReady, setIsReady] = useState(false)
  const [confidence, setConfidence] = useState<'full' | 'partial' | 'none' | null>(null)
  const [isTranslating] = useState(false)
  const [error] = useState<string | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const libRef = useRef<any>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const loadLib = async () => {
      try {
        const urdumagic = await import("urdumagic")
        libRef.current = urdumagic.UrduMagic || urdumagic.default
        setIsReady(true)
      } catch (e) {
        console.error("Failed to load UrduMagic", e)
      }
    }
    loadLib()

    return () => {}
  }, [])

  const clean = (text: string) => text.replace(/\[\?\]/g, '').trim()

  const onEnglishChange = (val: string) => {
    setEnglish(val)
    if (!val) {
      setRoman('')
      setUrdu('')
      setConfidence(null)
      return
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      if (!libRef.current || !isReady) return
      
      const result = libRef.current.fromEnglish(val)
      setUrdu(result.urdu)
      setRoman(result.roman)
      setConfidence(result.confidence)
    }, 250)
  }

  const onRomanChange = (val: string) => {
    setRoman(val)
    setEnglish('') // Clear English as per requirement
    if (!val) {
      setUrdu('')
      return
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      if (!libRef.current || !isReady) return
      const result = libRef.current.toUrdu(val)
      setUrdu(clean(result))
    }, 250)
  }

  const onUrduChange = (val: string) => {
    setUrdu(val)
    setEnglish('') // Clear English as per requirement
    if (!val) {
      setRoman('')
      return
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      if (!libRef.current || !isReady) return
      const result = libRef.current.toRoman(val)
      setRoman(clean(result))
    }, 250)
  }

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setEnglish(preset.en)
    setRoman(preset.roman)
    setUrdu(preset.urdu)
    setFocusBox(null)
  }

  return (
    <div data-no-translate className="w-full max-w-5xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
      <div className="p-6 md:p-8">
        {/* Presets */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {PRESETS.map((p) => (
            <button
              key={p.en}
              onClick={() => applyPreset(p)}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-[#f59e0b]/20 hover:text-[#f59e0b] hover:border-[#f59e0b]/50 transition-all font-medium"
            >
              {p.en}
            </button>
          ))}
        </div>

        {/* 3-Way Grid */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <Box 
              type="english" 
              label="English" 
              icon="🇬🇧" 
              value={english} 
              placeholder="Type English here..." 
              fontClass="text-lg"
              isFocused={focusBox === 'english'}
              onFocus={() => setFocusBox('english')}
              onBlur={() => setFocusBox(null)}
              onChange={(v: string) => onEnglishChange(v)}
              isOutput={focusBox !== 'english' && focusBox !== null}
              confidence={confidence}
            />
          </div>

          <div className="hidden md:block text-[#f59e0b]"><ArrowRightLeft className="w-6 h-6" /></div>
          <div className="md:hidden text-[#f59e0b]"><ArrowDownUp className="w-6 h-6" /></div>

          <div className="flex-1 w-full">
            <Box 
              type="roman" 
              label="Roman Urdu" 
              icon="Aa" 
              value={roman} 
              placeholder="Roman Urdu likhein..." 
              fontClass="text-lg italic"
              isFocused={focusBox === 'roman'}
              onFocus={() => setFocusBox('roman')}
              onBlur={() => setFocusBox(null)}
              onChange={(v: string) => onRomanChange(v)}
              isOutput={focusBox !== 'roman' && focusBox !== null}
            />
          </div>

          <div className="hidden md:block text-[#f59e0b]"><ArrowRightLeft className="w-6 h-6" /></div>
          <div className="md:hidden text-[#f59e0b]"><ArrowDownUp className="w-6 h-6" /></div>

          <div className="flex-1 w-full">
            <Box 
              type="urdu" 
              label="اردو" 
              icon="ع" 
              value={urdu} 
              placeholder="اردو لکھیں..." 
              isRtl={true}
              fontClass="text-2xl font-urdu text-[#f59e0b] leading-relaxed"
              isFocused={focusBox === 'urdu'}
              onFocus={() => setFocusBox('urdu')}
              onBlur={() => setFocusBox(null)}
              onChange={(v: string) => onUrduChange(v)}
              isOutput={focusBox !== 'urdu' && focusBox !== null}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6 text-[10px] text-white/30 uppercase tracking-widest font-bold">
           <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e3a8a]/40 border border-[#1e3a8a]/60 text-white/90">
                <Sparkles className="w-3 h-3 text-[#f59e0b]" />
                Powered by UrduMagic ⚡ Offline
             </div>
             {isTranslating && (
               <span className="text-[#f59e0b] animate-pulse">Translating...</span>
             )}
             <span>Library ready: {isReady ? 'YES ✓' : 'Loading...'}</span>
           </div>
           
           {error && (
             <div className="flex items-center gap-2 text-red-400">
               <Info className="w-3 h-3" />
               {error}
             </div>
           )}
        </div>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Box({ label, icon, value, placeholder, isRtl = false, fontClass = "", isFocused, onFocus, onBlur, onChange, isOutput, confidence }: any) {
  return (
    <div className={`relative flex flex-col gap-2 p-4 rounded-2xl border transition-all duration-300 h-full min-h-[140px] ${
      isFocused 
        ? 'border-[#f59e0b] bg-white/[0.12] shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
        : 'border-white/10 bg-white/[0.05]'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">{label}</span>
          {confidence && (
            <div className={`ml-2 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter flex items-center gap-1 ${
              confidence === 'full' ? 'bg-green-500/20 text-green-400' :
              confidence === 'partial' ? 'bg-amber-500/20 text-amber-400' :
              'bg-white/10 text-white/40'
            }`}>
              {confidence === 'full' && '✓ Found'}
              {confidence === 'partial' && '~ Partial'}
              {confidence === 'none' && '? Not found'}
            </div>
          )}
        </div>
        {isFocused && <div className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />}
      </div>
      
      <div className="relative flex-1 flex flex-col">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder={isRtl ? "" : placeholder}
          dir={isRtl ? 'rtl' : 'ltr'}
          className={`w-full h-full bg-transparent text-white outline-none resize-none transition-all placeholder:text-white/20 ${fontClass}`}
        />
        {isRtl && !value && !isFocused && (
          <span className="absolute inset-0 pointer-events-none text-white/20 text-right font-urdu text-2xl" dir="rtl">
            {placeholder}
          </span>
        )}
        {isOutput && !value && (
          <span className="absolute inset-0 pointer-events-none text-[#f59e0b]/50 italic text-sm pt-1 animate-pulse">
            converting...
          </span>
        )}
      </div>
    </div>
  )
}
