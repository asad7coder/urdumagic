import Navbar from "@/components/Navbar"
import { DocsSidebar } from "@/components/DocsSidebar"
import { MobileDocsSidebar } from "@/components/MobileDocsSidebar"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 pt-16">
        <aside className="fixed top-16 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <DocsSidebar className="py-6 pr-6" />
        </aside>
        <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]">
          <div className="mx-auto w-full min-w-0 max-w-3xl">
            {children}
          </div>
        </main>
        <MobileDocsSidebar />
      </div>
    </div>
  )
}
