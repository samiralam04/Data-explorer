'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { fetcher, api } from '@/lib/api';
import { useParams } from 'next/navigation';
import Image from 'next/image';

interface ProductDetail {
    id: string;
    title: string;
    author: string | null;
    price: number;
    image_url: string | null;
    description?: string;
    product_detail?: {
        description: string;
        specs: any;
        ratings_avg: number;
        reviews_count: number;
    };
    source_url: string;
}

export default function ProductPage() {
    const params = useParams();
    const id = params?.id as string;

    const { data: product, isLoading, error } = useQuery<ProductDetail>({
        queryKey: ['product', id],
        queryFn: () => fetcher(`/products/${id}`),
        enabled: !!id,
    });

    const scrapeMutation = useMutation({
        mutationFn: () => api.post('/scrape/product', { url: product?.source_url }),
        onSuccess: () => {
            alert('Scrape job started for more details!');
        },
        onError: (err) => {
            alert('Failed to start scrape: ' + err.message);
        }
    });

    if (isLoading) return <div className="p-10 text-center animate-pulse">Loading product...</div>;
    if (error) return <div className="p-10 text-center text-red-500">Error loading product</div>;
    if (!product) return null;

    const formattedPrice = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
    }).format(product.price);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
            <main className="container max-w-6xl mx-auto bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                    {/* Image Section */}
                    <div className="relative aspect-[3/4] rounded-lg bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                        {product.image_url ? (
                            <Image
                                src={product.image_url}
                                alt={product.title}
                                fill
                                className="object-contain"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.title}</h1>
                            <p className="text-xl text-gray-500">{product.author}</p>
                        </div>

                        <div className="text-3xl font-bold text-green-600">
                            {formattedPrice}
                        </div>

                        <div className="flex gap-4">
                            <a
                                href={product.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition"
                            >
                                View on WOB
                            </a>
                            <button
                                onClick={() => scrapeMutation.mutate()}
                                disabled={scrapeMutation.isPending}
                                className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-zinc-800 transition disabled:opacity-50"
                            >
                                {scrapeMutation.isPending ? 'Updating...' : 'Refresh Data'}
                            </button>
                        </div>

                        <div className="border-t pt-6 mt-2">
                            <h2 className="text-2xl font-semibold mb-4">Description</h2>
                            <div
                                className="prose dark:prose-invert"
                                dangerouslySetInnerHTML={{ __html: product.product_detail?.description || product.description || 'No description available yet.' }}
                            />
                        </div>

                        {product.product_detail?.specs && (
                            <div className="border-t pt-6">
                                <h2 className="text-xl font-semibold mb-2">Specifications</h2>
                                <pre className="text-xs bg-gray-100 dark:bg-zinc-800 p-4 rounded overflow-auto">
                                    {JSON.stringify(product.product_detail.specs, null, 2)}
                                </pre>
                            </div>
                        )}

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-semibold mb-4">Reviews & Ratings</h2>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="text-4xl font-bold">
                                    {product.product_detail?.ratings_avg?.toFixed(1) || '0.0'}
                                </div>
                                <div className="text-gray-500">
                                    out of 5 ({product.product_detail?.reviews_count || 0} reviews)
                                </div>
                            </div>

                            {/* Placeholder for reviews list - implementing real reviews would require separate API call or relation inclusion */}
                            <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg text-center text-gray-500">
                                No reviews available yet.
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
