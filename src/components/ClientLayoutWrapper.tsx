"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import PersistentHeaderBg from "@/components/PersistentHeaderBg";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ThemeToggle } from "@/components/ThemeToggle";
import VisitorTracker from "@/components/VisitorTracker";
import NavigationProgress from "@/components/NavigationProgress";

export default function ClientLayoutWrapper({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith("/admin");
    const isAuthPage = pathname === "/login";
    const shouldHideLayout = isAdmin || isAuthPage;

    return (
        <>
            <Suspense fallback={null}>
                <NavigationProgress />
            </Suspense>
            <VisitorTracker />
            {!shouldHideLayout &&
                <>
                    <Navbar />
                    <ScrollToTop />
                </>
            }
            <div className="flex-grow flex flex-col w-full relative">
                {!shouldHideLayout && <PersistentHeaderBg />}
                {children}
            </div>
            {!shouldHideLayout && (footer || null)}

            {/* Floating Theme Toggle for Admin/Auth Pages */}
            {shouldHideLayout && (
                <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1">
                    <ThemeToggle />
                </div>
            )}
        </>
    );
}
