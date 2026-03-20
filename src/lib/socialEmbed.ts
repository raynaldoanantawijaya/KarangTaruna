/**
 * Social Media Link Embed Processor
 * Detects social media URLs in HTML content and replaces them
 * with rich preview cards showing platform logo, name, and username.
 */

interface SocialPlatform {
    name: string;
    color: string;
    bgColor: string;
    darkBgColor: string;
    iconSvg: string;
    patterns: RegExp[];
    extractUsername: (url: string) => string | null;
    profileUrl: (username: string) => string;
}

const PLATFORMS: SocialPlatform[] = [
    {
        name: 'Instagram',
        color: '#E4405F',
        bgColor: 'bg-gradient-to-br from-[#833AB4] via-[#E4405F] to-[#FCAF45]',
        darkBgColor: 'dark:from-[#833AB4] dark:via-[#E4405F] dark:to-[#FCAF45]',
        iconSvg: `<svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
        patterns: [
            /https?:\/\/(www\.)?instagram\.com\/([a-zA-Z0-9._]+)/i,
        ],
        extractUsername: (url: string) => {
            const match = url.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
            if (match && !['p', 'reel', 'stories', 'explore', 'tv', 'accounts'].includes(match[1])) {
                return match[1];
            }
            return null;
        },
        profileUrl: (username: string) => `https://instagram.com/${username}`,
    },
    {
        name: 'Facebook',
        color: '#1877F2',
        bgColor: 'bg-[#1877F2]',
        darkBgColor: 'dark:bg-[#1877F2]',
        iconSvg: `<svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
        patterns: [
            /https?:\/\/(www\.)?(facebook|fb)\.com\/([a-zA-Z0-9.]+)/i,
        ],
        extractUsername: (url: string) => {
            const match = url.match(/(facebook|fb)\.com\/([a-zA-Z0-9.]+)/i);
            if (match && !['sharer', 'share', 'watch', 'groups', 'events', 'pages', 'marketplace', 'gaming'].includes(match[2])) {
                return match[2];
            }
            return null;
        },
        profileUrl: (username: string) => `https://facebook.com/${username}`,
    },
    {
        name: 'TikTok',
        color: '#000000',
        bgColor: 'bg-black',
        darkBgColor: 'dark:bg-white',
        iconSvg: `<svg class="w-8 h-8 text-white dark:text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
        patterns: [
            /https?:\/\/(www\.)?tiktok\.com\/@([a-zA-Z0-9._]+)/i,
        ],
        extractUsername: (url: string) => {
            const match = url.match(/tiktok\.com\/@([a-zA-Z0-9._]+)/i);
            return match ? match[1] : null;
        },
        profileUrl: (username: string) => `https://tiktok.com/@${username}`,
    },
    {
        name: 'YouTube',
        color: '#FF0000',
        bgColor: 'bg-[#FF0000]',
        darkBgColor: 'dark:bg-[#FF0000]',
        iconSvg: `<svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
        patterns: [
            /https?:\/\/(www\.)?youtube\.com\/@([a-zA-Z0-9._-]+)/i,
            /https?:\/\/(www\.)?youtube\.com\/c\/([a-zA-Z0-9._-]+)/i,
            /https?:\/\/(www\.)?youtube\.com\/channel\/([a-zA-Z0-9._-]+)/i,
        ],
        extractUsername: (url: string) => {
            let match = url.match(/youtube\.com\/@([a-zA-Z0-9._-]+)/i);
            if (match) return match[1];
            match = url.match(/youtube\.com\/c\/([a-zA-Z0-9._-]+)/i);
            if (match) return match[1];
            match = url.match(/youtube\.com\/channel\/([a-zA-Z0-9._-]+)/i);
            if (match) return match[1];
            return null;
        },
        profileUrl: (username: string) => `https://youtube.com/@${username}`,
    },
    {
        name: 'X (Twitter)',
        color: '#000000',
        bgColor: 'bg-black',
        darkBgColor: 'dark:bg-white',
        iconSvg: `<svg class="w-7 h-7 text-white dark:text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
        patterns: [
            /https?:\/\/(www\.)?(twitter|x)\.com\/([a-zA-Z0-9_]+)/i,
        ],
        extractUsername: (url: string) => {
            const match = url.match(/(twitter|x)\.com\/([a-zA-Z0-9_]+)/i);
            if (match && !['intent', 'search', 'explore', 'home', 'i', 'hashtag', 'settings'].includes(match[2])) {
                return match[2];
            }
            return null;
        },
        profileUrl: (username: string) => `https://x.com/${username}`,
    },
];

/**
 * Processes HTML content and replaces standalone social media links
 * with rich preview cards.
 */
export function processSocialLinks(html: string): string {
    // Match <a> tags that contain a social media URL
    // Also match bare URLs that aren't in <a> tags
    let processed = html;

    for (const platform of PLATFORMS) {
        for (const pattern of platform.patterns) {
            // Match <a> tags with social media links
            const aTagRegex = new RegExp(
                `<a[^>]*href=["'](${pattern.source})["'][^>]*>.*?</a>`,
                'gi'
            );

            processed = processed.replace(aTagRegex, (fullMatch, url) => {
                const username = platform.extractUsername(url);
                if (!username) return fullMatch;
                return generateCard(platform, username, url);
            });

            // Also match bare URLs (not already in <a> tags)
            // Look for URLs that are not preceded by href=" or src="
            const bareUrlRegex = new RegExp(
                `(?<!href=["']|src=["'])(${pattern.source}[^\\s<"]*)`,
                'gi'
            );

            processed = processed.replace(bareUrlRegex, (fullMatch, url) => {
                // Skip if already processed (inside our card)
                if (processed.indexOf(`data-social-card`) > -1 && fullMatch.includes('data-social-card')) {
                    return fullMatch;
                }
                const username = platform.extractUsername(url);
                if (!username) return fullMatch;
                return generateCard(platform, username, url);
            });
        }
    }

    return processed;
}

function generateCard(platform: SocialPlatform, username: string, originalUrl: string): string {
    const cleanUrl = originalUrl.split('?')[0]; // Remove query params for display
    
    return `
    <a href="${originalUrl}" target="_blank" rel="noopener noreferrer" 
       data-social-card="true"
       class="not-prose flex items-center gap-4 p-4 my-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all no-underline group cursor-pointer"
       style="text-decoration: none !important;">
        <div class="w-14 h-14 rounded-xl ${platform.bgColor} ${platform.darkBgColor} flex items-center justify-center shrink-0 shadow-sm">
            ${platform.iconSvg}
        </div>
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
                <span class="text-xs font-bold uppercase tracking-widest" style="color: ${platform.color}">${platform.name}</span>
            </div>
            <p class="text-base font-bold text-gray-900 dark:text-white truncate !mb-0 !mt-0 !leading-snug">@${username}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate !mb-0 !mt-0.5">${cleanUrl}</p>
        </div>
        <div class="shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
        </div>
    </a>`;
}
