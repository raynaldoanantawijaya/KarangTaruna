"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, GraduationCap, Download } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"
import { cn } from "@/lib/utils"

const navItems = [
    { name: "Beranda", href: "/" },
    { name: "Profil", href: "/profil" },
    { name: "Program Kerja", href: "/program-kerja" },
    { name: "Berita", href: "/berita" },
    { name: "Bencana", href: "/bencana" },
    { name: "Kontak", href: "/kontak" },
]

const toolItems = [
    { name: "PDDIKTI", href: "/alat/pddikti", icon: GraduationCap },
    { name: "Download YouTube", href: "/alat/youtube", icon: Download },
]

export function Navbar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = React.useState(false)
    const [isToolsOpen, setIsToolsOpen] = React.useState(false)
    const [isMobileToolsOpen, setIsMobileToolsOpen] = React.useState(false)
    const menuRef = React.useRef<HTMLDivElement>(null)
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const toolsRef = React.useRef<HTMLDivElement>(null)

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isOpen &&
                menuRef.current &&
                buttonRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
            // Close tools dropdown when clicking outside
            if (
                isToolsOpen &&
                toolsRef.current &&
                !toolsRef.current.contains(event.target as Node)
            ) {
                setIsToolsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen, isToolsOpen])

    return (
        <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center relative">
                    <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
                        <img
                            alt="Logo Asta Wira Dipta"
                            className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 object-contain"
                            src="/icon-192.webp"
                        />
                        <span className="font-bold text-sm sm:text-base md:text-sm lg:text-xl tracking-tight text-gray-900 dark:text-white leading-tight whitespace-nowrap">
                            Asta Wira Dipta
                        </span>
                    </Link>

                    {/* Desktop Menu - Centered */}
                    {/* Changed from absolute centering to flex to avoid overlap on smaller desktops */}
                    <div className="hidden md:flex items-center space-x-4 lg:space-x-6 absolute left-1/2 -translate-x-1/2 w-auto whitespace-nowrap">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "font-medium transition-colors text-sm lg:text-base",
                                    pathname === item.href
                                        ? "text-primary font-bold border-b-2 border-primary pb-1"
                                        : "text-gray-500 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}

                        {/* Alat Dropdown - Desktop */}
                        <div ref={toolsRef} className="relative">
                            <button
                                onClick={() => setIsToolsOpen(!isToolsOpen)}
                                className={cn(
                                    "font-medium transition-colors flex items-center gap-1 text-sm lg:text-base",
                                    pathname.startsWith("/alat")
                                        ? "text-primary font-bold"
                                        : "text-gray-500 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                                )}
                            >
                                Alat
                                <ChevronDown className={cn(
                                    "h-4 w-4 transition-transform duration-200",
                                    isToolsOpen && "rotate-180"
                                )} />
                            </button>

                            {/* Dropdown Menu */}
                            <div className={cn(
                                "absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200",
                                isToolsOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
                            )}>
                                {toolItems.map((tool) => (
                                    <Link
                                        key={tool.href}
                                        href={tool.href}
                                        className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary transition-colors text-sm"
                                        onClick={() => setIsToolsOpen(false)}
                                    >
                                        <tool.icon className="h-4 w-4" />
                                        {tool.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <ThemeToggle />
                        {/* Animated Hamburger Button */}
                        <button
                            ref={buttonRef}
                            className="md:hidden ml-2 p-2 text-gray-600 dark:text-gray-300 relative w-10 h-10 flex items-center justify-center"
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label={isOpen ? "Close menu" : "Open menu"}
                        >
                            <div className="w-6 h-5 relative flex flex-col justify-center items-center">
                                <span
                                    className={cn(
                                        "block absolute h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out",
                                        isOpen ? "rotate-45" : "-translate-y-2"
                                    )}
                                />
                                <span
                                    className={cn(
                                        "block absolute h-0.5 w-6 bg-current transition-all duration-300 ease-in-out",
                                        isOpen ? "opacity-0" : "opacity-100"
                                    )}
                                />
                                <span
                                    className={cn(
                                        "block absolute h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out",
                                        isOpen ? "-rotate-45" : "translate-y-2"
                                    )}
                                />
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu with animation */}
            <div
                ref={menuRef}
                className={cn(
                    "md:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "block px-3 py-2 rounded-md text-base font-medium",
                                pathname === item.href
                                    ? "text-primary bg-gray-50 dark:bg-gray-800"
                                    : "text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800"
                            )}
                            onClick={() => setIsOpen(false)}
                        >
                            {item.name}
                        </Link>
                    ))}

                    {/* Alat Dropdown - Mobile */}
                    <div>
                        <button
                            onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium",
                                pathname.startsWith("/alat")
                                    ? "text-primary bg-gray-50 dark:bg-gray-800"
                                    : "text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800"
                            )}
                        >
                            Alat
                            <ChevronDown className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                isMobileToolsOpen && "rotate-180"
                            )} />
                        </button>

                        {/* Mobile Sub-menu */}
                        <div className={cn(
                            "overflow-hidden transition-all duration-200",
                            isMobileToolsOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                        )}>
                            {toolItems.map((tool) => (
                                <Link
                                    key={tool.href}
                                    href={tool.href}
                                    className="flex items-center gap-3 px-6 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                                    onClick={() => {
                                        setIsOpen(false)
                                        setIsMobileToolsOpen(false)
                                    }}
                                >
                                    <tool.icon className="h-4 w-4" />
                                    {tool.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}
