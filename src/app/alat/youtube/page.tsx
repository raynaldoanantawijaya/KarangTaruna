"use client";

import { Download, Youtube, Link2, AlertCircle, Loader2, Music, Video, Clock, Eye, User } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface VideoInfo {
    title: string;
    author: string;
    authorUrl: string;
    lengthSeconds: number;
    views: number;
    uploadDate: string;
    thumbnail: string;
    description: string;
    videoUrl: string;
    url: string;
    quality?: string;
}

export default function YouTubeDownloadPage() {
    const [url, setUrl] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
    const [downloadType, setDownloadType] = useState<"mp3" | "mp4">("mp3");
    const [quality, setQuality] = useState("720");

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const formatViews = (views: number) => {
        if (views >= 1000000) {
            return (views / 1000000).toFixed(1) + "M";
        } else if (views >= 1000) {
            return (views / 1000).toFixed(1) + "K";
        }
        return views.toString();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!url.trim()) {
            setError("Masukkan URL YouTube");
            return;
        }

        if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
            setError("URL harus dari YouTube");
            return;
        }

        setError("");
        setLoading(true);
        setVideoInfo(null);

        try {
            const apiUrl = downloadType === "mp3"
                ? `https://api.ryzumi.vip/api/downloader/ytmp3?url=${encodeURIComponent(url)}`
                : `https://api.ryzumi.vip/api/downloader/ytmp4?url=${encodeURIComponent(url)}&quality=${quality}`;

            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error("Gagal mengambil data");
            }

            const data = await response.json();
            setVideoInfo(data);
        } catch (err) {
            setError("Terjadi kesalahan. Pastikan URL valid dan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (videoInfo?.url && videoInfo.url !== "Unknown Download URL") {
            window.open(videoInfo.url, "_blank");
        } else {
            setError("Download URL tidak tersedia. Coba format lain.");
        }
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="relative overflow-hidden transition-colors duration-500 min-h-[180px] sm:min-h-[220px] md:min-h-[280px] flex flex-col justify-start pt-10 sm:pt-14 md:pt-20 pb-6 sm:pb-8 md:pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <Youtube className="h-10 w-10 text-red-500 mr-3" />
                        <h1 className="text-2xl md:text-4xl font-bold text-white">
                            Download <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-yellow-100">YouTube</span>
                        </h1>
                    </div>
                    <p className="text-white/90 dark:text-gray-300 text-sm md:text-base max-w-2xl mx-auto transition-colors">
                        Download video YouTube dalam format MP3 atau MP4.
                    </p>
                </div>
            </div>

            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {/* Download Form */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-6 mb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* URL Input */}
                        <div className="relative">
                            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => {
                                    setUrl(e.target.value);
                                    setError("");
                                }}
                                placeholder="Paste link YouTube di sini..."
                                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Format Selection */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Type Selection */}
                            <div className="flex-1 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setDownloadType("mp3")}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${downloadType === "mp3"
                                            ? "bg-red-600 text-white"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        }`}
                                >
                                    <Music className="h-4 w-4" />
                                    MP3
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDownloadType("mp4")}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${downloadType === "mp4"
                                            ? "bg-red-600 text-white"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        }`}
                                >
                                    <Video className="h-4 w-4" />
                                    MP4
                                </button>
                            </div>

                            {/* Quality Selection (MP4 only) */}
                            {downloadType === "mp4" && (
                                <select
                                    value={quality}
                                    onChange={(e) => setQuality(e.target.value)}
                                    className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    <option value="360">360p</option>
                                    <option value="480">480p</option>
                                    <option value="720">720p</option>
                                    <option value="1080">1080p</option>
                                </select>
                            )}
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <Download className="h-5 w-5" />
                                    Proses Video
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Video Info & Download */}
                {videoInfo && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-6">
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-gray-900">
                            <img
                                src={videoInfo.thumbnail}
                                alt={videoInfo.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                {formatDuration(videoInfo.lengthSeconds)}
                            </div>
                        </div>

                        {/* Video Details */}
                        <div className="p-4 md:p-6">
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-2 mb-2">
                                {videoInfo.title}
                            </h3>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                <a
                                    href={videoInfo.authorUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 hover:text-red-500 transition-colors"
                                >
                                    <User className="h-4 w-4" />
                                    {videoInfo.author}
                                </a>
                                <span className="flex items-center gap-1">
                                    <Eye className="h-4 w-4" />
                                    {formatViews(videoInfo.views)} views
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {videoInfo.uploadDate}
                                </span>
                            </div>

                            {/* Download Button */}
                            <button
                                onClick={handleDownload}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <Download className="h-5 w-5" />
                                Download {downloadType.toUpperCase()}
                                {downloadType === "mp4" && ` (${quality}p)`}
                                {videoInfo.quality && downloadType === "mp3" && ` (${videoInfo.quality})`}
                            </button>

                            {videoInfo.url === "Unknown Download URL" && (
                                <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-3 text-center">
                                    ⚠️ Download MP4 tidak tersedia. Coba gunakan format MP3.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 md:p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Cara Menggunakan:</h3>
                    <ol className="space-y-3 text-gray-600 dark:text-gray-400 text-sm">
                        <li className="flex items-start gap-3">
                            <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                            <span>Salin URL video YouTube yang ingin diunduh</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                            <span>Paste URL di kolom di atas dan pilih format (MP3/MP4)</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                            <span>Klik "Proses Video" lalu "Download" untuk mengunduh</span>
                        </li>
                    </ol>
                </div>

                {/* Warning */}
                <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                        <strong>Catatan:</strong> Pastikan Anda memiliki hak untuk mengunduh konten tersebut. Menghormati hak cipta adalah tanggung jawab pengguna.
                    </p>
                </div>
            </main>
        </div>
    );
}
