'use client';

import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Book, ChevronRight } from 'lucide-react';
import { SkeletonNavigation } from './skeletons';

interface NavigationItem {
    id: string;
    title: string;
    slug: string;
}

export default function NavigationList() {
    const { data: navItems, isLoading, error } = useQuery<NavigationItem[]>({
        queryKey: ['navigation'],
        queryFn: () => fetcher('/navigation'),
    });

    if (isLoading) return <SkeletonNavigation />;
    if (error) return <div className="text-center text-destructive py-10">Error loading navigation</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {navItems?.map((item, index) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                    <Link
                        href={`/category/${item.slug}`}
                        className="group flex items-center justify-between p-6 bg-card border border-border rounded-xl hover:shadow-lg hover:shadow-indigo-500/5 hover:border-primary/30 transition-all duration-300"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-secondary rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30 group-hover:text-primary transition-colors">
                                <Book size={24} />
                            </div>
                            <span className="font-heading font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                                {item.title}
                            </span>
                        </div>
                        <ChevronRight className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" size={20} />
                    </Link>
                </motion.div>
            ))}
        </div>
    );
}
