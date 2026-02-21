'use client';

import React, { useState, useEffect } from 'react';
import { Save, Loader2, Layout, Calendar, Plus, Trash2, Image as ImageIcon, MapPin, Clock, Upload } from 'lucide-react';
import PermissionGate from '@/components/admin/PermissionGate';
import { useToast } from '@/components/admin/ToastContext';
import Image from 'next/image';

interface Program {
    title: string;
    description: string;
    category: string;
    imageUrl: string;
    public_id?: string;
    imageFile?: File; // Local state for delayed upload
    localPreviewUrl?: string; // Local state for UI preview before save
}

interface Agenda {
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    markerColor: 'primary' | 'secondary' | 'gray';
}

interface ProkerData {
    programs: Program[];
    agendas: Agenda[];
}

export default function ProkerPage() {
    return (
        <PermissionGate permission="manage_settings">
            <ProkerPageContent />
        </PermissionGate>
    );
}

function ProkerPageContent() {
    const [data, setData] = useState<ProkerData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchProkerData = async () => {
            try {
                const res = await fetch('/api/admin/proker');
                if (res.ok) {
                    const fetchedData = await res.json();
                    setData({
                        programs: fetchedData.programs || [],
                        agendas: fetchedData.agendas || []
                    });
                } else {
                    showToast('Gagal mengambil data Program Kerja', 'error');
                }
            } catch (error) {
                console.error('Failed to fetch proker data:', error);
                showToast('Terjadi kesalahan server', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProkerData();
    }, [showToast]);

    const handleProgramChange = (index: number, field: keyof Program, value: string) => {
        if (!data) return;
        const newPrograms = [...data.programs];
        newPrograms[index] = { ...newPrograms[index], [field]: value };
        setData({ ...data, programs: newPrograms });
    };

    const handleAgendaChange = (index: number, field: keyof Agenda, value: string) => {
        if (!data) return;
        const newAgendas = [...data.agendas];
        newAgendas[index] = { ...newAgendas[index], [field]: value };
        setData({ ...data, agendas: newAgendas });
    };

    const addProgram = () => {
        if (!data) return;
        setData({
            ...data,
            programs: [
                ...data.programs,
                { title: '', description: '', category: 'Kategori', imageUrl: '' }
            ]
        });
    };

    const removeProgram = (index: number) => {
        if (!data) return;
        const newPrograms = [...data.programs];
        newPrograms.splice(index, 1);
        setData({ ...data, programs: newPrograms });
    };

    const addAgenda = () => {
        if (!data) return;
        setData({
            ...data,
            agendas: [
                ...data.agendas,
                { title: '', date: '01 Jan 2024', time: '08:00 - Selesai', location: '', description: '', markerColor: 'primary' }
            ]
        });
    };

    const removeAgenda = (index: number) => {
        if (!data) return;
        const newAgendas = [...data.agendas];
        newAgendas.splice(index, 1);
        setData({ ...data, agendas: newAgendas });
    };

    const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !data) return;

        // Clean up previous preview URL to avoid memory leaks
        const currentProgram = data.programs[index];
        if (currentProgram.localPreviewUrl) {
            URL.revokeObjectURL(currentProgram.localPreviewUrl);
        }

        const previewUrl = URL.createObjectURL(file);

        const newPrograms = [...data.programs];
        newPrograms[index] = {
            ...newPrograms[index],
            imageFile: file,
            localPreviewUrl: previewUrl
        };
        setData({ ...data, programs: newPrograms });
    };

    const handleUploadToCloudinary = async (file: File): Promise<{ url: string, public_id: string } | null> => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            if (res.ok) {
                return await res.json();
            }
            return null;
        } catch (error) {
            console.error('Upload failed:', error);
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;
        setIsSaving(true);

        try {
            // First, process all pending image uploads
            const processedPrograms = await Promise.all(data.programs.map(async (program) => {
                if (program.imageFile) {
                    const uploadResult = await handleUploadToCloudinary(program.imageFile);
                    if (uploadResult) {
                        return {
                            ...program,
                            imageUrl: uploadResult.url,
                            public_id: uploadResult.public_id,
                            imageFile: undefined,
                            localPreviewUrl: undefined
                        };
                    } else {
                        throw new Error(`Failed to upload image for ${program.title}`);
                    }
                }
                return program;
            }));

            const payloadData = {
                ...data,
                programs: processedPrograms
            };

            const res = await fetch('/api/admin/proker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadData),
            });

            if (res.ok) {
                // Update local state with the returned new URLs
                setData(payloadData as ProkerData);
                showToast('Pengaturan Proker & Agenda berhasil disimpan', 'success');
            } else {
                showToast('Gagal menyimpan pengaturan', 'error');
            }
        } catch (error) {
            console.error('Save error:', error);
            showToast('Terjadi kesalahan saat menyimpan', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Program Kerja & Agenda</h1>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Kelola Kegiatan Unggulan dan Agenda Mendatang yang akan ditampilkan di Halaman Utama.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-10">
                {/* 1. Program Kerja Section */}
                <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Layout className="w-5 h-5 text-primary" /> Kegiatan Unggulan (Program Kerja)
                        </h2>
                        <button
                            type="button"
                            onClick={addProgram}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="w-4 h-4 flex-shrink-0" /> Tambah Program
                        </button>
                    </div>

                    {data.programs.length === 0 ? (
                        <p className="text-gray-500 text-center py-6">Belum ada Program Kerja. Silakan tambah baru.</p>
                    ) : (
                        <ul className="space-y-4">
                            {data.programs.map((program, index) => (
                                <li key={index} className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-600/50 rounded-xl transition-colors">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Image Upload/Preview (Left Side) */}
                                        <div className="flex-shrink-0 w-full md:w-48 h-32 relative rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 group">
                                            {program.localPreviewUrl || program.imageUrl ? (
                                                <>
                                                    <img
                                                        alt={program.title || "Preview"}
                                                        className="h-full w-full object-cover"
                                                        src={program.localPreviewUrl || program.imageUrl}
                                                    />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                                        <label className="cursor-pointer flex flex-col items-center text-white">
                                                            <Upload className="w-6 h-6 mb-1" />
                                                            <span className="text-xs font-medium">Ganti</span>
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => handleImageUpload(index, e)}
                                                            />
                                                        </label>
                                                    </div>
                                                </>
                                            ) : (
                                                <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full hover:text-primary transition-colors text-gray-400">
                                                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                                    <span className="text-xs font-medium text-center px-2">Upload Gambar</span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => handleImageUpload(index, e)}
                                                    />
                                                </label>
                                            )}
                                        </div>

                                        {/* Text Inputs (Middle) */}
                                        <div className="flex-1 min-w-0 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="text"
                                                    required
                                                    value={program.category}
                                                    onChange={(e) => handleProgramChange(index, 'category', e.target.value)}
                                                    className="w-1/3 text-sm font-medium text-primary bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-0 px-0 py-1"
                                                    placeholder="Kategori (mis: Sosial)"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                value={program.title}
                                                onChange={(e) => handleProgramChange(index, 'title', e.target.value)}
                                                className="w-full text-lg font-bold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-0 px-0 py-1"
                                                placeholder="Judul / Nama Program"
                                            />
                                            <textarea
                                                required
                                                rows={2}
                                                value={program.description}
                                                onChange={(e) => handleProgramChange(index, 'description', e.target.value)}
                                                className="w-full text-sm text-gray-500 dark:text-gray-400 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-0 px-0 py-1 resize-none line-clamp-2"
                                                placeholder="Deskripsi singkat tentang inovasi kegiatan ini..."
                                            />
                                        </div>

                                        {/* Action Buttons (Right Side) */}
                                        <div className="flex items-start md:items-center justify-end">
                                            <button
                                                type="button"
                                                onClick={() => removeProgram(index)}
                                                className="flex items-center justify-center w-10 h-10 rounded-full shadow-sm text-red-500 hover:text-white bg-white dark:bg-gray-800 hover:bg-red-600 dark:hover:bg-red-600 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash2 className="h-4 w-4 flex-shrink-0" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* 2. Agenda Mendatang Section */}
                <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-secondary" /> Agenda Mendatang (Timeline)
                        </h2>
                        <button
                            type="button"
                            onClick={addAgenda}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-md hover:bg-secondary-dark transition-colors"
                        >
                            <Plus className="w-4 h-4 flex-shrink-0" /> Tambah Agenda
                        </button>
                    </div>

                    {data.agendas.length === 0 ? (
                        <p className="text-gray-500 text-center py-6">Belum ada Agenda. Silakan tambah baru.</p>
                    ) : (
                        <ul className="space-y-4">
                            {data.agendas.map((agenda, index) => (
                                <li key={index} className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-600/50 rounded-xl transition-colors">
                                    <div className="flex flex-col md:flex-row gap-6">

                                        {/* Date/Time/Location (Left Side) */}
                                        <div className="flex-shrink-0 w-full md:w-56 space-y-3">
                                            <div>
                                                <input
                                                    type="text"
                                                    required
                                                    value={agenda.date}
                                                    onChange={(e) => handleAgendaChange(index, 'date', e.target.value)}
                                                    className="w-full text-sm font-bold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-secondary focus:ring-0 px-0 py-1"
                                                    placeholder="Tanggal (mis: 10 Des 2023)"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={agenda.time}
                                                    onChange={(e) => handleAgendaChange(index, 'time', e.target.value)}
                                                    className="w-full text-xs text-gray-600 dark:text-gray-300 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-secondary focus:ring-0 px-0 py-1"
                                                    placeholder="19:30 - Selesai"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={agenda.location}
                                                    onChange={(e) => handleAgendaChange(index, 'location', e.target.value)}
                                                    className="w-full text-xs text-gray-600 dark:text-gray-300 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-secondary focus:ring-0 px-0 py-1"
                                                    placeholder="Lokasi (mis: Balai Desa)"
                                                />
                                            </div>
                                            <select
                                                value={agenda.markerColor}
                                                onChange={(e) => handleAgendaChange(index, 'markerColor', e.target.value as any)}
                                                className="w-full text-xs rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-secondary focus:ring-secondary dark:bg-gray-800 dark:text-white p-1.5 border bg-white mt-2"
                                            >
                                                <option value="primary">Warna: Merah (Primary)</option>
                                                <option value="secondary">Warna: Kuning (Secondary)</option>
                                                <option value="gray">Warna: Abu-abu (Gray)</option>
                                            </select>
                                        </div>

                                        {/* Text Inputs (Middle) */}
                                        <div className="flex-1 min-w-0 space-y-3 pt-1">
                                            <input
                                                type="text"
                                                required
                                                value={agenda.title}
                                                onChange={(e) => handleAgendaChange(index, 'title', e.target.value)}
                                                className="w-full text-lg font-bold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-secondary focus:ring-0 px-0 py-1"
                                                placeholder="Judul / Nama Agenda"
                                            />
                                            <textarea
                                                required
                                                rows={3}
                                                value={agenda.description}
                                                onChange={(e) => handleAgendaChange(index, 'description', e.target.value)}
                                                className="w-full text-sm text-gray-500 dark:text-gray-400 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-secondary focus:ring-0 px-0 py-1 resize-none line-clamp-3"
                                                placeholder="Deskripsi dan keterangan acara..."
                                            />
                                        </div>

                                        {/* Action Buttons (Right Side) */}
                                        <div className="flex items-start md:items-center justify-end">
                                            <button
                                                type="button"
                                                onClick={() => removeAgenda(index)}
                                                className="flex items-center justify-center w-10 h-10 rounded-full shadow-sm text-red-500 hover:text-white bg-white dark:bg-gray-800 hover:bg-red-600 dark:hover:bg-red-600 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                                title="Hapus Agenda"
                                            >
                                                <Trash2 className="h-4 w-4 flex-shrink-0" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <div className="flex justify-end sticky bottom-6 z-10">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-transparent text-lg font-bold rounded-full shadow-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all transform hover:-translate-y-1"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" /> : <Save className="w-5 h-5 flex-shrink-0" />}
                        <span>Simpan Perubahan</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
