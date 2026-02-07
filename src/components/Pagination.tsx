import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
    searchParams: { [key: string]: string | string[] | undefined };
}

export default function Pagination({ currentPage, totalPages, baseUrl, searchParams }: PaginationProps) {
    if (totalPages <= 1) return null;

    const createPageUrl = (pageNumber: number) => {
        const params = new URLSearchParams();

        // Add existing params
        Object.entries(searchParams).forEach(([key, value]) => {
            if (key !== 'page' && typeof value === 'string') {
                params.set(key, value);
            }
        });

        // Add page param
        params.set('page', pageNumber.toString());

        return `${baseUrl}?${params.toString()}`;
    };

    return (
        <div className="flex justify-center items-center space-x-2 mt-12 mb-8">
            {/* Previous Button */}
            {currentPage > 1 ? (
                <a
                    href={createPageUrl(currentPage - 1)}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Previous Page"
                >
                    <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </a>
            ) : (
                <button
                    disabled
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed"
                    aria-label="Previous Page"
                >
                    <ChevronLeft className="h-5 w-5 text-gray-400" />
                </button>
            )}

            {/* Page Numbers */}
            <div className="flex space-x-1">
                {/* Always show first page */}
                <a
                    href={createPageUrl(1)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${currentPage === 1
                            ? 'bg-primary text-white border-primary'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                >
                    1
                </a>

                {/* Ellipsis if needed */}
                {currentPage > 3 && <span className="px-2 py-2 text-gray-500">...</span>}

                {/* Middle pages */}
                {currentPage > 2 && currentPage < totalPages && (
                    <a
                        href={createPageUrl(currentPage)}
                        className="px-4 py-2 rounded-lg border border-primary bg-primary text-white text-sm font-medium"
                    >
                        {currentPage}
                    </a>
                )}
            </div>

            {/* Simple Mobile/Desktop version: Just Page X of Y */}
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium px-2">
                Halaman {currentPage} dari {totalPages}
            </span>


            {/* Next Button */}
            {currentPage < totalPages ? (
                <a
                    href={createPageUrl(currentPage + 1)}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Next Page"
                >
                    <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </a>
            ) : (
                <button
                    disabled
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed"
                    aria-label="Next Page"
                >
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
            )}
        </div>
    );
}
