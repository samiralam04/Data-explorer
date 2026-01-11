'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ShoppingCart } from 'lucide-react';

interface Product {
    id: string;
    title: string;
    author?: string | null;
    price: string | number;
    image_url?: string | null;
    slug: string;
}

export default function ProductCard({ product }: { product: Product }) {
    const formattedPrice = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
    }).format(Number(product.price));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <Link href={`/product/${product.id}`} className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 relative">

                {/* Image Container */}
                <div className="relative aspect-[2/3] w-full bg-secondary overflow-hidden">
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={product.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground flex-col gap-2">
                            <span className="text-4xl">📚</span>
                            <span className="text-sm">No Image</span>
                        </div>
                    )}

                    {/* Overlay Action */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center">
                        <button className="bg-white text-indigo-600 px-4 py-2 rounded-full font-medium text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2">
                            <ShoppingCart size={16} />
                            View Details
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-heading font-semibold text-lg text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                            {product.title}
                        </h3>
                    </div>

                    {product.author && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{product.author}</p>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                        <div className="font-bold text-lg text-primary">
                            {formattedPrice}
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-medium bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-full">
                            <Star size={12} fill="currentColor" />
                            <span>4.5</span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
