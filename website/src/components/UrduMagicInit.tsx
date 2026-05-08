"use client"

import { useEffect } from "react"
import { UrduMagic } from "urdumagic"

export default function UrduMagicInit() {
  useEffect(() => {
    const savedLang = (localStorage.getItem("urdumagic-site-lang") as any) || "en"
    
    // Initialize UrduMagic on the website itself
    const magic = UrduMagic.init({
      defaultLang: savedLang,
      modes: ["en", "ur", "roman"],
      showSwitcher: true,
      strategy: "offline",
      performance: {
        debounceMs: 300,
        cacheTTL: 86400000
      }
    })

    let currentLang = savedLang;

    const handleSwitch = (e: any) => {
      const newLang = e.detail?.lang
      if (newLang && newLang !== currentLang) {
        currentLang = newLang;
        localStorage.setItem("urdumagic-site-lang", newLang)
        // Only call library if it didn't originate from here
        magic.switchLang(newLang)
      }
    }

    window.addEventListener("urdumagic-lang-switch" as any, handleSwitch)

    return () => {
      window.removeEventListener("urdumagic-lang-switch" as any, handleSwitch)
      magic.destroy()
    }
  }, [])

  return null
}
