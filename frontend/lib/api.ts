import axios from 'axios';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const fetcher = (url: string) => api.get(url).then((res) => res.data);
