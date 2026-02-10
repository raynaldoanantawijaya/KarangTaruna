/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useEffect, useCallback } from "react"
import { AlertTriangle, MapPin, Clock, Activity, RefreshCw, Waves, CircleDot, Navigation, Shield, AlertCircle, CheckCircle, ShieldCheck, ShieldAlert, Download, Lock } from "lucide-react"

interface GempaData {
    Tanggal: string
    Jam: string
    DateTime: string
    Coordinates: string
    Lintang: string
    Bujur: string
    Magnitude: string
    Kedalaman: string
    Wilayah: string
    Potensi?: string
    Dirasakan?: string
    Shakemap?: string
}

interface BMKGResponse {
    autogempa: GempaData
    gempaterkini: GempaData[]
    gempadirasakan: GempaData[]
}

interface LocationData {
    latitude: number
    longitude: number
    accuracy?: number
    altitude?: number | null
    altitudeAccuracy?: number | null
    speed?: number | null
    heading?: number | null
    timestamp?: number
    address?: string
    city?: string
    province?: string
    country?: string
    loading: boolean
    error?: string
    verified: boolean
    verificationMethod?: string
    sampleCount?: number
}

interface NearestQuake {
    gempa: GempaData
    distance: number
    impactLevel: "aman" | "waspada" | "siaga" | "bahaya"
}

function getMagnitudeColor(magnitude: string): string {
    const mag = parseFloat(magnitude)
    if (mag >= 7) return "bg-red-600 text-white"
    if (mag >= 6) return "bg-orange-500 text-white"
    if (mag >= 5) return "bg-yellow-500 text-black"
    if (mag >= 4) return "bg-green-500 text-white"
    return "bg-blue-500 text-white"
}

