'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, LogOut, ChevronDown } from 'lucide-react';

export default function AdminNavbar({ user }: { user?: { name: string; email: string } }) {
    const pathname = usePathname();
    const [isMediaOpen, setIsMediaOpen] = useState(false);
    const mediaDropdownRef = useRef<HTMLDivElement>(null);
    const displayName = user?.name || 'Admin User';

    const isActive = (path: string) => {
        return pathname === path ? 'border-primary text-white dark:text-slate-900 border-b-2' : 'border-transparent text-slate-400 hover:text-slate-200 dark:text-slate-500 dark:hover:text-slate-700 border-b-2 hover:border-gray-300 dark:hover:border-gray-300';
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (mediaDropdownRef.current && !mediaDropdownRef.current.contains(event.target as Node)) {
                setIsMediaOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [mediaDropdownRef]);

    // Close dropdown on route change
    useEffect(() => {
        setIsMediaOpen(false);
    }, [pathname]);

    return (
        <nav className="bg-gray-800 dark:bg-white border-b border-gray-700 dark:border-slate-200 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 relative">
                    {/* Logo Left */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <Settings className="text-white w-5 h-5" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-white dark:text-slate-900">Admin Astawiradipta</span>
                        </div>
                    </div>

                    {/* Centered Menu Links */}
                    <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 space-x-8">
                        <Link className={`${isActive('/admin')} inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors`} href="/admin">
                            Dashboard
                        </Link>
                        <Link className={`${isActive('/admin/posts')} inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors`} href="/admin/posts">
                            Posts
                        </Link>

                        {/* Media Dropdown */}
                        <div className="relative" ref={mediaDropdownRef}>
                            <button
                                onClick={() => setIsMediaOpen(!isMediaOpen)}
                                className={`
                                    ${pathname.startsWith('/admin/media')
                                        ? 'border-primary text-white dark:text-slate-900 border-b-2'
                                        : 'border-transparent text-slate-400 hover:text-slate-200 dark:text-slate-500 dark:hover:text-slate-700 border-b-2 hover:border-gray-300 dark:hover:border-gray-300'
                                    } 
                                    inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors focus:outline-none h-full relative z-10
                                `}
                            >
                                Media
                                <ChevronDown className={`ml-1 w-4 h-4 transition-transform duration-200 ${isMediaOpen ? 'transform rotate-180' : ''}`} />
                            </button>

                            {isMediaOpen && (
                                <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
                                    <div className="py-1" role="menu" aria-orientation="vertical">
                                        <Link href="/admin/media/photos" className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" role="menuitem">
                                            Photos
                                        </Link>
                                        <Link href="/admin/media/videos" className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" role="menuitem">
                                            Videos
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link className={`${isActive('/admin/appearance')} inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors`} href="/admin/appearance">
                            Tampilan
                        </Link>
                        <Link className={`${isActive('/admin/users')} inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors`} href="/admin/users">
                            Users
                        </Link>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={async () => {
                                await fetch('/api/auth/logout', { method: 'POST' });
                                window.location.href = '/login';
                            }}
                            className="p-1 rounded-full text-slate-400 hover:text-red-500 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                            title="Logout"
                        >
                            <span className="sr-only">Logout</span>
                            <LogOut className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gray-700 dark:bg-gray-200 overflow-hidden border border-gray-600 dark:border-slate-200">
                                <img
                                    alt="Admin Profile"
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
