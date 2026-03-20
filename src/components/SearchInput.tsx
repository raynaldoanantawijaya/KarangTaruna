'use client';

import { Search, Filter, Layers, Brush, Trophy, Check } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition, useRef, useEffect } from 'react';

const CATEGORIES = [
    { name: "Semua Kategori", slug: "", icon: Layers },
    { name: "Pendidikan & Sosial", slug: "pendidikan", icon: Layers },
    { name: "Ekonomi Kreatif", slug: "ekonomi", icon: Brush },
    { name: "Olahraga & Seni", slug: "olahraga", icon: Trophy },
];

export default function SearchInput() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const currentCategory = searchParams.get('category') || '';
    
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Initial sync
    useEffect(() => {
        setQuery(searchParams.get('q') || '');
    }, [searchParams]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters(query, currentCategory);
    };

    const handleCategorySelect = (categorySlug: string) => {
        setIsFilterOpen(false);
        applyFilters(query, categorySlug);
    };

    const applyFilters = (searchQuery: string, categorySlug: string) => {
        startTransition(() => {
            const params = new URLSearchParams();
            if (searchQuery) params.set('q', searchQuery);
            if (categorySlug) params.set('category', categorySlug);
            router.push(`/berita${params.toString() ? `?${params.toString()}` : ''}`);
        });
    };

    return (
        <div className="flex gap-2 relative" ref={dropdownRef}>
            <form onSubmit={handleSearch} className="relative flex-1">
                <input
                    type="text"
                    placeholder="Cari berita..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                />
                <button type="submit" disabled={isPending} className="absolute left-3 top-2.5">
                    <Search className={`h-4 w-4 text-gray-400 ${isPending ? 'animate-pulse' : ''}`} />
                </button>
            </form>
            
            <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex-shrink-0 flex items-center justify-center px-4 rounded-lg border transition-all ${
                    isFilterOpen || currentCategory
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
                <Filter className="h-4 w-4" />
                {currentCategory && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-400 border border-white"></div>}
            </button>

            {/* Dropdown Menu */}
            {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.slug}
                                onClick={() => handleCategorySelect(cat.slug)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors ${
                                    currentCategory === cat.slug 
                                    ? 'bg-primary/10 text-primary font-medium' 
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <cat.icon className={`h-4 w-4 ${currentCategory === cat.slug ? 'text-primary' : 'text-gray-400'}`} />
                                    {cat.name}
                                </span>
                                {currentCategory === cat.slug && <Check className="h-4 w-4 text-primary" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
