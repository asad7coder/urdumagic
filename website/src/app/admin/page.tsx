"use client"

import { useEffect, useState } from "react"
import { UrduMagic } from "urdumagic"
import { Download, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"

interface MissingWord {
  word: string
  count: number
}

export default function AdminDashboard() {
  const [missingWords, setMissingWords] = useState<MissingWord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let retryCount = 0
    const maxRetries = 10
    
    const tryLoad = () => {
      try {
        const instance = UrduMagic.getInstance()
        if (instance) {
          const words = instance.getMissingWords()
          setMissingWords(words.sort((a, b) => b.count - a.count))
          setIsLoading(false)
          return // Success, stop retrying
        }
      } catch {
        // Not initialized yet
        if (retryCount < maxRetries) {
          retryCount++
          setTimeout(tryLoad, 500)
        } else {
          console.error("UrduMagic failed to initialize after 5 seconds")
          setIsLoading(false)
        }
      }
    }

    tryLoad()
  }, [])

  const handleExport = () => {
    try {
      const instance = UrduMagic.getInstance()
      if (!instance) return
      
      const json = instance.exportMissingWords()
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement("a")
      a.href = url
      a.download = `urdumagic-missing-words-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error("Export failed", e)
    }
  }

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all collected words? This cannot be undone.")) {
      try {
        const instance = UrduMagic.getInstance()
        if (instance) {
          instance.clearMissingWords()
          setMissingWords([])
        }
      } catch (e) {
        console.error("Clear failed", e)
      }
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-8 md:p-12 lg:p-16">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center gap-1 mb-4">
              &larr; Back to Website
            </Link>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Missing Word Collector
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Review words that users encountered but are missing from the offline dictionary.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleClear}
              disabled={missingWords.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40"
            >
              <Trash2 className="w-4 h-4" />
              Clear Data
            </button>
            <button
              onClick={handleExport}
              disabled={missingWords.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Unique Words</h3>
            <p className="mt-2 text-3xl font-semibold text-neutral-900 dark:text-neutral-50">
              {isLoading ? "-" : missingWords.length}
            </p>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-neutral-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
              <p>Loading missing words...</p>
            </div>
          ) : missingWords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-50 mb-1">No missing words</h3>
              <p className="text-neutral-500 dark:text-neutral-400 max-w-sm">
                Your dictionary is fully covering the website&apos;s content right now. Great job!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                    <th className="py-3 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Word</th>
                    <th className="py-3 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider w-32">Frequency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {missingWords.map((item, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="py-3 px-6 whitespace-nowrap">
                        <span className="font-mono text-sm text-neutral-900 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                          {item.word}
                        </span>
                      </td>
                      <td className="py-3 px-6 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {item.count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
      </div>
    </div>
  )
}
