'use client';

import { Facebook, Twitter, Link as LinkIcon, Share2, Check, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface ShareButtonsProps {
    title: string;
    url: string;
    variant?: 'icon' | 'button';
}

export default function ShareButtons({ title, url, variant = 'icon' }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);
    const [fullUrl, setFullUrl] = useState(url);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && !url.startsWith('http')) {
            setFullUrl(window.location.origin + (url.startsWith('/') ? url : '/' + url));
        } else if (url.startsWith('http')) {
            setFullUrl(url);
        }
    }, [url]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                setShowMenu(false);
            }, 1500);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const encodedTitle = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(fullUrl);

    const shareOptions = [
        {
            name: 'WhatsApp',
            href: `https://api.whatsapp.com/send?text=${encodedTitle}%0A%0ABaca selengkapnya:%0A${encodedUrl}`,
            color: 'hover:bg-[#25D366]',
            icon: (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.002 3.825-3.115 6.938-6.937 6.938z"/></svg>
            ),
        },
        {
            name: 'Facebook',
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            color: 'hover:bg-[#1877F2]',
            icon: <Facebook className="w-5 h-5 fill-current" />,
        },
        {
            name: 'X (Twitter)',
            href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
            color: 'hover:bg-black dark:hover:bg-white dark:hover:text-black',
            icon: <Twitter className="w-5 h-5 fill-current" />,
        },
        {
            name: 'Telegram',
            href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
            color: 'hover:bg-[#0088cc]',
            icon: (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            ),
        },
    ];

    // ---- ICON variant (header area) ----
    if (variant === 'icon') {
        return (
            <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-400 mr-2 uppercase tracking-widest hidden sm:inline-block">Bagikan:</span>
                {shareOptions.map((opt) => (
                    <a key={opt.name} href={opt.href} target="_blank" rel="noopener noreferrer"
                       className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-transparent dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 ${opt.color} hover:text-white transition-all shadow-sm`}
                       title={opt.name}>
                        {opt.icon}
                    </a>
                ))}
                <button onClick={handleCopy}
                    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-transparent dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shadow-sm"
                    title="Salin Tautan">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4" />}
                </button>
            </div>
        );
    }

    // ---- BUTTON variant (bottom area): single button with popup ----
    return (
        <div className="relative w-full sm:w-auto" ref={menuRef}>
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white font-bold uppercase tracking-wider text-sm hover:bg-red-700 transition-colors shadow-none rounded-none w-full sm:w-auto justify-center"
            >
                <Share2 className="w-4 h-4" />
                Bagikan Artikel
            </button>

            {/* Popup Menu */}
            {showMenu && (
                <div className="absolute bottom-full mb-3 left-0 right-0 sm:left-auto sm:right-0 sm:w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Bagikan ke</span>
                        <button onClick={() => setShowMenu(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="p-2">
                        {shareOptions.map((opt) => (
                            <a
                                key={opt.name}
                                href={opt.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setShowMenu(false)}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-md"
                            >
                                <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0">
                                    {opt.icon}
                                </span>
                                {opt.name}
                            </a>
                        ))}
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-md w-full"
                        >
                            <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0">
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4" />}
                            </span>
                            {copied ? 'Tersalin!' : 'Salin Tautan'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
