/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowRight, Calendar, Users, MapPin, Award, CheckCircle } from "lucide-react";
import NewsImage from "@/components/NewsImage";
import { INTERNAL_ARTICLES } from "@/app/berita/read/page";

import GalleryImage from '@/components/GalleryImage';
import { adminDb } from '@/lib/firebase-admin';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  image?: string;
  date: string;
  status: string;
}

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  date: string;
}

import fs from 'fs/promises';
import path from 'path';

async function getInternalNews() {
  try {
    const postsRef = adminDb.collection('posts');
    const snapshot = await postsRef
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error reading internal news from Firestore:", error);
    return [];
  }
}

async function getGalleryItems(limitCount: number = 6) {
  try {
    const snapshot = await adminDb.collection('gallery')
      .orderBy('date', 'desc')
      .limit(limitCount)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GalleryItem));
  } catch (error) {
    console.error("Error reading gallery items from Firestore:", error);
    return [];
  }
}

interface VideoItem {
  id: string;
  title: string;
  description: string;
  youtubeId?: string;
  videoUrl?: string; // Cloudinary or direct URL
  isYouTube: boolean;
  date: string;
}

async function getVideoItems(limitCount: number = 2) {
  try {
    const snapshot = await adminDb.collection('videos')
      .orderBy('date', 'desc')
      .limit(limitCount)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as VideoItem));
  } catch (error) {
    console.error("Error reading video items from Firestore:", error);
    return [];
  }
}

async function getAppearanceData() {
  try {
    const docRef = adminDb.collection('settings').doc('appearance');
    const doc = await docRef.get();

    if (doc.exists) {
      return doc.data();
    }
    return null;
  } catch (error) {
    console.error("Error reading appearance data from Firestore:", error);
    return null;
  }
}


import { Suspense } from "react";
import LatestNewsSection from "@/components/home/LatestNewsSection";
import { LatestNewsSkeleton } from "@/components/home/LatestNewsSkeleton";
import { Metadata } from "next";
import AntiScrape from "@/components/AntiScrape";

// Internal news (static) does not block, but was part of the refactored section.
// I need to add the Internal News section back since I removed it in the previous step's range.
// Wait, the previous step removed lines 177-295 which INCLUDED key internal news logic.
// I must ensure I didn't lose the Internal News section. 
// I will restore it in a subsequent step or include it in LatestNewsSection if I moved it there?
// Creating LatestNewsSection ONLY included the external news.
// So I need to put the Internal News section BACK into page.tsx below the Suspense.

export const metadata: Metadata = {
  title: "Karang Taruna Asta Wira Dipta - Kelurahan Mojo, Surakarta",
  description: "Website Resmi Karang Taruna Asta Wira Dipta, Kelurahan Mojo, Kecamatan Pasar Kliwon, Kota Surakarta (Solo). Wadah pengembangan generasi muda kreatif dan inovatif.",
  keywords: ["karang taruna kelurahan mojo", "karang taruna mojo", "karangtaruna mojo", "kt mojo", "pemuda surakarta", "asta wira dipta", "organisasi pemuda solo"],
  alternates: {
    canonical: "https://astawiradipta.my.id",
  }
};

