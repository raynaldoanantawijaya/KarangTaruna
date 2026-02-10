/* eslint-disable @next/next/no-img-element */
import { Calendar, ChevronRight, Check, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Program Kerja Karang Taruna Asta Wira Dipta - Kegiatan Pemuda di Solo",
    description: "Daftar program kerja dan kegiatan Karang Taruna Asta Wira Dipta Kelurahan Mojo, Surakarta. Pelatihan, aksi sosial, lingkungan hidup, dan agenda pemuda Solo.",
    keywords: [
        "program kerja karang taruna", "kegiatan karang taruna", "agenda pemuda solo",
        "pelatihan pemuda", "aksi sosial solo", "donor darah solo", "kerja bakti mojo",
        "kegiatan sosial surakarta", "pemberdayaan pemuda", "karang taruna aktif",
        "sahur on the road solo", "jumat berkah", "bank sampah mojo"
    ],
    openGraph: {
        title: "Program Kerja Karang Taruna Asta Wira Dipta - Solo",
        description: "Daftar kegiatan dan program unggulan Karang Taruna di Kelurahan Mojo, Pasar Kliwon, Surakarta.",
        type: "website",
        url: "https://astawiradipta.my.id/program-kerja",
    },
};

export default function ProgramKerja() {
    return (
        <div className="w-full">
            {/* Header */}
            <div className="relative overflow-hidden transition-colors duration-500 min-h-[180px] sm:min-h-[220px] md:min-h-[280px] flex flex-col justify-start pt-10 sm:pt-14 md:pt-20 pb-6 sm:pb-8 md:pb-12">
                {/* Texture removed as requested for pure CSS styling */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
                        Program <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-yellow-100">Kerja</span>
                    </h1>
                    <p className="text-white/90 dark:text-gray-300 text-sm md:text-base max-w-2xl mx-auto transition-colors">
                        Rencana dan realisasi kegiatan nyata Karang Taruna untuk kemajuan bersama.
                    </p>
                </div>
                {/* Wave Divider Removed */}
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-20">

                {/* Featured Programs - Kegiatan Unggulan */}
                <section className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-8 md:p-12">
                    <div className="text-center mb-12">
                        <span className="text-primary font-semibold tracking-wider uppercase text-sm">Program & Kegiatan</span>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">Kegiatan Unggulan</h2>
                        <div className="w-24 h-1 bg-secondary mx-auto mt-4 rounded-full"></div>
                        <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
                            Berbagai inisiatif dan kegiatan nyata yang telah kami laksanakan untuk kesejahteraan sosial dan pemberdayaan masyarakat.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Item 1 - Program Pelatihan */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700 flex flex-col h-full">
                            <div className="relative h-56 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 group-hover:from-black/40 transition-colors"></div>
                                <img
                                    alt="Program Pelatihan"
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                    src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop"
                                />
                                <div className="absolute top-4 left-4 z-20">
                                    <span className="bg-secondary text-primary-dark text-xs font-bold px-3 py-1 rounded-full shadow-md">Pendidikan</span>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-grow relative">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors mt-2">Program Pelatihan</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-grow">
                                    Pelatihan keterampilan kerja dan pengembangan potensi diri bagi pemuda untuk meningkatkan daya saing di dunia kerja.
                                </p>
                            </div>
                        </div>

                        {/* Item 2 - Sahur on the Road */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700 flex flex-col h-full">
                            <div className="relative h-56 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 group-hover:from-black/40 transition-colors"></div>
                                <img
                                    alt="Sahur on the Road"
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                    src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop"
                                />
                                <div className="absolute top-4 left-4 z-20">
                                    <span className="bg-secondary text-primary-dark text-xs font-bold px-3 py-1 rounded-full shadow-md">Sosial</span>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-grow relative">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors mt-2">Sahur on the Road</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-grow">
                                    Kegiatan sedekah makanan sahur bagi masyarakat yang membutuhkan selama bulan Ramadhan sebagai bentuk kepedulian sosial.
                                </p>
                            </div>
                        </div>

                        {/* Item 3 - Sosialisasi */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700 flex flex-col h-full">
                            <div className="relative h-56 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 group-hover:from-black/40 transition-colors"></div>
                                <img
                                    alt="Sosialisasi"
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                    src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop"
                                />
                                <div className="absolute top-4 left-4 z-20">
                                    <span className="bg-secondary text-primary-dark text-xs font-bold px-3 py-1 rounded-full shadow-md">Edukasi</span>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-grow relative">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors mt-2">Sosialisasi</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-grow">
                                    Kegiatan penyuluhan dan edukasi kepada masyarakat mengenai berbagai program pemerintah dan informasi penting lainnya.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Programs */}
                <section>
                    <div className="text-center mb-12">
                        <span className="text-primary font-semibold tracking-wider uppercase text-sm">Fokus Utama</span>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">Bidang Program</h2>
                        <div className="w-24 h-1 bg-secondary mx-auto mt-4 rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="bg-gray-900 dark:bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700">
                            <div className="h-3 bg-blue-500"></div>
                            <div className="p-8">
                                <div className="w-14 h-14 bg-blue-900/30 dark:bg-blue-100 rounded-lg flex items-center justify-center text-blue-400 dark:text-blue-600 mb-6">
                                    {/* Icon placeholder could go here, using generic layout */}
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-white dark:text-gray-900 mb-4">Pendidikan & Pelatihan</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start text-sm text-gray-300 dark:text-gray-600">
                                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                        <span>Kursus Bahasa Inggris Gratis</span>
                                    </li>
                                    <li className="flex items-start text-sm text-gray-300 dark:text-gray-600">
                                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                        <span>Workshop Digital Marketing</span>
                                    </li>
                                    <li className="flex items-start text-sm text-gray-300 dark:text-gray-600">
                                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                        <span>Bimbingan Belajar Anak Sekolah</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-gray-900 dark:bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700">
                            <div className="h-3 bg-red-500"></div>
                            <div className="p-8">
                                <div className="w-14 h-14 bg-red-900/30 dark:bg-red-100 rounded-lg flex items-center justify-center text-red-400 dark:text-red-600 mb-6">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-white dark:text-gray-900 mb-4">Sosial & Kemanusiaan</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start text-sm text-gray-300 dark:text-gray-600">
                                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                        <span>Jumat Berkah Berbagi</span>
                                    </li>
                                    <li className="flex items-start text-sm text-gray-300 dark:text-gray-600">
                                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                        <span>Donor Darah Rutin</span>
                                    </li>
                                    <li className="flex items-start text-sm text-gray-300 dark:text-gray-600">
                                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                        <span>Tanggap Bencana Alam</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-gray-900 dark:bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700">
                            <div className="h-3 bg-green-500"></div>
                            <div className="p-8">
                                <div className="w-14 h-14 bg-green-900/30 dark:bg-green-100 rounded-lg flex items-center justify-center text-green-400 dark:text-green-600 mb-6">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-white dark:text-gray-900 mb-4">Lingkungan Hidup</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start text-sm text-gray-300 dark:text-gray-600">
                                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                        <span>Kerja Bakti Minggu Bersih</span>
                                    </li>
                                    <li className="flex items-start text-sm text-gray-300 dark:text-gray-600">
                                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                        <span>Bank Sampah Unit RW</span>
                                    </li>
                                    <li className="flex items-start text-sm text-gray-300 dark:text-gray-600">
                                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                        <span>Penanaman Apotek Hidup</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Timeline Agenda */}
                <section className="bg-gray-900 dark:bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
                        <div>
                            <span className="text-primary font-semibold tracking-wider uppercase text-sm">Jadwal Kegiatan</span>
                            <h2 className="text-3xl font-bold text-white dark:text-gray-900 mt-1">Agenda Mendatang</h2>
                        </div>
                        <button className="hidden md:inline-flex items-center text-primary font-semibold hover:text-primary-dark mt-4 md:mt-0">
                            Lihat Kalender Penuh <ChevronRight className="h-5 w-5 ml-1" />
                        </button>
                    </div>

                    <div className="relative border-l-2 border-white dark:border-gray-900 ml-3 md:ml-6 space-y-12">
                        {/* Event 1 */}
                        <div className="relative pl-8 md:pl-12">
                            <span className="absolute -left-[11px] top-0 bg-gray-900 dark:bg-white border-2 border-primary w-5 h-5 rounded-full"></span>
                            <div className="flex flex-col sm:flex-row sm:items-center mb-2">
                                <span className="text-sm font-bold text-primary mb-1 sm:mb-0 sm:mr-4 bg-primary/20 bg-opacity-20 px-3 py-1 rounded-full">10 Des 2023</span>
                                <h3 className="text-xl font-bold text-white dark:text-gray-900">Rapat Pleno Akhir Tahun</h3>
                            </div>
                            <div className="flex items-center text-gray-400 dark:text-gray-500 text-sm mb-3">
                                <Clock className="h-4 w-4 mr-1" /> 19:30 - Selesai
                                <span className="mx-2">•</span>
                                <span>Sekretariat RW 05</span>
                            </div>
                            <p className="text-gray-300 dark:text-gray-600">
                                Evaluasi laporan pertanggungjawaban kegiatan tahun 2023 dan penyusunan rancangan anggaran belanja organisasi tahun 2024.
                            </p>
                        </div>

                        {/* Event 2 */}
                        <div className="relative pl-8 md:pl-12">
                            <span className="absolute -left-[11px] top-0 bg-gray-900 dark:bg-white border-2 border-secondary w-5 h-5 rounded-full"></span>
                            <div className="flex flex-col sm:flex-row sm:items-center mb-2">
                                <span className="text-sm font-bold text-yellow-500 dark:text-yellow-600 mb-1 sm:mb-0 sm:mr-4 bg-secondary/20 px-3 py-1 rounded-full">17 Des 2023</span>
                                <h3 className="text-xl font-bold text-white dark:text-gray-900">Peringatan Hari Ibu</h3>
                            </div>
                            <div className="flex items-center text-gray-400 dark:text-gray-500 text-sm mb-3">
                                <Clock className="h-4 w-4 mr-1" /> 08:00 - 12:00
                                <span className="mx-2">•</span>
                                <span>Lapangan Bulutangkis RW 05</span>
                            </div>
                            <p className="text-gray-300 dark:text-gray-600">
                                Lomba memasak dan senam sehat bersama ibu-ibu PKK dan warga lingkungan.
                            </p>
                        </div>

                        {/* Event 3 */}
                        <div className="relative pl-8 md:pl-12">
                            <span className="absolute -left-[11px] top-0 bg-gray-900 dark:bg-white border-2 border-gray-600 dark:border-gray-400 w-5 h-5 rounded-full"></span>
                            <div className="flex flex-col sm:flex-row sm:items-center mb-2">
                                <span className="text-sm font-bold text-gray-400 dark:text-gray-600 mb-1 sm:mb-0 sm:mr-4 bg-gray-800 dark:bg-gray-200 px-3 py-1 rounded-full">31 Des 2023</span>
                                <h3 className="text-xl font-bold text-white dark:text-gray-900">Malam Keakraban Tahun Baru</h3>
                            </div>
                            <div className="flex items-center text-gray-400 dark:text-gray-500 text-sm mb-3">
                                <Clock className="h-4 w-4 mr-1" /> 20:00 - Selesai
                                <span className="mx-2">•</span>
                                <span>Area Parkir RT 02</span>
                            </div>
                            <p className="text-gray-300 dark:text-gray-600">
                                Acara bakar jagung dan pentas seni pemuda untuk menyambut tahun baru 2024.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <button className="inline-flex items-center text-primary font-semibold hover:text-primary-dark">
                            Lihat Kalender Penuh <ChevronRight className="h-5 w-5 ml-1" />
                        </button>
                    </div>
                </section>

                {/* Documentation Gallery */}
                <section>
                    <div className="text-center mb-12">
                        <span className="text-secondary font-semibold tracking-wider uppercase text-sm">Memories</span>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">Galeri Dokumentasi</h2>
                        <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
                        <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
                            Momen kebersamaan dan aksi nyata pemuda dalam membangun lingkungan.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {/* Item 1 - Makrab (Left) */}
                        <div className="relative rounded-2xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all h-[300px] md:h-[400px]">
                            <img
                                src="/images/galeri/makrab.webp"
                                alt="Kegiatan Outbound & Makrab"
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 flex items-end p-8">
                                <div>
                                    <span className="bg-secondary text-gray-900 text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block shadow-sm">Rekreasi</span>
                                    <h3 className="text-white font-bold text-2xl mb-1">Outbound & Makrab</h3>
                                    <p className="text-gray-300 text-sm">Mempererat tali persaudaraan antar anggota Karang Taruna.</p>
                                </div>
                            </div>
                        </div>

                        {/* Item 2 - Sosialisasi (Right) */}
                        <div className="relative rounded-2xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all h-[300px] md:h-[400px]">
                            <img
                                src="/images/galeri/sosialisasi.webp"
                                alt="Kegiatan Sosialisasi Hukum Kontrak"
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 flex items-end p-8">
                                <div>
                                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block shadow-sm">Edukasi</span>
                                    <h3 className="text-white font-bold text-2xl mb-1">Sosialisasi Hukum Kontrak</h3>
                                    <p className="text-gray-300 text-sm">Menambah wawasan hukum bagi masyarakat dan pemuda.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
