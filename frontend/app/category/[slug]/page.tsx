'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { fetcher, api } from '@/lib/api';
import ProductGrid from '@/components/ProductGrid';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function CategoryPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const [page, setPage] = useState(1);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['category', slug, page],
        queryFn: () => fetcher(`/categories/${slug}/products?page=${page}`),
        enabled: !!slug,
        retry: false
    });

    const scrapeMutation = useMutation({
        mutationFn: () => {
            // Use the source_url from the backend if available, otherwise fallback (though fallback might be wrong, it's better than nothing)
            // If source_url is relative, prepend domain.
            let url = data?.category?.source_url || `https://www.worldofbooks.com/en-gb/category/${slug}`;
            if (url && url.startsWith('/')) {
                url = `https://www.worldofbooks.com${url}`;
            }
            return api.post('/scrape/category', { url });
        },
        onSuccess: () => {
            alert('Scrape job started! Refresh in a few seconds.');
        },
        onError: (err) => {
            alert('Failed to start scrape: ' + err.message);
        }
    });

    if (error && (error as any).response?.status === 404) {
        return (
            <div className="container mx-auto p-10 text-center">
                <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
                <p className="mb-6">We don't have data for this category yet.</p>
                <button
                    onClick={() => scrapeMutation.mutate()}
                    disabled={scrapeMutation.isPending}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                    {scrapeMutation.isPending ? 'Scraping...' : 'Scrape This Category'}
                </button>
            </div>
        )
    }

    if (error) return <div className="p-10 text-red-500">Error loading category</div>;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
            <main className="container mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold capitalize">{slug?.replace(/-/g, ' ')}</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || isLoading}
                            className="px-4 py-2 border rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 self-center">Page {page}</span>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={isLoading || !data?.data?.length}
                            className="px-4 py-2 border rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>

                <ProductGrid products={data?.data} isLoading={isLoading} />

                {data?.data?.length === 0 && !isLoading && (
                    <div className="text-center mt-10">
                        <p>No products found in this category.</p>
                        <button
                            onClick={() => scrapeMutation.mutate()}
                            disabled={scrapeMutation.isPending}
                            className="text-blue-600 hover:underline mt-2"
                        >
                            Try Scraping
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
