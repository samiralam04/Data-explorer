'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function HistoryTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const lastPathRef = useRef<string>("");

    useEffect(() => {
        const fullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

        if (fullPath === lastPathRef.current) return;
        lastPathRef.current = fullPath;

        // Store in localStorage
        const history = JSON.parse(localStorage.getItem('pde_history') || '[]');
        const newEntry = { path: fullPath, timestamp: new Date().toISOString() };
        const updatedHistory = [newEntry, ...history].slice(0, 50); // Keep last 50
        localStorage.setItem('pde_history', JSON.stringify(updatedHistory));

        // Optional: Send to backend (fire and forget)
        // fetch(`${process.env.NEXT_PUBLIC_API_URL}/history`, { ... })

        console.log(`Navigated to: ${fullPath}`);
    }, [pathname, searchParams]);

    return null; // Headless component
}
