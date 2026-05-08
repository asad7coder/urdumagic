import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import CodeSnippet from "@/components/CodeSnippet";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      
      {/* Quick Install Section */}
      <section className="py-14">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Get started in seconds</h2>
            <p className="text-muted-foreground">Install the package and start your magic.</p>
          </div>
          <CodeSnippet code="npm install urdumagic" />
        </div>
      </section>

      <Features />

      {/* CTA Section */}
      <section className="py-22 relative overflow-hidden bg-[#0f172a] text-white">
        <div className="absolute inset-0 bg-primary/5 -skew-y-3 origin-right scale-110 pointer-events-none" />
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to make your site multilingual?</h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join developers building more inclusive Urdu experiences across the web.
          </p>
          <div className="flex justify-center gap-4">
             <a href="/docs" className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
               Read the Docs
             </a>
             <a href="https://github.com/asad7coder/urdumagic" target="_blank" className="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-3 rounded-lg font-medium hover:bg-white/20 transition-colors">
               View on GitHub
             </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
