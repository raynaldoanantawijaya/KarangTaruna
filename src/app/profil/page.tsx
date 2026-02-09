/* eslint-disable @next/next/no-img-element */
import { History, Gavel, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profil Karang Taruna Asta Wira Dipta - Visi, Misi & Struktur Organisasi | Solo",
    description: "Profil lengkap Karang Taruna Asta Wira Dipta Kelurahan Mojo, Surakarta. Visi, misi, struktur organisasi, sejarah, dan arti lambang. Organisasi kepemudaan terbaik di Solo.",
    keywords: [
        "profil karang taruna", "karang taruna mojo", "asta wira dipta",
        "struktur organisasi karang taruna", "visi misi karang taruna",
        "sejarah karang taruna", "karang taruna solo", "karang taruna surakarta",
        "organisasi pemuda solo", "kepemudaan mojo", "pasar kliwon"
    ],
    openGraph: {
        title: "Profil Karang Taruna Asta Wira Dipta - Kelurahan Mojo, Surakarta",
        description: "Visi, misi, struktur organisasi, dan sejarah Karang Taruna Asta Wira Dipta. Organisasi kepemudaan di Kelurahan Mojo, Pasar Kliwon, Solo.",
        type: "website",
        url: "https://astawiradipta.my.id/profil",
    },
};

const ANONYMOUS_IMG = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