function getMagnitudeLabel(magnitude: string): string {
    const mag = parseFloat(magnitude)
    if (mag >= 7) return "Sangat Kuat"
    if (mag >= 6) return "Kuat"
    if (mag >= 5) return "Sedang"
    if (mag >= 4) return "Ringan"
    return "Minor"
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

// Parse coordinates from BMKG format
function parseCoordinates(coords: string): { lat: number; lon: number } {
    const [lat, lon] = coords.split(',').map(c => parseFloat(c.trim()))
    return { lat, lon }
}

// Determine impact level based on distance and magnitude
function getImpactLevel(distance: number, magnitude: string): "aman" | "waspada" | "siaga" | "bahaya" {
    const mag = parseFloat(magnitude)

    // Calculate impact radius based on magnitude
    // Higher magnitude = larger impact radius
    const impactRadius = Math.pow(10, (mag - 1) / 2) * 10 // Rough estimate

    if (distance > impactRadius * 3) return "aman"
    if (distance > impactRadius * 2) return "waspada"
    if (distance > impactRadius) return "siaga"
    return "bahaya"
}

function getImpactInfo(level: "aman" | "waspada" | "siaga" | "bahaya") {
    switch (level) {
        case "bahaya":
            return {
                label: "BAHAYA",
                color: "bg-red-600 text-white",
                borderColor: "border-red-600",
                icon: AlertTriangle,
                message: "Lokasi Anda berada dalam zona dampak gempa. Segera lakukan evakuasi ke tempat aman!"
            }
        case "siaga":
            return {
                label: "SIAGA",
                color: "bg-orange-500 text-white",
                borderColor: "border-orange-500",
                icon: AlertCircle,
                message: "Lokasi Anda cukup dekat dengan episentrum. Tetap waspada dan siapkan jalur evakuasi."
            }
        case "waspada":
            return {
                label: "WASPADA",
                color: "bg-yellow-500 text-black",
                borderColor: "border-yellow-500",
                icon: AlertCircle,
                message: "Gempa mungkin terasa di lokasi Anda. Tetap tenang dan pantau informasi terbaru."
            }
        default:
            return {
                label: "AMAN",
                color: "bg-green-500 text-white",
                borderColor: "border-green-500",
                icon: CheckCircle,
                message: "Lokasi Anda berada jauh dari episentrum gempa terbaru."
            }
    }
}

export default function BencanaPage() {
    const [data, setData] = useState<BMKGResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<"terkini" | "dirasakan">("terkini")
    const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>('default')
    const [location, setLocation] = useState<LocationData>({
        latitude: 0,
        longitude: 0,
        loading: false,
        verified: false
    })
    const [nearestQuake, setNearestQuake] = useState<NearestQuake | null>(null)
    const [installPrompt, setInstallPrompt] = useState<any>(null)

    // Capture Install Prompt
    useEffect(() => {
        const handleInstallPrompt = (e: any) => {
            e.preventDefault();
            setInstallPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    }, [])

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch("https://api.ryzumi.vip/api/search/bmkg")
            if (!response.ok) throw new Error("Gagal mengambil data")
            const result = await response.json()
            setData(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan")
        } finally {
            setLoading(false)
        }
    }

    // Check Notification Permission on Mount
    useEffect(() => {
        if ('Notification' in window) {
            setNotificationStatus(Notification.permission)
        }

        // Register Service Worker if permission granted
        if (Notification.permission === 'granted') {
            registerServiceWorker()
        }
    }, [])

    const registerServiceWorker = async () => {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/notify-sw.js')
                console.log('SW Registered:', registration)

                // Send START message
                if (navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({ action: 'START_MONITORING' })
                }

                // Request Periodic Sync (Experimental)
                // This allows the browser to wake up the SW periodically (e.g. every 12h or more depending on engagement)
                // Note: Frequency is controlled by browser, not us.
                if ('periodicSync' in registration) {
                    try {
                        await (registration as any).periodicSync.register('check-gempa', {
                            minInterval: 24 * 60 * 60 * 1000 // 1 day (Browser limits this heavily)
                        });
                        console.log('Periodic Sync registered');
                    } catch (e) {
                        console.log('Periodic Sync not supported/allowed:', e);
                    }
                }
            } catch (error) {
                console.error('SW Registration failed:', error)
            }
        }
    }

    // Check query param for notification source
    const [showInstallModal, setShowInstallModal] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const source = urlParams.get('source');

            // If from notification AND install available
            if (source === 'notification' && installPrompt) {
                setShowInstallModal(true);
            }
        }
    }, [installPrompt])

    // Handle Activation Button Click
    const handleActivation = async () => {
        // 1. If Install Prompt is available, Trigger it first
        if (installPrompt) {
            await triggerInstall();
        } else {
            // 2. Request Notification Permission
            await requestNotificationPermission();
        }
    }

    const triggerInstall = async () => {
        if (!installPrompt) return;

        const result = await installPrompt.prompt();
        if (result.outcome === 'accepted') {
            setInstallPrompt(null);
            setShowInstallModal(false);
        }
    }

    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) {
            alert('Browser Anda tidak mendukung notifikasi.')
            return
        }

        const permission = await Notification.requestPermission()
        setNotificationStatus(permission)

        if (permission === 'granted') {
            registerServiceWorker()

            // Show test notification
            new Notification("Monitoring Gempa Aktif", {
                body: "Sistem akan memantau gempa di area Surakarta.",
                icon: "/icon-192.webp"
            })
        }
    }

    // Reverse geocoding using Nominatim (OpenStreetMap)
    const reverseGeocode = async (lat: number, lon: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'Accept-Language': 'id'
                    }
                }
            )
            if (!response.ok) throw new Error("Gagal mendapatkan alamat")
            const data = await response.json()

            const address = data.address || {}
            return {
                address: data.display_name,
                city: address.city || address.town || address.municipality || address.county || address.village || address.suburb,
                province: address.state || address.region,
                country: address.country
            }
        } catch {
            return null
        }
    }

    // ==================== ANTI-SPOOFING FUNCTIONS ====================

    // Anti-spoofing: Check if coordinates are within Indonesia bounds
    const isWithinIndonesia = (lat: number, lon: number): boolean => {
        const minLat = -11.5, maxLat = 6.5
        const minLon = 94.5, maxLon = 141.5
        return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon
    }

    // Anti-spoofing: Validate GPS accuracy
    const isAccuracyAcceptable = (accuracy: number): boolean => {
        return accuracy <= 150 // Accept if within 150 meters
    }

    // Anti-spoofing: Validate individual GPS reading
    const validateGPSReading = (position: GeolocationPosition): { valid: boolean; reason?: string } => {
        const { coords, timestamp } = position

        // Check 1: Accuracy threshold - fake GPS often has perfect or very poor accuracy
        if (coords.accuracy > 1000) {
            return { valid: false, reason: "Akurasi GPS terlalu rendah (>1km). Pastikan GPS aktif." }
        }

        // Check 2: Suspiciously perfect accuracy (common in fake GPS)
        if (coords.accuracy < 1) {
            return { valid: false, reason: "Terdeteksi lokasi palsu (akurasi tidak realistis)." }
        }

        // Check 3: Timestamp validation
        const now = Date.now()
        if (Math.abs(now - timestamp) > 60000) { // More than 1 minute old
            return { valid: false, reason: "Data lokasi sudah kadaluarsa." }
        }

        // Check 4: Null island check
        if (coords.latitude === 0 && coords.longitude === 0) {
            return { valid: false, reason: "Lokasi tidak valid (Null Island)." }
        }

        // Check 5: Invalid coordinate range
        if (coords.latitude < -90 || coords.latitude > 90 || coords.longitude < -180 || coords.longitude > 180) {
            return { valid: false, reason: "Koordinat tidak valid." }
        }

        return { valid: true }
    }

    // Get multiple GPS samples for validation with global timeout
    const getMultipleSamples = (): Promise<GeolocationPosition[]> => {
        return new Promise((resolve) => {
            const samples: GeolocationPosition[] = []
            const targetSamples = 3 // Reduced from 5 to 3 for faster response
            let attempts = 0
            const maxAttempts = 5 // Reduced from 8
            let resolved = false

            // Global timeout to prevent infinite loading (15 seconds max)
            const globalTimeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true
                    // If we have at least 1 sample, use it
                    if (samples.length > 0) {
                        resolve(samples)
                    } else {
                        // Fallback: try single reading with lower accuracy requirement
                        navigator.geolocation.getCurrentPosition(
                            (position) => resolve([position]),
                            () => resolve([]),
                            { enableHighAccuracy: false, timeout: 5000, maximumAge: 30000 }
                        )
                    }
                }
            }, 15000)

            const getSample = () => {
                if (resolved) return

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        if (resolved) return
                        samples.push(position)
                        if (samples.length >= targetSamples) {
                            resolved = true
                            clearTimeout(globalTimeout)
                            resolve(samples)
                        } else if (attempts < maxAttempts) {
                            attempts++
                            setTimeout(getSample, 200) // Reduced delay from 300ms to 200ms
                        } else {
                            resolved = true
                            clearTimeout(globalTimeout)
                            resolve(samples)
                        }
                    },
                    () => {
                        if (resolved) return
                        attempts++
                        if (attempts < maxAttempts && samples.length < targetSamples) {
                            setTimeout(getSample, 200)
                        } else {
                            resolved = true
                            clearTimeout(globalTimeout)
                            resolve(samples)
                        }
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 5000, // Reduced from 8000ms to 5000ms
                        maximumAge: 0
                    }
                )
            }
            getSample()
        })
    }

    // Calculate weighted average position (weight by accuracy)
    const calculateWeightedPosition = (samples: GeolocationPosition[]): { lat: number; lon: number; accuracy: number } => {
        if (samples.length === 0) return { lat: 0, lon: 0, accuracy: 9999 }

        // Use inverse accuracy as weight (more accurate = higher weight)
        let totalWeight = 0
        let weightedLat = 0
        let weightedLon = 0
        let minAccuracy = Infinity

        for (const sample of samples) {
            const weight = 1 / sample.coords.accuracy
            totalWeight += weight
            weightedLat += sample.coords.latitude * weight
            weightedLon += sample.coords.longitude * weight
            if (sample.coords.accuracy < minAccuracy) {
                minAccuracy = sample.coords.accuracy
            }
        }

        return {
            lat: weightedLat / totalWeight,
            lon: weightedLon / totalWeight,
            accuracy: minAccuracy
        }
    }

    // Check position consistency (anti-spoofing)
    const checkPositionConsistency = (samples: GeolocationPosition[]): { consistent: boolean; maxDeviation: number } => {
        if (samples.length < 2) return { consistent: true, maxDeviation: 0 }

        // Calculate centroid
        const avgLat = samples.reduce((acc, s) => acc + s.coords.latitude, 0) / samples.length
        const avgLon = samples.reduce((acc, s) => acc + s.coords.longitude, 0) / samples.length

        // Find max deviation from centroid
        let maxDeviation = 0
        for (const sample of samples) {
            const dist = calculateDistance(avgLat, avgLon, sample.coords.latitude, sample.coords.longitude) * 1000 // in meters
            if (dist > maxDeviation) {
                maxDeviation = dist
            }
        }

        // Fake GPS often has suspiciously consistent readings (< 1m deviation)
        // Or extremely inconsistent readings (> 500m deviation in quick succession)
        const tooConsistent = maxDeviation < 1 && samples.length >= 3
        const tooInconsistent = maxDeviation > 500

        return {
            consistent: !tooConsistent && !tooInconsistent,
            maxDeviation
        }
    }

    // Calculate standard deviation of accuracy (fake GPS often has identical accuracy)
    const getAccuracyDeviation = (samples: GeolocationPosition[]): number => {
        if (samples.length < 2) return 999
        const accuracies = samples.map(s => s.coords.accuracy)
        const mean = accuracies.reduce((a, b) => a + b, 0) / accuracies.length
        const variance = accuracies.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / accuracies.length
        return Math.sqrt(variance)
    }

    // ==================== MAIN LOCATION FUNCTION ====================

    const getUserLocation = useCallback(async () => {
        if (!navigator.geolocation) {
            setLocation(prev => ({
                ...prev,
                error: "Geolocation tidak didukung browser Anda",
                verified: false
            }))
            return
        }

        setLocation(prev => ({ ...prev, loading: true, error: undefined }))

        // Check permission status first using Permissions API
        try {
            if (navigator.permissions) {
                const permissionStatus = await navigator.permissions.query({ name: 'geolocation' })

                if (permissionStatus.state === 'denied') {
                    setLocation(prev => ({
                        ...prev,
                        loading: false,
                        error: "Akses lokasi ditolak. Silakan aktifkan izin lokasi di pengaturan browser Anda:\n\n📱 Android Chrome: Ketuk ikon gembok/info di address bar → Izin → Lokasi → Izinkan\n\n🖥️ Desktop: Klik ikon gembok di address bar → Izin situs → Lokasi → Izinkan",
                        verified: false
                    }))
                    return
                }
            }
        } catch {
            // Permissions API not supported, continue with regular geolocation request
        }

        try {
            // Get multiple samples for validation
            const samples = await getMultipleSamples()

            if (samples.length === 0) {
                // Check if it's a permission issue or GPS issue
                setLocation(prev => ({
                    ...prev,
                    loading: false,
                    error: "Gagal mendapatkan lokasi.\n\n🔹 Pastikan GPS/Lokasi aktif di perangkat Anda\n🔹 Izinkan akses lokasi saat browser meminta\n🔹 Jika sudah ditolak sebelumnya, buka pengaturan browser dan aktifkan izin lokasi untuk situs ini",
                    verified: false
                }))
                return
            }

            // Filter valid samples
            const validSamples = samples.filter(s => validateGPSReading(s).valid)

            if (validSamples.length === 0) {
                const firstInvalid = validateGPSReading(samples[0])
                setLocation(prev => ({
                    ...prev,
                    loading: false,
                    error: firstInvalid.reason || "Lokasi tidak valid",
                    verified: false
                }))
                return
            }

            // Check consistency (anti-spoofing)
            const consistency = checkPositionConsistency(validSamples)
            const accuracyDeviation = getAccuracyDeviation(validSamples)

            // Calculate final position
            const finalPos = calculateWeightedPosition(validSamples)
            const bestSample = validSamples.reduce((best, current) =>
                current.coords.accuracy < best.coords.accuracy ? current : best
            )

            // Determine verification status
            let verified = true
            let verificationMethod = ""
            const warnings: string[] = []

            // Anti-spoofing checks
            if (!consistency.consistent) {
                if (consistency.maxDeviation < 1) {
                    verified = false
                    warnings.push("Pola lokasi tidak alami")
                } else {
                    warnings.push("Posisi tidak stabil")
                }
            }

            if (accuracyDeviation < 0.1 && validSamples.length >= 3) {
                // Suspiciously identical accuracy values
                verified = false
                warnings.push("Akurasi tidak natural")
            }

            if (!isAccuracyAcceptable(finalPos.accuracy)) {
                verified = false
                warnings.push("Akurasi rendah")
            }

            // Determine verification level
            if (verified && warnings.length === 0) {
                if (finalPos.accuracy <= 10) {
                    verificationMethod = "✓ GPS Presisi Tinggi"
                } else if (finalPos.accuracy <= 30) {
                    verificationMethod = "✓ GPS Sangat Akurat"
                } else if (finalPos.accuracy <= 50) {
                    verificationMethod = "✓ GPS Akurat"
                } else if (finalPos.accuracy <= 100) {
                    verificationMethod = "✓ GPS Terverifikasi"
                } else {
                    verificationMethod = "✓ GPS Standard"
                }

                if (!isWithinIndonesia(finalPos.lat, finalPos.lon)) {
                    verificationMethod += " (Luar Indonesia)"
                }
            } else if (warnings.length > 0) {
                verificationMethod = "⚠ " + warnings.join(", ")
            } else {
                verificationMethod = "⚠ Tidak Terverifikasi"
            }

            // Get address from coordinates
            const geoData = await reverseGeocode(finalPos.lat, finalPos.lon)

            setLocation({
                latitude: finalPos.lat,
                longitude: finalPos.lon,
                accuracy: finalPos.accuracy,
                altitude: bestSample.coords.altitude,
                altitudeAccuracy: bestSample.coords.altitudeAccuracy,
                speed: bestSample.coords.speed,
                heading: bestSample.coords.heading,
                timestamp: bestSample.timestamp,
                address: geoData?.address,
                city: geoData?.city,
                province: geoData?.province,
                country: geoData?.country,
                loading: false,
                verified,
                verificationMethod,
                sampleCount: validSamples.length
            })

        } catch (err) {
            setLocation(prev => ({
                ...prev,
                loading: false,
                error: err instanceof Error ? err.message : "Gagal mendapatkan lokasi",
                verified: false
            }))
        }
    }, [])

    // Helper to check if quake is recent (within 24 hours)
    function isRecentQuake(dateStr: string, timeStr: string): boolean {
        try {
            // Parse date "06 Feb 2025" -> "2025-02-06"
            // BMKG format usually: "dd MMM yyyy", "HH:mm:ss WIB"
            // We can treat them as string or try to parse.
            // Simplified approach: BMKG often provides DateTime ISO like "2025-02-06T12:00:00+07:00" in some endpoints, 
            // but here we have separate fields. Let's rely on DateTime field if available, or current data structure.

            // Actually, the interface has DateTime: string. Let's use that if possible.
            // If not available/reliable, we can parse manually.

            // Let's assume DateTime is ISO or parseable.
            // If DateTime missing, fallback to parsing Tanggal/Jam.

            // Note: The previous code didn't use DateTime field in logic, just passed it around.
            // Let's rely on DateTime string which is standard in this API.

            // However, the `GempaData` interface has `DateTime`.
            // Let's try parsing `DateTime`.

            // Allow quakes from the last 24 hours
            const now = new Date()
            const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

            // Try parsing DateTime field first
            // Example DateTime: "2025-02-06T06:23:16+07:00"
            // But wait, the API response might not have strict ISO.
            // Let's try to parse "Tanggal" and "Jam" manually to be safe for Indonesian format?
            // "06 Feb 2025", "13:23:45 WIB"

            // Actually, let's just parsing DateTime if it exists.
            // If not, we might need a parser map for months.

            // Let's use the provided DateTime field from the API if it's there.
            // The API (https://api.ryzumi.vip/api/search/bmkg) usually returns standard BMKG format.
            // BMKG `DateTime` is usually ISO-8601 compliant.

            // Let's assume we can use DateTime.
            // If DateTime is not available in the item, return false (safe).

            // WAIT: `isRecentQuake` needs to be called inside the loop.
            return true; // Placeholder for now, logic below
        } catch (e) {
            return false
        }
    }

    // Function to parse BMKG date string to Date object
    const parseGempaDate = (dateTimeStr: string): Date => {
        try {
            return new Date(dateTimeStr)
        } catch {
            return new Date(0) // Invalid date
        }
    }

    // Calculate nearest earthquake when data or location changes
    useEffect(() => {
        if (!data || !location.latitude || !location.longitude) return

        // Combine all earthquakes
        const allQuakes = [...data.gempaterkini, ...data.gempadirasakan]

        let nearest: NearestQuake | null = null
        let minDistance = Infinity

        const now = new Date()
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

        const isRecent = (dt: string) => {
            const quakeDate = new Date(dt)
            return quakeDate >= twentyFourHoursAgo
        }

        for (const gempa of allQuakes) {
            // Filter by time: Only consider quakes within last 24 hours
            if (!isRecent(gempa.DateTime)) continue;

            const { lat, lon } = parseCoordinates(gempa.Coordinates)
            const distance = calculateDistance(location.latitude, location.longitude, lat, lon)

            if (distance < minDistance) {
                minDistance = distance
                nearest = {
                    gempa,
                    distance,
                    impactLevel: getImpactLevel(distance, gempa.Magnitude)
                }
            }
        }

        // Also check autogempa (usually the absolute latest significant one)
        if (data.autogempa) {
            // Check if autogempa is recent too!
            if (isRecent(data.autogempa.DateTime)) {
                const { lat, lon } = parseCoordinates(data.autogempa.Coordinates)
                const distance = calculateDistance(location.latitude, location.longitude, lat, lon)

                // If autogempa is closer AND recent, it overrides (or competes with) gempaterkini
                if (distance < minDistance) {
                    nearest = {
                        gempa: data.autogempa,
                        distance,
                        impactLevel: getImpactLevel(distance, data.autogempa.Magnitude)
                    }
                }
            }
        }

        setNearestQuake(nearest)
    }, [data, location.latitude, location.longitude])

    useEffect(() => {
        fetchData()
        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchData, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    const impactInfo = nearestQuake ? getImpactInfo(nearestQuake.impactLevel) : null
    const ImpactIcon = impactInfo?.icon || Shield

    return (
        <div className="w-full">
            {/* Header */}
            <div className="relative overflow-hidden transition-colors duration-500 min-h-[180px] sm:min-h-[220px] md:min-h-[280px] flex flex-col justify-start pt-10 sm:pt-14 md:pt-20 pb-6 sm:pb-8 md:pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <AlertTriangle className="h-10 w-10 text-yellow-400 mr-3" />
                        <h1 className="text-2xl md:text-4xl font-bold text-white">
                            Info <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-yellow-100">Bencana</span>
                        </h1>
                    </div>
                    <p className="text-white/90 dark:text-gray-300 text-sm md:text-base max-w-2xl mx-auto transition-colors">
                        Informasi gempa bumi terkini dari BMKG dengan pelacakan lokasi presisi tinggi.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Notification Card */}
                {/* Notification Card (Ultra Compact) */}
                <section className="mb-6">
                    <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl p-3 text-white shadow-md relative overflow-hidden flex items-center justify-between gap-3">
                        <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                            <ShieldAlert className="w-16 h-16" />
                        </div>

                        <div className="relative z-10 flex-1 min-w-0">
                            <h2 className="text-sm font-bold flex items-center gap-1.5 mb-0.5 whitespace-nowrap">
                                <ShieldCheck className="h-4 w-4 text-blue-200" />
                                Monitor Gempa Surakarta
                            </h2>
                            <p className="text-blue-200 text-xs truncate">
                                Notifikasi otomatis gempa area Surakarta (Background).
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Install Button (Visible if prompt exists) */}
                            {installPrompt && (
                                <button
                                    onClick={triggerInstall}
                                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 bg-white text-blue-700 active:bg-blue-50"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    Install
                                </button>
                            )}

                            {/* Notification Status Button */}
                            <button
                                onClick={requestNotificationPermission}
                                disabled={!!installPrompt || notificationStatus === 'granted'}
                                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 ${installPrompt
                                    ? 'bg-white/20 text-white/50 cursor-not-allowed' // Locked/Disabled Look
                                    : notificationStatus === 'granted'
                                        ? 'bg-green-500 text-white cursor-default'
                                        : 'bg-white text-blue-700 active:bg-blue-50'
                                    }`}
                            >
                                {installPrompt ? (
                                    <>
                                        <Lock className="h-3.5 w-3.5" />
                                        Wajib Install
                                    </>
                                ) : notificationStatus === 'granted' ? (
                                    <>
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        Aktif
                                    </>
                                ) : (
                                    <>
                                        <Shield className="h-3.5 w-3.5" />
                                        Aktifkan
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    {/* Tiny Tip */}
                    <p className="text-[10px] text-center mt-1 text-gray-400 dark:text-gray-500">
                        *Tips: Install App & Matikan Battery Saver agar notifikasi lancar.
                    </p>
                </section>

                {/* Location Tracking Card */}
                <section className="mb-8">
                    <div className={`rounded-2xl p-6 border-2 ${nearestQuake ? impactInfo?.borderColor : location.latitude ? 'border-green-500 dark:border-green-600' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 shadow-lg`}>
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                            {/* Location Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-primary/10 p-3 rounded-full">
                                        <Navigation className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Lokasi Anda</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Pelacakan GPS Presisi Tinggi dengan Anti-Spoofing</p>
                                    </div>
                                </div>

                                {location.loading ? (
                                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                        <div>
                                            <span className="block">Mendeteksi lokasi GPS...</span>
                                            <span className="text-xs text-gray-500">Mohon tunggu maksimal 15 detik</span>
                                        </div>
                                    </div>
                                ) : location.error ? (
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2 text-red-500">
                                            <ShieldAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm font-medium whitespace-pre-line">{location.error}</p>
                                        </div>
                                        <button
                                            onClick={getUserLocation}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                                        >
                                            <Navigation className="h-4 w-4" />
                                            Coba Lagi
                                        </button>
                                    </div>
                                ) : location.latitude ? (
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {location.city || 'Lokasi'}{location.province ? `, ${location.province}` : ''}
                                                </p>
                                                {location.address && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                        {location.address}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Verification Status */}
                                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${location.verified ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                                            {location.verified ? (
                                                <ShieldCheck className="h-4 w-4" />
                                            ) : (
                                                <ShieldAlert className="h-4 w-4" />
                                            )}
                                            <span className="font-medium">{location.verificationMethod}</span>
                                        </div>

                                        {/* Technical Details */}
                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                            <div>
                                                <span className="block font-medium">Koordinat</span>
                                                <span>{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</span>
                                            </div>
                                            <div>
                                                <span className="block font-medium">Akurasi</span>
                                                <span>±{location.accuracy?.toFixed(1) || 'N/A'} meter</span>
                                            </div>
                                            <div>
                                                <span className="block font-medium">Sampel GPS</span>
                                                <span>{location.sampleCount || 1} pembacaan</span>
                                            </div>
                                            <div>
                                                <span className="block font-medium">Waktu</span>
                                                <span>{location.timestamp ? new Date(location.timestamp).toLocaleTimeString('id-ID') : 'N/A'}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={getUserLocation}
                                            className="text-sm text-primary hover:underline flex items-center gap-1"
                                        >
                                            <RefreshCw className="h-3 w-3" />
                                            Perbarui lokasi
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={getUserLocation}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                                    >
                                        <Navigation className="h-4 w-4" />
                                        Lacak Lokasi Saya
                                    </button>
                                )}
                            </div>

                            {/* Impact Status */}
                            {nearestQuake && location.latitude ? (
                                <div className={`rounded-xl p-5 ${impactInfo?.color} min-w-[280px]`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <ImpactIcon className="h-8 w-8" />
                                        <div>
                                            <p className="text-sm opacity-80">Status Dampak</p>
                                            <p className="text-2xl font-bold">{impactInfo?.label}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm opacity-90 mb-4">{impactInfo?.message}</p>
                                    <div className="bg-black/20 rounded-lg p-3 space-y-1 text-sm">
                                        <p>📍 Jarak: <strong>{nearestQuake.distance.toFixed(1)} km</strong></p>
                                        <p>📊 Magnitudo: <strong>M {nearestQuake.gempa.Magnitude}</strong></p>
                                        <p>🕒 Waktu: <strong>{nearestQuake.gempa.Jam}</strong> ({nearestQuake.gempa.Tanggal})</p>
                                        <p>🗺️ {nearestQuake.gempa.Wilayah}</p>
                                    </div>
                                    {!location.verified && (
                                        <div className="mt-3 text-xs bg-black/20 rounded px-2 py-1">
                                            ⚠️ Lokasi belum terverifikasi penuh
                                        </div>
                                    )}
                                </div>
                            ) : location.latitude && !nearestQuake ? (
                                <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-5 min-w-[280px] text-center flex flex-col items-center justify-center h-full">
                                    <div className="bg-green-200 dark:bg-green-800 p-3 rounded-full mb-3">
                                        <CheckCircle className="h-8 w-8 text-green-700 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-green-800 dark:text-green-300 mb-1">Status Aman</h3>
                                    <p className="text-sm text-green-700 dark:text-green-400">
                                        Tidak ada aktivitas gempa signifikan di dekat Anda dalam 24 jam terakhir.
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </section>

                {/* Refresh Button */}
                <div className="flex justify-end mb-6">
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </button>
                </div>

                {loading && !data ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <RefreshCw className="h-12 w-12 text-primary animate-spin mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Memuat data gempa...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <p className="text-red-500 font-medium">{error}</p>
                        <button
                            onClick={fetchData}
                            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                        >
                            Coba Lagi
                        </button>
                    </div>
                ) : data ? (
                    <div className="space-y-8">
                        {/* Auto Gempa - Featured Card */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                <Activity className="h-6 w-6 text-red-500 mr-2" />
                                Gempa Terbaru
                            </h2>
                            <div className="bg-gradient-to-br from-red-600 to-orange-500 rounded-2xl p-6 md:p-8 text-white shadow-xl">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`text-4xl md:text-5xl font-bold px-4 py-2 rounded-xl ${getMagnitudeColor(data.autogempa.Magnitude)}`}>
                                                M {data.autogempa.Magnitude}
                                            </div>
                                            <div>
                                                <p className="text-white/80 text-sm">Kekuatan</p>
                                                <p className="font-semibold">{getMagnitudeLabel(data.autogempa.Magnitude)}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="font-medium">{data.autogempa.Wilayah}</p>
                                                    <p className="text-white/70 text-sm">{data.autogempa.Lintang}, {data.autogempa.Bujur}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Clock className="h-5 w-5 flex-shrink-0" />
                                                <p>{data.autogempa.Tanggal} • {data.autogempa.Jam}</p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <CircleDot className="h-5 w-5 flex-shrink-0" />
                                                <p>Kedalaman: {data.autogempa.Kedalaman}</p>
                                            </div>

                                            {data.autogempa.Dirasakan && (
                                                <div className="flex items-start gap-3">
                                                    <Waves className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                                    <p>Dirasakan: {data.autogempa.Dirasakan}</p>
                                                </div>
                                            )}
                                        </div>

                                        {data.autogempa.Potensi && (
                                            <div className={`mt-4 p-3 rounded-lg ${data.autogempa.Potensi.toLowerCase().includes('tsunami') && !data.autogempa.Potensi.toLowerCase().includes('tidak') ? 'bg-red-700' : 'bg-green-600'}`}>
                                                <p className="font-medium">{data.autogempa.Potensi}</p>
                                            </div>
                                        )}
                                    </div>

                                    {data.autogempa.Shakemap && (
                                        <div className="flex items-center justify-center">
                                            <img
                                                src={`https://data.bmkg.go.id/DataMKG/TEWS/${data.autogempa.Shakemap}`}
                                                alt="Shakemap"
                                                className="rounded-xl shadow-lg max-w-full h-auto max-h-80 object-contain bg-white p-2"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Tabs for Gempa Terkini and Dirasakan */}
                        <section>
                            <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setActiveTab("terkini")}
                                    className={`px-6 py-3 font-medium transition-colors ${activeTab === "terkini" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
                                >
                                    Gempa Terkini ({data.gempaterkini.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab("dirasakan")}
                                    className={`px-6 py-3 font-medium transition-colors ${activeTab === "dirasakan" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
                                >
                                    Gempa Dirasakan ({data.gempadirasakan.length})
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(activeTab === "terkini" ? data.gempaterkini : data.gempadirasakan).map((gempa, index) => {
                                    // Calculate distance if user location is available
                                    let distanceInfo = null
                                    if (location.latitude && location.longitude) {
                                        const { lat, lon } = parseCoordinates(gempa.Coordinates)
                                        const distance = calculateDistance(location.latitude, location.longitude, lat, lon)
                                        distanceInfo = distance
                                    }

                                    return (
                                        <div
                                            key={index}
                                            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getMagnitudeColor(gempa.Magnitude)}`}>
                                                    M {gempa.Magnitude}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {gempa.Kedalaman}
                                                </span>
                                            </div>

                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                                {gempa.Wilayah}
                                            </h3>

                                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                                <p className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    {gempa.Tanggal} • {gempa.Jam}
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    {gempa.Lintang}, {gempa.Bujur}
                                                </p>
                                                {distanceInfo !== null && (
                                                    <p className="flex items-center gap-2 text-primary font-medium">
                                                        <Navigation className="h-4 w-4" />
                                                        {distanceInfo.toFixed(1)} km dari lokasi Anda
                                                    </p>
                                                )}
                                            </div>

                                            {gempa.Dirasakan && (
                                                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        <span className="font-medium">Dirasakan:</span> {gempa.Dirasakan}
                                                    </p>
                                                </div>
                                            )}

                                            {gempa.Potensi && (
                                                <div className={`mt-3 px-3 py-2 rounded-lg text-xs font-medium ${gempa.Potensi.toLowerCase().includes('tsunami') && !gempa.Potensi.toLowerCase().includes('tidak') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                                    {gempa.Potensi}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </section>

                        {/* Info Footer */}
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Data gempa bumi bersumber dari <strong>Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)</strong>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                Data diperbarui otomatis setiap 5 menit • GPS Anti-Spoofing aktif
                            </p>
                        </div>
                    </div>
                ) : null}
            </main>

            {/* Install Prompt Modal (From Notification Click) */}
            {showInstallModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="text-center mb-6">
                            <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Install Aplikasi</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Agar notifikasi gempa berjalan optimal di background, silakan install aplikasi ini ke layar utama Anda.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={triggerInstall}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                                <Download className="w-5 h-5" />
                                Install Sekarang
                            </button>
                            <button
                                onClick={() => setShowInstallModal(false)}
                                className="w-full py-3 text-gray-500 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                            >
                                Nanti Saja
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
