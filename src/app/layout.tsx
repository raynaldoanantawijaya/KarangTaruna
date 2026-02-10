import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import PersistentHeaderBg from "@/components/PersistentHeaderBg";
import { ScrollToTop } from "@/components/ScrollToTop";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Karang Taruna Asta Wira Dipta - Mojo, Pasar Kliwon, Surakarta",
    template: "%s | Karang Taruna Asta Wira Dipta"
  },
  description: "Website Resmi Karang Taruna Asta Wira Dipta Kelurahan Mojo, Kecamatan Pasar Kliwon, Kota Surakarta (Solo), Jawa Tengah. Wadah pengembangan generasi muda, kegiatan sosial, program kerja pemuda, dan informasi komunitas karang taruna terbaik di Solo Raya.",
  keywords: [
    // Kata kunci utama
    "karang taruna",
    "karang taruna surakarta",
    "karang taruna solo",
    "karang taruna mojo",
    "karang taruna pasar kliwon",
    "karang taruna jawa tengah",
    "asta wira dipta",
    "asta wira dipta surakarta",
    "asta wira dipta solo",
    // Kombinasi lokasi
    "karang taruna kelurahan mojo",
    "karang taruna kecamatan pasar kliwon",
    "karang taruna kota surakarta",
    "karang taruna kota solo",
    "organisasi pemuda surakarta",
    "organisasi pemuda solo",
    "organisasi pemuda mojo",
    "komunitas pemuda surakarta",
    "komunitas pemuda solo",
    "komunitas pemuda pasar kliwon",
    // Kombinasi kegiatan
    "kegiatan pemuda surakarta",
    "kegiatan pemuda solo",
    "kegiatan sosial surakarta",
    "kegiatan sosial solo",
    "kegiatan sosial mojo",
    "program kerja karang taruna",
    "program pemuda surakarta",
    "program pemuda solo",
    // Kombinasi geografis
    "surakarta",
    "solo",
    "mojo surakarta",
    "mojo solo",
    "pasar kliwon surakarta",
    "pasar kliwon solo",
    "jawa tengah",
    "solo raya",
    // Kombinasi lainnya
    "pemuda mojo surakarta",
    "pemuda pasar kliwon",
    "generasi muda surakarta",
    "generasi muda solo",
    "wadah pemuda surakarta",
    "wadah pemuda solo",
    "organisasi kepemudaan surakarta",
    "organisasi kepemudaan solo",
    "karang taruna terbaik surakarta",
    "karang taruna terbaik solo",
    "karang taruna aktif surakarta",
    "karang taruna aktif solo"
  ],
  authors: [{ name: "Karang Taruna Asta Wira Dipta" }],
  creator: "Karang Taruna Asta Wira Dipta",
  publisher: "Karang Taruna Asta Wira Dipta",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://astawiradipta.my.id",
    siteName: "Karang Taruna Asta Wira Dipta",
    title: "Karang Taruna Asta Wira Dipta - Mojo, Pasar Kliwon, Surakarta (Solo)",
    description: "Website Resmi Karang Taruna Asta Wira Dipta Kelurahan Mojo, Kecamatan Pasar Kliwon, Kota Surakarta (Solo), Jawa Tengah. Wadah pengembangan generasi muda dan kegiatan sosial komunitas.",
    images: [
      {
        url: "/surakarta.webp",
        width: 1200,
        height: 630,
        alt: "Profil Kota Surakarta dan Karang Taruna Mojo",
      },
      {
        url: "/icon-512.webp",
        width: 512,
        height: 512,
        alt: "Logo Karang Taruna Asta Wira Dipta",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Karang Taruna Asta Wira Dipta - Muda, Berkarya, Berbudaya",
    description: "Pusat informasi kegiatan kepemudaan di Kelurahan Mojo, Surakarta. Sinergi membangun kota Solo yang berbudaya dan berkemajuan.",
    images: ["/surakarta.webp"],
  },
  alternates: {
    canonical: "https://astawiradipta.my.id"
  },
  category: "organization",
  verification: {
    google: "your-google-verification-code", // Ganti dengan kode verifikasi Google Search Console
  },
  other: {
    "geo.region": "ID-JT",
    "geo.placename": "Surakarta, Jawa Tengah, Indonesia",
    "geo.position": "-7.5755;110.8243",
    "ICBM": "-7.5755, 110.8243",
    "og:locality": "Surakarta",
    "og:region": "Jawa Tengah",
    "og:country-name": "Indonesia"
  }
};

// Structured Data / JSON-LD for Organization
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Karang Taruna Asta Wira Dipta",
  alternateName: ["Karang Taruna Mojo", "Karang Taruna Surakarta", "Karang Taruna Solo", "Asta Wira Dipta"],
  url: "https://astawiradipta.my.id",
  logo: "https://astawiradipta.my.id/logo.webp",
  description: "Karang Taruna Asta Wira Dipta adalah organisasi kepemudaan di Kelurahan Mojo, Kecamatan Pasar Kliwon, Kota Surakarta (Solo), Jawa Tengah. Wadah pengembangan generasi muda yang tumbuh atas dasar kesadaran dan rasa tanggung jawab sosial.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jl. Sungai Serang I No.313",
    addressLocality: "Surakarta",
    addressRegion: "Jawa Tengah",
    postalCode: "57191",
    addressCountry: "ID"
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -7.5755,
    longitude: 110.8243
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+62-87-888-2-666-99",
    email: "astawiradipta@gmail.com",
    contactType: "customer service",
    availableLanguage: "Indonesian"
  },
  sameAs: [
    "https://www.instagram.com/karangtaruna_mojoska/",
    "https://www.youtube.com/@karangtarunaindonesiaastaw2693"
  ],
  areaServed: {
    "@type": "City",
    name: "Surakarta",
    alternateName: "Solo"
  },
  foundingLocation: {
    "@type": "Place",
    name: "Kelurahan Mojo, Kecamatan Pasar Kliwon, Kota Surakarta"
  }
};

// Local Business Schema for better local SEO
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://astawiradipta.my.id",
  name: "Karang Taruna Asta Wira Dipta",
  image: "https://astawiradipta.my.id/logo.webp",
  telephone: "+62-87-888-2-666-99",
  email: "astawiradipta@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jl. Sungai Serang I No.313, Mojo",
    addressLocality: "Surakarta",
    addressRegion: "Jawa Tengah",
    postalCode: "57191",
    addressCountry: "ID"
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -7.5755,
    longitude: 110.8243
  },
  url: "https://astawiradipta.my.id",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "09:00",
    closes: "21:00"
  },
  priceRange: "Free"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Additional Meta Tags */}
        <meta name="geo.region" content="ID-JT" />
        <meta name="geo.placename" content="Surakarta" />
        <meta name="geo.position" content="-7.5755;110.8243" />
        <meta name="ICBM" content="-7.5755, 110.8243" />
        <link rel="canonical" href="https://astawiradipta.my.id" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a56db" />
      </head>
      <body
        className={`${poppins.variable} font-sans antialiased bg-background text-foreground transition-colors duration-300 overflow-x-hidden w-full relative`}
      >
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <ScrollToTop />
          <main className="flex-grow flex flex-col w-full relative">
            <PersistentHeaderBg />
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
