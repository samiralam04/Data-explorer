'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { fetcher, api } from '@/lib/api';
import ProductGrid from '@/components/ProductGrid';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

export default function CategoryPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const slug = params?.slug as string;

    // Get page from URL or default to 1
    const pageParam = searchParams.get('page');
    const page = pageParam ? parseInt(pageParam) : 1;
    const limit = 20;

    const [jobId, setJobId] = useState<string | null>(null);
    const [scrapeStatus, setScrapeStatus] = useState<'PENDING' | 'RUNNING' | 'DONE' | 'FAILED' | null>(null);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['category', slug, page], // React Query will cache per page key
        queryFn: () => fetcher(`/categories/${slug}/products?page=${page}&limit=${limit}`),
        enabled: !!slug,
        retry: false,
        staleTime: 5000, // Keep data fresh for a bit
        placeholderData: (previousData) => previousData, // Smooth transition between pages
    });

    const handlePageChange = (newPage: number) => {
        router.push(`?page=${newPage}&limit=${limit}`);
    };

    // ... (rest of simple logic)

    // Poll for job status (same as before)
    useQuery({
        queryKey: ['scrapeJob', jobId],
        queryFn: async () => {
            if (!jobId) return null;
            const res = await api.get(`/scrape/job/${jobId}`);
            const status = res.data?.status;
            setScrapeStatus(status);

            if (status === 'DONE') {
                setJobId(null);
                refetch();
                setScrapeStatus(null);
            } else if (status === 'FAILED' || status === 'SKIPPED') {
                setJobId(null);
                alert(`Scrape finished with status: ${status}`);
                setScrapeStatus(null);
                refetch();
            }
            return res.data;
        },
        enabled: !!jobId,
        refetchInterval: 2000,
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

    const isScraping = scrapeMutation.isPending || (jobId && scrapeStatus !== 'DONE' && scrapeStatus !== 'FAILED');

    if (error && (error as any).response?.status === 404) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-6">
                <div className="bg-card border border-border p-10 rounded-2xl shadow-xl text-center max-w-md w-full">
                    <div className="bg-red-50 dark:bg-red-950/30 text-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={32} />
                    </div>
                    <h1 className="text-2xl font-heading font-bold mb-3 text-foreground">Category Not Found</h1>
                    <p className="text-muted-foreground mb-8">We don't have data for this category yet. Start a scrape job to fetch products.</p>
                    <button
                        onClick={() => scrapeMutation.mutate()}
                        disabled={!!isScraping}
                        className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                        {isScraping ? <Loader2 className="animate-spin" /> : <RefreshCw size={18} />}
                        {isScraping ? 'Scraping in progress...' : 'Scrape This Category'}
                    </button>
                    {scrapeStatus && (
                        <div className="mt-4 text-sm text-primary font-medium animate-pulse bg-primary/10 py-2 rounded-lg">
                            Status: {scrapeStatus}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    if (error) return <div className="p-10 text-center text-destructive font-medium">Error loading category</div>;

    const totalPages = data?.meta?.totalPages || 1;

    return (
        <div className="min-h-screen bg-background p-6 md:p-10">
            <main className="container mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-heading font-extrabold capitalize text-foreground mb-3 tracking-tight">
                            {slug?.replace(/-/g, ' ')}
                        </h1>
                        {isScraping && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium border border-blue-100 dark:border-blue-900">
                                <Loader2 size={14} className="animate-spin" />
                                <span>Scraping: {scrapeStatus || 'Identifying...'}</span>
                            </div>
                        )}
                        {!isScraping && (
                            <p className="text-muted-foreground">My Collection. Page {page}.</p>
                        )}
                    </div>

                    <div className="flex items-center bg-card border border-border rounded-lg shadow-sm p-1">
                        <button
                            onClick={() => handlePageChange(Math.max(1, page - 1))}
                            disabled={page === 1 || isLoading}
                            className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <span className="px-4 py-2 text-sm font-bold text-foreground min-w-[3rem] text-center border-x border-border/50 bg-secondary/30">
                            {page}
                        </span>
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={isLoading || (data?.data?.length < limit && page >= totalPages && data?.data?.length === 0)}
                            // Using data length to determine if we should disable next, or use meta if available
                            className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                <div className="bg-card/50 rounded-3xl p-6 md:p-8 border border-border/50">
                    <ProductGrid products={data?.data} isLoading={isLoading || scrapeStatus === 'RUNNING'} />
                </div>

                {data?.data?.length === 0 && !isLoading && !jobId && (
                    <div className="text-center py-20 bg-secondary/30 rounded-2xl mt-8 border border-dashed border-border">
                        <p className="text-xl text-muted-foreground mb-4">No products found in this category.</p>
                        <button
                            onClick={() => scrapeMutation.mutate()}
                            disabled={scrapeMutation.isPending}
                            className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 flex items-center justify-center gap-2 mx-auto cursor-pointer"
                        >
                            <RefreshCw size={16} /> Try Scraping Data
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
