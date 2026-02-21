'use client';

import { useState, useEffect, useCallback } from 'react';
import { Monitor, Smartphone, Trash2, RefreshCw, MapPin, Clock, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/admin/ToastContext';

interface ActiveSession {
    id: string;
    userId: string;
    sessionId: string;
    userName: string;
    role: string;
    deviceInfo: { brand?: string; model?: string; os?: string } | null;
    location: { address?: string; latitude?: number; longitude?: number } | null;
    createdAt: number;
    lastActive: number;
}

function formatTime(ms: number) {
    const d = new Date(ms);
    return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

function timeAgo(ms: number) {
    const diff = Date.now() - ms;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Baru saja';
    if (mins < 60) return `${mins} menit lalu`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} jam lalu`;
    return `${Math.floor(hrs / 24)} hari lalu`;
}

export default function ActiveSessionsPage() {
    const [sessions, setSessions] = useState<ActiveSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [revokingId, setRevokingId] = useState<string | null>(null);
    const { showToast } = useToast();

    const fetchSessions = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/sessions');
            if (res.ok) {
                const data = await res.json();
                setSessions(data.sessions || []);
            } else {
                showToast('Gagal memuat daftar sesi aktif', 'error');
            }
        } catch {
            showToast('Terjadi kesalahan koneksi', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const revokeSession = async (sessionId: string) => {
        if (!confirm('Paksa logout perangkat ini? Pengguna akan terlempar keluar dari sistem.')) return;
        setRevokingId(sessionId);
        try {
            const res = await fetch(`/api/admin/sessions?sessionId=${sessionId}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('Sesi berhasil dicabut', 'success');
                setSessions(prev => prev.filter(s => s.id !== sessionId));
            } else {
                const data = await res.json();
                showToast(data.error || 'Gagal mencabut sesi', 'error');
            }
        } catch {
            showToast('Terjadi kesalahan', 'error');
        } finally {
            setRevokingId(null);
        }
    };

    // Group sessions by user
    const grouped = sessions.reduce<Record<string, ActiveSession[]>>((acc, s) => {
        const key = s.userId;
        if (!acc[key]) acc[key] = [];
        acc[key].push(s);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Shield className="w-6 h-6 text-primary" />
                            Sesi Aktif
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Perangkat yang sedang login. Maks. <strong>2 perangkat</strong> per akun.
                        </p>
                    </div>
                    <button
                        onClick={fetchSessions}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Warning */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 mb-6 flex items-start gap-3 text-sm text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
                    <p>Mencabut sesi akan <strong>memaksa logout</strong> perangkat tersebut secara instan. Gunakan fitur ini dengan bijak.</p>
                </div>

                {isLoading ? (
                    <div className="text-center py-20 text-gray-400">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
                        <p>Memuat sesi aktif...</p>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Tidak ada sesi aktif saat ini.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(grouped).map(([userId, userSessions]) => {
                            const userName = userSessions[0]?.userName || 'Unknown';
                            const role = userSessions[0]?.role || 'unknown';
                            return (
                                <div key={userId} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                    {/* User Header */}
                                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                        <div>
                                            <span className="font-semibold text-gray-900 dark:text-white">{userName}</span>
                                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${role === 'superadmin' ? 'bg-primary/10 text-primary' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                                {role}
                                            </span>
                                        </div>
                                        <div className={`text-xs font-bold px-3 py-1 rounded-full ${userSessions.length >= 2 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                                            {userSessions.length}/2 perangkat
                                        </div>
                                    </div>

                                    {/* Sessions */}
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {userSessions.map(session => {
                                            const isMobile = session.deviceInfo?.os?.toLowerCase().includes('android') || session.deviceInfo?.os?.toLowerCase().includes('ios');
                                            return (
                                                <div key={session.id} className="px-6 py-4 flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        {isMobile ? <Smartphone className="w-5 h-5 text-primary" /> : <Monitor className="w-5 h-5 text-primary" />}
                                                    </div>

                                                    <div className="flex-grow min-w-0">
                                                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                            {[session.deviceInfo?.brand, session.deviceInfo?.model, session.deviceInfo?.os].filter(Boolean).join(' ') || 'Perangkat tidak diketahui'}
                                                        </p>
                                                        {session.location?.address && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                                                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                                                <span className="truncate">{session.location.address}</span>
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            Login: {formatTime(session.createdAt)} · {timeAgo(session.createdAt)}
                                                        </p>
                                                    </div>

                                                    <button
                                                        onClick={() => revokeSession(session.id)}
                                                        disabled={revokingId === session.id}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex-shrink-0"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Cabut
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
