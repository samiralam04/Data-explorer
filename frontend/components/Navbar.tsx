'use client';

import Link from 'next/link';
import { Search, ShoppingBag, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const handleSearch = () => {
        if (!query.trim()) return;
        // Simple slugify: lowercase and replace spaces with dashes
        const slug = query.trim().toLowerCase().replace(/\s+/g, '-');
        router.push(`/category/${slug}`);
        setQuery('');
    };
    return (
        <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/30 dark:bg-black/30 border-b border-white/10 dark:border-white/5 supports-[backdrop-filter]:bg-white/10">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-indigo-600 text-white p-1.5 rounded-lg group-hover:bg-indigo-700 transition-colors">
                        <ShoppingBag size={20} />
                    </div>
                    <span className="font-heading font-bold text-xl tracking-tight text-foreground">
                        DataExplorer
                    </span>
                </Link>

                {/* Search Bar (Hidden on mobile) */}
                <div className="hidden md:flex items-center bg-secondary/50 px-3 py-2 rounded-full border border-transparent focus-within:border-primary/50 focus-within:bg-background transition-all w-96">
                    <button
                        onClick={handleSearch}
                        className="p-1 hover:text-primary transition-colors"
                    >
                        <Search size={18} className="text-muted-foreground" />
                    </button>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search categories (e.g., Science Fiction)..."
                        className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground text-foreground ml-2"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Link href="/about" className="hidden md:block text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        About
                    </Link>
                    <button className="p-2 hover:bg-secondary rounded-full text-foreground transition-colors md:hidden">
                        <Menu size={20} />
                    </button>
                    <div className="hidden md:flex gap-2">
                        <button className="px-4 py-2 text-sm font-medium text-primary bg-indigo-50 dark:bg-indigo-950/30 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                            Sign In
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-full hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
                            Get Started
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
