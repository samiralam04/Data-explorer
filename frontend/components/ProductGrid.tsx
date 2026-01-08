'use client';

import ProductCard from './ProductCard';

interface Product {
    id: string;
    title: string;
    author?: string | null;
    price: string | number;
    image_url?: string | null;
    slug: string;
}

interface ProductGridProps {
    products: Product[];
    isLoading?: boolean;
}

export default function ProductGrid({ products, isLoading }: ProductGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-[2/3] bg-gray-200 dark:bg-zinc-800 rounded-lg"></div>
                ))}
            </div>
        );
    }

    if (!products?.length) {
        return <div className="text-center py-10 text-gray-500">No products found.</div>;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
