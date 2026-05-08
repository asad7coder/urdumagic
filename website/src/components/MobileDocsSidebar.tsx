"use client"

import * as React from "react"
import { Menu } from "lucide-react"
import { Button } from "./ui/button"
import { DocsSidebar } from "./DocsSidebar"
import { useState } from "react"

export function MobileDocsSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Button 
        variant="ghost" 
        size="icon" 
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-primary shadow-lg text-primary-foreground hover:bg-primary/90"
        onClick={() => setOpen(!open)}
      >
        <Menu className="h-6 w-6" />
      </Button>
      
      {open && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-background border-r p-6 shadow-xl animate-in slide-in-from-left duration-300">
             <div className="flex items-center justify-between mb-8">
               <span className="font-bold text-xl">Documentation</span>
               <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Close</Button>
             </div>
             <div className="overflow-y-auto h-[calc(100vh-8rem)]">
                <DocsSidebar />
             </div>
           </div>
           <div className="absolute inset-0" onClick={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
}
