import NavigationList from "@/components/NavigationList";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-zinc-950/50 border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-rose-500/10 blur-3xl" />
        <div className="container mx-auto px-6 py-24 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Live Data Exploration
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white">
            Discover Knowledge <br /> Without Limits.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Seamlessly scrape, explore, and analyze millions of books from World of Books.
            Powered by real-time data pipelines.
          </p>
          <div className="flex justify-center gap-4">
            <a href="#categories" className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2">
              Start Exploring <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      <main id="categories" className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-heading font-bold mb-10 text-center flex items-center justify-center gap-3">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">Browse Categories</span>
        </h2>
        <NavigationList />
      </main>
    </div>
  );
}
