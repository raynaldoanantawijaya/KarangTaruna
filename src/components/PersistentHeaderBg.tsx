"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function PersistentHeaderBg() {
    const pathname = usePathname();

    // Define sine wave variations for smooth morphing
    // M0,60 Q150,[PEAK] 300,60 T600,60 T900,60 T1200,60 V120 H0 Z
    const getWavePath = (variant: 'A' | 'B' | 'C' | 'D' | 'E') => {
        switch (variant) {
            case 'A': // Home - Standard
                return "M0,60 Q150,30 300,60 T600,60 T900,60 T1200,60 V120 H0 Z";
            case 'B': // Profil - Higher Peaks
                return "M0,60 Q150,10 300,60 T600,60 T900,60 T1200,60 V120 H0 Z";
            case 'C': // Program - Lower/Flatter
                return "M0,60 Q150,50 300,60 T600,60 T900,60 T1200,60 V120 H0 Z";
            case 'D': // Berita - Inverse Phaseish
                return "M0,60 Q150,80 300,60 T600,60 T900,60 T1200,60 V120 H0 Z";
            case 'E': // Kontak - Sharp
                return "M0,60 Q150,0 300,60 T600,60 T900,60 T1200,60 V120 H0 Z";
            default:
                return "M0,60 Q150,30 300,60 T600,60 T900,60 T1200,60 V120 H0 Z";
        }
    };

    // Determine variant based on path
    let activeVariant: 'A' | 'B' | 'C' | 'D' | 'E' = 'A';
    if (pathname === '/profil') activeVariant = 'B';
    else if (pathname === '/program-kerja') activeVariant = 'C';
    else if (pathname === '/berita') activeVariant = 'D';
    else if (pathname === '/kontak') activeVariant = 'E';

    const dPath = getWavePath(activeVariant);

    const isHomePage = pathname === '/';

    return (
        <div className={`absolute top-0 left-0 w-full overflow-hidden bg-gradient-to-br from-red-700 to-red-900 dark:bg-none dark:!bg-[#111827] transition-colors duration-500 -z-10 gradient-header ${isHomePage ? 'h-[320px] sm:h-[380px] md:h-[450px]' : 'h-[240px] sm:h-[280px] md:h-[350px]'}`}>
            {/* Background Effects */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="shape-blob w-96 h-96 -top-20 -left-20 bg-white/10 blur-3xl rounded-full mix-blend-overlay animate-blob"></div>
                <div className="shape-blob w-[600px] h-[600px] top-1/2 -right-32 transform -translate-y-1/2 bg-yellow-500/10 blur-3xl rounded-full mix-blend-overlay animate-blob animation-delay-2000"></div>
                <div className="absolute top-0 right-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-20 mix-blend-overlay"></div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-20 right-[15%] w-24 h-24 rounded-full border border-white/20 hidden md:block animate-pulse opacity-50"></div>
            <div className="absolute top-40 right-[12%] w-12 h-12 rounded-full bg-secondary/30 hidden md:block blur-sm"></div>
            <div className="absolute bottom-40 left-[10%] w-20 h-20 rounded-full border-2 border-dashed border-white/20 hidden md:block opacity-60"></div>

            {/* Wave Divider */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
                <svg
                    className="relative block w-[calc(100%+1.3px)] h-[100px] md:h-[180px]"
                    preserveAspectRatio="none"
                    viewBox="0 0 1200 120"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Layer 1: Slow, semi-transparent (Back) */}
                    <path
                        className="fill-[var(--background)] opacity-30 transition-[d] duration-[1500ms] ease-in-out"
                        style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                        d={dPath}
                    ></path>

                    {/* Layer 2: Medium speed, semi-transparent (Middle) */}
                    <path
                        className="fill-[var(--background)] opacity-60 transition-[d] duration-[1500ms] ease-in-out"
                        style={{ transitionDelay: '100ms', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                        d={dPath}
                    ></path>

                    {/* Layer 3: Fast, Solid (Front - Main) */}
                    <path
                        className="fill-[var(--background)] transition-[d] duration-[1500ms] ease-in-out"
                        style={{ transitionDelay: '200ms', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                        d={dPath}
                    ></path>
                </svg>
            </div>
        </div>
    );
}