export default async function Home() {
  const internalNews = await getInternalNews();
  const galleryItems = await getGalleryItems(6); // Limit to 6 for homepage
  const videoItems = await getVideoItems(2); // Limit to 2 for homepage
  const appearance = await getAppearanceData(); // Fetch Appearance Data

  // Default values if data missing
  const hero = appearance?.hero || {
    title: "Karang Taruna Asta Wira Dipta",
    subtitle: "Kelurahan Mojo - Surakarta",
    description: "Organisasi kepemudaan resmi tingkat Kelurahan Mojo, Kecamatan Pasar Kliwon, Kota Surakarta (Solo). Wadah pengembangan generasi muda yang berkarya, berdaya, dan bertanggung jawab sosial.",
    buttonText: "Gabung Sekarang",
    secondaryButtonText: "Pelajari Lebih Lanjut"
  };

  const stats = appearance?.stats || {
    members: "20", membersLabel: "Anggota Aktif",
    programs: "10", programsLabel: "Program Terlaksana",
    units: "12", unitsLabel: "Unit RW Binaan",
    awards: "3", awardsLabel: "Penghargaan"
  };

  const vision = appearance?.vision || "Mewujudkan generasi muda yang mandiri, tangguh, terampil, berakhlak, dan berkualitas dalam pembangunan kesejahteraan sosial.";

  const mission = appearance?.mission || [
    "Mengembangkan potensi generasi muda dan wawasan kebangsaan.",
    "Memperkuat kerjasama antar pemuda dan masyarakat.",
    "Berperan aktif dalam kegiatan sosial dan kemanusiaan."
  ];

  // Use dynamic news if available, otherwise fallback to static for demo
  const displayNews = internalNews.length > 0 ? internalNews : Object.entries(INTERNAL_ARTICLES).map(([slug, article]) => ({
    id: slug,
    title: article.title,
    slug: slug,
    image: article.image,
    date: article.date,
    status: 'published'
  }));


  return (
    <div className="w-full">
      <AntiScrape />
      {/* Hero Section */}
      <div className="relative overflow-hidden transition-colors duration-500 min-h-[280px] sm:min-h-[350px] md:min-h-[450px] flex flex-col justify-start pt-8 sm:pt-10 md:pt-14 pb-8 sm:pb-12 md:pb-16">
        {/* Texture removed as requested for pure CSS styling */}

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 sm:space-x-3 py-1 sm:py-1.5 px-3 sm:px-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-3 sm:mb-6 shadow-lg">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.6)]"></span>
            <span className="text-white text-[10px] sm:text-xs md:text-sm font-bold tracking-wider uppercase">Asta Wira Dipta</span>
          </div>

          <h1 className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-extrabold text-white mb-2 sm:mb-3 leading-tight tracking-tight drop-shadow-md">
            {hero.title}<br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-yellow-100">{hero.subtitle}</span>
          </h1>

          <p className="text-red-50 dark:text-gray-300 text-[10px] sm:text-xs md:text-sm max-w-xs sm:max-w-md md:max-w-xl mx-auto mb-3 sm:mb-5 font-light leading-relaxed opacity-95 transition-colors">
            {hero.description}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
            <Link
              href="/kontak"
              className="group bg-white text-primary hover:bg-gray-50 font-bold py-1.5 sm:py-2 px-4 sm:px-5 rounded-full shadow-xl shadow-red-900/30 transition-all transform hover:-translate-y-1 hover:shadow-2xl flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs"
            >
              {hero.buttonText}
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/profil"
              className="group bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 font-semibold py-1.5 sm:py-2 px-4 sm:px-5 rounded-full transition-all flex items-center justify-center gap-1.5 sm:gap-2 hover:border-white/50 text-[10px] sm:text-xs"
            >
              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {hero.secondaryButtonText}
            </Link>
          </div>
        </div>

      </div>

      <main className="w-full">
        {/* Sambutan Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary rounded-full opacity-20 blur-xl"></div>
              <div className="relative bg-gray-900 dark:bg-white rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 transform rotate-2 hover:rotate-0 transition-transform duration-500 gemerlap-container group">
                {/* Sparkle overlays */}
                <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-300 rounded-full animate-sparkle" style={{ animationDelay: '0s' }}></div>
                <div className="absolute bottom-20 right-10 w-3 h-3 bg-white rounded-full animate-sparkle" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-sparkle" style={{ animationDelay: '0.5s' }}></div>

                <img
                  alt="Logo Karang Taruna"
                  className="rounded-xl w-full h-full object-contain aspect-[4/3] bg-gray-100 dark:bg-gray-800 p-4"
                  src="/visi-misi.webp"
                />
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <div>
                <span className="text-primary font-semibold tracking-wider uppercase text-sm">
                  Visi & Misi
                </span>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  Tujuan & Arah Gerak Kami
                </h2>
                <div className="w-20 h-1 bg-secondary mt-4 rounded-full"></div>
              </div>
              <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Visi</h4>
                  <p>{vision}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Misi</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {Array.isArray(mission) ? mission.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    )) : <li>{String(mission)}</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-12 bg-stats-section border-y border-gray-100 dark:border-none relative overflow-hidden transition-colors duration-300">
          {/* Blurs */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-secondary/5 rounded-full blur-2xl"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="p-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.members}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-200">{stats.membersLabel}</p>
              </div>
              <div className="p-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-secondary/20 text-yellow-700 dark:text-yellow-400 mb-4">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.programs}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-200">{stats.programsLabel}</p>
              </div>
              <div className="p-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.units}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-200">{stats.unitsLabel}</p>
              </div>
              <div className="p-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.awards}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-200">{stats.awardsLabel}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Latest News Section */}
        {/* Latest News Section - Wrapped in Suspense for Non-Blocking Load */}
        <Suspense fallback={<LatestNewsSkeleton />}>
          <LatestNewsSection />
        </Suspense>

        {/* Internal News Grid (4 Items) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-secondary font-semibold tracking-wider uppercase text-sm">
                Kabar Asta Wira Dipta
              </span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                Kegiatan & Artikel Internal (Mojo)
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {displayNews.slice(0, 4).map((article: any) => (
              <div key={article.id} className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full">
                <div className="relative h-40 overflow-hidden">
                  <NewsImage
                    alt={article.title}
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                    src={article.image || '/logo-kt.webp'} // Fallback image
                  />
                  <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/80 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                    Internal
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(article.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    <Link href={`/berita/read?slug=${article.slug}`}>
                      {article.title}
                    </Link>
                  </h3>
                  <div className="mt-auto pt-3">
                    <Link
                      href={`/berita/read?slug=${article.slug}`}
                      className="text-sm font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-1"
                    >
                      Baca <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Programs */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gray-50 dark:bg-transparent rounded-3xl mb-12">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold tracking-wider uppercase text-sm">Program & Kegiatan</span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">Kegiatan Unggulan</h2>
            <div className="w-24 h-1 bg-secondary mx-auto mt-4 rounded-full"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
              Berbagai inisiatif dan kegiatan nyata yang telah kami laksanakan untuk kesejahteraan sosial dan pemberdayaan masyarakat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Item 1 - Program Pelatihan */}
            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700 flex flex-col h-full">
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
            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700 flex flex-col h-full">
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
            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700 flex flex-col h-full">
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

          <div className="text-center mt-12">
            <Link
              href="/program-kerja"
              className="inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold py-3 px-8 rounded-full transition-all duration-300"
            >
              Lihat Semua Program
            </Link>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <span className="text-primary font-semibold tracking-wider uppercase text-sm">Memories & Dokumentasi</span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">Galeri Kegiatan</h2>
            <div className="w-24 h-1 bg-secondary mx-auto mt-4 rounded-full"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
              Kumpulan rekam jejak visual dari berbagai aksi dan kontribusi nyata kami untuk masyarakat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Render Videos First */}
            {videoItems.map((video: VideoItem) => (
              <div key={video.id} className="relative rounded-2xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all h-[250px] md:h-[300px] border border-gray-100 dark:border-gray-800">
                {video.isYouTube && video.youtubeId ? (
                  <iframe
                    className="w-full h-full object-cover"
                    src={`https://www.youtube.com/embed/${video.youtubeId}?modestbranding=1&rel=0`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : video.videoUrl ? (
                  <video
                    className="w-full h-full object-cover"
                    src={video.videoUrl}
                    controls
                    preload="metadata"
                  ></video>
                ) : null}

                {/* Overlay for non-iframe videos or just lower text */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 flex items-end p-6">
                  <div>
                    <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block shadow-sm">Video</span>
                    <h3 className="text-white font-bold text-lg mb-1 drop-shadow-md line-clamp-2">{video.title}</h3>
                  </div>
                </div>
              </div>
            ))}

            {/* Render Photos/Gallery */}
            {galleryItems.map((item: GalleryItem) => (
              <div key={item.id} className="relative rounded-2xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all h-[250px] md:h-[300px]">
                <GalleryImage
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <div>
                    <span className="bg-secondary text-gray-900 text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block shadow-sm">Foto</span>
                    <h3 className="text-white font-bold text-lg mb-1 drop-shadow-md">{item.title}</h3>
                    <p className="text-gray-300 text-xs line-clamp-2">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {videoItems.length === 0 && galleryItems.length === 0 && (
            <div className="text-center py-10 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              Belum ada dokumentasi. Minta Admin untuk mengunggah momen terbaru.
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/program-kerja"
              className="inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold py-3 px-8 rounded-full transition-all duration-300"
            >
              Lihat Seluruh Galeri
            </Link>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 py-20 text-white relative overflow-hidden">
          {/* Watermark texture removed */}
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <span className="inline-block py-1 px-3 rounded-full bg-primary text-white text-xs font-bold tracking-wider mb-6 uppercase border border-red-400">Bergabunglah Bersama Kami</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Siap Berkontribusi Nyata?</h2>
            <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Jadilah agen perubahan di lingkunganmu. Daftarkan diri Anda sekarang dan mari wujudkan pemuda yang produktif, kreatif, dan inovatif.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-secondary hover:bg-secondary-dark text-gray-900 font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                Daftar Anggota Baru
              </button>
              <Link href="/kontak" className="bg-transparent border-2 border-gray-500 hover:bg-gray-700 text-white font-bold py-4 px-10 rounded-full transition-all">
                Hubungi Kami
              </Link>
            </div>
          </div>
        </section>
        {/* SEO Content Section (Hidden visually or unobtrusive but readable by bots) */}
        <section className="bg-gray-50 dark:bg-gray-900 py-8 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Tentang Karang Taruna Kelurahan Mojo</h2>
            <p className="text-xs text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Karang Taruna Asta Wira Dipta adalah organisasi kepemudaan resmi yang berlokasi di Kelurahan Mojo, Kecamatan Pasar Kliwon, Kota Surakarta (Solo), Jawa Tengah.
              Kami berfokus pada pemberdayaan pemuda, kegiatan sosial, dan pembangunan masyarakat di wilayah Mojo dan sekitarnya.
              Bergabunglah bersama kami untuk mewujudkan generasi muda Solo yang berbudaya, berdaya saing, dan bermanfaat bagi lingkungan.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
