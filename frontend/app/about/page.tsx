import { Code, Database, Server, Layers, Zap, Info } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-white dark:bg-zinc-950 border-b border-border/50 py-24">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-rose-500/10 blur-3xl" />
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8">
                        <Info size={16} />
                        <span>About the Project</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-heading font-extrabold tracking-tight mb-6 text-foreground">
                        Building the Future of <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">Data Exploration</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        A modern, ethical scraping platform designed to demonstrate the power of real-time data ingestion, processing, and visualization.
                    </p>
                </div>
            </section>

            {/* Tech Stack Grid */}
            <section className="container mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-heading font-bold mb-4">Powered by Modern Tech</h2>
                    <p className="text-muted-foreground">Built with a robust, scalable technology stack.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <TechCard
                        icon={<Code className="text-blue-500" />}
                        title="Next.js Frontend"
                        desc="Server-side rendering, responsive UI, and seamless client interactions using React 19."
                    />
                    <TechCard
                        icon={<Server className="text-red-500" />}
                        title="NestJS Backend"
                        desc="Modular architecture for scalable APIs, utilizing best practices and separation of concerns."
                    />
                    <TechCard
                        icon={<Database className="text-green-500" />}
                        title="PostgreSQL & Prisma"
                        desc="Reliable relational data storage with type-safe ORM for efficient querying."
                    />
                    <TechCard
                        icon={<Layers className="text-orange-500" />}
                        title="BullMQ & Redis"
                        desc="Asynchronous job processing for reliable scraping with retries and concurrency control."
                    />
                    <TechCard
                        icon={<Zap className="text-yellow-500" />}
                        title="Playwright & Crawlee"
                        desc="High-performance, headless browser automation for accurate data extraction."
                    />
                </div>
            </section>

            {/* Mission */}
            <section className="bg-secondary/30 py-20">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-heading font-bold mb-6">Our Philosophy</h2>
                    <div className="max-w-3xl mx-auto space-y-6 text-lg text-muted-foreground">
                        <p>
                            We believe in <strong>ethical scraping</strong>. This project implements rate limiting, delays, and caching to ensure we respect the target server's resources while providing fresh data to our users.
                        </p>
                        <p>
                            The UI is designed to be <strong>intuitive and beautiful</strong>, proving that data tools don't have to be clunky. Glassmorphism, smooth animations, and clean typography elevate the user experience.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

function TechCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{desc}</p>
        </div>
    );
}
