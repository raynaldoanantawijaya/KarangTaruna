'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, LogOut, ChevronDown, Menu, X } from 'lucide-react';

export default function AdminNavbar({ user }: { user?: { name: string; email: string } }) {
    const pathname = usePathname();
    const [isMediaOpen, setIsMediaOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mediaDropdownRef = useRef<HTMLDivElement>(null);
    const displayName = user?.name || 'Admin User';

    const isActive = (path: string) => {
        return pathname === path ? 'border-primary text-white dark:text-slate-900 border-b-2' : 'border-transparent text-slate-400 hover:text-slate-200 dark:text-slate-500 dark:hover:text-slate-700 border-b-2 hover:border-gray-300 dark:hover:border-gray-300';
    };

    const isMobileActive = (path: string) => {
        return pathname === path ? 'bg-primary/10 text-primary font-bold border-l-4 border-primary' : 'text-slate-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-gray-800 dark:hover:text-white border-l-4 border-transparent';
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

    // Close menus on route change
    useEffect(() => {
        setIsMediaOpen(false);
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <nav className="bg-gray-800 dark:bg-white border-b border-gray-700 dark:border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 relative">
                    {/* Left: Hamburger & Logo */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-md text-slate-400 hover:text-white dark:hover:text-slate-900 hover:bg-gray-700 dark:hover:bg-gray-100 focus:outline-none transition-colors"
                        >
                            <span className="sr-only">Open menu</span>
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        {/* Logo Left */}
                        <div className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                                <Settings className="text-white w-5 h-5 flex-shrink-0" />
                            </div>
                            <span className="font-bold text-lg sm:text-xl tracking-tight text-white dark:text-slate-900 hidden xl:block">Admin Astawiradipta</span>
                            <span className="font-bold text-lg tracking-tight text-white dark:text-slate-900 xl:hidden">Admin</span>
                        </div>
                    </div>

                    {/* Centered Menu Links (Desktop Only) */}
                    <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 space-x-2 lg:space-x-5 xl:space-x-8">
                        <Link className={`${isActive('/admin')} inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors h-16`} href="/admin">
                            Dashboard
                        </Link>
                        <Link className={`${isActive('/admin/posts')} inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors h-16`} href="/admin/posts">
                            Posts
                        </Link>

                        {/* Media Dropdown */}
                        <div className="relative h-16 flex items-center" ref={mediaDropdownRef}>
                            <button
                                onClick={() => setIsMediaOpen(!isMediaOpen)}
                                className={`
                                    ${pathname.startsWith('/admin/media')
                                        ? 'border-primary text-white dark:text-slate-900 border-b-2'
                                        : 'border-transparent text-slate-400 hover:text-slate-200 dark:text-slate-500 dark:hover:text-slate-700 hover:border-gray-300 dark:hover:border-gray-300'
                                    } 
                                    inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors focus:outline-none h-full relative z-10
                                `}
                            >
                                Media
                                <ChevronDown className={`ml-1 w-4 h-4 transition-transform duration-200 ${isMediaOpen ? 'transform rotate-180' : ''}`} />
                            </button>

                            {isMediaOpen && (
                                <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-1 w-48 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
                                    <div className="py-2" role="menu" aria-orientation="vertical">
                                        <Link href="/admin/media/photos" className="block px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary transition-colors" role="menuitem">
                                            Photos
                                        </Link>
                                        <Link href="/admin/media/videos" className="block px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary transition-colors" role="menuitem">
                                            Videos
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link className={`${isActive('/admin/appearance')} inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors h-16`} href="/admin/appearance">
                            Tampilan
                        </Link>
                        <Link className={`${isActive('/admin/proker')} inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors h-16`} href="/admin/proker">
                            Proker
                        </Link>
                        <Link className={`${isActive('/admin/users')} inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors h-16`} href="/admin/users">
                            Users
                        </Link>
                        <Link className={`${isActive('/admin/sessions')} inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors h-16`} href="/admin/sessions">
                            Sesi Aktif
                        </Link>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={async () => {
                                // Capture fresh GPS location at logout for security audit
                                let logoutLocation: { latitude: number; longitude: number; accuracy: number } | null = null;
                                try {
                                    logoutLocation = await new Promise((resolve) => {
                                        let watchId: number;
                                        const deadline = setTimeout(() => {
                                            navigator.geolocation?.clearWatch(watchId);
                                            resolve(null); // Timeout — log out anyway
                                        }, 8000);
                                        watchId = navigator.geolocation.watchPosition(
                                            (pos) => {
                                                clearTimeout(deadline);
                                                navigator.geolocation.clearWatch(watchId);
                                                resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy });
                                            },
                                            () => { clearTimeout(deadline); navigator.geolocation.clearWatch(watchId); resolve(null); },
                                            { enableHighAccuracy: false, maximumAge: 60000 }
                                        );
                                    });
                                } catch { /* GPS not available, log out anyway */ }

                                await fetch('/api/auth/logout', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ location: logoutLocation }),
                                });
                                window.location.href = '/login';
                            }}
                            className="p-1 sm:p-2 mr-2 sm:mr-0 rounded-full text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-700 dark:hover:bg-gray-100 focus:outline-none transition-colors"
                            title="Logout"
                        >
                            <span className="sr-only">Logout</span>
                            <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <div className="flex items-center gap-2 hidden sm:flex">
                            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gray-700 dark:bg-gray-200 overflow-hidden border border-gray-600 dark:border-slate-200 shadow-sm">
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

            {/* Mobile Menu Panel */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-[600px] border-b border-gray-700 dark:border-gray-200' : 'max-h-0'}`}>
                <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-800 dark:bg-white shadow-inner sm:px-3">
                    <Link href="/admin" className={`${isMobileActive('/admin')} block px-3 py-2.5 rounded-md text-base font-medium`}>
                        Dashboard
                    </Link>
                    <Link href="/admin/posts" className={`${isMobileActive('/admin/posts')} block px-3 py-2.5 rounded-md text-base font-medium`}>
                        Posts
                    </Link>
                    <div className="pt-2 pb-1">
                        <div className="block px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Media</div>
                        <Link href="/admin/media/photos" className={`${isMobileActive('/admin/media/photos')} block px-3 py-2.5 rounded-md text-base font-medium ml-4`}>
                            Photos
                        </Link>
                        <Link href="/admin/media/videos" className={`${isMobileActive('/admin/media/videos')} block px-3 py-2.5 rounded-md text-base font-medium ml-4`}>
                            Videos
                        </Link>
                    </div>
                    <Link href="/admin/appearance" className={`${isMobileActive('/admin/appearance')} block px-3 py-2.5 rounded-md text-base font-medium`}>
                        Tampilan
                    </Link>
                    <Link href="/admin/proker" className={`${isMobileActive('/admin/proker')} block px-3 py-2.5 rounded-md text-base font-medium`}>
                        Proker
                    </Link>
                    <Link href="/admin/users" className={`${isMobileActive('/admin/users')} block px-3 py-2.5 rounded-md text-base font-medium`}>
                        Users
                    </Link>
                    <Link href="/admin/sessions" className={`${isMobileActive('/admin/sessions')} block px-3 py-2.5 rounded-md text-base font-medium`}>
                        Sesi Aktif
                    </Link>
                </div>
                {/* Mobile Profile Display */}
                <div className="pt-4 pb-4 border-t border-gray-700 dark:border-gray-200 sm:hidden bg-gray-800 dark:bg-white">
                    <div className="flex items-center px-5">
                        <div className="flex-shrink-0">
                            <img
                                className="h-10 w-10 rounded-full border border-gray-600 dark:border-gray-300"
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`}
                                alt="User Profile"
                            />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                            <div className="text-base font-bold text-white dark:text-gray-800 truncate">{displayName}</div>
                            <div className="text-sm font-medium text-gray-400 mt-1 truncate">{user?.email || 'admin@example.com'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
