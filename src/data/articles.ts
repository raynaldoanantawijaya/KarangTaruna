
export interface NewsDetail {
    title: string;
    image: string;
    body: string | string[]; // Paragraphs array OR HTML string
    date: string;
    author: string;
    source?: string;
}

// Dictionary of Internal Static Articles for SEO
export const INTERNAL_ARTICLES: Record<string, NewsDetail> = {
    "internal-profil-mojo": {
        title: "Mengenal Lebih Dekat Karang Taruna Asta Wira Dipta Kelurahan Mojo, Surakarta",
        image: "/visi-misi.webp",
        date: new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        author: "Admin Asta Wira Dipta",
        body: `
            <div class="space-y-6 text-gray-800 dark:text-gray-200 text-justify">
                <p class="lead text-lg font-medium"><strong>Karang Taruna Asta Wira Dipta</strong> adalah organisasi kepemudaan resmi yang berkedudukan di <strong>Kelurahan Mojo, Kecamatan Pasar Kliwon, Kota Surakarta (Solo)</strong>. Sebagai wadah pengembangan generasi muda, kami berkomitmen untuk menciptakan <strong>pemuda Solo</strong> yang berkarya, berdaya, dan memiliki kepedulian sosial tinggi.</p>
                
                <h3 class="text-2xl font-bold mt-8 mb-4">Mengenal Lebih Dalam Karang Taruna Mojo</h3>
                <p>
                    Sering dicari dengan kata kunci <strong>Karang Taruna Mojo</strong> atau <strong>Karangtaruna Mojo</strong>, organisasi kami merupakan ujung tombak pemberdayaan pemuda di tingkat kelurahan. 
                    Sebagai bagian integral dari <strong>Karang Taruna Surakarta</strong>, Asta Wira Dipta hadir untuk menjawab tantangan sosial yang ada di wilayah <strong>Pasar Kliwon</strong> dan sekitarnya. 
                    Nama "Asta Wira Dipta" sendiri mencerminkan semangat kepahlawanan dan cahaya yang menyinari, sebuah filosofi yang kami pegang teguh dalam setiap kegiatan <strong>organisasi kepemudaan Solo</strong> ini.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Sejarah Panjang Pengabdian di Kelurahan Mojo</h3>
                <p>
                    Perjalanan <strong>Karang Taruna Asta Wira Dipta</strong> tidak bisa dilepaskan dari sejarah perkembangan <strong>Kelurahan Mojo</strong> itu sendiri. Sejak era 90-an, bibit-bibit pergerakan pemuda di wilayah selatan <strong>Kota Surakarta</strong> ini sudah mulai tumbuh. Namun, revitalisasi besar-besaran terjadi dalam satu dekade terakhir, seiring dengan pembanungan infrastruktur di wilayah <strong>Pasar Kliwon</strong>.
                    Transformasi wilayah Mojo yang kini semakin modern menuntut adaptasi dari organisasi kepemudaan. Kami berevolusi dari sekadar kumpulan remaja kampung menjadi organisasi yang terstruktur, modern, dan melek digital, siap menyongsong era <strong>Solo Smart City</strong>.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Struktur Divisi dan Fokus Gerakan</h3>
                <p>
                    Untuk menjalankan roda organisasi secara efektif, <strong>Asta Wira Dipta Mojo</strong> terbagi menjadi beberapa divisi strategis yang masing-masing memiliki fokus kerja spesifik:
                </p>
                <ul class="list-disc pl-5 space-y-2 my-4">
                    <li><strong>Divisi Hubungan Masyarakat (Humas):</strong> Bertugas mengelola media sosial, website, dan publikasi kegiatan agar diketahui oleh masyarakat luas <strong>Surakarta</strong>.</li>
                    <li><strong>Divisi Lingkungan Hidup:</strong> Fokus pada isu kebersihan lingkungan, bank sampah, dan penghijauan di tepi <strong>Sungai Bengawan Solo</strong> yang melintasi wilayah kami.</li>
                    <li><strong>Divisi Kerohanian:</strong> Mengingat mayoritas warga <strong>Pasar Kliwon</strong> yang religius, divisi ini rutin mengadakan kajian dan peringatan hari besar Islam (PHBI).</li>
                    <li><strong>Divisi Olahraga dan Minat Bakat:</strong> Mewadahi hobi pemuda mulai dari sepak bola, bulu tangkis, hingga <em>e-sports</em> yang sedang tren di kalangan <strong>milenial Solo</strong>.</li>
                    <li><strong>Divisi Pemberdayaan Perempuan:</strong> Menggerakkan srikandi-srikandi muda Mojo untuk aktif dalam kegiatan PKK milenial dan pelatihan keterampilan.</li>
                </ul>

                <h3 class="text-2xl font-bold mt-8 mb-4">Peran Karang Taruna dalam Ekosistem Pemuda Solo Raya</h3>
                <p>
                    Sebagai bagian integral dari jaringan <strong>Karang Taruna Solo Raya</strong>, keberadaan Asta Wira Dipta di <strong>Kelurahan Mojo</strong> tidak berdiri sendiri. Kami aktif berkoordinasi dengan Karang Taruna tingkat kecamatan (<strong>Karang Taruna Pasar Kliwon</strong>) dan tingkat kota (<strong>Karang Taruna Kota Surakarta</strong>). 
                    Sinergi antar tingkatan ini memastikan bahwa setiap program yang digulirkan memiliki dampak yang lebih luas bagi masyarakat <strong>Solo</strong> dan sekitarnya.
                </p>
                <p>
                    Di tingkat <strong>Jawa Tengah</strong>, Asta Wira Dipta juga turut berkontribusi dalam forum-forum kepemudaan regional. Kami bangga menjadi representasi suara <strong>pemuda Surakarta</strong> dalam berbagai diskusi pembangunan daerah. 
                    Kiprah ini menjadikan kami salah satu <strong>organisasi kepemudaan</strong> yang diperhitungkan di kancah provinsi.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Destinasi Wisata dan Potensi Lokal di Sekitar Mojo</h3>
                <p>
                    <strong>Kelurahan Mojo</strong> memiliki lokasi strategis yang berdekatan dengan berbagai destinasi wisata dan pusat ekonomi <strong>Kota Solo</strong>. Di sebelah utara, terdapat kawasan <strong>Keraton Kasunanan Surakarta</strong> dan <strong>Pasar Klewer</strong> yang legendaris. 
                    Di sebelah timur, mengalir <strong>Sungai Bengawan Solo</strong> yang menjadi ikon historis Jawa. Pemuda <strong>Karang Taruna Mojo</strong> seringkali dilibatkan dalam kegiatan pelestarian budaya dan lingkungan di kawasan ini.
                </p>
                <p>
                    Selain itu, akses menuju <strong>Solo Baru</strong> dan kawasan industri <strong>Sukoharjo</strong> juga sangat mudah dari wilayah kami. Hal ini membuka peluang kerjasama lintas kabupaten antara <strong>Karang Taruna Surakarta</strong> dengan <strong>Karang Taruna Sukoharjo</strong>. 
                    Banyak anggota kami yang bekerja atau menempuh pendidikan di berbagai penjuru <strong>Solo Raya</strong>, termasuk di <strong>UNS (Universitas Sebelas Maret)</strong>, <strong>UMS (Universitas Muhammadiyah Surakarta)</strong>, dan <strong>ISI Surakarta</strong>.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Program Unggulan: Karang Taruna Digital dan UMKM Binaan</h3>
                <p>
                    Menjawab tantangan era digital, <strong>Karang Taruna Asta Wira Dipta</strong> menggagas program <em>Karang Taruna Digital</em>. Program ini melatih anggota dan warga <strong>Mojo</strong> untuk melek teknologi, mulai dari penggunaan media sosial untuk promosi UMKM hingga pelatihan <em>e-commerce</em>. 
                    Tujuannya adalah menciptakan <strong>pemuda Solo</strong> yang tidak hanya kreatif tetapi juga produktif secara ekonomi.
                </p>
                <p>
                    Kami juga memiliki puluhan UMKM binaan yang tersebar di seluruh <strong>Kelurahan Mojo</strong> dan sekitarnya. Produk-produk lokal seperti batik tulis, kuliner khas <strong>Solo</strong> (seperti serabi, tengkleng, dan nasi liwet), hingga kerajinan tangan dipasarkan melalui berbagai platform online. 
                    Ini adalah bukti nyata bahwa <strong>organisasi kepemudaan Surakarta</strong> mampu menjadi motor penggerak ekonomi kreatif.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Kepedulian Sosial: Dari Bantuan Sembako hingga Beasiswa</h3>
                <p>
                    Aspek kesejahteraan sosial menjadi salah satu pilar utama <strong>Karang Taruna Mojo</strong>. Setiap tahun, kami rutin mengadakan program penyaluran bantuan sembako bagi warga kurang mampu di <strong>Pasar Kliwon</strong>. 
                    Tidak hanya itu, kami juga menggalang dana beasiswa bagi pelajar berprestasi dari keluarga pra-sejahtera di <strong>Surakarta</strong>.
                </p>
                <p>
                    Program kesehatan seperti donor darah massal bekerjasama dengan PMI <strong>Kota Solo</strong>, posyandu remaja, dan penyuluhan kesehatan reproduksi juga menjadi agenda rutin. 
                    Kami percaya bahwa <strong>pemuda Solo</strong> yang sehat adalah aset bangsa yang tak ternilai.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Menuju Solo Kota Layak Pemuda</h3>
                <p>
                    Visi besar <strong>Karang Taruna Asta Wira Dipta</strong> adalah turut mewujudkan <strong>Solo</strong> sebagai Kota Layak Pemuda. Hal ini sejalan dengan program pemerintah <strong>Kota Surakarta</strong> dalam menciptakan ekosistem yang kondusif bagi tumbuh kembang generasi muda. 
                    Kami aktif memberikan masukan kepada pemerintah melalui Musrenbang dan forum-forum publik lainnya.
                </p>
                <p>
                    Dengan dukungan penuh dari Lurah Mojo, Camat <strong>Pasar Kliwon</strong>, dan seluruh stakeholder terkait, kami optimis bahwa cita-cita ini dapat terwujud. 
                    <strong>Karang Taruna Surakarta</strong> harus menjadi garda terdepan dalam membangun kota yang ramah bagi semua kalangan usia, terutama pemuda.
                </p>
            </div>
        `
    },
    "internal-profil-kota-surakarta": {
        title: "Surakarta: Kota Budaya yang Ramah Pemuda",
        image: "/surakarta.webp",
        date: new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        author: "Admin Asta Wira Dipta",
        body: `
            <div class="space-y-6 text-gray-800 dark:text-gray-200 text-justify">
                <p class="lead text-lg font-medium"><strong>Surakarta</strong>, atau yang lebih dikenal dengan <strong>Solo</strong>, adalah kota yang memiliki sejarah panjang sebagai pusat kebudayaan Jawa. Namun, di balik nuansa tradisionalnya, Solo kini bertransformasi menjadi kota modern yang dinamis dan ramah bagi generasi muda (<strong>Youth Friendly City</strong>).</p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Pusat Kreativitas Pemuda</h3>
                <p>
                    Pemerintah <strong>Kota Surakarta</strong>, melalui berbagai inisiatifnya, telah menyediakan ruang-ruang kreatif bagi anak muda. Mulai dari <em>Solo Technopark</em> sebagai inkubator teknologi, hingga revitalisasi <em>Lokananta</em> sebagai hub musik dan seni.
                    <strong>Karang Taruna Surakarta</strong> mengambil peran aktif dalam memanfaatkan fasilitas-fasilitas ini untuk kegiatan positif.
                </p>
            </div>
        `
    },
    "internal-sejarah-kelurahan-mojo": {
        title: "Melacak Jejak Sejarah Kelurahan Mojo, Pasar Kliwon",
        image: "/img_news/sejarah-mojo.webp",
        date: new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        author: "Tim Riset Sejarah Mojo",
        body: `
            <div class="space-y-6 text-gray-800 dark:text-gray-200 text-justify">
                <p class="lead text-lg font-medium"><strong>Kelurahan Mojo</strong>, yang terletak di bagian selatan <strong>Kecamatan Pasar Kliwon</strong>, memiliki sejarah unik yang berkelindan dengan perkembangan <strong>Kota Surakarta</strong>. Dahulu dikenal sebagai kawasan pinggiran, kini Mojo telah menjelma menjadi kawasan hunian yang tertata.</p>
                <p>Sejarah mencatat bahwa wilayah ini dulunya adalah tepian Bengawan Solo yang subur...</p>
            </div>
        `
    },
    "internal-profil-pasar-kliwon": {
        title: "Kecamatan Pasar Kliwon: Jantung Multikultural Solo",
        image: "/img_news/pasar-kliwon.webp",
        date: new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        author: "Admin Asta Wira Dipta",
        body: `
            <div class="space-y-6 text-gray-800 dark:text-gray-200 text-justify">
                <p class="lead text-lg font-medium"><strong>Kecamatan Pasar Kliwon</strong> bukan hanya sekadar wilayah administratif di <strong>Surakarta</strong>. Ia adalah simbol keberagaman dan harmoni. Di sini, berbagai etnis dan budaya hidup berdampingan dengan damai, menciptakan mozaik sosial yang indah.</p>
                <p>Sebagai Karang Taruna yang berada di wilayah ini, <string>Asta Wira Dipta</string> senantiasa menjunjung tinggi nilai-nilai toleransi dan gotong royong...</p>
            </div>
        `
    }
};
