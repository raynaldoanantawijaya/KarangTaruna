'use client';

import React, { useState, useEffect } from 'react';

import {
    Users, Shield, Activity, Plus, MoreHorizontal,
    Edit, Trash2, Lock, Unlock, X, Save, Check, Loader2
} from 'lucide-react';
import PermissionGate from '@/components/admin/PermissionGate';
import { useToast } from '@/components/admin/ToastContext';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    isBlocked: boolean;
    createdAt: string;
}

interface ActivityLog {
    id: string;
    userId: string;
    userName: string;
    action: string;
    details: string;
    timestamp: string;
    ip: string;
    userAgent: string;
    device?: string;
    location?: {
        latitude: number;
        longitude: number;
        address?: string;
        accuracy?: number;
    };
}

const PERMISSIONS_LIST = [
    { id: 'manage_dashboard', label: 'Dashboard (Lihat Statistik Pengunjung)' },
    { id: 'manage_posts', label: 'Kelola Berita (Buat, Edit, Hapus Berita)' },
    { id: 'manage_media', label: 'Kelola Media (Foto & Video)' },
    { id: 'manage_appearance', label: 'Kelola Tampilan (Appearance Website)' },
    { id: 'manage_users', label: 'Kelola Pengguna (Tambah, Edit, Blokir User)' },
];

export default function UsersPage() {
    return (
        <PermissionGate permission="manage_users">
            <UsersPageContent />
        </PermissionGate>
    );
}

