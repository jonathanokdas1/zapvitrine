'use client';

import { Plus } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    price: number;
}

export default function AddToCartButton({ product, color }: { product: Product, color: string }) {
    const handleClick = () => {
        const event = new CustomEvent('add-to-cart', { detail: product });
        window.dispatchEvent(event);
    };

    return (
        <button
            onClick={handleClick}
            className="text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 active:scale-95 transition-transform"
            style={{ backgroundColor: color }}
        >
            <Plus className="h-4 w-4" />
            Adicionar
        </button>
    );
}
