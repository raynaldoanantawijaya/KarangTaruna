'use client';

import React, { useState, useEffect } from 'react';

import { Save, Loader2, Layout, Target, Plus, Trash2 } from 'lucide-react';
import PermissionGate from '@/components/admin/PermissionGate';
import { useToast } from '@/components/admin/ToastContext';

interface AppearanceData {
    hero: {
        title: string;
        subtitle: string;
        description: string;
        buttonText: string;
        secondaryButtonText: string;
    };
    stats: {
        members: string;
        membersLabel: string;
        programs: string;
        programsLabel: string;
        units: string;
        unitsLabel: string;
        awards: string;
        awardsLabel: string;
    };
    vision?: string;
    mission?: string[];
}

export default function AppearancePage() {
    return (
        <PermissionGate permission="manage_appearance">
            <AppearancePageContent />
        </PermissionGate>
    );
}

function AppearancePageContent() {
    const [data, setData] = useState<AppearanceData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/appearance');
            if (res.ok) {
                const json = await res.json();
                // Ensure mission is an array
                if (!json.mission || !Array.isArray(json.mission)) {
                    json.mission = json.mission ? [json.mission] : [];
                }
                setData(json);
            }
        } catch (error) {
            console.error('Failed to fetch appearance data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (section: 'hero' | 'stats', field: string, value: string) => {
        if (!data) return;
        setData({
            ...data,
            [section]: {
                ...data[section],
                [field]: value
            }
        });
    };

    const handleVisionChange = (value: string) => {
        if (!data) return;
        setData({ ...data, vision: value });
    };

    // Mission Handlers
    const handleMissionPointChange = (index: number, value: string) => {
        if (!data || !data.mission) return;
        const newMission = [...data.mission];
        newMission[index] = value;
        setData({ ...data, mission: newMission });
    };

    const addMissionPoint = () => {
        if (!data) return;
        const newMission = data.mission ? [...data.mission, ''] : [''];
        setData({ ...data, mission: newMission });
    };

    const removeMissionPoint = (index: number) => {
        if (!data || !data.mission) return;
        const newMission = data.mission.filter((_, i) => i !== index);
        setData({ ...data, mission: newMission });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate that all stats are numeric only
        if (data && data.stats) {
            const { members, programs, units, awards } = data.stats;
            const isNumeric = (val: string) => /^\d+$/.test(val);

            if (!isNumeric(members) || !isNumeric(programs) || !isNumeric(units) || !isNumeric(awards)) {
                showToast('Semua statistik harus berupa angka saja (tanpa simbol atau huruf).', 'warning');
                return;
            }
        }

        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/appearance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                showToast('Pengaturan berhasil disimpan!', 'success');
            } else {
                showToast('Gagal menyimpan pengaturan.', 'error');
            }
        } catch (error) {
            console.error('Error saving settings', error);
            showToast('Terjadi kesalahan saat menyimpan pengaturan', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!data) return <div className="min-h-screen flex items-center justify-center">Failed to load data</div>;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-slate-800 dark:text-slate-200 antialiased font-sans">


            <main className="flex-1 py-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="md:flex md:items-center md:justify-between mb-8">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:text-3xl">
                                Appearance Settings
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">Customize the homepage content.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">


                        {/* Vision & Mission Section */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-green-600" /> Visi & Misi
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Visi</label>
                                    <textarea
                                        rows={3}
                                        value={data.vision || ''}
                                        onChange={(e) => handleVisionChange(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white p-2 border"
                                        placeholder="Enter Vision statement..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Misi</label>
                                    <div className="space-y-3">
                                        {data.mission?.map((point, index) => (
                                            <div key={index} className="flex gap-2">
                                                <div className="flex-shrink-0 flex items-center justify-center w-8 h-10 bg-gray-100 dark:bg-gray-700 rounded text-sm font-bold text-gray-500">
                                                    {index + 1}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={point}
                                                    onChange={(e) => handleMissionPointChange(index, e.target.value)}
                                                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white p-2 border"
                                                    placeholder={`Mission point ${index + 1}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeMissionPoint(index)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                                    title="Remove point"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addMissionPoint}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Mission Point
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Statistics Section */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Layout className="w-5 h-5 text-secondary" /> Statistics
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">Edit numeric values only (e.g., 20, 10, 12).</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Members */}
                                <div className="border p-4 rounded-md dark:border-gray-600">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Anggota Aktif</label>
                                    <div>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={data.stats.members}
                                            onChange={(e) => {
                                                // Allow numbers ONLY
                                                if (/^[0-9]*$/.test(e.target.value)) {
                                                    handleChange('stats', 'members', e.target.value)
                                                }
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white p-2 border font-mono text-lg"
                                        />
                                    </div>
                                </div>

                                {/* Programs */}
                                <div className="border p-4 rounded-md dark:border-gray-600">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Program Terlaksana</label>
                                    <div>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={data.stats.programs}
                                            onChange={(e) => {
                                                if (/^[0-9]*$/.test(e.target.value)) {
                                                    handleChange('stats', 'programs', e.target.value)
                                                }
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white p-2 border font-mono text-lg"
                                        />
                                    </div>
                                </div>

                                {/* Units */}
                                <div className="border p-4 rounded-md dark:border-gray-600">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Unit RW Binaan</label>
                                    <div>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={data.stats.units}
                                            onChange={(e) => {
                                                if (/^[0-9]*$/.test(e.target.value)) {
                                                    handleChange('stats', 'units', e.target.value)
                                                }
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white p-2 border font-mono text-lg"
                                        />
                                    </div>
                                </div>

                                {/* Awards */}
                                <div className="border p-4 rounded-md dark:border-gray-600">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Penghargaan</label>
                                    <div>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={data.stats.awards}
                                            onChange={(e) => {
                                                if (/^[0-9]*$/.test(e.target.value)) {
                                                    handleChange('stats', 'awards', e.target.value)
                                                }
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white p-2 border font-mono text-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
