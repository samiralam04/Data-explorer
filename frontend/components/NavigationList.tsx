'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { fetcher, api } from '@/lib/api';
import Link from 'next/link';

interface SubCategory {
    id: string;
    title: string;
    slug: string;
}

interface NavItem {
    id: string;
    title: string;
    slug: string;
    categories: SubCategory[];
}

export default function NavigationList() {
    const { data, isLoading, error, refetch } = useQuery<NavItem[]>({
        queryKey: ['navigation'],
        queryFn: () => fetcher('/navigation'),
    });

    const scrapeMutation = useMutation({
        mutationFn: () => api.post('/scrape/navigation'),
        onSuccess: () => {
            alert('Scrape job started!');
            // refetch interval or notification
        },
        onError: (err) => {
            alert('Failed to start scrape: ' + err.message);
        }
    });

    if (isLoading) return <div className="p-4">Loading navigation...</div>;
    if (error) return <div className="p-4 text-red-500">Error loading navigation</div>;

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Product Data Explorer</h1>
                <button
                    onClick={() => scrapeMutation.mutate()}
                    disabled={scrapeMutation.isPending}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {scrapeMutation.isPending ? 'Starting...' : 'Scrape Navigation'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.map((nav) => (
                    <div key={nav.id} className="border rounded-lg p-4 hover:shadow-lg transition bg-white dark:bg-zinc-900">
                        <Link href={`/category/${nav.slug}`} className="text-xl font-semibold mb-2 hover:text-blue-500 block">
                            {nav.title}
                        </Link>
                        <div className="text-sm text-gray-500 mb-4">
                            {nav.categories?.length || 0} top categories
                        </div>
                        <div className="space-y-1">
                            {nav.categories?.slice(0, 5).map(cat => (
                                <Link key={cat.id} href={`/category/${cat.slug}`} className="block text-blue-600 hover:underline">
                                    {cat.title}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {data?.length === 0 && (
                <div className="text-center p-10 text-gray-500">
                    No navigation data found. Click "Scrape Navigation" to fetch data from source.
                </div>
            )}
        </div>
    );
}
