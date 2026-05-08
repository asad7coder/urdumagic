"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { ArrowRightLeft, Sparkles, Trash2, Info } from "lucide-react"

export default function Playground() {
  const [input, setInput] = useState("salam, kya hal hai aap ka?")
  const [output, setOutput] = useState("")
  const [detected, setDetected] = useState("")
  const [lib, setLib] = useState<any>(null)
  
  // Load UrduMagic dynamically (client-side only)
  useEffect(() => {
    import("urdumagic").then((m) => {
      setLib(() => m.UrduMagic)
      // Initial conversion
      const urdu = m.UrduMagic.toUrdu("salam, kya hal hai aap ka?")
      setOutput(urdu)
      setDetected(m.UrduMagic.detectScript("salam, kya hal hai aap ka?"))
    })
  }, [])

  // Auto-convert with debounce
  useEffect(() => {
    if (!lib) return
    const timer = setTimeout(() => {
      const urdu = lib.toUrdu(input)
      setOutput(urdu)
      setDetected(lib.detectScript(input))
    }, 300)
    return () => clearTimeout(timer)
  }, [input, lib])

  const toUrdu = () => {
    if (!lib) return
    setOutput(lib.toUrdu(input))
    setDetected(lib.detectScript(input))
  }

  const toRoman = () => {
    if (!lib) return
    // Assuming we want to convert from output (Urdu) to Roman
    const roman = lib.toRoman(output || input)
    setInput(roman)
  }

  const clear = () => {
    setInput("")
    setOutput("")
    setDetected("")
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Real-time Transliteration</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Interactive Playground</h1>
            <p className="text-muted-foreground text-balance">Experiment with UrduMagic&apos;s offline transliteration and detection engine.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Input Panel */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input (Roman or Mixed)</span>
                <Button variant="ghost" size="sm" onClick={clear} className="text-muted-foreground h-8">
                  <Trash2 className="w-4 h-4 mr-2" /> Clear
                </Button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type here..."
                className="w-full h-64 p-6 rounded-2xl border bg-card text-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            {/* Output Panel */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Output (Urdu Script)</span>
                <div className="flex items-center gap-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  <Info className="w-3 h-3" />
                  <span>Detected: {detected || "None"}</span>
                </div>
              </div>
              <div 
                className="w-full h-64 p-6 rounded-2xl border bg-primary/5 text-primary text-4xl font-urdu leading-loose overflow-auto whitespace-pre-wrap"
                dir="rtl"
              >
                {output || "اردو متن یہاں ظاہر ہوگا..."}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button size="lg" onClick={toUrdu} className="h-12 px-8">
              Convert to Urdu
            </Button>
            <Button size="lg" variant="outline" onClick={toRoman} className="h-12 px-8 gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              Swap to Roman
            </Button>
          </div>

          {/* Example Help */}
          <div className="mt-20 p-8 rounded-2xl border bg-muted/30">
            <h3 className="font-bold mb-4">Try these examples:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Greeting", text: "assalamu alaikum, kaise hain aap?" },
                { title: "Question", text: "kya waqt hoa hai?" },
                { title: "Mixed", text: "I love Pakistan اور میں اردو بولتا ہوں۔" },
                { title: "Complex", text: "urdu magic bohot zabardast library hai!" }
              ].map((ex, i) => (
                <button 
                  key={i}
                  onClick={() => setInput(ex.text)}
                  className="p-4 rounded-xl border bg-card hover:border-primary/50 text-left transition-colors group"
                >
                  <p className="text-xs text-muted-foreground mb-1">{ex.title}</p>
                  <p className="font-mono text-sm group-hover:text-primary">{ex.text}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
