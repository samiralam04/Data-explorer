'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher, api, saveHistory } from '@/lib/api';
import { useParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { SkeletonProductDetail } from '@/components/skeletons';
import { v4 as uuidv4 } from 'uuid';
import { Star, RefreshCw, ExternalLink, BookOpen, Clock } from 'lucide-react';

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
    reviews?: {
        author: string;
        rating: number;
        text: string;
        createdAt: string;
    }[];
    source_url: string;
}

export default function ProductPage() {
    const params = useParams();
    const id = params?.id as string;
    const pathname = usePathname();
    const queryClient = useQueryClient();
    const [sessionId, setSessionId] = useState('');

    useEffect(() => {
        let sid = localStorage.getItem('pde_session_id');
        if (!sid) {
            sid = uuidv4();
            localStorage.setItem('pde_session_id', sid);
        }
        setSessionId(sid);

        const history = JSON.parse(localStorage.getItem('pde_history') || '[]');
        const newEntry = { path: pathname, timestamp: Date.now() };
        const updatedHistory = [...history, newEntry].slice(-50);
        localStorage.setItem('pde_history', JSON.stringify(updatedHistory));

        if (sid) {
            saveHistory(sid, updatedHistory).catch(console.error);
        }
    }, [pathname]);

    const { data: product, isLoading, error } = useQuery<ProductDetail>({
        queryKey: ['product', id],
        queryFn: () => fetcher(`/products/${id}`),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const scrapeMutation = useMutation({
        mutationFn: () => api.post('/scrape/product', { url: product?.source_url }),
        onSuccess: () => {
            const interval = setInterval(() => {
                queryClient.invalidateQueries({ queryKey: ['product', id] });
            }, 5000);
            setTimeout(() => clearInterval(interval), 30000);
        },
        onError: (err) => {
            alert('Failed to start scrape: ' + err.message);
        }
    });

    if (isLoading) return <SkeletonProductDetail />;
    if (error) return <div className="p-10 text-center text-destructive">Error loading product</div>;
    if (!product) return null;

    const formattedPrice = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
    }).format(product.price);

    return (
        <div className="min-h-screen bg-background py-10 px-4 md:px-8">
            <main className="container max-w-5xl mx-auto">
                <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0">

                    {/* Image Section */}
                    <div className="md:col-span-5 bg-secondary p-8 flex items-center justify-center relative min-h-[400px]">
                        {product.image_url ? (
                            <div className="relative aspect-[2/3] w-3/4 shadow-2xl rounded-lg overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
                                <Image
                                    src={product.image_url}
                                    alt={product.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <BookOpen size={64} className="mb-4 opacity-50" />
                                <span>No Cover Available</span>
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="md:col-span-7 p-8 md:p-12 flex flex-col">
                        <div className="mb-6">
                            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2 leading-tight">
                                {product.title}
                            </h1>
                            <p className="text-xl text-muted-foreground font-medium">{product.author}</p>
                        </div>

                        <div className="flex items-center gap-6 mb-8">
                            <div className="text-4xl font-bold text-primary tracking-tight">
                                {formattedPrice}
                            </div>
                            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-900">
                                <Star size={18} className="text-amber-500 fill-amber-500" />
                                <span className="font-bold text-amber-700 dark:text-amber-400">
                                    {product.product_detail?.ratings_avg?.toFixed(1) || 'N/A'}
                                </span>
                                <span className="text-amber-600/60 dark:text-amber-500/60 text-sm ml-1">
                                    ({product.product_detail?.reviews_count || 0} reviews)
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mb-8">
                            <a
                                href={product.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-all font-medium"
                            >
                                <ExternalLink size={18} />
                                View on Store
                            </a>
                            <button
                                onClick={() => scrapeMutation.mutate()}
                                disabled={scrapeMutation.isPending}
                                className="flex items-center gap-2 px-6 py-3 border border-primary text-primary rounded-full hover:bg-primary/5 transition-all font-medium disabled:opacity-50 cursor-pointer"
                            >
                                <RefreshCw size={18} className={scrapeMutation.isPending ? 'animate-spin' : ''} />
                                {scrapeMutation.isPending ? 'Updating...' : 'Refresh Data'}
                            </button>
                        </div>

                        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed mb-8">
                            <h3 className="text-foreground font-heading font-semibold text-lg mb-2">Description</h3>
                            <div dangerouslySetInnerHTML={{ __html: product.product_detail?.description || product.description || 'No description available yet.' }} />
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Specs if available */}
                    {product.product_detail?.specs && (
                        <div className="bg-card border border-border rounded-2xl p-8">
                            <h2 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
                                <BookOpen size={20} className="text-primary" /> Product Details
                            </h2>
                            <div className="space-y-4">
                                {Object.entries(product.product_detail.specs).map(([key, value]) => {
                                    if (key === 'Recommendations') return null;
                                    return (
                                        <div key={key} className="flex justify-between border-b border-border/50 pb-2 last:border-0">
                                            <span className="font-medium text-muted-foreground">{key}</span>
                                            <span className="text-foreground text-right max-w-[60%]">{String(value)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Reviews List */}
                    <div className="bg-card border border-border rounded-2xl p-8">
                        <h2 className="text-xl font-heading font-bold mb-6">Recent Reviews</h2>
                        <div className="space-y-6">
                            {product.reviews && product.reviews.length > 0 ? (
                                product.reviews.slice(0, 3).map((r, i) => (
                                    <div key={i} className="border-b border-border/50 pb-6 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold text-foreground">{r.author}</span>
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, stars) => (
                                                    <Star key={stars} size={14} className={stars < Math.round(r.rating) ? "text-amber-400 fill-amber-400" : "text-muted"} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground italic">"{r.text}"</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-muted-foreground">
                                    No reviews yet. Try refreshing data.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
