import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function LatestNewsSkeleton() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <span className="text-primary font-semibold tracking-wider uppercase text-sm">
                        Informasi Terkini
                    </span>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        Berita Terbaru
                    </h2>
                    <div className="w-20 h-1 bg-secondary mt-4 rounded-full"></div>
                </div>
                <div className="hidden md:flex items-center text-gray-300">
                    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
            </div>

            <div className="space-y-6">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row h-full md:h-56">
                        {/* Image Skeleton */}
                        <div className="md:w-1/3 relative h-48 md:h-full bg-gray-200 dark:bg-gray-800 animate-pulse"></div>

                        {/* Content Skeleton */}
                        <div className="p-6 md:w-2/3 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center space-x-2 mb-3">
                                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                    <div className="h-3 w-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                </div>
                                <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse"></div>
                                <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>
                                <div className="space-y-2">
                                    <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                    <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                </div>
                            </div>
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-4"></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center md:hidden">
                <div className="inline-block h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
        </section>
    );
}
