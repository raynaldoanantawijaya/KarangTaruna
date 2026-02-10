"use client"

import Link from "next/link"
import { Instagram, Youtube, MapPin, Mail, Phone } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 border-t-4 border-primary transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Logo and About */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-3 mb-4">
                            <img
                                alt="Logo Karang Taruna Footer"
                                className="h-16 w-16 md:h-20 md:w-20 object-contain"
                                src="/icon-192.png"
                            />
                            <div>
                                <span className="font-bold text-lg sm:text-xl tracking-tight block leading-tight">Asta Wira Dipta</span>
                                <span className="text-xs text-gray-400 block">Kelurahan Mojo - Surakarta</span>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm max-w-sm mb-6">
                            Wadah pengembangan generasi muda yang tumbuh atas dasar kesadaran dan rasa tanggung jawab sosial dari, oleh dan untuk masyarakat.
                        </p>
                        <div className="flex space-x-3 sm:space-x-4">
                            <a href="https://www.instagram.com/karangtaruna_mojoska/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg sm:rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors text-white">
                                <span className="sr-only">Instagram</span>
                                <Instagram className="h-5 w-5 sm:h-4 sm:w-4" />
                            </a>
                            <a href="https://youtube.com/@karangtarunaindonesiaastaw2693" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg sm:rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors text-white">
                                <span className="sr-only">YouTube</span>
                                <Youtube className="h-5 w-5 sm:h-4 sm:w-4" />
                            </a>
                            <a href="#" className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg sm:rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors text-white">
                                <span className="sr-only">TikTok</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-5 w-5 sm:h-4 sm:w-4"
                                >
                                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Contact - Aligned and clean */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-white">Kontak</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li className="flex items-start">
                                <MapPin className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-0.5" />
                                <span className="leading-relaxed">Jl. Sungai Serang I No.313, Mojo, Kec. Ps. Kliwon, Kota Surakarta, Jawa Tengah 57191</span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                                <span>astawiradipta@gmail.com</span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                                <span>+62 87 888 2 666 99</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500 text-sm">© 2026 Van Helsing. All rights reserved.</p>
                    <p className="text-gray-600 text-xs mt-2 md:mt-0">Asta Wira Dipta</p>
                </div>
            </div>
        </footer>
    )
}
