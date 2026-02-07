"use client";

import { GraduationCap, Search, Loader2, User, Building2, BookOpen } from "lucide-react";
import { useState } from "react";

interface Mahasiswa {
    id: string;
    nama: string;
    nim: string;
    nama_pt: string;
    nama_prodi: string;
}

export default function PDDIKTIPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Mahasiswa[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!query.trim()) {
            setError("Masukkan nama mahasiswa");
            return;
        }

        if (query.trim().length < 3) {
            setError("Minimal 3 karakter");
            return;
        }

        setError("");
        setLoading(true);
        setHasSearched(true);

        try {
            const response = await fetch(`https://api.ryzumi.vip/api/search/mahasiswa?query=${encodeURIComponent(query)}`);

            if (!response.ok) {
                throw new Error("Gagal mengambil data");
            }

            const data = await response.json();
            setResults(data || []);
        } catch (err) {
            setError("Terjadi kesalahan saat mengambil data. Coba lagi.");
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="relative overflow-hidden transition-colors duration-500 min-h-[180px] sm:min-h-[220px] md:min-h-[280px] flex flex-col justify-start pt-10 sm:pt-14 md:pt-20 pb-6 sm:pb-8 md:pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <GraduationCap className="h-10 w-10 text-yellow-400 mr-3" />
                        <h1 className="text-2xl md:text-4xl font-bold text-white">
                            PDDIKTI <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-yellow-100">Lookup</span>
                        </h1>
                    </div>
                    <p className="text-white/90 dark:text-gray-300 text-sm md:text-base max-w-2xl mx-auto transition-colors">
                        Cari informasi mahasiswa di seluruh perguruan tinggi Indonesia.
                    </p>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {/* Search Box */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-6 mb-6">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setError("");
                                }}
                                placeholder="Masukkan nama mahasiswa..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-semibold px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Mencari...
                                </>
                            ) : (
                                <>
                                    <Search className="h-5 w-5" />
                                    Cari
                                </>
                            )}
                        </button>
                    </form>

                    {error && (
                        <p className="text-red-500 text-sm mt-3">{error}</p>
                    )}
                </div>

                {/* Results */}
                {hasSearched && !loading && (
                    <div className="space-y-4">
                        {/* Results Count */}
                        <div className="flex items-center justify-between">
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {results.length > 0
                                    ? `Ditemukan ${results.length} hasil untuk "${query}"`
                                    : `Tidak ada hasil untuk "${query}"`
                                }
                            </p>
                        </div>

                        {/* Results Grid */}
                        {results.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {results.map((mhs) => (
                                    <div
                                        key={mhs.id}
                                        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-lg shrink-0">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                    {mhs.nama}
                                                </h3>
                                                <p className="text-sm text-primary font-medium mt-0.5">
                                                    NIM: {mhs.nim}
                                                </p>
                                                <div className="mt-2 space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                                                        <span className="truncate">{mhs.nama_pt}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <BookOpen className="h-3.5 w-3.5 shrink-0" />
                                                        <span className="truncate">{mhs.nama_prodi}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* No Results */}
                        {results.length === 0 && (
                            <div className="text-center py-12">
                                <GraduationCap className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    Tidak ada data mahasiswa yang ditemukan.
                                </p>
                                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                                    Coba kata kunci lain atau periksa ejaan.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Initial State */}
                {!hasSearched && !loading && (
                    <div className="text-center py-12">
                        <Search className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                            Masukkan nama mahasiswa untuk memulai pencarian.
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                            Data dari Pangkalan Data Pendidikan Tinggi (PDDIKTI)
                        </p>
                    </div>
                )}

                {/* Info */}
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                        <strong>Info:</strong> Data diambil dari Pangkalan Data Pendidikan Tinggi (PDDIKTI) Kementerian Pendidikan dan Kebudayaan Republik Indonesia.
                    </p>
                </div>
            </main>
        </div>
    );
}
