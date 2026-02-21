'use client';

import {
    FileText,
    Search,
    ArrowUpDown,
    Edit,
    Trash2,
    ChevronRight,
    Plus,
    Home,
    Eye
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import PermissionGate from '@/components/admin/PermissionGate';
import { useToast } from '@/components/admin/ToastContext';


export default function PostsPage() {
    return (
        <PermissionGate permission="manage_posts">
            <PostsPageContent />
        </PermissionGate>
    );
}

function PostsPageContent() {
    const [posts, setPosts] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [postToDelete, setPostToDelete] = React.useState<string | null>(null);
    const { showToast } = useToast();

    React.useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/admin/content');
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (error) {
            console.error('Failed to fetch posts', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setPostToDelete(id);
    };

    const confirmDelete = async () => {
        if (!postToDelete) return;

        try {
            const res = await fetch(`/api/admin/content?id=${postToDelete}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                // Remove alert to make it smoother
                fetchPosts();
                showToast('Postingan berhasil dihapus', 'success');
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            console.error('Delete failed', error);
            showToast('Gagal menghapus postingan', 'error');
        } finally {
            setPostToDelete(null);
        }
    };

    const cancelDelete = () => {
        setPostToDelete(null);
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-slate-800 dark:text-slate-200 antialiased font-sans">


            {/* Main Content */}
            <main className="flex-1 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


                    {/* Header & Primary Action */}
                    <div className="md:flex md:items-center md:justify-between mb-8">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:text-3xl">
                                Posts Management
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">Manage, edit, and publish your website content.</p>
                        </div>
                        <div className="mt-4 flex md:mt-0 md:ml-4">
                            <Link href="/admin/editor" className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-95">
                                <Plus className="w-5 h-5 mr-2" />
                                Add New Post
                            </Link>
                        </div>
                    </div>

                    {/* Filters & Search Bar - No Box */}
                    <div className="mb-6">
                        <div className="relative">
                            <label htmlFor="search" className="block text-xs font-medium text-slate-900 dark:text-white mb-1 uppercase tracking-wider">Search</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    name="search"
                                    id="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-600 dark:border-slate-300 rounded-lg bg-gray-700 dark:bg-slate-50 text-white dark:text-slate-900 placeholder-slate-500 dark:placeholder-slate-400 h-10 transition-colors"
                                    placeholder="Search by title..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-gray-800 dark:bg-white shadow-sm rounded-xl overflow-hidden border border-gray-700 dark:border-slate-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700 dark:divide-slate-200">
                                <thead className="bg-gray-700/50 dark:bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer group hover:text-primary transition-colors">
                                            <div className="flex items-center gap-1">
                                                Post Title
                                                <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                                            </div>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                            Date Created
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800 dark:bg-white divide-y divide-gray-700 dark:divide-slate-200">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">Loading...</td>
                                        </tr>
                                    ) : filteredPosts.length === 0 ? (
                                        <tr className="hover:bg-gray-700/50 dark:hover:bg-slate-50 transition-colors">
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <FileText className="w-10 h-10 opacity-20" />
                                                    <p className="text-sm">Belum ada postingan baru.</p>
                                                    <Link href="/admin/editor" className="mt-2 text-primary hover:underline text-xs">
                                                        Buat Postingan Baru
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPosts.map((post) => (
                                            <tr key={post.id} className="hover:bg-gray-700/50 dark:hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-white dark:text-slate-900">{post.title}</div>
                                                    <div className="text-xs text-slate-500">/{post.slug}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.status === 'published' ? 'bg-green-900/30 text-green-400 dark:bg-green-100 dark:text-green-800' : 'bg-yellow-900/30 text-yellow-400 dark:bg-yellow-100 dark:text-yellow-800'}`}>
                                                        {post.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 dark:text-slate-500">
                                                    {new Date(post.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <a
                                                            href={`/berita/read?slug=${post.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-slate-400 hover:text-primary transition-colors"
                                                            title="Preview"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </a>
                                                        <Link href={`/admin/editor?id=${post.id}`} className="text-slate-400 hover:text-primary transition-colors" title="Edit">
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button onClick={() => handleDeleteClick(post.id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Hapus">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {postToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full transform transition-all">
                        <div className="mb-6 text-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Konfirmasi Hapus</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Apakah Anda yakin ingin menghapus postingan ini secara permanen? Aksi ini tidak dapat dibatalkan.
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
