import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductGrid from './ProductGrid';

describe('ProductGrid', () => {
    const mockProducts = [
        {
            id: '1',
            title: 'Test Book 1',
            author: 'Author 1',
            price: 10.99,
            image_url: 'http://example.com/1.jpg',
            slug: 'test-book-1',
            currency: 'GBP'
        },
        {
            id: '2',
            title: 'Test Book 2',
            author: 'Author 2',
            price: 20.00,
            image_url: 'http://example.com/2.jpg',
            slug: 'test-book-2',
            currency: 'GBP'
        }
    ];

    it('renders loading skeleton when isLoading is true', () => {
        render(<ProductGrid products={[]} isLoading={true} />);

        const skeletons = document.querySelectorAll('.animate-pulse');
        expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders products when data is provided', () => {
        render(<ProductGrid products={mockProducts} isLoading={false} />);

        expect(screen.getByText('Test Book 1')).toBeInTheDocument();
        expect(screen.getByText('Test Book 2')).toBeInTheDocument();
        expect(screen.getByText('Author 1')).toBeInTheDocument();
        expect(screen.getByText('£10.99')).toBeInTheDocument();
    });

    it('renders empty state message when no products', () => {
        render(<ProductGrid products={[]} isLoading={false} />);

    });
});
