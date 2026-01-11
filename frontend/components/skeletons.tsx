export const SkeletonNav = () => (
    <div className="h-16 bg-white dark:bg-zinc-900 border-b flex items-center px-6 gap-4 animate-pulse">
        <div className="h-8 w-32 bg-gray-200 dark:bg-zinc-800 rounded"></div>
        <div className="flex-1"></div>
        <div className="h-8 w-24 bg-gray-200 dark:bg-zinc-800 rounded"></div>
    </div>
);

export const SkeletonCategory = () => (
    <div className="p-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-zinc-800 rounded mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-zinc-800 rounded"></div>
            ))}
        </div>
    </div>
);

export const SkeletonProductGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-gray-200 dark:bg-zinc-800 rounded-lg"></div>
        ))}
    </div>
);

export const SkeletonProductDetail = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 animate-pulse">
        <div className="aspect-[3/4] bg-gray-200 dark:bg-zinc-800 rounded-lg"></div>
        <div className="flex flex-col gap-6">
            <div className="h-10 w-3/4 bg-gray-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-6 w-1/2 bg-gray-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-12 w-32 bg-gray-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-40 w-full bg-gray-200 dark:bg-zinc-800 rounded"></div>
        </div>
    </div>
);

export const SkeletonNavigation = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-zinc-800 rounded-xl border border-gray-100 dark:border-zinc-700"></div>
        ))}
    </div>
);
