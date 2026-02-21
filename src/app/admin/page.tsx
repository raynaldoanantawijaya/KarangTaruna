'use client';

import React from 'react';

import { Users, Eye, Clock, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import PermissionGate from '@/components/admin/PermissionGate';

export default function AdminDashboard() {
    return (
        <PermissionGate permission="manage_dashboard">
            <AdminDashboardContent />
        </PermissionGate>
    );
}

function AdminDashboardContent() {
    const [stats, setStats] = React.useState({
        totalVisits: 0,
        dailyVisits: 0,
        uniqueVisitors: 0,
        chartData: [] as { label: string; visitors: number; key?: string }[]
    });
    const [loading, setLoading] = React.useState(true);
    const [viewType, setViewType] = React.useState<'weekly' | 'yearly'>('weekly');
    const [activeTooltip, setActiveTooltip] = React.useState<number | null>(null);

    React.useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/stats?type=${viewType}`);
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [viewType]);

    const maxVisitors = Math.max(...(stats.chartData?.map(d => d.visitors) || [0]), 1); // Avoid division by zero

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-slate-800 dark:text-slate-200 antialiased font-sans">
            <main className="flex-1 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Dashboard Overview</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">Welcome back, Admin! Here's what's happening today.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                        {/* Total Visitors */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Users className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Total Kunjungan</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900 dark:text-white">
                                                    {loading ? '...' : stats.totalVisits.toLocaleString()}
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Daily Visitors */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Clock className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Pengunjung Hari Ini</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900 dark:text-white">
                                                    {loading ? '...' : stats.dailyVisits.toLocaleString()}
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Unique Visitors */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Eye className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Pengunjung Unik (Hari Ini)</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900 dark:text-white">
                                                    {loading ? '...' : stats.uniqueVisitors.toLocaleString()}
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visitor Chart Section */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                            <div>
                                <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white">Grafik Kunjungan</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {viewType === 'weekly' ? 'Statistik minggu ini (Senin - Minggu)' : 'Statistik per bulan tahun ini'}
                                </p>
                            </div>
                            <div className="flex bg-gray-100 dark:bg-gray-700/50 rounded-lg p-1">
                                <button
                                    onClick={() => setViewType('weekly')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewType === 'weekly'
                                        ? 'bg-white dark:bg-gray-800 text-primary shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    Minggu Ini
                                </button>
                                <button
                                    onClick={() => setViewType('yearly')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewType === 'yearly'
                                        ? 'bg-white dark:bg-gray-800 text-primary shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    Tahun Ini
                                </button>
                            </div>
                        </div>

                        {/* Enhanced CSS Bar Chart */}
                        <div className="h-72 w-full relative">
                            {loading ? (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg backdrop-blur-sm z-10">
                                    <div className="flex flex-col items-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                                        <span className="text-sm">Memuat data...</span>
                                    </div>
                                </div>
                            ) : null}

                            {/* Chart Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-full border-t border-gray-100 dark:border-gray-700/50 h-0 flex items-center relative">
                                        <span className="absolute -top-3 left-0 text-[10px] text-gray-400 w-6">
                                            {Math.round(maxVisitors * (1 - i / 4))}
                                        </span>
                                    </div>
                                ))}
                                {/* Bottom Line (covered by bars but useful for grid visual) */}
                            </div>

                            {/* Bars Container */}
                            <div className="absolute inset-0 flex items-end justify-between pl-8 pb-6 pt-4 gap-[2px] sm:gap-1">
                                {stats.chartData?.length > 0 ? (
                                    stats.chartData.map((data, index) => {
                                        const heightPercentage = Math.max((data.visitors / maxVisitors) * 100, 2); // Min 2% visibility
                                        const isMax = data.visitors === maxVisitors && maxVisitors > 0;

                                        return (
                                            <div
                                                key={index}
                                                className="flex flex-col items-center flex-1 h-full justify-end group relative"
                                                onClick={() => setActiveTooltip(activeTooltip === index ? null : index)}
                                            >
                                                {/* Bar */}
                                                <div
                                                    className={`w-full max-w-[50px] rounded-t sm:rounded-t-md transition-all duration-300 relative cursor-pointer shadow-sm hover:shadow-md hover:scale-105 transform origin-bottom
                                                        ${isMax
                                                            ? 'bg-gradient-to-t from-primary to-primary/60 dark:from-primary dark:to-primary/60'
                                                            : 'bg-gradient-to-t from-primary/60 to-primary/30 dark:from-primary/80 dark:to-primary/40 hover:from-primary hover:to-primary/80'}`}
                                                    style={{ height: `${heightPercentage}%` }}
                                                >
                                                    {/* Value Label (Visible on hover or if space permits/clicked) */}
                                                    <div className={`absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[10px] sm:text-xs py-1 px-2 rounded transition-opacity duration-200 whitespace-nowrap z-50 shadow-lg pointer-events-none ${activeTooltip === index ? 'opacity-100' : 'opacity-0 lg:group-hover:opacity-100'}`}>
                                                        <div className="font-bold text-center">{data.visitors}</div>
                                                        <div className="text-[9px] opacity-80 text-center">{data.label}</div>
                                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                                    </div>
                                                </div>

                                                {/* X-Axis Label */}
                                                <div className="mt-2 text-[9px] sm:text-[10px] font-medium text-gray-500 dark:text-gray-400 w-full text-center truncate group-hover:text-primary transition-colors">
                                                    {viewType === 'weekly'
                                                        ? data.label.substring(0, 3)
                                                        : data.label}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    !loading && (
                                        <div className="w-full text-center text-gray-400 text-sm py-10">Belum ada data.</div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

        </div>

    );
}
