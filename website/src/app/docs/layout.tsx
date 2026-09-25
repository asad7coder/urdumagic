import Navbar from "@/components/Navbar"
import { DocsSidebar } from "@/components/DocsSidebar"
import { MobileDocsSidebar } from "@/components/MobileDocsSidebar"
import { DocsTableOfContents } from "@/components/DocsTableOfContents"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Ambient glowing backdrop lights for glassmorphic depth */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 right-1/4 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[130px] dark:bg-primary/15" />
        <div className="absolute top-1/3 -left-40 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[150px] dark:bg-blue-600/15" />
        <div className="absolute -bottom-40 right-10 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[140px] dark:bg-amber-600/10" />
      </div>

      <Navbar />
      <div className="container relative z-10 flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 pt-16">
        <aside className="sticky top-16 z-30 hidden h-[calc(100vh-4rem)] w-full shrink-0 overflow-y-auto border-r border-border/50 bg-background/50 backdrop-blur-xl md:block">
          <DocsSidebar className="py-6 pr-4" />
        </aside>
        <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_240px]">
          <div className="mx-auto w-full min-w-0 max-w-3xl">
            {children}
          </div>
          <div className="hidden text-sm xl:block">
            <div className="sticky top-20 -mt-2 h-[calc(100vh-5rem)] overflow-y-auto pt-4 pl-4">
              <DocsTableOfContents />
            </div>
          </div>
        </main>
        <MobileDocsSidebar />
      </div>
    </div>
  )
}
