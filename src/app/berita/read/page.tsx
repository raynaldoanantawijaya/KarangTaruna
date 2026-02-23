import { load } from 'cheerio';
import { Metadata } from 'next';
import { adminDb } from '@/lib/firebase-admin';

interface NewsDetail {
    title: string;
    image: string;
    body: string | string[]; // Paragraphs array OR HTML string
    date: string;
    author: string;
    source?: string;
    link?: string;
    time?: string;
}

import fs from 'fs/promises';
import path from 'path';

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

                <h3 class="text-2xl font-bold mt-8 mb-4">Jangkauan Wilayah: Dari Kampung Silir hingga Tepi Bengawan</h3>
                <p>
                    Wilayah kerja <strong>Karang Taruna Mojo</strong> mencakup area yang sangat luas dan beragam di sisi tenggara <strong>Kota Solo</strong>. Kami merangkul pemuda dari berbagai kampung di Kelurahan Mojo, mulai dari area pemukiman padat di tengah, kawasan eks-Silir yang kini telah bertransformasi, hingga wilayah di tepian historis <strong>Sungai Bengawan Solo</strong>.
                    Sinergi antar-RW di Mojo, mulai dari RW 01 hingga RW-RW lainnya, menjadi kekuatan utama kami. Kekompakan antar kampung ini menjadikan <strong>Asta Wira Dipta</strong> sebagai barometer kerukunan pemuda di <strong>Kecamatan Pasar Kliwon</strong>.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Agenda Tahunan yang Dinanti Masyarakat Solo</h3>
                <p>
                    Kami memiliki kalender kegiatan yang padat dan selalu dinanti oleh warga <strong>Mojo</strong> dan sekitarnya. Beberapa <em>event</em> besar yang rutin kami selenggarakan antara lain:
                </p>
                <ul class="list-disc pl-5 space-y-2 my-4">
                    <li><strong>Malam Tirakatan 17 Agustus:</strong> Peringatan HUT RI yang meriah dengan pentas seni pemuda lokal.</li>
                    <li><strong>Festival Hadrah dan Seni Islam:</strong> Mengingat Mojo adalah wilayah santri yang kental di <strong>Pasar Kliwon</strong>.</li>
                    <li><strong>Turnamen Olahraga Kampung:</strong> Ajang pencarian bakat atlet muda berbakat dari lorong-lorong kampung di <strong>Surakarta</strong>.</li>
                    <li><strong>Bazar UMKM Pemuda:</strong> Mendorong wirausaha muda untuk tampil memamerkan produk lokal <strong>khas Solo</strong>.</li>
                    <li><strong>Peringatan Sumpah Pemuda:</strong> Refleksi semangat kebangsaan bagi seluruh anggota <strong>Karang Taruna Surakarta</strong>.</li>
                    <li><strong>Buka Puasa Bersama (Bukber):</strong> Momen perekat silaturahmi antar anggota dan alumni di bulan Ramadhan.</li>
                </ul>

                <h3 class="text-2xl font-bold mt-8 mb-4">Pusat Informasi Kepemudaan Solo</h3>
                <p>
                    Website ini dirancang untuk menjadi pusat informasi bagi siapa saja yang ingin mengenal lebih jauh tentang kiprah <strong>pemuda Mojo</strong>. Kami melayani pertanyaan seputar struktur organisasi, agenda kegiatan, hingga cara bergabung menjadi anggota.
                    Tidak hanya untuk warga lokal, kami juga terbuka untuk kolaborasi dengan komunitas lain di <strong>Surakarta</strong> dan sekitarnya. <strong>Karang Taruna Solo</strong> harus bersatu untuk memajukan kota tercinta ini.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Terbuka untuk Kolaborasi dan Sinergi</h3>
                <p>
                    Kami membuka peluang seluas-luasnya bagi pihak luar untuk bekerjasama. Baik itu mahasiswa <strong>KKN UNS</strong>, <strong>KKN UMS</strong>, <strong>KKN ISI Surakarta</strong>, maupun institusi pendidikan lain yang ingin melakukan pengabdian masyarakat di <strong>Kelurahan Mojo</strong>.
                    Kami siap menjadi mitra lokal yang memfasilitasi program-program pemberdayaan. Begitu pula bagi pihak swasta atau sponsor yang ingin mendukung kegiatan kepemudaan di <strong>Solo</strong>, Asta Wira Dipta adalah mitra yang tepat, amanah, dan profesional.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">FAQ (Pertanyaan Seputar Karang Taruna Mojo)</h3>
                <div class="space-y-4">
                    <div>
                        <p class="font-bold">Dimana alamat sekretariat Karang Taruna Mojo?</p>
                        <p>Sekretariat kami berlokasi di Jl. Sungai Serang I No.313, Kelurahan Mojo, Pasar Kliwon, Surakarta. Lokasi strategis dekat dengan berbagai fasilitas publik di Solo bagian selatan. Mudah diakses dari arah Semanggi maupun Bekonang.</p>
                    </div>
                    <div>
                        <p class="font-bold">Apa saja kegiatan pemuda di Pasar Kliwon?</p>
                        <p>Kegiatan meliputi olahraga (futsal, voli, tenis meja), kesenian (hadrah, tari, teater), pengajian rutin, pelatihan wirausaha digital, dan aksi sosial kemasyarakatan seperti donor darah, vaksinasi, dan kerjabakti lingkungan.</p>
                    </div>
                    <div>
                        <p class="font-bold">Bagaimana cara bergabung dengan Karang Taruna Asta Wira Dipta?</p>
                        <p>Pemuda berusia 13-45 tahun yang berdomisili di Kelurahan Mojo dan memiliki KTP/KK setempat dapat langsung mendaftar ke sekretariat atau menghubungi pengurus Unit RW setempat. Tidak dipungut biaya pendaftaran. Kami menyambut dengan tangan terbuka.</p>
                    </div>
                    <div>
                        <p class="font-bold">Apakah Karang Taruna Mojo menerima kerjasama sponsorship?</p>
                        <p>Tentu saja. Kami sangat terbuka untuk kerjasama dengan brand atau instansi yang memiliki visi sejalan dalam memajukan potensi pemuda dan masyarakat Kota Surakarta.</p>
                    </div>
                </div>

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

                <h3 class="text-2xl font-bold mt-8 mb-4">Ajakan untuk Berpartisipasi</h3>
                <p>
                    Bagi Anda yang berdomisili di <strong>Kelurahan Mojo</strong>, <strong>Kecamatan Pasar Kliwon</strong>, atau wilayah <strong>Surakarta</strong> lainnya, kami mengajak untuk bergabung dan berpartisipasi aktif dalam setiap kegiatan <strong>Karang Taruna</strong>. 
                    Tidak perlu bakat khusus, yang terpenting adalah semangat untuk berkontribusi bagi lingkungan dan masyarakat.
                </p>
                <p>
                    Anda juga bisa mendukung kami dengan mengikuti akun media sosial resmi <strong>Karang Taruna Mojo</strong> di Instagram @karangtaruna_mojoska. 
                    Dengan menekan tombol <em>follow</em>, Anda sudah membantu menyebarluaskan informasi kegiatan positif <strong>pemuda Solo</strong> kepada khalayak yang lebih luas.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Testimoni Warga dan Mitra</h3>
                <p>
                    "Berkat bimbingan dari teman-teman <strong>Karang Taruna Mojo</strong>, usaha kripik tempe saya sekarang sudah bisa dikirim ke luar <strong>Solo</strong>," ungkap Bu Sari, salah satu pelaku UMKM binaan. 
                    Pengakuan serupa datang dari berbagai pihak, mulai dari tokoh masyarakat, aparat kelurahan, hingga mitra usaha.
                </p>
                <p>
                    Camat <strong>Pasar Kliwon</strong> juga pernah memberikan apresiasi khusus atas partisipasi aktif Asta Wira Dipta dalam program-program pemerintah. 
                    "Ini adalah contoh <strong>Karang Taruna</strong> yang ideal, aktif, kreatif, dan bermanfaat bagi masyarakat," ujarnya.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Hubungan dengan Tokoh dan Lembaga di Solo</h3>
                <p>
                    <strong>Karang Taruna Asta Wira Dipta</strong> memiliki relasi yang baik dengan berbagai tokoh dan lembaga di <strong>Kota Surakarta</strong>. 
                    Kami rutin berkoordinasi dengan LPMK (Lembaga Pemberdayaan Masyarakat Kelurahan) Mojo, PKK, RT/RW, hingga Forum Kerukunan Umat Beragama (FKUB) <strong>Solo</strong>.
                </p>
                <p>
                    Di level yang lebih tinggi, kami juga pernah beraudiensi dengan Dinas Sosial <strong>Kota Surakarta</strong>, Dinas Pemuda dan Olahraga, serta DPRD <strong>Solo</strong>. 
                    Kesempatan ini kami manfaatkan untuk menyuarakan aspirasi <strong>pemuda Pasar Kliwon</strong> dan mengusulkan program-program inovatif.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Prestasi yang Membanggakan</h3>
                <p>
                    Meskipun bukan tujuan utama, berbagai penghargaan telah diraih oleh anggota <strong>Karang Taruna Mojo</strong> baik secara individu maupun kolektif. 
                    Beberapa pencapaian meliputi juara lomba video kreatif tingkat <strong>Kota Solo</strong>, finalis inovasi sosial <strong>Jawa Tengah</strong>, dan penghargaan dari berbagai CSR perusahaan atas dedikasi sosial.
                </p>
                <p>
                    Prestasi-prestasi ini menjadi bukti bahwa <strong>organisasi kepemudaan Surakarta</strong> mampu bersaing dan memberikan kontribusi nyata. 
                    Kami terus berupaya meningkatkan kualitas diri agar nama <strong>Karang Taruna Surakarta</strong> semakin harum.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Rencana Masa Depan: Ekspansi dan Inovasi</h3>
                <p>
                    Ke depan, <strong>Karang Taruna Asta Wira Dipta</strong> berencana untuk memperluas jangkauan program hingga ke wilayah perbatasan <strong>Solo</strong> dengan kabupaten tetangga. 
                    Kami juga tengah merancang platform digital untuk manajemen keanggotaan dan pelaporan kegiatan secara transparan.
                </p>
                <p>
                    Inovasi lain yang sedang kami garap adalah <em>Co-Working Space</em> untuk <strong>pemuda Solo</strong> di kawasan <strong>Mojo</strong>. 
                    Ruang kreatif ini diharapkan menjadi tempat bertemu, berkolaborasi, dan berkarya bagi generasi muda <strong>Surakarta</strong> dan sekitarnya. Ini adalah wujud nyata komitmen kami untuk terus relevan di era modern.
                </p>
                <h3 class="text-2xl font-bold mt-8 mb-4">Kata Kunci & Topik Terkait</h3>
                
                <div class="space-y-6 text-sm leading-relaxed text-justify">
                    <!-- Karang Taruna -->
                    <div class="bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-lg border-l-4 border-primary">
                        <p class="font-semibold text-primary mb-2">🏛️ Karang Taruna & Organisasi Kepemudaan</p>
                        <p><strong>Karang Taruna Mojo</strong>, <strong>Karang Taruna Surakarta</strong>, <strong>Karang Taruna Solo</strong>, <strong>Karang Taruna Pasar Kliwon</strong>, <strong>Karang Taruna Jawa Tengah</strong>, <strong>Karang Taruna Semanggi</strong>, <strong>Karang Taruna Sangkrah</strong>, <strong>Karang Taruna Jebres</strong>, <strong>Karang Taruna Banjarsari</strong>, <strong>Karang Taruna Laweyan</strong>, <strong>Karang Taruna Serengan</strong>, <strong>Karang Taruna Mojosongo</strong>, <strong>Karang Taruna Kadipiro</strong>, <strong>Karang Taruna Nusukan</strong>, <strong>Karang Taruna Manahan</strong>, <strong>organisasi pemuda Solo</strong>, <strong>komunitas pemuda Surakarta</strong>, <strong>kegiatan pemuda di Solo</strong>, <strong>pemuda Solo Raya</strong>, <strong>generasi muda Surakarta</strong>, <strong>anak muda Solo</strong>, <strong>milenial Surakarta</strong>, <strong>Gen Z Solo</strong>, <strong>remaja Solo</strong>, <strong>pemuda kreatif Surakarta</strong>, <strong>pemuda produktif Solo</strong>, <strong>pemuda inspiratif Jawa Tengah</strong>.</p>
                    </div>

                    <!-- Lowongan & Event -->
                    <div class="bg-gradient-to-r from-blue-500/5 to-transparent p-4 rounded-lg border-l-4 border-blue-500">
                        <p class="font-semibold text-blue-600 dark:text-blue-400 mb-2">💼 Lowongan Kerja & Event</p>
                        <p><strong>lowongan kerja Solo</strong>, <strong>lowongan kerja Surakarta</strong>, <strong>loker Solo 2024</strong>, <strong>loker Solo 2025</strong>, <strong>loker Surakarta terbaru</strong>, <strong>kerja di Solo</strong>, <strong>karir Solo</strong>, <strong>job fair Solo</strong>, <strong>bursa kerja Surakarta</strong>, <strong>magang Solo</strong>, <strong>internship Surakarta</strong>, <strong>freelance Solo</strong>, <strong>event Solo 2024</strong>, <strong>event Solo 2025</strong>, <strong>event Solo 2026</strong>, <strong>agenda Solo hari ini</strong>, <strong>jadwal acara Solo</strong>, <strong>festival Solo</strong>, <strong>pameran Solo</strong>, <strong>bazaar Solo</strong>, <strong>pasar malam Solo</strong>, <strong>konser musik Solo</strong>, <strong>pertunjukan seni Surakarta</strong>, <strong>berita Solo terbaru</strong>, <strong>berita Surakarta hari ini</strong>, <strong>info Solo Raya</strong>, <strong>update Jawa Tengah</strong>, <strong>kabar Solo</strong>, <strong>news Surakarta</strong>, <strong>viral Solo</strong>, <strong>trending Jawa Tengah</strong>, <strong>headline Solo</strong>.</p>
                    </div>

                    <!-- Wisata & Kuliner -->
                    <div class="bg-gradient-to-r from-green-500/5 to-transparent p-4 rounded-lg border-l-4 border-green-500">
                        <p class="font-semibold text-green-600 dark:text-green-400 mb-2">🍜 Wisata & Kuliner Solo</p>
                        <p><strong>wisata Solo</strong>, <strong>wisata Surakarta</strong>, <strong>tempat wisata di Solo</strong>, <strong>destinasi wisata Solo</strong>, <strong>objek wisata Surakarta</strong>, <strong>wisata murah Solo</strong>, <strong>wisata gratis Solo</strong>, <strong>wisata malam Solo</strong>, <strong>wisata keluarga Surakarta</strong>, <strong>wisata anak Solo</strong>, <strong>wisata romantis Solo</strong>, <strong>honeymoon Solo</strong>, <strong>liburan Solo</strong>, <strong>staycation Surakarta</strong>, <strong>weekend Solo</strong>, <strong>kuliner Solo</strong>, <strong>kuliner Surakarta</strong>, <strong>makanan khas Solo</strong>, <strong>jajanan Solo</strong>, <strong>street food Surakarta</strong>, <strong>serabi Solo</strong>, <strong>tengkleng Solo</strong>, <strong>nasi liwet Solo</strong>, <strong>sate kere Solo</strong>, <strong>wedang ronde Solo</strong>, <strong>timlo Solo</strong>, <strong>selat Solo</strong>, <strong>gudeg Solo</strong>, <strong>bakso Solo</strong>, <strong>soto Solo</strong>, <strong>pecel Solo</strong>, <strong>rawon Solo</strong>, <strong>lotek Solo</strong>, <strong>tahu kupat Solo</strong>, <strong>intip Solo</strong>, <strong>gethuk Solo</strong>, <strong>jenang Solo</strong>, <strong>dawet Solo</strong>, <strong>es buah Solo</strong>, <strong>kopi Solo</strong>, <strong>cafe Solo</strong>, <strong>restoran Solo</strong>, <strong>warung makan Surakarta</strong>, <strong>angkringan Solo</strong>, <strong>lesehan Solo</strong>.</p>
                    </div>

                    <!-- Destinasi & Landmark -->
                    <div class="bg-gradient-to-r from-amber-500/5 to-transparent p-4 rounded-lg border-l-4 border-amber-500">
                        <p class="font-semibold text-amber-600 dark:text-amber-400 mb-2">🏛️ Destinasi & Landmark</p>
                        <p><strong>Keraton Surakarta</strong>, <strong>Keraton Kasunanan</strong>, <strong>Mangkunegaran</strong>, <strong>Pasar Klewer</strong>, <strong>Pasar Gede Solo</strong>, <strong>Pasar Triwindu</strong>, <strong>Pasar Legi Solo</strong>, <strong>Pasar Kembang Solo</strong>, <strong>Pasar Nusukan</strong>, <strong>Pasar Jongke</strong>, <strong>Taman Balekambang</strong>, <strong>Taman Sriwedari</strong>, <strong>Taman Satwa Taru Jurug</strong>, <strong>Kebun Binatang Solo</strong>, <strong>The Heritage Palace</strong>, <strong>De Tjolomadoe</strong>, <strong>Pandawa Water World</strong>, <strong>Solo Safari</strong>, <strong>Kampoeng Batik Laweyan</strong>, <strong>Kampoeng Batik Kauman</strong>, <strong>Museum Radya Pustaka</strong>, <strong>Museum Keris Solo</strong>, <strong>Museum Batik Danar Hadi</strong>, <strong>House of Danar Hadi</strong>, <strong>Benteng Vastenburg</strong>, <strong>Loji Gandrung</strong>.</p>
                    </div>

                    <!-- Batik -->
                    <div class="bg-gradient-to-r from-purple-500/5 to-transparent p-4 rounded-lg border-l-4 border-purple-500">
                        <p class="font-semibold text-purple-600 dark:text-purple-400 mb-2">👘 Batik Solo</p>
                        <p><strong>batik Solo</strong>, <strong>batik Laweyan</strong>, <strong>batik Kauman</strong>, <strong>batik tulis Solo</strong>, <strong>batik cap Solo</strong>, <strong>batik printing Solo</strong>, <strong>kain batik Surakarta</strong>, <strong>baju batik Solo</strong>, <strong>kemeja batik Solo</strong>, <strong>dress batik Surakarta</strong>, <strong>seragam batik Solo</strong>, <strong>batik murah Solo</strong>, <strong>grosir batik Solo</strong>, <strong>toko batik Surakarta</strong>, <strong>pusat batik Solo</strong>.</p>
                    </div>

                    <!-- Pendidikan -->
                    <div class="bg-gradient-to-r from-indigo-500/5 to-transparent p-4 rounded-lg border-l-4 border-indigo-500">
                        <p class="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">🎓 Pendidikan & Kampus</p>
                        <p><strong>UNS Surakarta</strong>, <strong>Universitas Sebelas Maret</strong>, <strong>UMS Solo</strong>, <strong>Universitas Muhammadiyah Surakarta</strong>, <strong>ISI Surakarta</strong>, <strong>Institut Seni Indonesia Surakarta</strong>, <strong>Politeknik Solo</strong>, <strong>IAIN Surakarta</strong>, <strong>UIN Raden Mas Said</strong>, <strong>Unisri Solo</strong>, <strong>Universitas Slamet Riyadi</strong>, <strong>STIE Solo</strong>, <strong>Akper Solo</strong>, <strong>STIKes Solo</strong>, <strong>Univet Solo</strong>, <strong>Uniba Solo</strong>, <strong>SMA Negeri 1 Surakarta</strong>, <strong>SMA Negeri 2 Solo</strong>, <strong>SMA Negeri 3 Solo</strong>, <strong>SMA Negeri 4 Surakarta</strong>, <strong>SMA Negeri 5 Solo</strong>, <strong>SMA Negeri 6 Solo</strong>, <strong>SMA Negeri 7 Surakarta</strong>, <strong>SMA Negeri 8 Solo</strong>, <strong>SMA Batik 1 Solo</strong>, <strong>SMA Batik 2 Solo</strong>, <strong>SMA Al Islam 1 Solo</strong>, <strong>SMA Warga Solo</strong>, <strong>SMK Negeri 1 Solo</strong>, <strong>SMK Negeri 2 Surakarta</strong>, <strong>SMK Negeri 3 Solo</strong>, <strong>SMK Negeri 4 Surakarta</strong>, <strong>SMK Negeri 5 Solo</strong>, <strong>SMK Negeri 6 Solo</strong>, <strong>SMK Negeri 7 Surakarta</strong>, <strong>SMK Negeri 8 Solo</strong>, <strong>SMK Negeri 9 Solo</strong>, <strong>SMP Negeri 1 Solo</strong>, <strong>SMP Negeri 2 Surakarta</strong>, <strong>SD Negeri Solo</strong>, <strong>pendidikan di Solo</strong>, <strong>sekolah terbaik Solo</strong>, <strong>sekolah favorit Surakarta</strong>, <strong>bimbel Solo</strong>, <strong>les privat Surakarta</strong>, <strong>kursus Solo</strong>, <strong>pelatihan Solo</strong>, <strong>workshop Surakarta</strong>, <strong>seminar Solo</strong>, <strong>training Solo</strong>, <strong>KKN UNS</strong>, <strong>KKN UMS</strong>, <strong>mahasiswa Solo</strong>, <strong>pelajar Surakarta</strong>, <strong>alumni UNS</strong>, <strong>alumni UMS</strong>, <strong>wisuda Solo</strong>, <strong>sidang skripsi Surakarta</strong>.</p>
                    </div>

                    <!-- Pemerintahan & Wilayah -->
                    <div class="bg-gradient-to-r from-red-500/5 to-transparent p-4 rounded-lg border-l-4 border-red-500">
                        <p class="font-semibold text-red-600 dark:text-red-400 mb-2">🏢 Pemerintahan & Wilayah Administratif</p>
                        <p><strong>Kota Surakarta</strong>, <strong>Kota Solo</strong>, <strong>Pemerintah Kota Surakarta</strong>, <strong>Pemkot Solo</strong>, <strong>Walikota Solo</strong>, <strong>DPRD Solo</strong>, <strong>Dinas Surakarta</strong>, <strong>Kecamatan Pasar Kliwon</strong>, <strong>Kecamatan Jebres</strong>, <strong>Kecamatan Banjarsari</strong>, <strong>Kecamatan Laweyan</strong>, <strong>Kecamatan Serengan</strong>, <strong>Kelurahan Mojo</strong>, <strong>Kelurahan Semanggi</strong>, <strong>Kelurahan Sangkrah</strong>, <strong>Kelurahan Joyosuran</strong>, <strong>Kelurahan Kauman</strong>, <strong>Kelurahan Baluwarti</strong>, <strong>Kelurahan Gajahan</strong>, <strong>Kelurahan Kampung Baru</strong>, <strong>Kelurahan Kedung Lumbu</strong>, <strong>Kelurahan Mojosongo</strong>, <strong>Kelurahan Jebres</strong>, <strong>Kelurahan Pucangsawit</strong>, <strong>Kelurahan Jagalan</strong>, <strong>Kelurahan Sudiroprajan</strong>, <strong>Kelurahan Gandekan</strong>, <strong>Kelurahan Sewu</strong>, <strong>Kelurahan Tegalharjo</strong>, <strong>Kelurahan Purwodiningratan</strong>, <strong>Kelurahan Kepatihan Kulon</strong>, <strong>Kelurahan Kepatihan Wetan</strong>, <strong>Kelurahan Manahan</strong>, <strong>Kelurahan Mangkubumen</strong>, <strong>Kelurahan Timuran</strong>, <strong>Kelurahan Ketelan</strong>, <strong>Kelurahan Punggawan</strong>, <strong>Kelurahan Kestalan</strong>, <strong>Kelurahan Setabelan</strong>, <strong>Kelurahan Gilingan</strong>, <strong>Kelurahan Nusukan</strong>, <strong>Kelurahan Kadipiro</strong>, <strong>Kelurahan Banyuanyar</strong>, <strong>Kelurahan Sumber</strong>, <strong>Kelurahan Laweyan</strong>, <strong>Kelurahan Sondakan</strong>, <strong>Kelurahan Pajang</strong>, <strong>Kelurahan Jajar</strong>, <strong>Kelurahan Karangasem</strong>, <strong>Kelurahan Kerten</strong>, <strong>Kelurahan Purwosari</strong>, <strong>Kelurahan Penumping</strong>, <strong>Kelurahan Sriwedari</strong>, <strong>Kelurahan Panularan</strong>, <strong>Kelurahan Bumi</strong>, <strong>Kelurahan Serengan</strong>, <strong>Kelurahan Danukusuman</strong>, <strong>Kelurahan Joyotakan</strong>, <strong>Kelurahan Tipes</strong>, <strong>Kelurahan Kratonan</strong>, <strong>Kelurahan Jayengan</strong>, <strong>Kelurahan Kemlayan</strong>, <strong>Solo Raya</strong>, <strong>Subosukawonosraten</strong>, <strong>Karesidenan Surakarta</strong>, <strong>Eks Karesidenan Solo</strong>, <strong>Kabupaten Sukoharjo</strong>, <strong>Kabupaten Karanganyar</strong>, <strong>Kabupaten Boyolali</strong>, <strong>Kabupaten Wonogiri</strong>, <strong>Kabupaten Sragen</strong>, <strong>Kabupaten Klaten</strong>, <strong>Provinsi Jawa Tengah</strong>, <strong>Jateng</strong>, <strong>Central Java</strong>, <strong>Indonesia</strong>.</p>
                    </div>

                    <!-- Transportasi & Akomodasi -->
                    <div class="bg-gradient-to-r from-cyan-500/5 to-transparent p-4 rounded-lg border-l-4 border-cyan-500">
                        <p class="font-semibold text-cyan-600 dark:text-cyan-400 mb-2">🚆 Transportasi & Akomodasi</p>
                        <p><strong>Stasiun Balapan Solo</strong>, <strong>Stasiun Solo Balapan</strong>, <strong>Stasiun Purwosari</strong>, <strong>Stasiun Jebres</strong>, <strong>Bandara Adi Soemarmo</strong>, <strong>Bandara Solo</strong>, <strong>Terminal Tirtonadi</strong>, <strong>Terminal Solo</strong>, <strong>BST Solo</strong>, <strong>Batik Solo Trans</strong>, <strong>transportasi Solo</strong>, <strong>bus Solo</strong>, <strong>angkot Solo</strong>, <strong>becak Solo</strong>, <strong>ojek Solo</strong>, <strong>Gojek Solo</strong>, <strong>Grab Solo</strong>, <strong>taksi Solo</strong>, <strong>rental mobil Surakarta</strong>, <strong>sewa motor Solo</strong>, <strong>kereta Solo Jakarta</strong>, <strong>kereta Solo Surabaya</strong>, <strong>kereta Solo Jogja</strong>, <strong>pesawat Solo</strong>, <strong>tiket pesawat Surakarta</strong>, <strong>hotel Solo</strong>, <strong>hotel murah Surakarta</strong>, <strong>hotel bintang 5 Solo</strong>, <strong>hotel dekat stasiun Solo</strong>, <strong>hotel dekat bandara Solo</strong>, <strong>penginapan Surakarta</strong>, <strong>guest house Solo</strong>, <strong>homestay Surakarta</strong>, <strong>villa Solo</strong>, <strong>apartemen Solo</strong>, <strong>perumahan Solo</strong>, <strong>kost Solo</strong>, <strong>kost murah Surakarta</strong>, <strong>kos putra Solo</strong>, <strong>kos putri Surakarta</strong>, <strong>kontrakan Solo</strong>, <strong>rumah dijual Solo</strong>, <strong>tanah dijual Surakarta</strong>, <strong>ruko Solo</strong>.</p>
                    </div>

                    <!-- Olahraga & Hiburan -->
                    <div class="bg-gradient-to-r from-orange-500/5 to-transparent p-4 rounded-lg border-l-4 border-orange-500">
                        <p class="font-semibold text-orange-600 dark:text-orange-400 mb-2">⚽ Olahraga, Hiburan & Belanja</p>
                        <p><strong>Stadion Manahan</strong>, <strong>Stadion Sriwedari</strong>, <strong>Persis Solo</strong>, <strong>Bhayangkara FC</strong>, <strong>sepak bola Solo</strong>, <strong>futsal Solo</strong>, <strong>badminton Solo</strong>, <strong>basket Solo</strong>, <strong>voli Solo</strong>, <strong>tenis Solo</strong>, <strong>renang Solo</strong>, <strong>kolam renang Surakarta</strong>, <strong>gym Solo</strong>, <strong>fitness Surakarta</strong>, <strong>senam Solo</strong>, <strong>yoga Surakarta</strong>, <strong>zumba Solo</strong>, <strong>car free day Solo</strong>, <strong>CFD Solo</strong>, <strong>jogging Solo</strong>, <strong>lari pagi Surakarta</strong>, <strong>marathon Solo</strong>, <strong>sepeda Solo</strong>, <strong>gowes Surakarta</strong>, <strong>bersepeda Solo</strong>, <strong>konser Solo</strong>, <strong>bioskop Solo</strong>, <strong>CGV Solo</strong>, <strong>XXI Solo</strong>, <strong>Cinepolis Solo</strong>, <strong>Solo Paragon Mall</strong>, <strong>Hartono Mall Solo</strong>, <strong>Solo Square</strong>, <strong>Solo Grand Mall</strong>, <strong>Transmart Solo</strong>, <strong>Hypermart Solo</strong>, <strong>Luwes Solo</strong>, <strong>Matahari Solo</strong>, <strong>Ramayana Solo</strong>, <strong>Carrefour Solo</strong>, <strong>Superindo Solo</strong>, <strong>Alfamart Solo</strong>, <strong>Indomaret Surakarta</strong>.</p>
                    </div>

                    <!-- Bisnis & Ekonomi -->
                    <div class="bg-gradient-to-r from-emerald-500/5 to-transparent p-4 rounded-lg border-l-4 border-emerald-500">
                        <p class="font-semibold text-emerald-600 dark:text-emerald-400 mb-2">💰 Bisnis & Ekonomi</p>
                        <p><strong>UMKM Solo</strong>, <strong>UMKM Surakarta</strong>, <strong>bisnis Solo</strong>, <strong>usaha di Solo</strong>, <strong>wirausaha muda Solo</strong>, <strong>entrepreneur Surakarta</strong>, <strong>startup Solo</strong>, <strong>coworking space Solo</strong>, <strong>inkubator bisnis Surakarta</strong>, <strong>e-commerce Solo</strong>, <strong>marketplace Solo</strong>, <strong>online shop Surakarta</strong>, <strong>toko online Solo</strong>, <strong>investasi Solo</strong>, <strong>properti Solo</strong>, <strong>franchise Solo</strong>, <strong>pelatihan bisnis Solo</strong>, <strong>seminar bisnis Surakarta</strong>, <strong>modal usaha Solo</strong>, <strong>pinjaman usaha Surakarta</strong>, <strong>BPR Solo</strong>, <strong>koperasi Surakarta</strong>, <strong>Bank Solo</strong>, <strong>ATM Solo</strong>.</p>
                    </div>

                    <!-- Kesehatan & Sosial -->
                    <div class="bg-gradient-to-r from-pink-500/5 to-transparent p-4 rounded-lg border-l-4 border-pink-500">
                        <p class="font-semibold text-pink-600 dark:text-pink-400 mb-2">🏥 Kesehatan & Sosial</p>
                        <p><strong>RSUD Dr. Moewardi</strong>, <strong>RS Dr. Oen Solo</strong>, <strong>RS Kasih Ibu Solo</strong>, <strong>RS PKU Muhammadiyah Solo</strong>, <strong>RS Panti Waluyo Solo</strong>, <strong>RS Brayat Minulyo</strong>, <strong>RS Solo</strong>, <strong>klinik Solo</strong>, <strong>puskesmas Solo</strong>, <strong>apotek Solo</strong>, <strong>dokter Solo</strong>, <strong>dokter gigi Surakarta</strong>, <strong>dokter spesialis Solo</strong>, <strong>vaksinasi Solo</strong>, <strong>imunisasi Surakarta</strong>, <strong>donor darah PMI Solo</strong>, <strong>PMI Surakarta</strong>, <strong>kesehatan masyarakat Surakarta</strong>, <strong>posyandu Solo</strong>, <strong>lansia Solo</strong>, <strong>disabilitas Surakarta</strong>, <strong>panti jompo Solo</strong>, <strong>panti asuhan Surakarta</strong>, <strong>yayasan sosial Solo</strong>, <strong>bantuan sosial Solo</strong>, <strong>sembako murah Solo</strong>, <strong>zakat Solo</strong>, <strong>infaq Surakarta</strong>, <strong>sedekah jariyah Solo</strong>, <strong>wakaf Solo</strong>, <strong>qurban Surakarta</strong>, <strong>aqiqah Solo</strong>.</p>
                    </div>

                    <!-- Keagamaan & Budaya -->
                    <div class="bg-gradient-to-r from-teal-500/5 to-transparent p-4 rounded-lg border-l-4 border-teal-500">
                        <p class="font-semibold text-teal-600 dark:text-teal-400 mb-2">🕌 Keagamaan & Budaya</p>
                        <p><strong>Masjid Agung Solo</strong>, <strong>Masjid Laweyan</strong>, <strong>Masjid Al Wustho</strong>, <strong>Masjid Tegalsari</strong>, <strong>Gereja Solo</strong>, <strong>Gereja Purbayan</strong>, <strong>GKJ Solo</strong>, <strong>GKI Solo</strong>, <strong>Vihara Solo</strong>, <strong>Vihara Dhamma Sundara</strong>, <strong>Klenteng Solo</strong>, <strong>Klenteng Tien Kok Sie</strong>, <strong>Pura Solo</strong>, <strong>PHBI Solo</strong>, <strong>Idul Fitri Solo</strong>, <strong>Idul Adha Surakarta</strong>, <strong>lebaran Solo</strong>, <strong>mudik Solo</strong>, <strong>Natal Solo</strong>, <strong>Imlek Solo</strong>, <strong>Waisak Solo</strong>, <strong>Nyepi Solo</strong>, <strong>tradisi Jawa</strong>, <strong>budaya Jawa Tengah</strong>, <strong>adat Solo</strong>, <strong>upacara adat Surakarta</strong>, <strong>sekaten Solo</strong>, <strong>grebeg maulud</strong>, <strong>kirab budaya Solo</strong>, <strong>wayang Solo</strong>, <strong>gamelan Surakarta</strong>, <strong>tari tradisional Solo</strong>, <strong>karawitan Solo</strong>, <strong>ketoprak Solo</strong>, <strong>ludruk Surakarta</strong>.</p>
                    </div>

                    <!-- Organisasi Mahasiswa & Komunitas -->
                    <div class="bg-gradient-to-r from-violet-500/5 to-transparent p-4 rounded-lg border-l-4 border-violet-500">
                        <p class="font-semibold text-violet-600 dark:text-violet-400 mb-2">🤝 Organisasi & Komunitas</p>
                        <p><strong>pemuda Indonesia</strong>, <strong>generasi muda Indonesia</strong>, <strong>Karang Taruna Indonesia</strong>, <strong>Sumpah Pemuda</strong>, <strong>Hari Pemuda</strong>, <strong>KNPI Solo</strong>, <strong>HMI Solo</strong>, <strong>PMII Surakarta</strong>, <strong>IMM Solo</strong>, <strong>GMNI Solo</strong>, <strong>GMKI Surakarta</strong>, <strong>Pramuka Solo</strong>, <strong>Kwarcab Solo</strong>, <strong>OSIS Solo</strong>, <strong>MPK Solo</strong>, <strong>BEM UNS</strong>, <strong>BEM UMS</strong>, <strong>DEMA ISI</strong>, <strong>organisasi mahasiswa Solo</strong>, <strong>UKM kampus Surakarta</strong>, <strong>komunitas Solo</strong>, <strong>komunitas seni Solo</strong>, <strong>komunitas fotografi Surakarta</strong>, <strong>komunitas musik Solo</strong>, <strong>komunitas motor Solo</strong>, <strong>komunitas mobil Surakarta</strong>, <strong>komunitas gaming Solo</strong>, <strong>komunitas hiking Solo</strong>, <strong>komunitas sepeda Surakarta</strong>, <strong>relawan Solo</strong>, <strong>volunteer Surakarta</strong>, <strong>aksi sosial Solo</strong>, <strong>bakti sosial Surakarta</strong>, <strong>gotong royong Solo</strong>, <strong>kerja bakti Surakarta</strong>.</p>
                    </div>
                </div>


                <div class="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl mt-8 border-l-4 border-primary">
                    <p class="font-bold text-lg mb-2">Informasi Sekretariat & Kontak</p>
                    <p class="text-sm">
                        <strong>Karang Taruna Asta Wira Dipta</strong><br>
                        Jl. Sungai Serang I No.313, <strong>Mojo</strong>, Kec. <strong>Pasar Kliwon</strong>,<br>
                        Kota <strong>Surakarta (Solo)</strong>, Jawa Tengah 57191.<br>
                        Email: info@karangtarunamojo.id (contoh)<br>
                        Instagram: @karangtaruna_mojo<br>
                        <em>Pusat informasi kegiatan pemuda dan karangtaruna terbaik di Solo Raya. Melayani wilayah Pasar Kliwon, Semanggi, dan sekitarnya. Hubungi kami untuk sinergi membangun bangsa.</em>
                    </p>
                </div>
            </div>
        `
    },
    "internal-sejarah-kelurahan-mojo": {
        title: "Sejarah Kelurahan Mojo: Lahir dari Pemekaran Semanggi Tahun 2018",
        image: "/kelurahan-mojo-history.webp",
        date: new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        author: "Tim Redaksi Kelurahan Mojo",
        body: `
            <div class="space-y-6 text-gray-800 dark:text-gray-200 text-justify">
                <p class="lead text-lg font-medium"><strong>Kelurahan Mojo</strong> adalah kelurahan yang relatif baru di <strong>Kecamatan Pasar Kliwon, Kota Surakarta (Solo), Provinsi Jawa Tengah</strong>. Kelurahan ini resmi terbentuk pada <strong>tahun 2018</strong> sebagai hasil pemekaran (<em>pemecahan</em>) dari <strong>Kelurahan Semanggi</strong> yang sebelumnya merupakan kelurahan terluas di Kota Solo.</p>
                
                <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border-l-4 border-blue-500 my-6">
                    <h4 class="font-bold text-blue-700 dark:text-blue-300 mb-2">📊 Data Singkat Kelurahan Mojo</h4>
                    <ul class="text-sm space-y-1">
                        <li>• <strong>Tahun Terbentuk:</strong> 2018 (Hasil Pemekaran Semanggi)</li>
                        <li>• <strong>Kecamatan:</strong> Pasar Kliwon</li>
                        <li>• <strong>Kota:</strong> Surakarta (Solo)</li>
                        <li>• <strong>Provinsi:</strong> Jawa Tengah</li>
                        <li>• <strong>Jumlah Penduduk:</strong> ± 12.591 jiwa (2020)</li>
                        <li>• <strong>Batas Utara:</strong> Jalan Kyai Mojo (dengan Kelurahan Semanggi)</li>
                    </ul>
                </div>

                <h3 class="text-2xl font-bold mt-8 mb-4">Latar Belakang Pemekaran dari Kelurahan Semanggi</h3>
                <p>
                    Sebelum tahun 2018, wilayah yang kini menjadi <strong>Kelurahan Mojo</strong> merupakan bagian integral dari <strong>Kelurahan Semanggi</strong>. 
                    Kelurahan Semanggi dikenal sebagai kelurahan dengan cakupan wilayah paling luas di <strong>Kota Surakarta</strong>, membentang dari pusat 
                    <strong>Kecamatan Pasar Kliwon</strong> hingga perbatasan dengan <strong>Kabupaten Sukoharjo</strong>.
                </p>
                <p>
                    Luasnya wilayah Semanggi menimbulkan berbagai tantangan administratif. Pelayanan publik menjadi kurang optimal karena jarak yang harus 
                    ditempuh warga untuk mengurus dokumen kependudukan cukup jauh. Pembangunan infrastruktur juga tidak merata, dengan wilayah selatan 
                    (yang kini menjadi Mojo) cenderung tertinggal dibanding wilayah utara.
                </p>
                <p>
                    Selain itu, pertumbuhan penduduk yang pesat di kawasan selatan Semanggi—terutama di sekitar <strong>RSUD Bung Karno</strong>, 
                    <strong>Rusunawa</strong>, dan bantaran <strong>Sungai Bengawan Solo</strong>—menuntut adanya unit pemerintahan yang lebih dekat 
                    dengan masyarakat. Inilah yang mendorong <strong>Pemerintah Kota Surakarta</strong> untuk melakukan pemekaran wilayah.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Proses Pembentukan Kelurahan Mojo (2018)</h3>
                <p>
                    Pemekaran <strong>Kelurahan Semanggi</strong> menjadi dua kelurahan—yaitu <strong>Kelurahan Semanggi</strong> (wilayah utara) dan 
                    <strong>Kelurahan Mojo</strong> (wilayah selatan)—resmi berlaku pada <strong>tahun 2018</strong>. Keputusan ini dituangkan dalam 
                    peraturan daerah <strong>Kota Surakarta</strong> dan disahkan oleh <strong>DPRD Solo</strong>.
                </p>
                <p>
                    <strong>Jalan Kyai Mojo</strong> ditetapkan sebagai batas pemisah antara kedua kelurahan. Seluruh wilayah di sebelah selatan 
                    Jalan Kyai Mojo menjadi bagian dari <strong>Kelurahan Mojo</strong>, sementara wilayah di utara jalan tersebut tetap menjadi 
                    bagian dari <strong>Kelurahan Semanggi</strong>.
                </p>
                <p>
                    Nama <strong>"Mojo"</strong> diambil dari nama jalan tersebut, yang merupakan penghormatan kepada <strong>Kyai Mojo</strong> 
                    (Bagus Kasan Besari), pahlawan nasional asal <strong>Surakarta</strong> yang berjuang bersama Pangeran Diponegoro dalam 
                    <strong>Perang Jawa (1825-1830)</strong>.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Fasilitas Penting di Kelurahan Mojo</h3>
                <p>
                    Pasca pemekaran, beberapa fasilitas publik penting yang sebelumnya tercatat berada di <strong>Kelurahan Semanggi</strong> kini 
                    resmi menjadi bagian dari <strong>Kelurahan Mojo</strong>. Perpindahan administratif ini membawa implikasi penting bagi pengelolaan 
                    dan pelayanan masyarakat di wilayah tersebut.
                </p>
                
                <div class="grid md:grid-cols-2 gap-4 my-6">
                    <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h4 class="font-bold text-primary mb-2">🏥 RSUD Bung Karno</h4>
                        <p class="text-sm">Rumah sakit umum daerah terbesar di <strong>Surakarta</strong> yang sebelumnya dikenal sebagai RSUD Dr. Moewardi Annex. Kini terletak di wilayah <strong>Kelurahan Mojo</strong>.</p>
                    </div>
                    <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h4 class="font-bold text-primary mb-2">🛒 Pasar Klithikan Notoharjo</h4>
                        <p class="text-sm">Pasar barang antik dan bekas yang terkenal di <strong>Solo</strong>. Destinasi wisata belanja unik yang kini berada di <strong>Kelurahan Mojo</strong>.</p>
                    </div>
                    <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h4 class="font-bold text-primary mb-2">🏢 Rusunawa Mojo</h4>
                        <p class="text-sm">Rumah susun sederhana sewa (dahulu <em>Rusunawa Semanggi</em>) yang kini berganti nama menjadi <strong>Rusunawa Mojo</strong> setelah pemekaran.</p>
                    </div>
                    <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h4 class="font-bold text-primary mb-2">📚 Taman Cerdas Mojo</h4>
                        <p class="text-sm">Fasilitas edukasi publik yang dahulu bernama <em>Taman Cerdas Semanggi</em>. Kini menjadi pusat belajar anak-anak di <strong>Kelurahan Mojo</strong>.</p>
                    </div>
                    <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h4 class="font-bold text-primary mb-2">🎖️ Koramil 0735 Pasar Kliwon</h4>
                        <p class="text-sm">Komando Rayon Militer yang membawahi wilayah <strong>Kecamatan Pasar Kliwon</strong>, berlokasi di <strong>Kelurahan Mojo</strong>.</p>
                    </div>
                    <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h4 class="font-bold text-primary mb-2">🏫 SMP Negeri 11 Surakarta</h4>
                        <p class="text-sm">Sekolah menengah pertama negeri yang menjadi tujuan pendidikan anak-anak di <strong>Pasar Kliwon</strong> dan sekitarnya.</p>
                    </div>
                </div>

                <h3 class="text-2xl font-bold mt-8 mb-4">Kyai Mojo: Inspirasi Nama Kelurahan</h3>
                <p>
                    Nama <strong>Kelurahan Mojo</strong> mengabadikan nama <strong>Kyai Mojo</strong> (nama asli: <strong>Bagus Kasan Besari</strong>), seorang 
                    ulama dan pejuang dari <strong>Surakarta</strong> yang hidup pada abad ke-19. Beliau merupakan salah satu panglima perang 
                    <strong>Pangeran Diponegoro</strong> dalam <strong>Perang Jawa</strong> (1825-1830) melawan kolonial Belanda.
                </p>
                <p>
                    <strong>Kyai Mojo</strong> lahir di <strong>Surakarta</strong> dan menjadi tokoh sentral dalam perlawanan di wilayah <strong>Jawa Tengah</strong> bagian selatan. 
                    Setelah Perang Jawa berakhir, beliau diasingkan ke <strong>Tondano</strong>, <strong>Sulawesi Utara</strong>, hingga akhir hayatnya. 
                    Atas jasanya, Kyai Mojo dinobatkan sebagai <strong>Pahlawan Nasional Indonesia</strong>.
                </p>
                <p>
                    <strong>Jalan Kyai Mojo</strong> di <strong>Surakarta</strong> dinamai untuk menghormati jasa beliau, dan kini nama tersebut juga 
                    diabadikan dalam <strong>Kelurahan Mojo</strong> sebagai bentuk penghormatan kepada pahlawan lokal <strong>Solo</strong>.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Geografis dan Tantangan Lingkungan</h3>
                <p>
                    Secara geografis, <strong>Kelurahan Mojo</strong> memiliki posisi yang strategis namun juga menantang. Wilayah selatan kelurahan ini 
                    berbatasan langsung dengan aliran <strong>Sungai Bengawan Solo</strong>. Kondisi ini menjadikan sebagian wilayah Mojo, terutama 
                    di RW-RW yang berada di bantaran sungai, memiliki sejarah panjang dalam menghadapi risiko banjir tahunan.
                </p>
                <p>
                    Namun, wajah bantaran sungai di <strong>Mojo</strong> kini telah berubah drastis. Berkat pembangunan <strong>tanggul (parapet)</strong> 
                    pengendali banjir oleh pemerintah pusat dan daerah, risiko banjir kiriman kini dapat diminimalisir. Area di sepanjang tanggul pun 
                    kini mulai dimanfaatkan sebagai ruang terbuka hijau dan area interaksi warga yang asri, mengubah citra wilayah pinggiran sungai 
                    menjadi lebih tertata.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Dinamika Ekonomi dan UMKM Warga</h3>
                <p>
                    Perekonomian warga <strong>Kelurahan Mojo</strong> sangat dinamis dan beragam. Keberadaan <strong>Pasar Klithikan Notoharjo</strong> 
                    di wilayah ini menjadi magnet ekonomi tersendiri. Ratusan pedagang onderdil, barang antik, dan perkakas bekas menggantungkan hidupnya 
                    di pasar legendaris ini, menciptakan efek berganda (<em>multiplier effect</em>) bagi warung makan, jasa parkir, dan kos-kosan di sekitarnya.
                </p>
                <p>
                    Selain sektor perdagangan formal, <strong>UMKM</strong> di Mojo juga tumbuh subur. Banyak warga yang menekuni industri rumahan 
                    seperti produksi <strong>batik</strong>, kerajinan sangkar burung, hingga kuliner tradisional. Pemerintah Kelurahan terus mendorong 
                    digitalisasi UMKM agar produk warga Mojo dapat menjangkau pasar yang lebih luas melalui <em>marketplace</em> dan media sosial.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Kehidupan Sosial Budaya dan Tradisi</h3>
                <p>
                    Meskipun merupakan kelurahan pemekaran baru, akar budaya masyarakat <strong>Mojo</strong> tetap kuat. Tradisi gotong royong 
                    atau <em>sambatan</em> masih sangat kental terasa, terutama saat ada warga yang membangun rumah atau memiliki hajat. 
                    Setiap tahun, warga juga antusias menggelar <strong>Kirab Budaya</strong> di tingkat RW maupun kelurahan untuk merayakan 
                    hari jadi atau HUT Kemerdekaan RI.
                </p>
                <p>
                    Salah satu tradisi unik yang masih dilestarikan adalah <strong>Sadranan</strong> menjelang bulan puasa. Warga berkumpul 
                    di makam leluhur untuk mendoakan dan membersihkan area pemakaman, dilanjutkan dengan makan bersama (kenduri) yang mempererat 
                    tali silaturahmi antarwarga tanpa memandang status sosial.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Prestasi dan Inovasi Kelurahan</h3>
                <p>
                    Sejak berdiri sendiri, <strong>Kelurahan Mojo</strong> tak henti mengukir prestasi. Kelurahan ini aktif dalam program 
                    <strong>Kampung Iklim (ProKlim)</strong>, di mana warga secara swadaya melakukan penghijauan lorong-lorong kampung dan 
                    pengelolaan sampah mandiri melalui Bank Sampah.
                </p>
                <p>
                    Di bidang kesehatan, kader-kader <strong>PKK</strong> dan <strong>Posyandu</strong> kelurahan rutin memantau kesehatan balita dan lansia, 
                    menjadikan Mojo sebagai salah satu kelurahan yang proaktif dalam penanganan <em>stunting</em> di <strong>Kecamatan Pasar Kliwon</strong>. 
                    Semangat "Mojo Bangkit" menjadi slogan yang memacu aparatur kelurahan dan warga untuk terus berbenah menuju kelurahan yang 
                    maju, mandiri, dan sejahtera.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Pendidikan dan Literasi Warga</h3>
                <p>
                    Pendidikan menjadi prioritas utama di <strong>Kelurahan Mojo</strong>. Selain keberadaan <strong>SMP Negeri 11 Surakarta</strong> 
                    dan <strong>SD Negeri Mojo</strong>, kelurahan ini juga memiliki fasilitas <strong>Taman Cerdas Mojo</strong> yang sangat representatif. 
                    Taman Cerdas ini tidak hanya berfungsi sebagai taman bermain, tetapi juga pusat literasi digital dan perpustakaan masyarakat yang 
                    dilengkapi dengan fasilitas komputer dan internet gratis untuk menunjang pembelajaran siswa.
                </p>
                <p>
                    Berbagai kegiatan <em>parenting</em> dan pelatihan keterampilan juga kerap diselenggarakan di aula kelurahan dan Taman Cerdas, 
                    bekerja sama dengan instansi terkait untuk meningkatkan kualitas sumber daya manusia (SDM) warga Mojo dari berbagai usai.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Aksesibilitas dan Transportasi</h3>
                <p>
                    Sebagai wilayah yang sedang berkembang, <strong>Kelurahan Mojo</strong> memiliki aksesibilitas yang sangat baik. 
                    <strong>Jalan Kyai Mojo</strong> sebagai jalan arteri utama menghubungkan wilayah ini langsung dengan pusat kota <strong>Solo</strong> 
                    dan wilayah <strong>Sukoharjo</strong> (Bekonang).
                </p>
                <p>
                    Layanan transportasi umum <strong>Batik Solo Trans (BST)</strong> juga melintasi wilayah ini, memudahkan warga untuk bepergian 
                    ke tempat kerja atau sekolah dengan biaya terjangkau. Hal ini semakin mendukung mobilitas ekonomi warga Mojo yang dinamis.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Visi Masa Depan: Mojo yang Humanis dan Modern</h3>
                <p>
                    Melihat ke depan, <strong>Kelurahan Mojo</strong> bercita-cita menjadi kawasan hunian tepi sungai yang humanis dan modern. 
                    Integrasi antara penataan kawasan <strong>Semanggi-Mojo</strong> yang berkelanjutan, pengembangan wisata sejarah dan belanja 
                    (Pasar Klithikan), serta penguatan modal sosial masyarakat menjadi kunci utama.
                </p>
                <p>
                    Dengan sinergi antara pemerintah kota, kelurahan, dan elemen masyarakat seperti <strong>Karang Taruna</strong>, <strong>LPMK</strong>, 
                    dan komunitas warga, Mojo bertekad untuk terus bertransformasi menjadi "Wajah Baru" Kota Solo di sisi selatan yang membanggakan.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Karakteristik Wilayah dan Demografi</h3>
                <p>
                    <strong>Kelurahan Mojo</strong> memiliki karakteristik wilayah yang beragam. Di bagian utara (dekat Jalan Kyai Mojo), terdapat 
                    kawasan pemukiman padat dan pusat perdagangan. Semakin ke selatan, wilayah ini berbatasan dengan <strong>Sungai Bengawan Solo</strong> 
                    dan <strong>Kabupaten Sukoharjo</strong>.
                </p>
                <p>
                    Berdasarkan data tahun 2020, <strong>Kelurahan Mojo</strong> memiliki populasi sekitar <strong>12.591 jiwa</strong>. Mayoritas penduduk 
                    bekerja di sektor perdagangan, jasa, industri rumah tangga, dan sebagai pekerja di berbagai fasilitas publik yang ada di wilayah ini.
                </p>
                <p>
                    Sebagai bagian dari <strong>Kecamatan Pasar Kliwon</strong>, masyarakat <strong>Mojo</strong> memiliki karakteristik budaya yang khas. 
                    Pengaruh komunitas Arab yang telah lama menetap di <strong>Pasar Kliwon</strong> tercermin dalam tradisi keagamaan Islam yang kuat. 
                    Banyak pondok pesantren, majelis taklim, dan pengajian rutin yang aktif di wilayah ini.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Program Penataan Permukiman Kumuh</h3>
                <p>
                    <strong>Kelurahan Mojo</strong> menjadi salah satu <strong>lokasi prioritas penataan permukiman kumuh</strong> oleh 
                    <strong>Pemerintah Kota Surakarta</strong>. Program ini bertujuan untuk meningkatkan kualitas hidup warga yang bermukim 
                    di kawasan bantaran <strong>Sungai Bengawan Solo</strong> dan area padat penduduk lainnya.
                </p>
                <p>
                    Berbagai program telah dan sedang dilaksanakan, meliputi: perbaikan drainase, pembangunan MCK komunal, penataan jalan lingkungan, 
                    dan program pemberdayaan ekonomi masyarakat. <strong>KOTAKU</strong> (Kota Tanpa Kumuh) menjadi salah satu program nasional yang 
                    diimplementasikan di <strong>Kelurahan Mojo</strong>.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Alamat dan Kontak Kantor Kelurahan Mojo</h3>
                <div class="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl border-l-4 border-primary my-6">
                    <h4 class="font-bold text-lg mb-3">📍 Kantor Kelurahan Mojo</h4>
                    <ul class="text-sm space-y-2">
                        <li><strong>Alamat:</strong> Jl. Sungai Serang I No.313, Mojo, Kec. Pasar Kliwon, Kota Surakarta, Jawa Tengah 57117</li>
                        <li><strong>Website Resmi:</strong> <a href="https://mojo.surakarta.go.id" target="_blank" class="text-primary hover:underline">mojo.surakarta.go.id</a></li>
                        <li><strong>Email:</strong> kelmojo@surakarta.go.id</li>
                        <li><strong>Jam Pelayanan:</strong> Senin - Jumat, 08.00 - 15.00 WIB</li>
                    </ul>
                </div>

                <h3 class="text-2xl font-bold mt-8 mb-4">Perbedaan Kelurahan Mojo dan Kelurahan Semanggi</h3>
                <div class="overflow-x-auto my-6">
                    <table class="w-full text-sm border-collapse">
                        <thead>
                            <tr class="bg-primary text-white">
                                <th class="border border-gray-300 dark:border-gray-600 p-3 text-left">Aspek</th>
                                <th class="border border-gray-300 dark:border-gray-600 p-3 text-left">Kelurahan Mojo</th>
                                <th class="border border-gray-300 dark:border-gray-600 p-3 text-left">Kelurahan Semanggi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="bg-white dark:bg-gray-800">
                                <td class="border border-gray-300 dark:border-gray-600 p-3 font-semibold">Posisi</td>
                                <td class="border border-gray-300 dark:border-gray-600 p-3">Selatan Jl. Kyai Mojo</td>
                                <td class="border border-gray-300 dark:border-gray-600 p-3">Utara Jl. Kyai Mojo</td>
                            </tr>
                            <tr class="bg-gray-50 dark:bg-gray-700">
                                <td class="border border-gray-300 dark:border-gray-600 p-3 font-semibold">Tahun Berdiri</td>
                                <td class="border border-gray-300 dark:border-gray-600 p-3">2018 (pemekaran)</td>
                                <td class="border border-gray-300 dark:border-gray-600 p-3">Sudah ada sebelumnya</td>
                            </tr>
                            <tr class="bg-white dark:bg-gray-800">
                                <td class="border border-gray-300 dark:border-gray-600 p-3 font-semibold">Fasilitas Utama</td>
                                <td class="border border-gray-300 dark:border-gray-600 p-3">RSUD Bung Karno, Pasar Klithikan, Rusunawa</td>
                                <td class="border border-gray-300 dark:border-gray-600 p-3">Pasar Semanggi, Kampung Batik</td>
                            </tr>
                            <tr class="bg-gray-50 dark:bg-gray-700">
                                <td class="border border-gray-300 dark:border-gray-600 p-3 font-semibold">Karakteristik</td>
                                <td class="border border-gray-300 dark:border-gray-600 p-3">Kawasan kesehatan & bantaran sungai</td>
                                <td class="border border-gray-300 dark:border-gray-600 p-3">Kawasan perdagangan & pemukiman</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h3 class="text-2xl font-bold mt-8 mb-4">Potensi dan Masa Depan Kelurahan Mojo</h3>
                <p>
                    Sebagai kelurahan yang baru terbentuk, <strong>Kelurahan Mojo</strong> memiliki berbagai potensi yang dapat dikembangkan. 
                    Keberadaan <strong>RSUD Bung Karno</strong> membuka peluang pengembangan sektor kesehatan dan jasa pendukung rumah sakit. 
                    <strong>Pasar Klithikan Notoharjo</strong> menjadi daya tarik wisata belanja yang unik.
                </p>
                <p>
                    Organisasi kepemudaan seperti <strong>Karang Taruna Asta Wira Dipta</strong> turut berperan aktif dalam pembangunan 
                    <strong>Kelurahan Mojo</strong>. Melalui berbagai program pemberdayaan, pelatihan UMKM, dan kegiatan sosial, pemuda 
                    <strong>Mojo</strong> berkontribusi nyata bagi kemajuan wilayahnya.
                </p>
                <p>
                    Dengan dukungan <strong>Pemerintah Kota Surakarta</strong>, program penataan permukiman, dan partisipasi aktif masyarakat, 
                    <strong>Kelurahan Mojo</strong> optimis dapat terus berkembang menjadi wilayah yang maju, sejahtera, dan layak huni bagi 
                    seluruh warganya.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Kata Kunci & Topik Terkait</h3>
                
                <div class="space-y-6 text-sm leading-relaxed text-justify">
                    <!-- Kelurahan Mojo -->
                    <div class="bg-gradient-to-r from-amber-500/5 to-transparent p-4 rounded-lg border-l-4 border-amber-500">
                        <p class="font-semibold text-amber-600 dark:text-amber-400 mb-2">📜 Sejarah & Pemekaran</p>
                        <p><strong>sejarah Kelurahan Mojo</strong>, <strong>pemekaran Kelurahan Semanggi</strong>, <strong>Kelurahan Mojo 2018</strong>, <strong>asal usul Kelurahan Mojo</strong>, <strong>sejarah pemekaran Solo</strong>, <strong>pecahan Semanggi</strong>, <strong>Jalan Kyai Mojo</strong>, <strong>Kyai Mojo pahlawan nasional</strong>, <strong>Bagus Kasan Besari</strong>, <strong>Perang Jawa 1825</strong>, <strong>Pangeran Diponegoro</strong>, <strong>sejarah Pasar Kliwon</strong>, <strong>sejarah Kota Surakarta</strong>, <strong>sejarah Solo</strong>, <strong>batas wilayah Mojo Semanggi</strong>, <strong>kelurahan baru di Surakarta</strong>, <strong>pemekaran wilayah Surakarta tahun 2018</strong>, <strong>latar belakang Kelurahan Mojo</strong>.</p>
                    </div>

                    <!-- Fasilitas -->
                    <div class="bg-gradient-to-r from-blue-500/5 to-transparent p-4 rounded-lg border-l-4 border-blue-500">
                        <p class="font-semibold text-blue-600 dark:text-blue-400 mb-2">🏥 Fasilitas & Infrastruktur</p>
                        <p><strong>RSUD Bung Karno Surakarta</strong>, <strong>RSUD Mojo</strong>, <strong>Pasar Klithikan Notoharjo</strong>, <strong>Pasar Barang Bekas Solo</strong>, <strong>Rusunawa Mojo</strong>, <strong>Rusunawa Semanggi</strong>, <strong>Taman Cerdas Mojo</strong>, <strong>Koramil Pasar Kliwon</strong>, <strong>SMP Negeri 11 Surakarta</strong>, <strong>SD Negeri Mojo</strong>, <strong>tanggul Bengawan Solo</strong>, <strong>parapet Mojo</strong>, <strong>puskesmas pembantu Mojo</strong>, <strong>masjid di Mojo</strong>, <strong>gereja di Mojo</strong>, <strong>lapangan Mojo</strong>, <strong>aula Kelurahan Mojo</strong>.</p>
                    </div>

                    <!-- Wilayah -->
                    <div class="bg-gradient-to-r from-red-500/5 to-transparent p-4 rounded-lg border-l-4 border-red-500">
                        <p class="font-semibold text-red-600 dark:text-red-400 mb-2">🏛️ Wilayah Administratif</p>
                        <p><strong>Kelurahan Mojo</strong>, <strong>Kelurahan Semanggi</strong>, <strong>Kecamatan Pasar Kliwon</strong>, <strong>Kota Surakarta</strong>, <strong>Kota Solo</strong>, <strong>Provinsi Jawa Tengah</strong>, <strong>Solo Raya</strong>, <strong>Subosukawonosraten</strong>, <strong>Kabupaten Sukoharjo</strong>, <strong>Sungai Bengawan Solo</strong>, <strong>pemerintahan Kota Solo</strong>, <strong>Walikota Surakarta</strong>, <strong>DPRD Kota Surakarta</strong>, <strong>kantor kelurahan Mojo</strong>, <strong>jam buka kelurahan Mojo</strong>, <strong>pelayanan kelurahan Mojo</strong>.</p>
                    </div>

                    <!-- Program -->
                    <div class="bg-gradient-to-r from-green-500/5 to-transparent p-4 rounded-lg border-l-4 border-green-500">
                        <p class="font-semibold text-green-600 dark:text-green-400 mb-2">🏘️ Program Pembangunan</p>
                        <p><strong>penataan permukiman kumuh Solo</strong>, <strong>program KOTAKU Surakarta</strong>, <strong>Kota Tanpa Kumuh Mojo</strong>, <strong>penataan bantaran sungai Solo</strong>, <strong>relokasi warga bantaran</strong>, <strong>pemberdayaan masyarakat Mojo</strong>, <strong>infrastruktur Pasar Kliwon</strong>, <strong>MCK komunal Solo</strong>, <strong>drainase dan sanitasi Mojo</strong>, <strong>jalan lingkungan Mojo</strong>, <strong>pengentasan kemiskinan Solo</strong>, <strong>ProKlim Mojo</strong>, <strong>Bank Sampah Mojo</strong>.</p>
                    </div>

                    <!-- Ekonomi -->
                    <div class="bg-gradient-to-r from-purple-500/5 to-transparent p-4 rounded-lg border-l-4 border-purple-500">
                        <p class="font-semibold text-purple-600 dark:text-purple-400 mb-2">💰 Ekonomi & Bisnis Warga</p>
                        <p><strong>UMKM Kelurahan Mojo</strong>, <strong>batik Mojo</strong>, <strong>pengrajin sangkar burung Solo</strong>, <strong>kuliner Pasar Kliwon</strong>, <strong>jual beli onderdil Solo</strong>, <strong>onderdil motor bekas Notoharjo</strong>, <strong>barang antik Solo</strong>, <strong>wisata belanja Solo</strong>, <strong>angkringan Mojo</strong>, <strong>sate kere Solo</strong>, <strong>tengkleng Pasar Kliwon</strong>, <strong>lowongan kerja di Mojo</strong>, <strong>kos-kosan dekat RSUD Bung Karno</strong>.</p>
                    </div>

                    <!-- Sosial Budaya -->
                    <div class="bg-gradient-to-r from-pink-500/5 to-transparent p-4 rounded-lg border-l-4 border-pink-500">
                        <p class="font-semibold text-pink-600 dark:text-pink-400 mb-2">🤝 Sosial & Budaya</p>
                        <p><strong>Karang Taruna Asta Wira Dipta</strong>, <strong>LPMK Kelurahan Mojo</strong>, <strong>PKK Kelurahan Mojo</strong>, <strong>Posyandu Mojo</strong>, <strong>Babinsa Kelurahan Mojo</strong>, <strong>Bhabinkamtibmas Mojo</strong>, <strong>Kirab Budaya Mojo</strong>, <strong>Sadranan Mojo</strong>, <strong>kerja bakti warga Solo</strong>, <strong>gotong royong Mojo</strong>, <strong>komunitas pemuda Pasar Kliwon</strong>, <strong>pengajian rutin Mojo</strong>, <strong>TPA Mojo</strong>.</p>
                    </div>

                    <!-- Lokasi Terkait -->
                    <div class="bg-gradient-to-r from-teal-500/5 to-transparent p-4 rounded-lg border-l-4 border-teal-500">
                        <p class="font-semibold text-teal-600 dark:text-teal-400 mb-2">📍 Lokasi Sekitar</p>
                        <p><strong>Kelurahan Sangkrah</strong>, <strong>Kelurahan Kedung Lumbu</strong>, <strong>Kelurahan Joyosuran</strong>, <strong>Gading Solo</strong>, <strong>Gading Kidul</strong>, <strong>Alun-Alun Kidul Solo</strong>, <strong>Benteng Vastenburg</strong>, <strong>Jembatan Mojo</strong>, <strong>Bekonang Sukoharjo</strong>, <strong>Polokarto</strong>, <strong>Grogol Sukoharjo</strong>, <strong>Palur</strong>, <strong>Jebres</strong>, <strong>Mojosongo</strong> (sering tertukar), <strong>Joyontakan</strong>.</p>
                    </div>
                </div>

                <div class="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl mt-8 border-l-4 border-primary">
                    <p class="font-bold text-lg mb-2">📚 Sumber & Referensi</p>
                    <p class="text-sm">
                        Artikel ini disusun berdasarkan data dari <strong>Website Resmi Kelurahan Mojo</strong> (mojo.surakarta.go.id), 
                        <strong>Wikipedia</strong>, dan dokumen <strong>Pemerintah Kota Surakarta</strong>.<br><br>
                        <em>Ditulis untuk kepentingan edukasi dan informasi publik tentang sejarah administratif Kota Surakarta.</em>
                    </p>
                </div>
            </div>
        `
    },
    "internal-profil-pasar-kliwon": {
        title: "Menjelajahi Pasar Kliwon: Jantung Budaya dan Perdagangan Kota Surakarta",
        image: "/pasarkliwon.webp",
        date: new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        author: "Tim Redaksi Karang Taruna",
        body: `
            <div class="space-y-6 text-gray-800 dark:text-gray-200 text-justify">
                <p class="lead text-lg font-medium"><strong>Kecamatan Pasar Kliwon</strong> bukan sekadar wilayah administratif di <strong>Kota Surakarta</strong>. Ia adalah jantung yang berdetak dengan irama budaya, sejarah, dan perdagangan yang harmonis. Sebagai rumah bagi <strong>Keraton Kasunanan Surakarta</strong>, Pasar Kliwon menyimpan kekayaan warisan yang tak ternilai bagi identitas masyarakat Solo.</p>
                
                <h3 class="text-2xl font-bold mt-8 mb-4">Sejarah dan Jejak Akulturasi Budaya</h3>
                <p>
                    Nama <strong>Pasar Kliwon</strong> sendiri diambil dari nama pasar tradisional yang dahulu ramai pada hari pasaran Jawa (Kliwon). Wilayah ini unik karena menjadi <em>melting pot</em> (pertemuan budaya) antara masyarakat Jawa, keturunan Arab, dan Tionghoa yang hidup berdampingan secara damai selama berabad-abad.
                </p>
                <p>
                    Kawasan ini terkenal sebagai <strong>Kampung Arab-nya Solo</strong>, di mana tradisi Islam berkembang kuat beriringan dengan adat istiadat Keraton. Perayaan seperti <strong>Haul Habib Ali bin Muhammad Al-Habsyi</strong> setiap tahunnya mampu menyedot ratusan ribu peziarah dari dalam dan luar negeri, menjadikan Pasar Kliwon sebagai pusat wisata religi internasional.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Sejarah Panjang: Dari Hutan Bambu hingga Pusat Peradaban</h3>
                <p>
                    <strong>Kecamatan Pasar Kliwon</strong> memiliki akar sejarah yang sangat dalam, bahkan sebelum berdirinya Kota Surakarta (Solo). 
                    Dahulu, wilayah ini dikenal sebagai bagian dari <em>Desa Sala</em> yang berupa rawa-rawa dan hutan bambu. Titik baliknya adalah ketika 
                    <strong>Sunan Pakubuwono II</strong> memindahkan istana Mataram dari Kartasura ke Desa Sala pada tahun 1745 karena Geger Pecinan.
                </p>
                <div class="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border-l-4 border-amber-600 my-4 italic text-sm">
                    "Perpindahan Keraton inilah yang menjadi cikal bakal lahirnya Kecamatan Pasar Kliwon sebagai pusat pemerintahan kerajaan (Vorstenlanden)."
                </div>
                <p>
                    Nama "Pasar Kliwon" sendiri merujuk pada sebuah pasar yang aktivitasnya memuncak setiap <em>Pasaran Kliwon</em> dalam kalender Jawa. 
                    Pasar ini menjadi titik temu pedagang dari berbagai etnis, menciptakan akulturasi budaya yang unik yang masih terasa hingga saat ini.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Letak Geografis dan Batas Wilayah</h3>
                <p>
                    Secara geografis, Kecamatan Pasar Kliwon terletak di bagian tenggara Kota Surakarta. Posisinya sangat strategis karena diapit oleh sungai legendaris dan pusat kota.
                </p>
                <ul class="space-y-2 mt-2 mb-6 text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                    <li><strong>Utara:</strong> Berbatasan dengan Kecamatan Jebres (dibatasi oleh Jl. Urip Sumoharjo dan Sungai Pepe).</li>
                    <li><strong>Selatan:</strong> Berbatasan dengan Kabupaten Sukoharjo (Kecamatan Grogol).</li>
                    <li><strong>Timur:</strong> Berbatasan dengan Sungai Bengawan Solo (di seberangnya adalah Kabupaten Sukoharjo, wilayah Bekonang/Mojolaban).</li>
                    <li><strong>Barat:</strong> Berbatasan dengan Kecamatan Serengan dan Banjarsari (Jl. Slamet Riyadi dan Jl. Yos Sudarso).</li>
                </ul>
                <p>
                    Kontur tanahnya relatif datar namun sedikit menurun ke arah timur menuju bantaran Sungai Bengawan Solo, yang menjadikan sebagian wilayah di kelurahan Semanggi, Sangkrah, dan Kedung Lumbu perlu waspada terhadap potensi luapan sungai saat musim penghujan ekstrem.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Dinamika Sosial & Multikulturalisme</h3>
                <p>
                     Pasar Kliwon adalah miniaturnya toleransi di Kota Solo. Di sinilah tiga kebudayaan besar berpadu harmonis:
                </p>
                <ul class="list-disc pl-5 space-y-2 mt-2">
                    <li><strong>Budaya Jawa (Keraton):</strong> Tercermin dari tata krama, bahasa halus, dan tradisi kejawen yang masih dipegang teguh warga asli, terutama di Baluwarti dan sekitarnya.</li>
                    <li><strong>Budaya Arab (Islam):</strong> Terpusat di Kelurahan Pasar Kliwon dan Semanggi. Pengaruhnya terlihat dari arsitektur rumah, kuliner, dan syiar agama Islam yang kuat.</li>
                    <li><strong>Budaya Tionghoa:</strong> Terlihat dari aktivitas perdagangan di kawasan Coyudan dan Nonongan (perbatasan barat), yang menjadi motor penggerak ekonomi.</li>
                </ul>

                <h3 class="text-2xl font-bold mt-8 mb-4">Pusat Ekonomi dan Perdagangan</h3>
                <p>
                    Denyut nadi ekonomi Pasar Kliwon tak pernah berhenti. <strong>Pasar Klewer</strong>, pusat tekstil terbesar di Jawa Tengah, berdiri megah di sini. Pasar ini menjadi rujukan utama para pedagang batik dari seluruh nusantara.
                </p>
                <p>
                    Selain itu, <strong>Beteng Trade Center (BTC)</strong> dan <strong>Pusat Grosir Solo (PGS)</strong> yang terletak di perbatasan wilayah ini semakin mengukuhkan Pasar Kliwon sebagai pusat grosir fashion dan kain. Ribuan tenaga kerja terserap, termasuk pemuda-pemudi kreatif yang mengembangkan industri fashion lokal.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Destinasi Wisata Unggulan</h3>
                <div class="grid md:grid-cols-2 gap-4 my-6">
                    <div class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-700">
                        <h4 class="font-bold text-amber-800 dark:text-amber-300 mb-2">🕌 Masjid Agung Surakarta</h4>
                        <p class="text-sm">Masjid bersejarah peninggalan Mataram Islam yang menjadi pusat kegiatan keagamaan resmi Keraton.</p>
                    </div>
                    <div class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-700">
                        <h4 class="font-bold text-amber-800 dark:text-amber-300 mb-2">🏯 Keraton Kasunanan</h4>
                        <p class="text-sm">Istana resmi Susuhunan Pakubuwono yang menjadi simbol pusat kebudayaan Jawa.</p>
                    </div>
                    <div class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-700">
                        <h4 class="font-bold text-amber-800 dark:text-amber-300 mb-2">🧱 Benteng Vastenburg</h4>
                        <p class="text-sm">Saksi bisu kolonialisme Belanda yang kini menjadi venue berbagai festival internasional.</p>
                    </div>
                    <div class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-700">
                        <h4 class="font-bold text-amber-800 dark:text-amber-300 mb-2">🏘️ Kampung Batik Kauman</h4>
                        <p class="text-sm">Sentra batik tulis premium yang menawarkan pengalaman wisata sejarah menyusuri gang-gang kuno.</p>
                    </div>
                </div>

                <h3 class="text-2xl font-bold mt-8 mb-4">Kuliner Khas dan Legendaris</h3>
                <p>
                    Berkunjung ke Pasar Kliwon tak lengkap tanpa mencicipi kuliner khasnya. Wilayah ini adalah surga bagi pecinta makanan otentik.
                    <strong>Nasi Kebuli</strong> dan <strong>Nasi Mandhi</strong> khas Timur Tengah dapat dengan mudah ditemukan di sekitar Masjid Riyadh dan Kampung Arab.
                </p>
                <p>
                    Tak hanya itu, <strong>Sate Kere</strong> (sate dari tempe gembus/jeroan) yang dulu merupakan makanan rakyat jelata kini menjadi buruan wisatawan. 
                    Kudapan manis <strong>Serabi Notosuman</strong> yang legendaris juga berpusat di wilayah ini, menawarkan cita rasa santan gurih yang tak berubah sejak 1923. 
                    Bagi pencari kesegaran, <strong>Es Gempol Pleret</strong> di pinggir jalan sering menjadi pilihan pelepas dahaga.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Agenda Budaya dan Festival Tahunan</h3>
                <p>
                    Pasar Kliwon adalah panggung budaya yang hidup sepanjang tahun. Beberapa agenda besar yang selalu dinanti antara lain:
                </p>
                <ul class="list-disc pl-5 space-y-2 mt-2 mb-6">
                    <li><strong>Sekatenan:</strong> Pasar malam dan perayaan budaya menyambut Maulid Nabi Muhammad SAW di Alun-Alun Utara Keraton.</li>
                    <li><strong>Kirab Pusaka 1 Suro:</strong> Prosesi sakral mengelilingi benteng Keraton (Baluwarti) yang dilakukan hening tanpa bicara (tapa bisu).</li>
                    <li><strong>Festival Jenang Solo:</strong> Perayaan memperingati HUT Kota Solo dengan membagikan ribuan takir jenang gratis di kawasan Ngarsopuro-Pasar Gede (berbatasan dengan Pasar Kliwon).</li>
                    <li><strong>Haul Solo:</strong> Peringatan wafatnya Habib Ali bin Muhammad Al-Habsyi yang mengubah kawasan Pasar Kliwon menjadi lautan manusia dari berbagai negara.</li>
                </ul>

                <h3 class="text-2xl font-bold mt-8 mb-4">Konektivitas dan Transportasi</h3>
                <p>
                    Akses menuju Kecamatan Pasar Kliwon sangatlah mudah. Wilayah ini dilayani oleh berbagai koridor <strong>Batik Solo Trans (BST)</strong> yang nyaman dan terintegrasi.
                    Keberadaan <strong>Stasiun Solo Kota (Sangkrah)</strong> juga menjadi nilai tambah, melayani rute kereta perintis <strong>Railbus Batara Kresna</strong> yang menghubungkan Solo dengan Wonogiri.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Profil Lengkap & Detail 10 Kelurahan di Pasar Kliwon</h3>
                <p class="mb-6">
                    Berikut adalah bedah detail potensi dan karakteristik unik dari 10 kelurahan yang membentuk Kecamatan Pasar Kliwon, lengkap dengan landmark utama dan aktivitas ekonominya:
                </p>
                
                <div class="space-y-8">
                    <!-- Mojo -->
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow">
                        <h4 class="font-bold text-xl text-primary mb-2">1. Kelurahan Mojo</h4>
                        <p class="text-sm mb-2"><strong>"Wajah Baru Pelayanan Publik & Kesehatan"</strong></p>
                        <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            Hasil pemekaran tahun 2018 dari Semanggi. Wilayah ini kini menjadi primadona baru dengan hadirnya fasilitas vital.
                            <br><strong>Landmark Utama:</strong> RSUD Bung Karno (Rumah Sakit Daerah tipe C), Pasar Klithikan Notoharjo (pusat onderdil & barang bekas terbesar), Rusunawa Mojo, dan Taman Cerdas Mojo.
                            <br><strong>Potensi Ekonomi:</strong> Perdagangan suku cadang kendaraan, kuliner sekitar RSUD, dan UMKM sangkar burung.
                            <br><strong>Jalan Utama:</strong> Jl. Kyai Mojo, Jl. Sungai Serang.
                        </p>
                    </div>

                    <!-- Semanggi -->
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border-l-4 border-amber-500 shadow-sm hover:shadow-md transition-shadow">
                        <h4 class="font-bold text-xl text-amber-600 dark:text-amber-400 mb-2">2. Kelurahan Semanggi</h4>
                        <p class="text-sm mb-2"><strong>"Sentra Konveksi & Kreativitas Warga"</strong></p>
                        <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            Wilayah terluas dengan populasi terpadat. Semanggi dikenal sebagai "kandang"-nya industri kreatif rumahan.
                            <br><strong>Landmark Utama:</strong> Pasar Gading (ikon kuliner malam), Jembatan Mojo (penghubung ke Sukoharjo), Tanggul Bengawan Solo.
                            <br><strong>Potensi Ekonomi:</strong> Sentra konveksi (kaos, seragam), kerajinan rotan, dan pembuatan batako.
                            <br><strong>Isu Strategis:</strong> Penataan kawasan kumuh melalui program KOTAKU dan relokasi warga bantaran.
                        </p>
                    </div>

                    <!-- Pasar Kliwon -->
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow">
                        <h4 class="font-bold text-xl text-green-600 dark:text-green-400 mb-2">3. Kelurahan Pasar Kliwon</h4>
                        <p class="text-sm mb-2"><strong>"Kampung Arab & Wisata Religi Internasional"</strong></p>
                        <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            Pusat dari kecamatan ini. Nuansa Timur Tengah sangat kental dengan banyaknya toko minyak wangi, kurma, dan busana muslim.
                            <br><strong>Landmark Utama:</strong> Masjid Ar-Riyadh, Makam Habib Ali bin Muhammad Al-Habsyi, Masjid Assegaf.
                            <br><strong>Event Dunia:</strong> Haul Habib Ali (wisata religi tahunan terbesar di Solo).
                            <br><strong>Kuliner:</strong> Nasi Kebuli, Nasi Mandhi, Roti Maryam, Kopi Rempah.
                        </p>
                    </div>

                    <!-- Kauman -->
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border-l-4 border-amber-700 shadow-sm hover:shadow-md transition-shadow">
                        <h4 class="font-bold text-xl text-amber-800 dark:text-amber-300 mb-2">4. Kelurahan Kauman</h4>
                        <p class="text-sm mb-2"><strong>"Kampung Wisata Batik & Sejarah Islam"</strong></p>
                        <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            Dahulu merupakan pemukiman para ulama (Kaum) Keraton. Kini bertransformasi menjadi destinsi wisata belanja premium.
                            <br><strong>Landmark Utama:</strong> Masjid Agung Surakarta (Masjid Gede), Kampung Batik Kauman, Gunungan Sekaten.
                            <br><strong>Keunikan:</strong> Gang-gang sempit yang estetik, rumah joglo kuno, dan showroom batik tulis eksklusif.
                        </p>
                    </div>

                    <!-- Baluwarti -->
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border-l-4 border-yellow-500 shadow-sm hover:shadow-md transition-shadow">
                        <h4 class="font-bold text-xl text-yellow-600 dark:text-yellow-400 mb-2">5. Kelurahan Baluwarti</h4>
                        <p class="text-sm mb-2"><strong>"The Living Heritage: Jantung Budaya Jawa"</strong></p>
                        <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            Satu-satunya kelurahan yang wilayahnya 100% berada di dalam tembok benteng Keraton Kasunanan.
                            <br><strong>Landmark Utama:</strong> Kori Kamandungan (Pintu Gerbang Keraton), Museum Keraton Surakarta, Sasana Handrawina, Alun-Alun Kidul (Alkid).
                            <br><strong>Aktivitas:</strong> Wisata sejarah, memberi makan Kebo Bule (Kyai Slamet), dan wisata kuliner malam di Alkid.
                        </p>
                    </div>

                    <!-- Sangkrah -->
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow">
                        <h4 class="font-bold text-xl text-blue-600 dark:text-blue-400 mb-2">6. Kelurahan Sangkrah</h4>
                        <p class="text-sm mb-2"><strong>"Gerbang Timur & Konektivitas Kereta"</strong></p>
                        <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            Terletak di tepi Bengawan Solo, menjadi titik temu transportasi darat dan rel.
                            <br><strong>Landmark Utama:</strong> Stasiun Solo Kota (Stasiun Sangkrah), RSUD Bung Karno (sebagian wilayah berbatasan), Pintu Air Demangan.
                            <br><strong>Transportasi:</strong> Pemberhentian Railbus Batara Kresna (Solo-Wonogiri) dan Kereta Uap Jaladara (Sepur Kluthuk).
                        </p>
                    </div>

                    <!-- Kedung Lumbu -->
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border-l-4 border-indigo-500 shadow-sm hover:shadow-md transition-shadow">
                        <h4 class="font-bold text-xl text-indigo-600 dark:text-indigo-400 mb-2">7. Kelurahan Kedung Lumbu</h4>
                        <p class="text-sm mb-2"><strong>"Pusat Grosir & Hiburan Rakyat"</strong></p>
                        <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            Wilayah strategis yang selalu ramai akan aktivitas ekonomi.
                            <br><strong>Landmark Utama:</strong> Alun-Alun Utara (pusat Sekaten), Pasar Klewer (Pusat Tekstil Jawa Tengah), Pusat Grosir Solo (PGS), Beteng Trade Center (BTC).
                            <br><strong>Ekonomi:</strong> Perdagangan tekstil, batik, dan garmen grosir.
                        </p>
                    </div>

                    <!-- Gajahan -->
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border-l-4 border-pink-500 shadow-sm hover:shadow-md transition-shadow">
                        <h4 class="font-bold text-xl text-pink-600 dark:text-pink-400 mb-2">8. Kelurahan Gajahan</h4>
                        <p class="text-sm mb-2"><strong>"Kawasan Penyangga Keraton & Perbankan"</strong></p>
                        <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            Wilayah elit di masa lampau yang kini menjadi campuran hunian dan bisnis.
                            <br><strong>Landmark Utama:</strong> Benteng Vastenburg (sisi selatan), kawasan perbankan Jl. Slamet Riyadi (ujung timur).
                            <br><strong>Sejarah:</strong> Nama Gajahan diambil dari lokasi kandang gajah milik raja Keraton Surakarta.
                        </p>
                    </div>

                    <!-- Kampung Baru -->
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border-l-4 border-teal-500 shadow-sm hover:shadow-md transition-shadow">
                        <h4 class="font-bold text-xl text-teal-600 dark:text-teal-400 mb-2">9. Kelurahan Kampung Baru</h4>
                        <p class="text-sm mb-2"><strong>"Pusat Pemerintahan & Hotel Berbintang"</strong></p>
                        <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            Wilayah paling utara di Pasar Kliwon, berbatasan langsung dengan pusat pemerintahan kota.
                            <br><strong>Landmark Utama:</strong> Balaikota Surakarta, Rutan Kelas 1 Surakarta, Bank Indonesia Solo, Gereja SP Maria.
                            <br><strong>Ekonomi:</strong> Perkantoran pemerintah, hotel, dan jasa keuangan.
                        </p>
                    </div>

                    <!-- Joyosuran -->
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border-l-4 border-purple-500 shadow-sm hover:shadow-md transition-shadow">
                        <h4 class="font-bold text-xl text-purple-600 dark:text-purple-400 mb-2">10. Kelurahan Joyosuran</h4>
                        <p class="text-sm mb-2"><strong>"Gerbang Selatan & Pemukiman Dinamis"</strong></p>
                        <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            Berbatasan langsung dengan Kabupaten Sukoharjo (Grogol). Karakteristik masyarakatnya sangat guyub.
                            <br><strong>Landmark Utama:</strong> Pasar Gading (sisi selatan), TPU Daksinoloyo.
                            <br><strong>Ekonomi:</strong> Pasar tradisional, kuliner sore, dan jasa bengkel.
                        </p>
                    </div>
                </div>

                <h3 class="text-2xl font-bold mt-8 mb-4">Demografi dan Potensi Masa Depan</h3>
                <p>
                    Dengan luas wilayah sekitar 4,82 km², Pasar Kliwon memiliki kepadatan penduduk yang tinggi. Tantangan utama wilayah ini adalah penataan kawasan kumuh dan pelestarian cagar budaya.
                </p>
                <p>
                    Pemerintah Kota Surakarta terus berupaya merevitalisasi kawasan ini, seperti penataan koridor <strong>Jalan Jenderal Sudirman</strong> dan <strong>Gatot Subroto</strong> yang kini menjadi ikon wisata malam (Gatsu-Ngarsopuro). Pasar Kliwon diproyeksikan akan terus menjadi ujung tombak pariwisata berbasis budaya di Kota Solo.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Kata Kunci & Topik Terkait</h3>
                
                <div class="space-y-6 text-sm leading-relaxed text-justify">
                    <!-- Wilayah Administratif -->
                    <div class="bg-gradient-to-r from-red-500/5 to-transparent p-4 rounded-lg border-l-4 border-red-500">
                        <p class="font-semibold text-red-600 dark:text-red-400 mb-2">🏛️ Wilayah & Administrasi</p>
                        <p><strong>Kecamatan Pasar Kliwon</strong>, <strong>Kantor Kecamatan Pasar Kliwon</strong>, <strong>Camat Pasar Kliwon</strong>, <strong>Kode Pos Pasar Kliwon 57110 - 57119</strong>, <strong>Kelurahan Mojo</strong>, <strong>Kelurahan Semanggi</strong>, <strong>Kelurahan Pasar Kliwon</strong>, <strong>Kelurahan Kauman</strong>, <strong>Kelurahan Sangkrah</strong>, <strong>Kelurahan Kedung Lumbu</strong>, <strong>Kelurahan Baluwarti</strong>, <strong>Kelurahan Gajahan</strong>, <strong>Kelurahan Kampung Baru</strong>, <strong>Kelurahan Joyosuran</strong>, <strong>batas wilayah Solo Sukoharjo</strong>, <strong>kota lama Surakarta</strong>, <strong>Vorstenlanden Solo</strong>.</p>
                    </div>

                    <!-- Wisata & Budaya -->
                    <div class="bg-gradient-to-r from-amber-500/5 to-transparent p-4 rounded-lg border-l-4 border-amber-500">
                        <p class="font-semibold text-amber-600 dark:text-amber-400 mb-2">🕌 Wisata Religi & Budaya</p>
                        <p><strong>Masjid Agung Surakarta</strong>, <strong>Masjid Ar-Riyadh Solo</strong>, <strong>Makam Habib Ali bin Muhammad Al-Habsyi</strong>, <strong>Haul Solo</strong>, <strong>Haul Habib Ali Pasar Kliwon</strong>, <strong>Kampung Arab Solo</strong>, <strong>Kampung Wisata Batik Kauman</strong>, <strong>Keraton Kasunanan Surakarta</strong>, <strong>Alun-Alun Utara Solo</strong>, <strong>Alun-Alun Kidul Solo (Alkid)</strong>, <strong>Kebo Bule Kyai Slamet</strong>, <strong>Sekaten Surakarta</strong>, <strong>Grebeg Sudiro</strong>, <strong>Kirab 1 Suro</strong>, <strong>Festival Jenang Solo</strong>, <strong>Museum Keraton Solo</strong>, <strong>Pagelaran Keraton</strong>.</p>
                    </div>

                    <!-- Ekonomi -->
                    <div class="bg-gradient-to-r from-green-500/5 to-transparent p-4 rounded-lg border-l-4 border-green-500">
                        <p class="font-semibold text-green-600 dark:text-green-400 mb-2">💰 Pusat Ekonomi & Belanja</p>
                        <p><strong>Pasar Klewer</strong>, <strong>Pusat Grosir Solo (PGS)</strong>, <strong>Beteng Trade Center (BTC)</strong>, <strong>Pasar Gading</strong>, <strong>Pasar Klithikan Notoharjo</strong>, <strong>Galeri Batik Kauman</strong>, <strong>kain batik murah Solo</strong>, <strong>grosir daster Solo</strong>, <strong>kuliner Nasi Kebuli Solo</strong>, <strong>Serabi Notosuman</strong>, <strong>Sate Kere Yu Rebi</strong>, <strong>Es Gempol Pleret</strong>, <strong>Tengkleng Klewer</strong>, <strong>pusat kuliner Galabo</strong>, <strong>toko kain tekstil Solo</strong>, <strong>oleh-oleh khas Solo Pasar Kliwon</strong>.</p>
                    </div>

                    <!-- Fasilitas & Pendidikan -->
                    <div class="bg-gradient-to-r from-blue-500/5 to-transparent p-4 rounded-lg border-l-4 border-blue-500">
                        <p class="font-semibold text-blue-600 dark:text-blue-400 mb-2">🏥 Fasilitas & Pendidikan</p>
                        <p><strong>RSUD Bung Karno</strong>, <strong>CSI (Custodio Sentral Islam)</strong>, <strong>Rumah Sakit Kustati</strong>, <strong>Stasiun Solo Kota (Sangkrah)</strong>, <strong>Benteng Vastenburg</strong>, <strong>Balaikota Surakarta</strong>, <strong>Bank Indonesia Solo</strong>, <strong>Kantor Pos Besar Solo</strong>, <strong>Rutan Solo</strong>, <strong>Jembatan Mojo</strong>, <strong>Tanggul Bengawan Solo</strong>, <strong>MTSN 2 Surakarta</strong>, <strong>SMPN 6 Surakarta</strong>, <strong>SMA Muhammadiyah 2 Surakarta</strong>, <strong>SD Al-Islam</strong>, <strong>Pondok Pesantren Ta'mirul Islam</strong>.</p>
                    </div>

                    <!-- Jalan Utama -->
                    <div class="bg-gradient-to-r from-gray-500/5 to-transparent p-4 rounded-lg border-l-4 border-gray-500">
                        <p class="font-semibold text-gray-600 dark:text-gray-400 mb-2">🛣️ Nama Jalan Utama</p>
                        <p><strong>Jl. Slamet Riyadi (ujung timur)</strong>, <strong>Jl. Jenderal Sudirman</strong>, <strong>Jl. Kapten Mulyadi</strong>, <strong>Jl. Veteran</strong>, <strong>Jl. Yos Sudarso (Nonongan)</strong>, <strong>Jl. Kyai Mojo</strong>, <strong>Jl. Sungai Serang</strong>, <strong>Jl. Alun-Alun Utara</strong>, <strong>Jl. Dr. Radjiman (Kauman)</strong>.</p>
                    </div>

                    <!-- Tokoh & Sejarah -->
                    <div class="bg-gradient-to-r from-purple-500/5 to-transparent p-4 rounded-lg border-l-4 border-purple-500">
                        <p class="font-semibold text-purple-600 dark:text-purple-400 mb-2">📜 Tokoh & Sejarah</p>
                        <p><strong>Pakubuwono II</strong> (Pendiri Kota Solo), <strong>Pakubuwono X</strong>, <strong>Habib Ali Al-Habsyi</strong> (Pengarang Simtudduror), <strong>Gesang</strong> (Maestro Keroncong dari Kemlayan/dekat Pasar Kliwon), <strong>sejarah perpindahan Keraton Kartasura</strong>, <strong>Geger Pecinan</strong>, <strong>Perjanjian Giyanti</strong>, <strong>Banjir Besar Solo 1966</strong>.</p>
                    </div>
                </div>
            </div>
        `
    },

    "internal-profil-kota-surakarta": {
        title: "Profil Kota Surakarta (Solo) Lengkap: Sejarah, Wisata, & 54 Kelurahan",
        image: "/surakarta.webp",
        date: new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        author: "Tim Riset & Redaksi Karang Taruna",
        body: `
            <div class="space-y-10 text-gray-800 dark:text-gray-200 text-justify leading-relaxed font-sans">
                
                <!-- INTRO -->
                <div class="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border-l-8 border-amber-600 shadow-sm">
                    <p class="text-xl font-serif italic text-amber-900 dark:text-amber-100 mb-4">"Bumi Berseri, Spirit of Java"</p>
                    <p class="text-lg">
                        <strong>Surakarta</strong> (Jawa: ꦱꦸꦫꦏꦂꦠ), atau yang populer dengan nama <strong>Solo</strong>, adalah sebuah entitas budaya yang hidup. Kota ini tidak hanya sekadar kumpulan gedung dan jalan, melainkan sebuah <em>naskah kuno</em> yang terbuka lebar. Dari tata kota yang filosofis hingga denyut nadi modernitas di Solo Technopark, Solo adalah simfoni antara masa lalu yang agung dan masa depan yang cerah.
                    </p>
                </div>

                <!-- 1. FILOSOFI TATA KOTA -->
                <div>
                    <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b-2 border-gray-200 pb-2">1. Catur Gatra Tunggal: Filosofi Tata Kota</h3>
                    <p class="mb-4">
                        Solo dibangun dengan konsep Jawa Islam yang disebut <strong>Catur Gatra Tunggal</strong>, yaitu penyatuan empat elemen kekuasaan dalam satu sumbu imaginer:
                    </p>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border-t-4 border-purple-500">
                            <h4 class="font-bold text-purple-600 mb-2">👑 Keraton</h4>
                            <p class="text-sm">Simbol pusat pemerintahan (Ekskutif). Tempat Raja (Sunan) memimpin rakyat.</p>
                        </div>
                        <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border-t-4 border-green-500">
                            <h4 class="font-bold text-green-600 mb-2">🕌 Masjid Agung</h4>
                            <p class="text-sm">Simbol pusat keagamaan (Religi). Masjid Agung Surakarta terletak tepat di barat Alun-Alun.</p>
                        </div>
                        <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border-t-4 border-yellow-500">
                            <h4 class="font-bold text-yellow-600 mb-2">🌳 Alun-Alun</h4>
                            <p class="text-sm">Simbol ruang publik dan rakyat (Demokrasi). Tempat bertemunya Raja dan kawula (rakyat).</p>
                        </div>
                        <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border-t-4 border-blue-500">
                            <h4 class="font-bold text-blue-600 mb-2">💰 Pasar Gede</h4>
                            <p class="text-sm">Simbol pusat ekonomi. Pasar Gedhe Hardjonagoro merepresentasikan kemakmuran.</p>
                        </div>
                    </div>
                </div>

                <!-- 2. SEJARAH MENDALAM -->
                <div class="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl">
                    <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">2. Lintasan Sejarah: The Rise of Surakarta</h3>
                    
                    <ul class="relative border-l-4 border-amber-300 ml-4 space-y-8">
                        <li class="pl-6 relative">
                            <span class="absolute -left-3 top-0 bg-amber-500 w-6 h-6 rounded-full border-4 border-white"></span>
                            <h4 class="font-bold text-lg">1745: Boyong Kedhaton</h4>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Rombongan Sunan Pakubuwono II berpindah dari Kartasura ke Desa Sala. Peristiwa ini diperingati setiap tahun sebagai Hari Jadi Kota Solo (17 Februari).</p>
                        </li>
                        <li class="pl-6 relative">
                            <span class="absolute -left-3 top-0 bg-amber-500 w-6 h-6 rounded-full border-4 border-white"></span>
                            <h4 class="font-bold text-lg">1755: Perjanjian Giyanti (Palihan Nagari)</h4>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Mataram Islam terbelah dua. Muncullah <strong>Kasunanan Surakarta</strong> (Sunan PB III) dan <strong>Kasultanan Yogyakarta</strong> (Sultan HB I).</p>
                        </li>
                        <li class="pl-6 relative">
                            <span class="absolute -left-3 top-0 bg-amber-500 w-6 h-6 rounded-full border-4 border-white"></span>
                            <h4 class="font-bold text-lg">1757: Perjanjian Salatiga</h4>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Raden Mas Said (Pangeran Sambernyawa) mendirikan kadipaten sendiri di dalam Surakarta, yaitu <strong>Pura Mangkunegaran</strong>. Sejak itu Solo memiliki "Dua Matahari Kembar".</p>
                        </li>
                    </ul>
                </div>

                <!-- 3. BATIK & BUDAYA -->
                <div>
                     <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">3. Filosofi Batik & Budaya Adhiluhung</h3>
                     <p class="mb-4">Solo adalah ibukota Batik. Batik Solo memiliki ciri khas warna sogan (coklat kekuningan) yang melambangkan kerendahan hati dan kedekatan dengan tanah (bumi).</p>
                     
                     <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div class="group relative overflow-hidden rounded-lg shadow-lg">
                             <div class="bg-amber-800 p-4 h-full text-white">
                                 <h5 class="font-bold text-lg mb-2">Truntum</h5>
                                 <p class="text-xs opacity-90">Motif bintik bintang. Bermakna cinta yang tumbuh kembali (tumaruntum). Diciptakan oleh Ratu Kencana saat merindukan Raja.</p>
                             </div>
                         </div>
                         <div class="group relative overflow-hidden rounded-lg shadow-lg">
                             <div class="bg-amber-700 p-4 h-full text-white">
                                 <h5 class="font-bold text-lg mb-2">Parang & Lereng</h5>
                                 <p class="text-xs opacity-90">Garis diagonal tegas. Melambangkan semangat pantang menyerah. Dahulu hanya boleh dipakai oleh Raja dan kerabatnya.</p>
                             </div>
                         </div>
                         <div class="group relative overflow-hidden rounded-lg shadow-lg">
                             <div class="bg-amber-600 p-4 h-full text-white">
                                 <h5 class="font-bold text-lg mb-2">Sidomukti</h5>
                                 <p class="text-xs opacity-90">Sido (menjadi) + Mukti (bahagia/sejahtera). Biasa dipakai pengantin agar hidup bahagia dan sejahtera.</p>
                             </div>
                         </div>
                     </div>
                </div>

                <!-- 4. WAJAH BARU SOLO (REVITALISASI) -->
                <div class="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-200">
                    <h3 class="text-3xl font-bold text-blue-800 dark:text-blue-400 mb-6 flex items-center">
                        🏗️ 4. The New Face of Solo: Era Revitalisasi
                    </h3>
                    <p class="mb-4">Dalam beberapa tahun terakhir, Solo mengalami percepatan pembangunan infrastruktur yang masif (17 Titik Prioritas Pembangunan):</p>
                    <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <li class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                            <strong class="text-lg text-primary block mb-1">Masjid Raya Sheikh Zayed</strong>
                            <span class="text-sm text-gray-600 dark:text-gray-300">Hadiah dari Pangeran UEA. Replika Grand Mosque Abu Dhabi dengan sentuhan motif batik Solo. Kapasitas 10.000 jamaah.</span>
                        </li>
                        <li class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                            <strong class="text-lg text-primary block mb-1">Lokananta (Titik Nol Musik Indonesia)</strong>
                            <span class="text-sm text-gray-600 dark:text-gray-300">Studio rekaman pertama di Indonesia (1956) yang direvitalisasi menjadi creative hub, museum musik, dan venue konser.</span>
                        </li>
                        <li class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                            <strong class="text-lg text-primary block mb-1">Solo Technopark</strong>
                            <span class="text-sm text-gray-600 dark:text-gray-300">Pusat vokasi dan inovasi teknologi. Menggandeng Shopee, Garena, dan industri manufaktur untuk mencetak talenta digital.</span>
                        </li>
                        <li class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                            <strong class="text-lg text-primary block mb-1">Rel Layang Simpang Joglo</strong>
                            <span class="text-sm text-gray-600 dark:text-gray-300">Proyek (under construction) rel kereta api layang terpanjang di Indonesia untuk mengurai kemacetan legendaris di palang Joglo.</span>
                        </li>
                        <li class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                            <strong class="text-lg text-primary block mb-1">Taman Balekambang</strong>
                            <span class="text-sm text-gray-600 dark:text-gray-300">Taman hutan kota peninggalan Mangkunegara VII yang disulap menjadi taman botani kelas dunia dengan panggung pertunjukan terbuka.</span>
                        </li>
                         <li class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                            <strong class="text-lg text-primary block mb-1">Museum Budaya Sains & Teknologi</strong>
                            <span class="text-sm text-gray-600 dark:text-gray-300">Museum baru di Jebres yang akan menjadi pusat edukasi sains terbesar di Jawa Tengah.</span>
                        </li>
                    </ul>
                </div>

                <!-- 5. KULINER (DEEP DIVE) -->
                <div>
                     <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">5. Gastronomi Solo: Murah, Meriah, Mewah</h3>
                     <p class="mb-4">Solo dikenal sebagai kota dengan biaya hidup termurah namun kualitas rasa bintang lima.</p>
                     
                     <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400 rounded-lg overflow-hidden border">
                            <thead class="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" class="px-6 py-3">Kuliner</th>
                                    <th scope="col" class="px-6 py-3">Deskripsi</th>
                                    <th scope="col" class="px-6 py-3">Tempat Legendaris</th>
                                    <th scope="col" class="px-6 py-3">Range Harga</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">Sate Buntel</td>
                                    <td class="px-6 py-4">Daging kambing cincang dibungkus lemak tipis lalu dibakar. Juicy!</td>
                                    <td class="px-6 py-4">Mbok Galak, H. Bejo (Langganan Presiden Jokowi)</td>
                                    <td class="px-6 py-4">Rp 40rb - 60rb</td>
                                </tr>
                                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">Selat Solo</td>
                                    <td class="px-6 py-4">Fusion Jawa-Eropa (Salad). Manis, asam, segar.</td>
                                    <td class="px-6 py-4">Selat Mbak Lies, Selat Viens</td>
                                    <td class="px-6 py-4">Rp 15rb - 25rb</td>
                                </tr>
                                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">Tengkleng</td>
                                    <td class="px-6 py-4">Sup balungan kambing, bumbu kuning encer pedas.</td>
                                    <td class="px-6 py-4">Tengkleng Klewer Bu Edi, Pak Manto (Rica Tengkleng)</td>
                                    <td class="px-6 py-4">Rp 30rb - 60rb</td>
                                </tr>
                                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">Soto Seger</td>
                                    <td class="px-6 py-4">Soto kuah bening daging sapi/ayam, mangkuk kecil.</td>
                                    <td class="px-6 py-4">Soto Gading, Soto Triwindu</td>
                                    <td class="px-6 py-4">Rp 10rb - 15rb</td>
                                </tr>
                                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">Gudeg Ceker</td>
                                    <td class="px-6 py-4">Gudeg basah dengan ceker ayam lunak. Kuliner dini hari (jam 2 pagi).</td>
                                    <td class="px-6 py-4">Gudeg Ceker Margoyudan Bu Kasno</td>
                                    <td class="px-6 py-4">Rp 20rb - 30rb</td>
                                </tr>
                                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">Tahok</td>
                                    <td class="px-6 py-4">Kembang tahu jahe hangat (mirip Wedang Tahu). Sarapan khas Pasar Gede.</td>
                                    <td class="px-6 py-4">Tahok Pak Citro (Pasar Gede)</td>
                                    <td class="px-6 py-4">Rp 8rb - 10rb</td>
                                </tr>
                            </tbody>
                        </table>
                     </div>
                </div>

                
                <!-- 6. DAFTAR KELURAHAN (DETAILED) -->
                <div>
                    <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-10 border-b-2 border-gray-200 pb-2">6. Ensiklopedia 54 Kelurahan: Detak Jantung Kota Solo</h3>
                    <p class="mb-6">Surakarta terbagi menjadi 5 kecamatan yang masing-masing memiliki karakter unik. Berikut adalah profil mendalam dari setiap kelurahan yang menjadi urat nadi kehidupan masyarakat Solo:</p>

                    <!-- PASAR KLIWON -->
                    <div class="mb-8">
                        <div class="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-t-xl border-b-4 border-amber-500">
                            <h4 class="text-2xl font-bold text-amber-800 dark:text-amber-200">🏯 I. Kecamatan Pasar Kliwon (10 Kelurahan)</h4>
                            <p class="text-sm text-amber-700 dark:text-amber-300 mt-1">Kode Pos: 5711X | Pusat Sejarah & Religi</p>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-gray-800 p-4 rounded-b-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">1. Kelurahan Mojo</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Rumah bagi RSUD Bung Karno dan Pasar Silir yang legendaris (kini sentra kreatif). Kelurahan ini merupakan hasil pemekaran Semanggi pada 2018 dan menjadi pusat kegiatan Karang Taruna Asta Wira Dipta.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">2. Kelurahan Semanggi</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Kawasan padat penduduk yang terkenal dengan industri kreatif rumahan (konveksi). Memiliki Jembatan Mojo yang ikonik menghubungkan Solo dengan Sukoharjo (Bekonang).</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">3. Kelurahan Pasar Kliwon</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Jantung perdagangan tekstil. Di sini terdapat Pasar Kliwon yang menjual berbagai perlengkapan, serta Masjid Agung Surakarta yang bersejarah.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">4. Kelurahan Kauman</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Kampung Batik Kauman. Gang-gang sempit dengan arsitektur kolonial-Jawa yang indah. Pusat produksi batik tulis halus dan wisata heritage religius.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">5. Kelurahan Baluwarti</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Berada di DALAM benteng Keraton. "Baluwarti" berarti benteng. Suasana sangat sakral dan tenang, tempat tinggal para abdi dalem dan kerabat keraton.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">6. Kelurahan Gajahan</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Terkenal dengan alun-alun selatan (Alkid) dimana terdapat kebo bule Kyai Slamet. Pusat jajanan malam dan tradisi Masangin (berjalan melewati dua beringin).</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">7. Kelurahan Joyosuran</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Kawasan pemukiman yang berkembang pesat. Memiliki akses dekat ke jalan raya utama menuju Wonogiri/Sukoharjo.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">8. Kelurahan Sangkrah</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Terletak di tepi Bengawan Solo. Memiliki Stasiun Solo Kota (Sangkrah) yang masih aktif melayani kereta wisata Jaladara dan Railbus Batara Kresna.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">9. Kelurahan Kedung Lumbu</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Wilayah yang cukup luas, mencakup area sekitar Luwes Lojiwetan. Pusat bisnis distribusi barang kebutuhan pokok.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">10. Kelurahan Kampung Baru</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Pusat pemerintahan kota (Balai Kota Surakarta) dan Bank Indonesia. Kawasan yang sangat strategis dan tertata rapi.</p>
                            </div>
                        </div>
                    </div>

                    <!-- JEBRES -->
                    <div class="mb-8">
                        <div class="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-t-xl border-b-4 border-blue-500">
                            <h4 class="text-2xl font-bold text-blue-800 dark:text-blue-200">🎓 II. Kecamatan Jebres (11 Kelurahan)</h4>
                            <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">Kode Pos: 5712X | Pusat Pendidikan & Teknologi</p>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-gray-800 p-4 rounded-b-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">1. Kelurahan Jebres</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Rumah bagi Universitas Sebelas Maret (UNS) dan Stasiun Jebres yang bergaya arsitektur Indische Empire. Kawasan kos-kosan mahasiswa terbesar.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">2. Kelurahan Mojosongo</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Kelurahan terluas di Solo. Lokasi TPA Putri Cempo yang kini menjadi PLTSa (Pembangkit Listrik Tenaga Sampah) terbesar. Banyak perumahan baru berkembang di sini.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">3. Kelurahan Pucangsawit</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Terletak di pinggir Bengawan Solo. Memiliki Taman Sunan Jogo Kali yang digagas oleh FX Rudy Rudyatmo, menjadi destinasi wisata sungai.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">4. Kelurahan Jagalan</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Terkenal dengan kuliner daging dan sosis solo. Dahulu merupakan area penyembelihan hewan (jagal). Padat dan sibuk.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">5. Kelurahan Purwodiningratan</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Wilayah administratif yang tenang, banyak bangunan tua peninggalan Belanda dan perkantoran.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">6. Kelurahan Tegalharjo</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Dekat dengan RS dr. Oen Kandang Sapi. Pusat layanan kesehatan utama di wilayah utara Solo.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">7. Kelurahan Kepatihan Wetan</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Bagian dari kawasan Kepatihan (Dalem Patih Keraton). Bersejarah dan berada di tengah kota.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">8. Kelurahan Kepatihan Kulon</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Berbatasan langsung dengan Kampung Baru. Area bisnis dan percetakan.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">9. Kelurahan Sudiroprajan</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Simbol akulturasi Jawa-Tionghoa. Lokasi Pasar Gede Hardjonagoro. Terkenal dengan perayaan Imlek dan Grebeg Sudiro yang meriah.</p>
                            </div>
                             <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">10. Kelurahan Gandekan</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Kawasan padat di tepi sungai Pepe. Sering menjadi indikator banjir kota, namun kini telah banyak dinormalisasi.</p>
                            </div>
                             <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">11. Kelurahan Sewu</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Dikenal sebagai Kampung Beton, karena banyak pengrajin beton dan pot. Terletak di tepi Bengawan Solo (Tanggul).</p>
                            </div>
                        </div>
                    </div>

                    <!-- BANJARSARI -->
                    <div class="mb-8">
                        <div class="bg-red-100 dark:bg-red-900/30 p-4 rounded-t-xl border-b-4 border-red-500">
                            <h4 class="text-2xl font-bold text-red-800 dark:text-red-200">🏟️ III. Kecamatan Banjarsari (15 Kelurahan)</h4>
                            <p class="text-sm text-red-700 dark:text-red-300 mt-1">Kode Pos: 5713X | Pusat Bisnis & Olahraga</p>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white dark:bg-gray-800 p-4 rounded-b-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">1. Kelurahan Manahan</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Jantung olahraga Solo. Stadion Manahan (Venue Piala Dunia U-17) berada di sini. Kawasan elit dan kuliner malam (Shelter Manahan).</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">2. Kelurahan Sumber</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Kediaman Presiden Joko Widodo. Kawasan perumahan tenang dengan akses mudah ke Graha Saba Buana.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">3. Kelurahan Banjarsari</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Nama kecamatan diambil dari sini. Wilayah pemukiman padat yang strategis.</p>
                            </div>
                             <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">4. Kelurahan Nusukan</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Pusat keramaian utara. Pasar Nusukan burung dan kuliner malam. Akses utama ke Terminal Tirtonadi.</p>
                            </div>
                             <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">5. Kelurahan Gilingan</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Lokasi Masjid Raya Sheikh Zayed dan Terminal Tirtonadi. Salah satu kelurahan tersibuk di Solo.</p>
                            </div>
                             <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">6. Kelurahan Joglo</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Pintu gerbang utara Kota Solo. Sedang dibangun Rel Layang Simpang Joglo untuk mengurai kemacetan legendaris.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">7. Kelurahan Kadipiro</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Kelurahan dengan penduduk terbanyak. Sangat luas, mencakup area Solo utara bagian barat.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">8. Kelurahan Banyuanyar</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Sentra kuliner sate kambing (Sate Hj. Bejo). Kawasan perumahan kelas menengah atas.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">9. Kelurahan Mangkubumen</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Kawasan perkotaan dekat Solo Paragon Mall. Banyak hotel dan penginapan.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">10. Kelurahan Punggawan</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Di belakang Masjid Sholihin. Kawasan hunian lama yang tenang di tengah hiruk pikuk kota.</p>
                            </div>
                             <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">11. Kelurahan Timuran</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Lokasi Pura Mangkunegaran (sebagian) dan Pasar Ngarsopuro (Night Market). Pusat budaya Mangkunegaran.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">12. Kelurahan Ketelan</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Area sekitar Pura Mangkunegaran sisi barat. Masjid Al-Wustho Mangkunegaran berada di dekat sini.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">13. Kelurahan Kestalan</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Belakang Pasar Legi. Pusat perdagangan sayur dan hasil bumi.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">14. Kelurahan Setabelan</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Lokasi Pasar Legi (Induk). Pusat ekonomi pasar tradisional terbesar di Solo.</p>
                            </div>
                             <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">15. Kelurahan Trubusaran</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Kelurahan kecil di jantung kota, padat penduduk dan dekat dengan jalur utama.</p>
                            </div>
                        </div>
                    </div>

                    <!-- LAWEYAN -->
                    <div class="mb-8">
                        <div class="bg-green-100 dark:bg-green-900/30 p-4 rounded-t-xl border-b-4 border-green-500">
                            <h4 class="text-2xl font-bold text-green-800 dark:text-green-200">🎨 IV. Kecamatan Laweyan (11 Kelurahan)</h4>
                            <p class="text-sm text-green-700 dark:text-green-300 mt-1">Kode Pos: 5714X | Heritage & Batik</p>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-gray-800 p-4 rounded-b-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">1. Kelurahan Laweyan</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Kampung Batik tertua. Arsitektur rumah saudagar batik yang megah dengan tembok tinggi. Destinasi wisata sejarah utama.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">2. Kelurahan Sondakan</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Sentra produksi batik pendukung Laweyan. Banyak workshop dan showroom batik rumahan.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">3. Kelurahan Pajang</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Situs Keraton Pajang (Jaka Tingkir) ada di sekitar sini. Gerbang barat Solo, lokasi Solo Square Mall.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">4. Kelurahan Jajar</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Kawasan hotel berbintang (Alila, Sunan). Pusat bisnis perhotelan di jalan masuk kota.</p>
                            </div>
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">5. Kelurahan Kerten</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Lokasi RS Panti Waluyo dan markas Korem. Kawasan hijau yang tertata.</p>
                            </div>
                             <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">6. Kelurahan Purwosari</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Stasiun Purwosari (Pemberhentian KA ekonomi dan lokal). Simpang empat strategis dengan flyover ikonik.</p>
                            </div>
                             <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">7. Kelurahan Sriwedari</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Taman Sriwedari, Gedung Wayang Orang, dan Stadion R. Maladi. Pusat hiburan rakyat tempo dulu.</p>
                            </div>
                             <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">8. Kelurahan Penumping</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Lokasi Rumah Dinas Walikota (Loji Gandrung) dan Stadion Sriwedari. Jantung protokol Slamet Riyadi.</p>
                            </div>
                             <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">9. Kelurahan Bumi</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Kawasan pemukiman yang tenang di sisi selatan Laweyan.</p>
                            </div>
                             <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">10. Kelurahan Panularan</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Terkenal dengan Pasar Kembang (Sarkem-nya Solo untuk bunga). Dekat dengan Mapolresta Surakarta.</p>
                            </div>
                             <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">11. Kelurahan Karangasem</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Lokasi kampus UMS (Fakultas Kedokteran) dan RS Mata. Perbatasan dengan Kartasura.</p>
                            </div>
                        </div>
                    </div>

                    <!-- SERENGAN -->
                    <div class="mb-8">
                        <div class="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-t-xl border-b-4 border-purple-500">
                            <h4 class="text-2xl font-bold text-purple-800 dark:text-purple-200">🍽️ V. Kecamatan Serengan (7 Kelurahan)</h4>
                            <p class="text-sm text-purple-700 dark:text-purple-300 mt-1">Kode Pos: 5715X | Kuliner & Emas</p>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-gray-800 p-4 rounded-b-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            
                            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">1. Kelurahan Serengan</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Pusat kuliner legendaris. Banyak warung makan enak tersembunyi di gang-gangnya.</p>
                            </div>
                             <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">2. Kelurahan Danukusuman</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Kawasan pemukiman padat yang agamis. Banyak pondok pesantren dan kegiatan keagamaan.</p>
                            </div>
                             <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">3. Kelurahan Jayengan</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Kampung Permata. Sentra pengrajin perhiasan dan batu mulia. Juga terkenal dengan tradisi Bubur Samin Banjar saat Ramadhan.</p>
                            </div>
                             <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">4. Kelurahan Kratonan</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Kawasan bersejarah di selatan Keraton. Jalan-jalan lebar dengan pohon rindang.</p>
                            </div>
                             <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">5. Kelurahan Tipes</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Pusat perbelanjaan Lotte Mart. Kawasan bisnis yang berkembang di jalan Veteran.</p>
                            </div>
                             <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">6. Kelurahan Kemlayan</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Kampung Seniman. Asal maestro Gesang. Gang-gangnya penuh mural dan nuansa seni.</p>
                            </div>
                             <div class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <strong class="text-lg text-primary block mb-1">7. Kelurahan Joyotakan</strong>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Pintu selatan kota Solo. Sering terdampak luapan sungai, namun memiliki semangat gotong royong yang kuat.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 7. INDEKS PENCARIAN (RENAMED) -->
                <div>
                    <h3 class="text-2xl font-bold mt-8 mb-4">Indeks Pencarian Terkait</h3>

                    <div class="p-6 bg-gray-100 dark:bg-gray-800 text-xs font-mono rounded-xl space-y-4 max-h-96 overflow-y-auto border border-gray-300 dark:border-gray-700">
                        <div>
                            <strong class="text-primary block mb-1">🏛️ Administrasi & Pemerintahan:</strong>
                            <p>Kota Surakarta, Pemkot Solo, DPRD Surakarta, Walikota Surakarta Teguh Prakosa, Gibran Rakabuming Raka, Kecamatan Jebres, Kecamatan Pasar Kliwon, Kecamatan Banjarsari, Kecamatan Serengan, Kecamatan Laweyan, Kode Pos Solo, Kelurahan Mojo Surakarta, Peta Kota Solo.</p>
                        </div>
                        <div>
                            <strong class="text-primary block mb-1">✈️ Pariwisata & Landmark:</strong>
                            <p>Wisata Solo 2024, Keraton Kasunanan Surakarta Hadiningrat, Pura Mangkunegaran, Masjid Raya Sheikh Zayed Solo, Solo Safari Jurug, Taman Balekambang, Benteng Vastenburg, Museum Keris, Museum Batik Danar Hadi, Tumurun Museum, De Tjolomadoe (Karanganyar dekat Solo), Heritage Palace, Pasar Gede, Pasar Klewer, Kampung Batik Laweyan, Kampung Batik Kauman.</p>
                        </div>
                        <div>
                            <strong class="text-primary block mb-1">🍜 Kuliner & Hangout:</strong>
                            <p>Kuliner legendaris Solo, Sarapan enak di Solo, Nasi Liwet Wongso Lemu, Tengkleng Pak Manto, Sate Buntel Mbok Galak, Selat Solo Mbak Lies, Es Dawet Telasih Bu Dermi, Serabi Notosuman, Roti Mandarijn Orion, Wedangan HIK, Cafe hits Solo, Coffee shop Gatsu Solo, Gudeg Ceker Margoyudan, Soto Gading langganan Jokowi.</p>
                        </div>
                        <div>
                            <strong class="text-primary block mb-1">🚆 Transportasi & Akomodasi:</strong>
                            <p>Hotel murah di Solo, Hotel bintang 5 Solo, Alila Solo, Swiss-Belhotel Solo, Stasiun Solobalapan, Stasiun Purwosari, Bandara Adi Soemarmo, Jadwal KRL Solo Jogja, Batik Solo Trans (BST), Sewa motor Solo, Rental mobil Solo, Bus Eka Mira, Tol Solo Semarang, Tol Solo Ngawi.</p>
                        </div>
                         <div>
                            <strong class="text-primary block mb-1">🎓 Pendidikan & Kesehatan:</strong>
                            <p>Universitas Sebelas Maret (UNS), UMS Pabelan, ISI Surakarta, Biaya hidup mahasiswa Solo, Kost daerah UNS, RSUD Moewardi, RS Ortopedi Soeharso, Dokter spesialis Solo, Apotek 24 jam Solo.</p>
                        </div>
                        <div>
                            <strong class="text-primary block mb-1">🎉 Event & Budaya:</strong>
                            <p>Jadwal Event Solo 2025, Haul Habib Ali Solo, Sekaten Solo, Grebeg Sudiro Imlek, Solo Batik Carnival, SIPA Solo, Rock in Solo, Konser Lokananta, CFD Slamet Riyadi, Wayang Orang Sriwedari jadwal, Kirab Malam Satu Suro.</p>
                        </div>
                    </div>
                </div>

                <div class="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-mono">
                    <p><strong>Summary:</strong> Profil lengkap Kota Surakarta (Solo) mencakup sejarah Mataram Islam, 5 kecamatan (Pasar Kliwon, Jebres, Banjarsari, Laweyan, Serengan), wisata budaya Keraton & Mangkunegaran, kuliner legendaris (Nasi Liwet, Tengkleng), pusat pendidikan UNS/ISI, serta fasilitas kesehatan dan transportasi modern.</p>
                </div>
            </div>
        `
    },

    "internal-pemerintahan-surakarta": {
        title: "Mengenal Struktur Pemerintahan Kota Surakarta: Kecamatan dan Kelurahan Lengkap",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/City_of_Surakarta_Logo.svg/1200px-City_of_Surakarta_Logo.svg.png",
        date: new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        author: "Tim Riset Asta Wira Dipta",
        body: `
    <div class="space-y-6 text-gray-800 dark:text-gray-200" >
                <p class="lead text-lg font-medium"><strong>Kota Surakarta</strong>, atau yang lebih dikenal sebagai <strong>Solo</strong>, adalah pusat budaya dan pemerintahan di Jawa Tengah yang memiliki struktur administrasi tertata rapi. Sebagai warga masyarakat, terutama pemuda <strong>Karang Taruna</strong>, penting bagi kita untuk memahami pembagian wilayah administratif ini.</p>
                
                <h3 class="text-2xl font-bold mt-8 mb-4">Profil Singkat Pemerintahan Kota Surakarta</h3>
                <p>
                    Secara administratif, Kota Surakarta terdiri dari <strong>5 Kecamatan</strong> dan <strong>54 Kelurahan</strong>. Setiap wilayah memiliki karakteristik unik, mulai dari pusat perdagangan di Pasar Klewer hingga pusat pendidikan di Jebres.
                    Pemahaman tentang struktur ini penting bagi <strong>organisasi kepemudaan Surakarta</strong> agar dapat menyusun program kerja yang tepat sasaran dan bersinergi dengan pemerintah setempat.
                </p>

                <h3 class="text-2xl font-bold mt-8 mb-4">Daftar Lengkap Kecamatan dan Kelurahan di Surakarta</h3>
                
                <div class="space-y-6 mt-6">
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h4 class="text-xl font-bold text-primary mb-3">1. Kecamatan Pasar Kliwon</h4>
                        <p class="mb-2 text-sm text-gray-500">Kecamatan di mana <strong>Karang Taruna Asta Wira Dipta (Mojo)</strong> berada. Merupakan kawasan budaya dan religi yang kental.</p>
                        <ul class="grid grid-cols-2 gap-2 list-disc pl-5">
                            <li><strong>Kelurahan Mojo</strong> (Home of Asta Wira Dipta)</li>
                            <li>Kelurahan Pasar Kliwon</li>
                            <li>Kelurahan Semanggi</li>
                            <li>Kelurahan Joyosuran</li>
                            <li>Kelurahan Sangkrah</li>
                            <li>Kelurahan Kedung Lumbu</li>
                            <li>Kelurahan Kauman</li>
                            <li>Kelurahan Kampung Baru</li>
                            <li>Kelurahan Gajahan</li>
                            <li>Kelurahan Baluwarti (Keraton)</li>
                        </ul>
                    </div>

                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h4 class="text-xl font-bold text-primary mb-3">2. Kecamatan Jebres</h4>
                        <p class="mb-2 text-sm text-gray-500">Pusat pendidikan (UNS, ISI) dan kawasan teknologi (Technopark).</p>
                        <ul class="grid grid-cols-2 gap-2 list-disc pl-5">
                            <li>Kelurahan Jebres</li>
                            <li>Kelurahan Mojosongo</li>
                            <li>Kelurahan Pucangsawit</li>
                            <li>Kelurahan Jagalan</li>
                            <li>Kelurahan Purwodiningratan</li>
                            <li>Kelurahan Tegalharjo</li>
                            <li>Kelurahan Kepatihan Wetan</li>
                            <li>Kelurahan Kepatihan Kulon</li>
                            <li>Kelurahan Sudiroprajan</li>
                            <li>Kelurahan Gandekan</li>
                            <li>Kelurahan Sewu</li>
                        </ul>
                    </div>

                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h4 class="text-xl font-bold text-primary mb-3">3. Kecamatan Banjarsari</h4>
                        <p class="mb-2 text-sm text-gray-500">Kecamatan terpadat, pusat bisnis, dan lokasi Pura Mangkunegaran.</p>
                        <ul class="grid grid-cols-1 md:grid-cols-2 gap-2 list-disc pl-5">
                            <li>Kelurahan Banjarsari</li>
                            <li>Kelurahan Manahan</li>
                            <li>Kelurahan Mangkubumen</li>
                            <li>Kelurahan Timuran</li>
                            <li>Kelurahan Ketelan</li>
                            <li>Kelurahan Punggawan</li>
                            <li>Kelurahan Kestalan</li>
                            <li>Kelurahan Setabelan</li>
                            <li>Kelurahan Gilingan</li>
                            <li>Kelurahan Nusukan</li>
                            <li>Kelurahan Kadipiro</li>
                            <li>Kelurahan Banyuanyar</li>
                            <li>Kelurahan Sumber</li>
                            <li>Kelurahan Trubusaran</li>
                            <li>Kelurahan Joglo</li>
                        </ul>
                    </div>

                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h4 class="text-xl font-bold text-primary mb-3">4. Kecamatan Laweyan</h4>
                        <p class="mb-2 text-sm text-gray-500">Terkenal sebagai Kampung Batik dan kawasan heritage.</p>
                        <ul class="grid grid-cols-2 gap-2 list-disc pl-5">
                            <li>Kelurahan Laweyan</li>
                            <li>Kelurahan Sondakan</li>
                            <li>Kelurahan Pajang</li>
                            <li>Kelurahan Jajar</li>
                            <li>Kelurahan Karangasem</li>
                            <li>Kelurahan Kerten</li>
                            <li>Kelurahan Purwosari</li>
                            <li>Kelurahan Penumping</li>
                            <li>Kelurahan Sriwedari</li>
                            <li>Kelurahan Panularan</li>
                            <li>Kelurahan Bumi</li>
                        </ul>
                    </div>

                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h4 class="text-xl font-bold text-primary mb-3">5. Kecamatan Serengan</h4>
                        <p class="mb-2 text-sm text-gray-500">Pusat kuliner (Serabi Notosuman) dan kawasan perbelanjaan.</p>
                        <ul class="grid grid-cols-2 gap-2 list-disc pl-5">
                            <li>Kelurahan Serengan</li>
                            <li>Kelurahan Danukusuman</li>
                            <li>Kelurahan Joyotakan</li>
                            <li>Kelurahan Tipes</li>
                            <li>Kelurahan Kratonan</li>
                            <li>Kelurahan Jayengan</li>
                            <li>Kelurahan Kemlayan</li>
                        </ul>
                    </div>
                </div>

                <h3 class="text-2xl font-bold mt-8 mb-4">Sinergi Karang Taruna dengan Pemerintah Kota</h3>
                <p>
                    <strong>Karang Taruna</strong> sebagai mitra strategis pemerintah memiliki peran vital di setiap tingkatan, mulai dari unit RW, Kelurahan, hingga Kecamatan.
                    Di wilayah <strong>Kelurahan Mojo</strong>, Karang Taruna Asta Wira Dipta aktif berkolaborasi dengan perangkat kelurahan dan LPMK untuk menyukseskan program-program pembangunan <strong>Kota Surakarta</strong>.
                    Kami mengajak seluruh elemen pemuda di 54 Kelurahan untuk bersatu padu membangun Solo yang lebih maju, berbudaya, dan sejahtera.
                </p>

                <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl mt-8 border-l-4 border-blue-500">
                    <p class="font-bold text-blue-800 dark:text-blue-300 text-lg mb-2">Tahukah Anda?</p>
                    <p class="text-sm text-blue-800 dark:text-blue-200">
                        Nama-nama kelurahan di Solo seringkali diambil dari sejarah atau potensi lokal wilayah tersebut. Contohnya <strong>Mojo</strong> yang konon dahulu banyak ditumbuhi pohon Maja. Melestarikan sejarah ini adalah tugas kita bersama sebagai generasi muda.
                    </p>
                </div>
            </div >
    `
    },

};

async function getExternalNews(url: string): Promise<NewsDetail | null> {
    try {
        if (!url || !url.startsWith('http')) {
            return null;
        }

        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch ${url} `);
        }

        const html = await res.text();
        const $ = load(html);

        const title = $('h1').first().text().trim();

        // Prioritize Open Graph image, then Twitter image, then specific content selectors
        let image = $('meta[property="og:image"]').attr('content') ||
            $('meta[name="twitter:image"]').attr('content') ||
            $('.detail_media img').attr('src') ||
            $('.read__photo img').attr('src') ||
            $('.pic_artikel img').attr('src') ||
            $('figure img').first().attr('src') ||
            '';

        const body: string[] = [];

        // Try to find the article body container
        const bodyContent = $('.detail_text, .read__content, .article-content, .post-content, .bk-content, .story-body__content, .read__content-body').first();

        if (bodyContent.length > 0) {
            bodyContent.find('p').each((_, el) => {
                const text = $(el).text().trim();
                // Filter content
                if (text && !text.includes('SCROLL TO CONTINUE') && !text.includes('ADVERTISEMENT') && !text.includes('Baca juga:')) {
                    body.push(text);
                }
            });
        } else {
            // Fallback: get all paragraphs that look like content
            $('p').each((_, el) => {
                const text = $(el).text().trim();
                // Heuristic: Content paragraphs are usually longer
                if (text.length > 60) body.push(text);
            });
        }

        return {
            title,
            image,
            body,
            date: $('.date, .read__time, .time').first().text().trim(),
            author: $('.author, .read__author, .editor').first().text().trim()
        };
    } catch (error) {
        console.error("Scraping Error:", error);
        return null;
    }
}