function UsersPageContent() {
    const [activeTab, setActiveTab] = useState<'users' | 'activity'>('users');
    const [users, setUsers] = useState<User[]>([]);
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'editor',
        permissions: [] as string[],
        isBlocked: false
    });
    const [isSaving, setIsSaving] = useState(false);
    const [userToDelete, setUserToDelete] = useState<{ id: string; email: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'users') {
                const res = await fetch('/api/admin/users');
                if (res.ok) setUsers(await res.json());
            } else {
                const res = await fetch('/api/admin/activity');
                if (res.ok) setLogs(await res.json());
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '', // Leave blank to keep current
                role: user.role,
                permissions: user.permissions,
                isBlocked: user.isBlocked
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'editor',
                permissions: ['manage_posts'],
                isBlocked: false
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const url = editingUser
                ? `/api/admin/users/${editingUser.id}`
                : '/api/admin/users';

            const method = editingUser ? 'PUT' : 'POST';

            // Don't send empty password on update
            let bodyData: any = { ...formData };
            if (editingUser && !bodyData.password) {
                delete bodyData.password;
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData),
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchData(); // Refresh list
                showToast(editingUser ? 'User updated successfully' : 'User added successfully', 'success');
            } else {
                const err = await res.json();
                showToast(err.error || 'Operation failed', 'error');
            }
        } catch (error) {
            console.error('Submit error', error);
            showToast('Failed to save user', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (id: string, email: string) => {
        setUserToDelete({ id, email });
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;

        try {
            const res = await fetch(`/api/admin/users/${userToDelete.id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchData();
                showToast('User deleted successfully', 'success');
            } else {
                const err = await res.json();
                showToast(err.error || 'Failed to delete user', 'error');
            }
        } catch (error) {
            console.error('Delete error', error);
        } finally {
            setUserToDelete(null);
        }
    };

    const cancelDelete = () => {
        setUserToDelete(null);
    };

    const togglePermission = (permId: string) => {
        setFormData(prev => {
            const perms = prev.permissions.includes(permId)
                ? prev.permissions.filter(p => p !== permId)
                : [...prev.permissions, permId];
            return { ...prev, permissions: perms };
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-slate-800 dark:text-slate-200 font-sans">


            <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">

                {/* Header */}
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:text-3xl sm:truncate">
                            User Management
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
                            Manage access, permissions, and view activity logs.
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`${activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                        >
                            <Users className="w-5 h-5" /> Users
                        </button>
                        <button
                            onClick={() => setActiveTab('activity')}
                            className={`${activeTab === 'activity' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                        >
                            <Activity className="w-5 h-5" /> Activity Logs
                        </button>
                    </nav>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-400" /></div>
                ) : (
                    <>
                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <div className="space-y-4">
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => handleOpenModal()}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    >
                                        <Plus className="w-4 h-4 flex-shrink-0" /> <span>Add User</span>
                                    </button>
                                </div>

                                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {users.map((user) => (
                                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                                                                {user.role}
                                                            </span>
                                                            <div className="text-xs text-gray-400 mt-1">{user.permissions.length === 5 ? 'Full Access' : `${user.permissions.length} Permissions`}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {user.isBlocked ? (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                                    Blocked
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                    Active
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button
                                                                onClick={() => handleOpenModal(user)}
                                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                                                            >
                                                                <Edit className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(user.id, user.email)}
                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                                title="Hapus Pengguna"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Activity Logs Tab */}
                        {activeTab === 'activity' && (
                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Waktu</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pengguna</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aktivitas</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Detail</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Perangkat</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lokasi GPS</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">IP Address</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {logs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 text-sm">Belum ada aktivitas.</td>
                                                </tr>
                                            ) : (
                                                logs.map((log) => {
                                                    const formatAction = (action: string) => {
                                                        switch (action) {
                                                            case 'LOGIN': return 'Masuk';
                                                            case 'CREATE_USER': return 'Tambah User';
                                                            case 'UPDATE_USER': return 'Update User';
                                                            case 'DELETE_USER': return 'Hapus User';
                                                            default: return action;
                                                        }
                                                    };

                                                    // Optional: Attempt to translate legacy English details on the fly
                                                    const formatDetails = (details: string) => {
                                                        if (details.includes('User logged in successfully')) return 'Berhasil masuk ke sistem';
                                                        if (details.includes('Created new user:')) return details.replace('Created new user:', 'Menambahkan user baru:');
                                                        if (details.includes('Updated user:')) return details.replace('Updated user:', 'Memperbarui data user:');
                                                        if (details.includes('Deleted user:')) return details.replace('Deleted user:', 'Menghapus user:');
                                                        return details;
                                                    };

                                                    return (
                                                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                {new Date(log.timestamp).toLocaleString('id-ID')}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                                                                        {log.userName.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div className="ml-3">
                                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{log.userName}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="px-2 py-1 text-xs font-bold rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                                    {formatAction(log.action)}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                                                {formatDetails(log.details)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                                                    {log.device || '-'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                {log.location ? (
                                                                    <div className="flex flex-col gap-1 items-start">
                                                                        <span className="text-xs truncate max-w-[200px]" title={log.location.address || `${log.location.latitude}, ${log.location.longitude}`}>
                                                                            {log.location.address || `${log.location.latitude}, ${log.location.longitude}`}
                                                                        </span>
                                                                        <div className="flex items-center gap-2">
                                                                            <a
                                                                                href={`https://www.google.com/maps?q=${log.location.latitude},${log.location.longitude}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-[11px] text-primary hover:underline font-medium"
                                                                            >
                                                                                Lihat Maps
                                                                            </a>
                                                                            {log.location.accuracy && (
                                                                                <span className="text-[10px] text-gray-400" title={`Akurasi GPS: ~${Math.round(log.location.accuracy)} meter`}>
                                                                                    (±{Math.round(log.location.accuracy)}m)
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs italic text-gray-400">-</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                                                                {log.ip}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* User Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 dark:bg-black opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full relative z-50">
                            <form onSubmit={handleSubmit}>
                                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                                                {editingUser ? 'Edit User' : 'Add New User'}
                                            </h3>

                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white p-2 border"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                                    <input
                                                        type="email"
                                                        required
                                                        disabled={!!editingUser}
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white p-2 border disabled:opacity-50"
                                                        placeholder="user@example.com"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Password {editingUser && <span className="text-xs text-gray-500 font-normal">(Leave blank to keep unchanged)</span>}
                                                    </label>
                                                    <input
                                                        type="password"
                                                        required={!editingUser}
                                                        value={formData.password}
                                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white p-2 border"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permissions</label>
                                                    <div className="space-y-2 border border-gray-200 dark:border-gray-600 rounded-md p-3 max-h-48 overflow-y-auto">
                                                        {PERMISSIONS_LIST.map((perm) => (
                                                            <div key={perm.id} className="flex items-start">
                                                                <div className="flex items-center h-5">
                                                                    <input
                                                                        id={`perm-${perm.id}`}
                                                                        type="checkbox"
                                                                        checked={formData.permissions.includes(perm.id) || formData.permissions.includes('all')}
                                                                        onChange={() => togglePermission(perm.id)}
                                                                        disabled={formData.permissions.includes('all')}
                                                                        className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                                                                    />
                                                                </div>
                                                                <div className="ml-3 text-sm">
                                                                    <label htmlFor={`perm-${perm.id}`} className="font-medium text-gray-700 dark:text-gray-300">
                                                                        {perm.label}
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex items-center mt-2">
                                                    <input
                                                        id="isBlocked"
                                                        type="checkbox"
                                                        checked={formData.isBlocked}
                                                        onChange={(e) => setFormData({ ...formData, isBlocked: e.target.checked })}
                                                        className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="isBlocked" className="ml-2 block text-sm text-red-600 dark:text-red-400 font-medium">
                                                        Block this user (Prevent Login)
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                        Save User
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {userToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full transform transition-all">
                        <div className="mb-6 text-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Konfirmasi Hapus</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Apakah Anda yakin ingin menghapus pengguna <br /><strong className="text-gray-700 dark:text-gray-300">{userToDelete.email}</strong>? Aksi ini tidak dapat dibatalkan.
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
