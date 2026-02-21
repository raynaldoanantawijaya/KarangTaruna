'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Lock, User, Key, ChevronRight, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // --- 1. Require GPS Location ---
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error('Browser Anda tidak mendukung GPS/Location.'));
                } else {
                    navigator.geolocation.getCurrentPosition(resolve, (err) => {
                        reject(new Error('Akses ditolak: Anda wajib memberikan izin GPS/Lokasi untuk login ke sistem Admin.'));
                    }, { enableHighAccuracy: true, timeout: 10000 });
                }
            }).catch(err => {
                throw err; // Re-throw to be caught by the outer catch block
            });

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            let address = `${lat}, ${lon}`;

            // Try reverse geocoding (best effort, don't block login if it fails)
            try {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    address = geoData.display_name || address;
                }
            } catch (e) {
                console.warn("Reverse geocoding failed", e);
            }

            // --- 2. Get Advanced Device Info (Client Hints) ---
            let clientDevice = null;
            const nav = navigator as any;
            if (nav.userAgentData && nav.userAgentData.getHighEntropyValues) {
                try {
                    const hints = await nav.userAgentData.getHighEntropyValues(["model", "platform", "architecture"]);
                    clientDevice = {
                        brand: nav.userAgentData.brands?.[0]?.brand,
                        model: hints.model,
                        os: hints.platform
                    };
                } catch (e) {
                    console.warn("Client Hints failed", e);
                }
            }

            // --- 3. Sign in with Firebase Client SDK ---
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();

            // --- 4. Send ID token to backend to create session cookie & log activity ---
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idToken,
                    location: { latitude: lat, longitude: lon, address },
                    clientDevice
                }),
            });

            const data = await res.json();

            if (res.ok) {
                // Ask browser to save password to Google Password Manager
                if ((window as any).PasswordCredential) {
                    try {
                        const cred = new (window as any).PasswordCredential({
                            id: email,
                            password: password,
                            name: data.name || email,
                        });
                        await navigator.credentials.store(cred);
                    } catch {
                        // Silently ignore if browser doesn't support or user declines
                    }
                }
                router.push('/admin');
                router.refresh();
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.code === 'auth/invalid-credential') {
                setError('Email atau password salah.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Terlalu banyak percobaan gagal. Silakan coba lagi nanti.');
            } else {
                setError(err.message || 'Terjadi kesalahan saat login.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0B1114] flex items-center justify-center p-4 transition-colors duration-300">
            <div className="max-w-md w-full bg-white dark:bg-[#151e23] rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-primary p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-30">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg border border-white/30">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">Admin Access</h2>
                        <p className="text-white/80 text-sm">Karang Taruna Asta Wira Dipta</p>
                    </div>
                </div>

                {/* Form */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-start gap-2 animate-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-1.5 pt-2">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#0B1114] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                                    placeholder="Enter email"
                                    autoComplete="username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Key className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#0B1114] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                                    placeholder="Enter password"
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
                                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98] mt-4"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In <ChevronRight className="w-5 h-5 ml-1" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="bg-gray-50 dark:bg-black/20 px-8 py-4 border-t border-gray-100 dark:border-gray-800 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                        &copy; {new Date().getFullYear()} Karang Taruna Asta Wira Dipta
                    </p>
                </div>
            </div>
        </div>
    );
}
