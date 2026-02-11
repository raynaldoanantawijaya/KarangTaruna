"use client";

import { GraduationCap, Search, Loader2, User, Building2, BookOpen, School, Users, X, Activity, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

type SearchType = "mahasiswa" | "dosen" | "university";

interface SearchResult {
    id: string;
    nama: string;
    nim?: string;
    nidn?: string;
    nama_pt: string;
    nama_prodi?: string;
    kode_pt?: string;
    sinkatan_pt?: string;
}

// Reusable Independent Search Column
function SearchColumn({
    title,
    type,
    icon: Icon,
    placeholder,
    colorClass,
    onSelect
}: {
    title: string;
    type: SearchType;
    icon: any;
    placeholder: string;
    colorClass: string;
    onSelect: (type: SearchType, id: string, initialData: SearchResult) => void;
}) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        if (query.length < 3) {
            setError("Minimal 3 karakter");
            return;
        }

        setError("");
        setLoading(true);
        setHasSearched(true);
        setResults([]);

        try {
            const res = await fetch(`https://univppdikti.vercel.app/search/${type}/${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error("Gagal mengambil data");
            const json = await res.json();
            setResults(Array.isArray(json) ? json : (json.data || []));
        } catch (err) {
            console.error(err);
            setError("Gagal mengambil data. Coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all hover:shadow-xl">
            {/* Header */}
            <div className={`p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 ${colorClass.replace('text-', 'bg-').replace('600', '50')} dark:bg-opacity-10`}>
                <div className={`p-2 rounded-lg ${colorClass.replace('text-', 'bg-').replace('600', '100')} dark:bg-opacity-20`}>
                    <Icon className={`h-5 w-5 ${colorClass}`} />
                </div>
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">{title}</h2>
            </div>

            {/* Search Input Area */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                if (error) setError("");
                            }}
                            placeholder={placeholder}
                            className="w-full pl-3 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || query.length < 3}
                        className={`px-3 py-2.5 rounded-xl text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px] ${type === 'mahasiswa' ? 'bg-blue-600 hover:bg-blue-700' :
                            type === 'dosen' ? 'bg-purple-600 hover:bg-purple-700' :
                                'bg-orange-600 hover:bg-orange-700'
                            }`}
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </button>
                </form>
                {error && <p className="text-red-500 text-xs mt-2 ml-1">{error}</p>}
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto min-h-[400px] max-h-[600px] p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                {hasSearched && !loading && results.length === 0 && !error && (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                        <Search className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-sm">Tidak ada hasil ditemukan.</p>
                    </div>
                )}

                {!hasSearched && (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                        <Icon className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-sm">Silakan cari data {title.toLowerCase()}.</p>
                    </div>
                )}

                {results.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelect(type, item.id, item)}
                        className="w-full text-left p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600 group"
                    >
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {item.nama || item.nama_pt}
                        </h3>
                        <div className="mt-1.5 space-y-1">
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1">
                                {(item.nim || item.nidn || item.kode_pt) && (
                                    <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">
                                        {item.nim || item.nidn || item.kode_pt}
                                    </span>
                                )}
                                {item.sinkatan_pt && (
                                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded border border-orange-100 dark:border-orange-800">
                                        {item.sinkatan_pt}
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            {item.nama_prodi && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 flex items-center gap-1.5">
                                    <BookOpen className="h-3 w-3 shrink-0" /> {item.nama_prodi}
                                </p>
                            )}
                            {item.nama_pt && type !== 'university' && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-1 flex items-center gap-1.5">
                                    <Building2 className="h-3 w-3 shrink-0" /> {item.nama_pt}
                                </p>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

// Detail Modal Component
function DetailModal({ type, id, initialData, onClose }: { type: SearchType; id: string; initialData: SearchResult; onClose: () => void }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await fetch(`https://univppdikti.vercel.app/detail/${type}/${id}`);
                const json = await res.json();
                if (!json || Object.keys(json).length === 0) {
                    setError(true); // Empty response
                } else {
                    setData(json);
                }
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();

        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; }
    }, [type, id]);

    // Icon & Color Logic
    const Icon = type === 'mahasiswa' ? User : type === 'dosen' ? Users : School;
    const colorClass = type === 'mahasiswa' ? 'text-blue-600' : type === 'dosen' ? 'text-purple-600' : 'text-orange-600';
    const bgClass = type === 'mahasiswa' ? 'bg-blue-50 dark:bg-blue-900/20' : type === 'dosen' ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-orange-50 dark:bg-orange-900/20';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-scaleIn border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 rounded-t-2xl">
                    <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${colorClass}`} />
                        Detail {type === 'university' ? 'Perguruan Tinggi' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">

                    {/* Identity Head (Always show from initial data if detail fails) */}
                    <div className={`${bgClass} p-5 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-6 items-start md:items-center`}>
                        {/* Logo for University */}
                        {type === 'university' && data?.logo_base64 && (
                            <div className="w-24 h-24 shrink-0 bg-white rounded-lg p-2 shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden">
                                <img
                                    src={data.logo_base64.startsWith('data:') ? data.logo_base64 : `data:image/jpeg;base64,${data.logo_base64}`}
                                    alt="Logo PT"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )}

                        <div className="flex-1">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {data?.nama || data?.nama_pt || initialData.nama || initialData.nama_pt}
                            </h2>
                            <div className="flex flex-wrap gap-3 text-sm mt-3">
                                {(data?.nim || initialData.nim) && (
                                    <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-gray-600 dark:text-gray-300">
                                        {data?.nim || initialData.nim}
                                    </span>
                                )}
                                {(data?.nidn || initialData.nidn) && (
                                    <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-gray-600 dark:text-gray-300">
                                        NIDN: {data?.nidn || initialData.nidn}
                                    </span>
                                )}
                                {(data?.kode_pt || initialData.kode_pt) && (
                                    <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-gray-600 dark:text-gray-300">
                                        Kode PT: {data?.kode_pt || initialData.kode_pt}
                                    </span>
                                )}
                                {(data?.status_pt) && (
                                    <span className={`px-3 py-1 rounded-lg border font-bold ${data.status_pt === 'Aktif' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                                        }`}>
                                        {data.status_pt}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className={`h-10 w-10 animate-spin ${colorClass} mb-4`} />
                            <p className="text-gray-500">Mengambil data lengkap...</p>
                        </div>
                    )}

                    {/* Data Content */}
                    {!loading && data && (
                        <div className="space-y-6">

                            {/* University Specific Data */}
                            {type === 'university' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Jumlah Mahasiswa</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {data.jumlah_mahasiswa?.toLocaleString() || '-'}
                                        </p>
                                    </div>
                                    <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tanggal Berdiri</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {data.tgl_berdiri || '-'}
                                        </p>
                                    </div>
                                    <div className="md:col-span-2 p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Alamat Kampus</p>
                                        <p className="font-medium text-gray-700 dark:text-gray-300">
                                            {data.alamat || 'Alamat tidak tersedia'}
                                        </p>
                                    </div>
                                    {(data.website || data.email) && (
                                        <div className="md:col-span-2 flex flex-wrap gap-4 text-sm">
                                            {data.website && data.website !== '-' && (
                                                <a href={data.website.startsWith('http') ? data.website : `https://${data.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                                    🌐 Website Resmi
                                                </a>
                                            )}
                                            {data.email && data.email !== '-' && (
                                                <a href={`mailto:${data.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                                                    📧 {data.email}
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Mahasiswa / Dosen Specific Data */}
                            {type !== 'university' && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {data.nama_pt && (
                                            <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Perguruan Tinggi</p>
                                                <p className="font-semibold text-gray-900 dark:text-white flex items-start gap-2">
                                                    <Building2 className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                                                    {data.nama_pt}
                                                </p>
                                            </div>
                                        )}
                                        {data.nama_prodi && (
                                            <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Program Studi</p>
                                                <p className="font-semibold text-gray-900 dark:text-white flex items-start gap-2">
                                                    <BookOpen className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                                                    {data.nama_prodi} {data.jenjang ? `(${data.jenjang})` : ''}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {data.status_saat_ini && (
                                            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${data.status_saat_ini.toLowerCase().includes('aktif') ? 'bg-green-100 text-green-700 border border-green-200' :
                                                    data.status_saat_ini.toLowerCase().includes('lulus') ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                                        'bg-gray-100 text-gray-700 border border-gray-200'
                                                }`}>
                                                <Activity className="h-3.5 w-3.5" /> {data.status_saat_ini}
                                            </span>
                                        )}
                                        {data.tahun_masuk && (
                                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                                                <Calendar className="h-3.5 w-3.5" /> Masuk: {data.tahun_masuk}
                                            </span>
                                        )}
                                    </div>

                                    {/* History Table (Riwayat Status Kuliah) */}
                                    {data.riwayat_status_kuliah && data.riwayat_status_kuliah.length > 0 && (
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                <Activity className="h-5 w-5 text-primary" /> Riwayat Status Kuliah
                                            </h4>
                                            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700 max-h-60">
                                                <table className="w-full text-sm text-left relative">
                                                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs sticky top-0 z-10 shadow-sm">
                                                        <tr>
                                                            <th className="px-4 py-3">Semester</th>
                                                            <th className="px-4 py-3 text-center">SKS</th>
                                                            <th className="px-4 py-3">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                        {data.riwayat_status_kuliah.map((row: any, i: number) => (
                                                            <tr key={i} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                                <td className="px-4 py-3 font-medium">{row.semester_str || row.id_smt}</td>
                                                                <td className="px-4 py-3 text-center">{row.sks_semester}</td>
                                                                <td className="px-4 py-3">
                                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${row.status_mahasiswa?.toLowerCase() === 'aktif' ? 'bg-green-100 text-green-700' :
                                                                            row.status_mahasiswa?.toLowerCase() === 'cuti' ? 'bg-yellow-100 text-yellow-700' :
                                                                                'bg-gray-100 text-gray-600'
                                                                        }`}>
                                                                        {row.status_mahasiswa}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function PDDIKTIPage() {
    const [selectedDetail, setSelectedDetail] = useState<{ type: SearchType; id: string; initialData: SearchResult } | null>(null);

    return (
        <div className="w-full">
            {/* Header */}
            <div className="relative overflow-hidden transition-colors duration-500 min-h-[180px] sm:min-h-[220px] flex flex-col justify-center py-10 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-1/2 -translate-y-1/2">
                    <GraduationCap className="h-64 w-64 text-white" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center justify-center p-2 mb-4 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 shadow-lg">
                        <GraduationCap className="h-6 w-6 text-yellow-400 mr-2" />
                        <span className="text-white font-medium text-sm">Official Data Source Integration</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
                        PDDIKTI <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Lookup</span>
                    </h1>
                    <p className="text-blue-100 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
                        Akses data pendidikan tinggi secara real-time. Cari Mahasiswa, Dosen, dan Kampus di seluruh Indonesia.
                    </p>
                </div>
            </div>

            {/* Main Content - Strict 3 Column Grid */}
            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-10 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Kolom 1: Mahasiswa */}
                    <SearchColumn
                        title="Cari Mahasiswa"
                        type="mahasiswa"
                        icon={User}
                        placeholder="Nama Lengkap / NIM"
                        colorClass="text-blue-600"
                        onSelect={(type, id, initialData) => setSelectedDetail({ type, id, initialData })}
                    />

                    {/* Kolom 2: Dosen */}
                    <SearchColumn
                        title="Cari Dosen"
                        type="dosen"
                        icon={Users}
                        placeholder="Nama Lengkap / NIDN"
                        colorClass="text-purple-600"
                        onSelect={(type, id, initialData) => setSelectedDetail({ type, id, initialData })}
                    />

                    {/* Kolom 3: Universitas */}
                    <SearchColumn
                        title="Cari Kampus"
                        type="university"
                        icon={School}
                        placeholder="Nama Perguruan Tinggi"
                        colorClass="text-orange-600"
                        onSelect={(type, id, initialData) => setSelectedDetail({ type, id, initialData })}
                    />
                </div>

                {/* Footer Disclaimer */}
                <div className="mt-12 text-center border-t border-gray-100 dark:border-gray-800 pt-8 pb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Data disinkronisasi langsung dari server <span className="font-semibold text-gray-700 dark:text-gray-300">PDDIKTI Kemendikbudristek</span>.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Jika data tidak ditemukan, kemungkinan sedang terjadi gangguan pada server pusat PDDIKTI.
                    </p>
                </div>
            </main>

            {/* Detail Modal */}
            {selectedDetail && (
                <DetailModal
                    type={selectedDetail.type}
                    id={selectedDetail.id}
                    initialData={selectedDetail.initialData}
                    onClose={() => setSelectedDetail(null)}
                />
            )}
        </div>
    );
}