export default function Profil() {
    return (
        <div className="w-full">
            {/* Header */}
            <div className="relative overflow-hidden transition-colors duration-500 min-h-[180px] sm:min-h-[220px] md:min-h-[280px] flex flex-col justify-start pt-10 sm:pt-14 md:pt-20 pb-6 sm:pb-8 md:pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
                        Profil <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-yellow-100">Organisasi</span>
                    </h1>
                    <p className="text-white/90 dark:text-gray-300 text-sm md:text-base max-w-2xl mx-auto transition-colors">
                        Asta Wira Dipta. Mengenal lebih dekat struktur, sejarah, dan nilai-nilai Karang Taruna kami.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">
                {/* Structure Section - UPDATED ROLE TEXTS */}
                <section className="w-full pb-4 sm:pb-10 md:pb-20 flex flex-col items-center overflow-hidden">

                    {/* Title - outside scaling container to stay normal size */}
                    <div className="text-center mb-4 sm:mb-8 md:mb-12 w-full">
                        <span className="text-primary font-semibold tracking-wider uppercase text-xs sm:text-sm">Struktur Organisasi</span>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-2">Dewan Pengurus</h2>
                        <div className="w-16 sm:w-20 md:w-24 h-1 bg-secondary mx-auto mt-3 sm:mt-4 rounded-full"></div>
                    </div>

                    {/* Responsive scaling container with height wrapper */}
                    <div className="h-[420px] sm:h-[600px] md:h-[840px] lg:h-[1200px] overflow-hidden">
                        <div className="transform scale-[0.35] sm:scale-[0.5] md:scale-[0.7] lg:scale-100 origin-top">
                            {/* Height 1200px */}
                            <div className="relative w-[1200px] h-[1200px] mx-auto bg-transparent shrink-0">

                                {/* 
                           SVG LAYER (Z=0)
                           Coordinates:
                           Lvl 1 Bridge: 300.
                           Lvl 2 Crossbar: 480. Drops to 540.
                           Lvl 3 Crossbar: 840. Drops to 880.
                         */}
                                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" viewBox="0 0 1200 1200">
                                    <g stroke="currentColor" strokeWidth="2" className="text-gray-900 dark:text-gray-300">

                                        {/* 1. CENTRAL SPINE */}
                                        {/* From Lvl 1 (y=300) to Lvl 3 (y=840) */}
                                        <line x1="600" y1="300" x2="600" y2="840" />


                                        {/* 2. LEVEL 1: KETUA & WAKIL (y=300) */}
                                        <line x1="460" y1="300" x2="740" y2="300" />


                                        {/* 3. LEVEL 2: SEK & BEND (y=480 Crossbar) */}
                                        <line x1="300" y1="480" x2="900" y2="480" />

                                        {/* Vertical Drops to Sub-Groups (to y=520) */}
                                        <line x1="300" y1="480" x2="300" y2="520" />
                                        <line x1="900" y1="480" x2="900" y2="520" />

                                        {/* Level 2 Sub-Brackets (y=520) */}
                                        <line x1="200" y1="520" x2="400" y2="520" />
                                        {/* Drops to cards (to y=540 - strictly connecting to card top) */}
                                        <line x1="200" y1="520" x2="200" y2="540" />
                                        <line x1="400" y1="520" x2="400" y2="540" />

                                        <line x1="800" y1="520" x2="1000" y2="520" />
                                        {/* Drops to cards */}
                                        <line x1="800" y1="520" x2="800" y2="540" />
                                        <line x1="1000" y1="520" x2="1000" y2="540" />


                                        {/* 4. LEVEL 3: BIDANG (y=840 Crossbar) */}
                                        <line x1="200" y1="840" x2="1000" y2="840" />

                                        {/* Drops to cards (to y=880) */}
                                        <line x1="200" y1="840" x2="200" y2="880" />
                                        <line x1="400" y1="840" x2="400" y2="880" />
                                        <line x1="600" y1="840" x2="600" y2="880" />
                                        <line x1="800" y1="840" x2="800" y2="880" />
                                        <line x1="1000" y1="840" x2="1000" y2="880" />

                                    </g>
                                </svg>

                                {/* --- CONTENT LAYER (Z=10) --- */}

                                {/* ROW 1: KETUA & WAKIL (Top y=180) */}
                                <div className="absolute top-[180px] left-[340px] w-[240px] bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 border-primary p-6 text-center z-10">
                                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700 mb-4 bg-gray-200">
                                        <img src={ANONYMOUS_IMG} alt="Sonya Wibisono" className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sonya Wibisono</h3>
                                    <p className="text-primary font-medium text-sm">Ketua</p>
                                </div>

                                <div className="absolute top-[180px] left-[620px] w-[240px] bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 border-primary p-6 text-center z-10">
                                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700 mb-4 bg-gray-200">
                                        <img src={ANONYMOUS_IMG} alt="Rio Saputra" className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Rio Saputra</h3>
                                    <p className="text-primary font-medium text-sm">Wakil Ketua</p>
                                </div>


                                {/* ROW 2: SEK & BEND (Top y=540) */}

                                {/* Sek 1 */}
                                <div className="absolute top-[540px] left-[120px] w-[160px] bg-white dark:bg-gray-800 rounded-xl shadow-md border-t-4 border-secondary p-4 text-center z-10">
                                    <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-700 mb-3 bg-gray-200">
                                        <img src={ANONYMOUS_IMG} alt="Fira" className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Fira</h3>
                                    <p className="text-primary text-[10px] mt-1 font-semibold uppercase">Sekretaris 1</p>
                                </div>

                                {/* Sek 2 */}
                                <div className="absolute top-[540px] left-[320px] w-[160px] bg-white dark:bg-gray-800 rounded-xl shadow-md border-t-4 border-secondary p-4 text-center z-10">
                                    <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-700 mb-3 bg-gray-200">
                                        <img src={ANONYMOUS_IMG} alt="Raynaldo" className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Raynaldo A.W.</h3>
                                    <p className="text-primary text-[10px] mt-1 font-semibold uppercase">Sekretaris 2</p>
                                </div>

                                {/* Bend 1 */}
                                <div className="absolute top-[540px] left-[720px] w-[160px] bg-white dark:bg-gray-800 rounded-xl shadow-md border-t-4 border-secondary p-4 text-center z-10">
                                    <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-700 mb-3 bg-gray-200">
                                        <img src={ANONYMOUS_IMG} alt="Vadilla" className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Vadilla</h3>
                                    <p className="text-primary text-[10px] mt-1 font-semibold uppercase">Bendahara 1</p>
                                </div>

                                {/* Bend 2 */}
                                <div className="absolute top-[540px] left-[920px] w-[160px] bg-white dark:bg-gray-800 rounded-xl shadow-md border-t-4 border-secondary p-4 text-center z-10">
                                    <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-700 mb-3 bg-gray-200">
                                        <img src={ANONYMOUS_IMG} alt="Diffa" className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Diffa</h3>
                                    <p className="text-primary text-[10px] mt-1 font-semibold uppercase">Bendahara 2</p>
                                </div>


                                {/* ROW 3: BIDANG COORDINATORS (Top y=880) */}

                                {/* 1 */}
                                <div className="absolute top-[880px] left-[110px] w-[180px] h-[220px] bg-white dark:bg-gray-800 rounded-xl shadow-md border-t-4 border-gray-500 p-4 text-center z-10 flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-700 mb-3 bg-gray-200">
                                        <img src={ANONYMOUS_IMG} alt="Alfian Aji" className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-md font-bold text-gray-900 dark:text-white leading-tight mb-2">Alfian Aji</h3>
                                    <p className="text-gray-500 text-[10px] leading-snug font-medium uppercase">Bidang Pengembangan Sumber Daya Manusia</p>
                                </div>

                                {/* 2 */}
                                <div className="absolute top-[880px] left-[310px] w-[180px] h-[220px] bg-white dark:bg-gray-800 rounded-xl shadow-md border-t-4 border-gray-500 p-4 text-center z-10 flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-700 mb-3 bg-gray-200">
                                        <img src={ANONYMOUS_IMG} alt="Nita" className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-md font-bold text-gray-900 dark:text-white leading-tight mb-2">Nita</h3>
                                    <p className="text-gray-500 text-[10px] leading-snug font-medium uppercase">Bidang Pengembangan Ekonomi Kreatif, Lingkungan Hidup Dan Pariwisata</p>
                                </div>

                                {/* 3 */}
                                <div className="absolute top-[880px] left-[510px] w-[180px] h-[220px] bg-white dark:bg-gray-800 rounded-xl shadow-md border-t-4 border-gray-500 p-4 text-center z-10 flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-700 mb-3 bg-gray-200">
                                        <img src={ANONYMOUS_IMG} alt="Putri" className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-md font-bold text-gray-900 dark:text-white leading-tight mb-2">Putri</h3>
                                    <p className="text-gray-500 text-[10px] leading-snug font-medium uppercase">Bidang Pengembangan Kegiatan Kerohanian Dan Pembinaan Mental</p>
                                </div>

                                {/* 4 */}
                                <div className="absolute top-[880px] left-[710px] w-[180px] h-[220px] bg-white dark:bg-gray-800 rounded-xl shadow-md border-t-4 border-gray-500 p-4 text-center z-10 flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-700 mb-3 bg-gray-200">
                                        <img src={ANONYMOUS_IMG} alt="Ahmad Sidiq" className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-md font-bold text-gray-900 dark:text-white leading-tight mb-2">Ahmad Sidiq</h3>
                                    <p className="text-gray-500 text-[10px] leading-snug font-medium uppercase">Bidang Pengembangan Kegiatan Olahraga Dan Seni Budaya</p>
                                </div>

                                {/* 5 */}
                                <div className="absolute top-[880px] left-[910px] w-[180px] h-[220px] bg-white dark:bg-gray-800 rounded-xl shadow-md border-t-4 border-gray-500 p-4 text-center z-10 flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-700 mb-3 bg-gray-200">
                                        <img src={ANONYMOUS_IMG} alt="Dani" className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-md font-bold text-gray-900 dark:text-white leading-tight mb-2">Dani</h3>
                                    <p className="text-gray-500 text-[10px] leading-snug font-medium uppercase">Bidang Hubungan Masyarakat Publikasi Dan Pengembangan Komunikasi</p>
                                </div>

                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    {/* History */}
                    <div className="bg-gray-900 dark:bg-white rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center mb-6">
                            <img src="/icon-sejarah.png" alt="Icon Sejarah" className="h-12 w-12 object-contain mr-4" />
                            <h2 className="text-2xl font-bold text-white dark:text-gray-900">Sejarah Singkat</h2>
                        </div>
                        <div className="prose dark:prose-invert max-w-none text-gray-300 dark:text-gray-600">
                            <p className="mb-4">
                                Karang Taruna lahir pada tanggal <strong>26 September 1960</strong> di Kampung Melayu, Jakarta. Kelahiran ini merupakan perwujudan semangat kepedulian generasi muda untuk turut mencegah dan menanggulangi masalah kesejahteraan sosial masyarakat, terutama yang dihadapi anak dan remaja di lingkungannya.
                            </p>
                            <p>
                                Nama Karang Taruna sendiri diambil dari bahasa Sansekerta; <em>Karang</em> yang berarti pekarangan, halaman, atau tempat, dan <em>Taruna</em> yang berarti remaja. Secara harfiah berarti tempat atau wadah pengembangan remaja.
                            </p>
                            <div className="mt-6 p-4 bg-gray-800 dark:bg-yellow-50 rounded-lg border-l-4 border-secondary">
                                <p className="text-sm font-medium italic text-gray-300 dark:text-gray-700">
                                    &quot;Karang Taruna adalah organisasi sosial kemasyarakatan sebagai wadah dan sarana pengembangan setiap anggota masyarakat yang tumbuh dan berkembang atas dasar kesadaran dan tanggung jawab sosial.&quot;
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Arti Lambang - Compact Grid */}
                    <div className="bg-gray-900 dark:bg-white rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center mb-6">
                            <img src="/logo.png" alt="Logo Karang Taruna" className="h-16 w-16 object-contain mr-4" />
                            <h2 className="text-2xl font-bold text-white dark:text-gray-900">Arti Lambang</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-gray-300 dark:text-gray-600 text-[13px] leading-snug">
                            <div className="flex gap-3">
                                <div className="min-w-3 h-3 mt-1 rounded-full bg-primary shrink-0"></div>
                                <div>
                                    <strong className="block text-white dark:text-gray-900 mb-0.5">Bunga Teratai</strong>
                                    Lambang kesucian, unsur kepribadian yang suci & tidak tercela.
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="min-w-3 h-3 mt-1 rounded-full bg-secondary shrink-0"></div>
                                <div>
                                    <strong className="block text-white dark:text-gray-900 mb-0.5">Empat Helai Daun</strong>
                                    Melambangkan keempat penjuru mata angin.
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="min-w-3 h-3 mt-1 rounded-full bg-primary shrink-0"></div>
                                <div>
                                    <strong className="block text-white dark:text-gray-900 mb-0.5">Tujuh Kelopak</strong>
                                    7 unsur kepribadian (Taat, Tanggap, Tangguh, Tandas, Tangkas, Terampil, Tulus).
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="min-w-3 h-3 mt-1 rounded-full bg-secondary shrink-0"></div>
                                <div>
                                    <strong className="block text-white dark:text-gray-900 mb-0.5">Pita</strong>
                                    "Asta Wira Dipta": Pejuang berkepribadian, berpengetahuan, terampil.
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="min-w-3 h-3 mt-1 rounded-full bg-primary shrink-0"></div>
                                <div>
                                    <strong className="block text-white dark:text-gray-900 mb-0.5">Lingkaran</strong>
                                    Ketahanan nasional sebagai tameng/perisai.
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="min-w-3 h-3 mt-1 rounded-full bg-white border border-gray-500 shrink-0"></div>
                                <div>
                                    <strong className="block text-white dark:text-gray-900 mb-0.5">Warna Putih</strong>
                                    Kesucian, tidak tercela/ternoda.
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="min-w-3 h-3 mt-1 rounded-full bg-red-600 shrink-0"></div>
                                <div>
                                    <strong className="block text-white dark:text-gray-900 mb-0.5">Warna Merah</strong>
                                    Keberanian, sabar, tenang, kendali diri.
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="min-w-3 h-3 mt-1 rounded-full bg-yellow-400 shrink-0"></div>
                                <div>
                                    <strong className="block text-white dark:text-gray-900 mb-0.5">Warna Kuning</strong>
                                    Keagungan dan keluhuran budi pekerti.
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
