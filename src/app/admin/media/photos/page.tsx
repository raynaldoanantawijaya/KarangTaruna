'use client';

import React, { useState, useEffect } from 'react';

import { Trash2, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';
import PermissionGate from '@/components/admin/PermissionGate';
import { useToast } from '@/components/admin/ToastContext';

interface GalleryItem {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    public_id?: string; // Add public_id from Cloudinary
    category: string;
    date: string;
}

export default function MediaPage() {
    return (
        <PermissionGate permission="manage_media">
            <MediaPageContent />
        </PermissionGate>
    );
}

function MediaPageContent() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const { showToast } = useToast();

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [publicId, setPublicId] = useState(''); // State for Cloudinary public_id
    const [category, setCategory] = useState('');

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await fetch('/api/admin/gallery');
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (error) {
            console.error('Failed to fetch gallery items', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/admin/gallery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, imageUrl, public_id: publicId, category }),
            });

            if (res.ok) {
                // Reset form
                setTitle('');
                setDescription('');
                setImageUrl('');
                setPublicId('');
                setCategory('');
                // Refresh list
                // Refresh list
                fetchItems();
                showToast('Foto berhasil ditambahkan', 'success');
            } else {
                showToast('Gagal menambahkan foto', 'error');
            }
        } catch (error) {
            console.error('Error adding item', error);
            showToast('Terjadi kesalahan saat menambahkan foto', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setImageUrl(data.url);
                setPublicId(data.public_id || ''); // Save the public_id
                showToast('Foto berhasil diunggah', 'success');
            } else {
                showToast('Upload gagal', 'error');
            }
        } catch (error) {
            console.error('Error uploading file', error);
            showToast('Terjadi kesalahan saat mengunggah foto', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setItemToDelete(id);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            const res = await fetch(`/api/admin/gallery?id=${itemToDelete}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchItems();
                showToast('Foto berhasil dihapus', 'success');
            } else {
                showToast('Gagal menghapus foto', 'error');
            }
        } catch (error) {
            console.error('Error deleting item', error);
            showToast('Terjadi kesalahan saat menghapus foto', 'error');
        } finally {
            setItemToDelete(null);
        }
    };

    const cancelDelete = () => {
        setItemToDelete(null);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-slate-800 dark:text-slate-200 antialiased font-sans">


            <main className="flex-1 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="md:flex md:items-center md:justify-between mb-8">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:text-3xl">
                                Media Gallery: Photos
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">Manage images for the "Memories" section on the homepage.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Form Section */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-100 dark:border-gray-700 sticky top-24">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Image</h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white p-2 border"
                                            placeholder="e.g. Kegiatan Makrab"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                        <input
                                            type="text"
                                            required
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white p-2 border"
                                            placeholder="e.g. Rekreasi, Edukasi"
                                        />
                                    </div>
                                    {/* File Upload instead of URL */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image</label>
                                        <div className="relative">
                                            {/* Full area proper label if no image, or div if image exists */}
                                            {imageUrl ? (
                                                <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md relative group">
                                                    <img src={imageUrl} alt="Preview" className="mx-auto h-32 object-cover rounded-md shadow-sm" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setImageUrl('')}
                                                        className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-md transform hover:scale-105"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label
                                                    htmlFor="file-upload"
                                                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group relative"
                                                >
                                                    <div className="space-y-1 text-center">
                                                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400 group-hover:text-primary transition-colors" />
                                                        <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                                                            <span className="font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                                                                Upload a file
                                                            </span>
                                                            <input
                                                                id="file-upload"
                                                                name="file-upload"
                                                                type="file"
                                                                className="sr-only"
                                                                accept="image/*"
                                                                onChange={handleFileChange}
                                                            />
                                                            <p className="pl-1">or drag and drop</p>
                                                        </div>
                                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                                    </div>
                                                </label>
                                            )}
                                            {isSubmitting && (
                                                <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-md">
                                                    <Loader2 className="animate-spin text-primary w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                        <textarea
                                            rows={3}
                                            required
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white p-2 border"
                                            placeholder="Short description..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5 mr-1" /> Add Image</>}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* List Section */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                                {isLoading ? (
                                    <div className="p-8 text-center text-gray-500">Loading gallery items...</div>
                                ) : items.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                        <ImageIcon className="w-12 h-12 opacity-20 mb-2" />
                                        <p>No images found. Add one from the form.</p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {items.map((item) => (
                                            <li key={item.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-shrink-0 h-24 w-32 relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-600">
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.title}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Error';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-medium text-primary truncate">
                                                                {item.category}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {item.date}
                                                            </p>
                                                        </div>
                                                        <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                                            {item.title}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <button
                                                            onClick={() => handleDeleteClick(item.id)}
                                                            className="flex items-center justify-center w-8 h-8 rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {itemToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full transform transition-all">
                        <div className="mb-6 text-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Konfirmasi Hapus</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Apakah Anda yakin ingin menghapus foto ini secara permanen? Aksi ini tidak dapat dibatalkan.
                            </p>
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row justify-center gap-3">
                            <button
                                onClick={cancelDelete}
                                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 shadow-md shadow-red-500/30 transition-colors"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
