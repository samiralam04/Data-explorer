'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { fetcher, api } from '@/lib/api';
import ProductGrid from '@/components/ProductGrid';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function CategoryPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const [jobId, setJobId] = useState<string | null>(null);
    const [scrapeStatus, setScrapeStatus] = useState<'PENDING' | 'RUNNING' | 'DONE' | 'FAILED' | null>(null);
    const [page, setPage] = useState(1);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['category', slug, page],
        queryFn: () => fetcher(`/categories/${slug}/products?page=${page}`),
        enabled: !!slug,
        retry: false
    });

    // Poll for job status if we have a job ID and it's not finished
    useQuery({
        queryKey: ['scrapeJob', jobId],
        queryFn: async () => {
            if (!jobId) return null;
            const res = await api.get(`/scrape/job/${jobId}`);
            const status = res.data?.status;
            setScrapeStatus(status);

            if (status === 'DONE') {
                setJobId(null); // Stop polling
                refetch(); // Refresh product list
                setScrapeStatus(null);
            } else if (status === 'FAILED' || status === 'SKIPPED') {
                setJobId(null); // Stop polling
                alert(`Scrape finished with status: ${status}`);
                setScrapeStatus(null);
                refetch();
            }
            return res.data;
        },
        enabled: !!jobId,
        refetchInterval: 2000, // Poll every 2 seconds
        refetchIntervalInBackground: true
    });

    const scrapeMutation = useMutation({
        mutationFn: () => {
            let url = data?.category?.source_url || `https://www.worldofbooks.com/en-gb/category/${slug}`;
            if (url && url.startsWith('/')) {
                url = `https://www.worldofbooks.com${url}`;
            }
            return api.post('/scrape/category', { url });
        },
        onSuccess: (res) => {
            setJobId(res.data.id);
            setScrapeStatus('PENDING');
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
                    disabled={scrapeMutation.isPending || !!jobId}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {scrapeMutation.isPending || jobId ? 'Scraping in progress...' : 'Scrape This Category'}
                </button>
                {scrapeStatus && (
                    <div className="mt-4 text-blue-500 animate-pulse">
                        Status: {scrapeStatus}... Please wait.
                    </div>
                )}
            </div>
        )
    }

    if (error) return <div className="p-10 text-red-500">Error loading category</div>;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
            <main className="container mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold capitalize">{slug?.replace(/-/g, ' ')}</h1>
                        {scrapeStatus && (
                            <div className="text-sm text-blue-600 mt-1 flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
                                Scraping in progress: {scrapeStatus}
                            </div>
                        )}
                    </div>
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

                <ProductGrid products={data?.data} isLoading={isLoading || scrapeStatus === 'RUNNING'} />

                {data?.data?.length === 0 && !isLoading && !jobId && (
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
