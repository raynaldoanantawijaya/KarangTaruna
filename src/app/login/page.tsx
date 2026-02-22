'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Lock, User, Key, ChevronRight, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

function LoginForm() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isMaxSessions, setIsMaxSessions] = useState(false);

    useEffect(() => {
        const errParam = searchParams.get('error');
        if (errParam === 'gps_disabled') {
            setError('Sesi Anda dihentikan karena sistem mendeteksi GPS/Lokasi perangkat telah dimatikan. Silakan aktifkan kembali untuk masuk.');
        } else if (errParam === 'session_revoked') {
            setError('Sesi Anda pada perangkat ini telah dicabut/ditutup oleh sistem atau dari perangkat lain. Silakan login kembali jika ini adalah kesalahan.');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setIsMaxSessions(false);

        try {
            // --- 1. Require GPS Location ---
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error('Browser Anda tidak mendukung GPS/Location.'));
                } else {
                    navigator.geolocation.getCurrentPosition(resolve, (err) => {
                        reject(new Error('Akses ditolak: Anda wajib memberikan izin GPS/Lokasi untuk login ke sistem Admin.'));
                    }, { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }); // Fast GPS (cached allowed)
                }
            }).catch(err => {
                throw err; // Re-throw to be caught by the outer catch block
            });

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            let address = `${lat}, ${lon}`; // Default address fallback

            // --- 2. Get Advanced Device Info (Client Hints) ---
            let clientDevice = null;
            const nav = navigator as any;
            if (nav.userAgentData && nav.userAgentData.getHighEntropyValues) {
                try {
                    const hints = await nav.userAgentData.getHighEntropyValues(["model", "platform", "architecture"]);

                    // Filter out fake privacy brands like "Not A;Brand" injected by Chromium
                    let realBrand = '';
                    if (nav.userAgentData.brands) {
                        const validBrandObj = nav.userAgentData.brands.find((b: any) =>
                            !b.brand.toLowerCase().includes('not') && !b.brand.toLowerCase().includes('brand')
                        );
                        realBrand = validBrandObj ? validBrandObj.brand : '';
                    }

                    clientDevice = {
                        brand: realBrand,
                        model: hints.model,
                        os: hints.platform,
                        isMobile: nav.userAgentData?.mobile || false,
                        touchPoints: navigator.maxTouchPoints || 0,
                        screenWidth: window.screen.width || 0
                    };
                } catch (e) {
                    console.warn("Client Hints failed", e);
                }
            } else {
                // Fallback for Firefox/Safari which don't support client hints well
                clientDevice = {
                    isMobile: /Mobi|Android/i.test(navigator.userAgent),
                    touchPoints: navigator.maxTouchPoints || 0,
                    screenWidth: window.screen.width || 0
                };
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
                    location: { latitude: lat, longitude: lon, address, accuracy },
                    clientDevice
                }),
            });

            const data = await res.json();

            if (res.ok) {
                // Kick off reverse geocoding in the background so it doesn't block UI navigation
                const sessionIdFromApi = data.user?.sessionId;
                if (sessionIdFromApi) {
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`)
                        .then(geoRes => geoRes.json())
                        .then(geoData => {
                            if (geoData.display_name) {
                                // Send background update to our own API
                                fetch('/api/auth/update-location', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ sessionId: sessionIdFromApi, address: geoData.display_name })
                                }).catch(console.warn);
                            }
                        })
                        .catch(console.warn);
                }

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
                window.location.href = '/admin';
            } else if (data.code === 'MAX_SESSIONS_REACHED') {
                throw new Error('__MAX_SESSIONS__:' + data.error);
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            const msg: string = err.message || '';
            if (msg.startsWith('__MAX_SESSIONS__:')) {
                setIsMaxSessions(true);
                setError(msg.replace('__MAX_SESSIONS__:', ''));
            } else if (err.code === 'auth/invalid-credential') {
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
                            isMaxSessions ? (
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 p-4 rounded-xl text-sm animate-in slide-in-from-top-2">
                                    <div className="flex items-start gap-2 font-semibold mb-1">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
                                        <span>Batas Perangkat Tercapai</span>
                                    </div>
                                    <p className="ml-7 leading-relaxed">{error}</p>
                                </div>
                            ) : (
                                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-start gap-2 animate-in slide-in-from-top-2">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )
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

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