async function getLocalNews(slug: string): Promise<NewsDetail | null> {
    try {
        const postsRef = adminDb.collection('posts');
        // Try to find by slug first
        let snapshot = await postsRef.where('slug', '==', slug).limit(1).get();

        // If not found by slug, try finding by document ID
        if (snapshot.empty) {
            const docRef = postsRef.doc(slug);
            const doc = await docRef.get();
            if (!doc.exists) {
                return null;
            }
            const item = doc.data();
            return {
                title: item?.title || '',
                image: item?.image || '',
                body: item?.content || '',
                date: item?.date || '',
                author: item?.author || "Admin Asta Wira Dipta",
                source: "Karang Taruna Asta Wira Dipta",
                link: slug
            };
        }

        const doc = snapshot.docs[0];
        const item = doc.data();

        return {
            title: item.title || '',
            image: item.image || '',
            body: item.content || '',
            date: item.date || '',
            author: item.author || "Admin Asta Wira Dipta",
            source: "Karang Taruna Asta Wira Dipta",
            link: slug
        };
    } catch (error) {
        console.error("Firestore Read Error:", error);
        return null;
    }
}

// Generate Metadata for SEO
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }): Promise<Metadata> {
    const resolvedSearchParams = await searchParams;
    const url = resolvedSearchParams.url as string;
    const id = resolvedSearchParams.id as string;
    const slug = resolvedSearchParams.slug as string;

    // Check Internal dictionary
    const target = url || id || slug;
    const internalArticle = INTERNAL_ARTICLES[target];

    if (internalArticle) {
        return {
            title: `${internalArticle.title} - Karang Taruna Asta Wira Dipta`,
            description: internalArticle.title,
            alternates: {
                canonical: `https://astawiradipta.my.id/berita/read?url=${encodeURIComponent(target)}`
            },
            robots: {
                index: true,
                follow: true,
            },
            openGraph: {
                title: internalArticle.title,
                description: "Berita dan Artikel Karang Taruna Asta Wira Dipta, Kelurahan Mojo, Surakarta.",
                images: [internalArticle.image.startsWith('http') ? internalArticle.image : `https://astawiradipta.my.id${internalArticle.image.startsWith('/') ? '' : '/'}${internalArticle.image}`],
                type: 'article',
                authors: [internalArticle.author]
            }
        }
    }

    // Attempt to fetch local title for metadata if slug/id exists
    if (slug || id) {
        const localNews = await getLocalNews(slug || id);
        if (localNews) {
            return {
                title: `${localNews.title} - Karang Taruna Asta Wira Dipta`,
                description: localNews.title,
                alternates: {
                    canonical: `https://astawiradipta.my.id/berita/read?slug=${encodeURIComponent(slug || id)}`
                },
                openGraph: {
                    title: localNews.title,
                    description: "Berita dan Artikel Karang Taruna Asta Wira Dipta.",
                    images: [localNews.image.startsWith('http') ? localNews.image : `https://astawiradipta.my.id${localNews.image.startsWith('/') ? '' : '/'}${localNews.image}`],
                    type: 'article',
                }
            }
        }
    }

    // URL adalah berita eksternal (url=https://...) → noindex karena kontennya dari domain lain
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        return {
            title: "Baca Berita - Karang Taruna Asta Wira Dipta",
            description: "Portal Berita dan Informasi Terkini Karang Taruna Asta Wira Dipta.",
            robots: {
                index: false,
                follow: false,
            },
        }
    }

    return {
        title: "Baca Berita - Karang Taruna Asta Wira Dipta",
        description: "Portal Berita dan Informasi Terkini Karang Taruna Asta Wira Dipta.",
        alternates: {
            canonical: "https://astawiradipta.my.id/berita"
        }
    }
}

