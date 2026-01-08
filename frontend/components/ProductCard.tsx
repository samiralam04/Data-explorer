'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Product {
    id: string;
    title: string;
    author?: string | null;
    price: string | number; // Decimal comes as string from JSON often
    image_url?: string | null;
    slug: string;
}

export default function ProductCard({ product }: { product: Product }) {
    const formattedPrice = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
    }).format(Number(product.price));

    return (
        <Link href={`/product/${product.id}`} className="group block border rounded-lg overflow-hidden bg-white dark:bg-zinc-900 hover:shadow-xl transition">
            <div className="relative aspect-[2/3] w-full bg-gray-200 dark:bg-zinc-800">
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        No Image
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-lg line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                    {product.title}
                </h3>
                {product.author && (
                    <p className="text-sm text-gray-500 mb-2">{product.author}</p>
                )}
                <div className="font-bold text-lg text-green-600">
                    {formattedPrice}
                </div>
            </div>
        </Link>
    );
}