export default async function ReadNews({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams;
    const url = resolvedSearchParams.url as string;

    // Support for ID param if URL is missing (fallback for some internal routing?)
    const id = resolvedSearchParams.id as string;
    const slug = resolvedSearchParams.slug as string;

    // Determine the effective identifier: url > slug > id
    const effectiveUrl = url || slug || id;

    if (!effectiveUrl) return <div className="p-8 text-center">{`URL Invalid (Missing URL, Slug, or ID)`}</div>;

    // 1. Cek Apakah URL adalah internal slug
    let detail = INTERNAL_ARTICLES[effectiveUrl];

    // 2. Cek Local DB (Content.json)
    if (!detail) {
        detail = await getLocalNews(effectiveUrl) as NewsDetail;
    }

    // 3. Jika bukan internal/local, coba fetch eksternal
    if (!detail && url) {
        detail = await getExternalNews(url) as NewsDetail;
    }

    if (!detail) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 text-center">
                <h2 className="text-xl font-bold mb-4">Gagal memuat konten berita secara penuh.</h2>
                <p className="mb-6 text-gray-600">Ada kesalahan saat mengambil data. Silakan buka tautan asli.</p>
                <a href={url} target="_blank" rel="nofollow" className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                    Buka di Sumber Asli
                </a>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-6 sm:py-12 px-4 sm:px-6">
            {/* Title - Mobile optimized */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white leading-snug sm:leading-tight">
                {detail.title}
            </h1>

            {/* Meta info - Stacked on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 mb-4 sm:mb-6 space-y-1 sm:space-y-0 sm:space-x-4">
                {detail.date && <span className="flex items-center"><svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>{detail.date}</span>}
                {detail.author && <span className="flex items-center"><svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>{detail.author}</span>}
            </div>

            {/* Featured Image */}
            {detail.image && (
                <div className="mb-6 sm:mb-8 rounded-xl overflow-hidden shadow-lg -mx-4 sm:mx-0">
                    <img
                        src={detail.image}
                        alt={detail.title}
                        className="w-full h-auto object-cover"
                    />
                </div>
            )}

            {/* Article Body - Mobile reading optimized */}
            <div className="prose prose-base sm:prose-lg dark:prose-invert max-w-none 
                text-gray-700 dark:text-gray-300
                prose-p:text-[15px] sm:prose-p:text-base prose-p:leading-relaxed sm:prose-p:leading-loose prose-p:mb-4 sm:prose-p:mb-5
                prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:mt-6 sm:prose-headings:mt-8 prose-headings:mb-3 sm:prose-headings:mb-4
                prose-h3:text-xl sm:prose-h3:text-2xl
                prose-ul:my-3 sm:prose-ul:my-4 prose-ul:pl-4 sm:prose-ul:pl-5
                prose-li:text-[14px] sm:prose-li:text-base prose-li:my-1
                prose-strong:text-gray-900 dark:prose-strong:text-white
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                [&_.bg-gradient-to-r]:p-3 sm:[&_.bg-gradient-to-r]:p-4 [&_.bg-gradient-to-r]:text-[13px] sm:[&_.bg-gradient-to-r]:text-sm
                [&_.grid]:gap-3 sm:[&_.grid]:gap-4
                [&_table]:text-xs sm:[&_table]:text-sm
            ">
                {Array.isArray(detail.body) ? (
                    detail.body.map((p, i) => (
                        <p key={i} className="mb-4 leading-relaxed">{p}</p>
                    ))
                ) : (
                    <div dangerouslySetInnerHTML={{ __html: detail.body }} />
                )}
            </div>

            {/* Structured Data (JSON-LD) for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "NewsArticle",
                        "headline": detail.title,
                        "image": [detail.image],
                        "datePublished": new Date().toISOString(), // In real app, use article date
                        "author": [{
                            "@type": "Organization",
                            "name": detail.author || "Karang Taruna Asta Wira Dipta",
                            "url": "https://astawiradipta.my.id"
                        }]
                    })
                }}
            />

            {/* Source/Footer - Touch friendly */}
            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
                {url && url.startsWith('http') ? (
                    <>
                        <p className="text-sm text-gray-500 mb-3">Sumber: {new URL(url).hostname}</p>
                        <a href={url} target="_blank" rel="nofollow" className="inline-flex items-center bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            Buka di Sumber Asli
                        </a>
                    </>
                ) : (
                    <p className="text-sm text-gray-500 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        Sumber: Redaksi Karang Taruna Asta Wira Dipta
                    </p>
                )}
            </div>
        </div>
    );
}
