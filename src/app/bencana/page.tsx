/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useEffect, useCallback } from "react"
import { AlertTriangle, MapPin, Clock, Activity, RefreshCw, Waves, CircleDot, Navigation, Shield, AlertCircle, CheckCircle, ShieldCheck, ShieldAlert, Download, Lock, Thermometer, Wind, Droplets, CloudRain, Sun, Moon, Cloud } from "lucide-react"

// ==================== CONSTANTS ====================
const API_BASE = "https://monitor-bencana.vercel.app"

// ==================== INTERFACES ====================
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

interface AutoGempa {
    tanggal: string
    jam: string
    datetime: string
    coordinates: string
    lintang: string
    bujur: string
    magnitude: string
    kedalaman: string
    wilayah: string
    potensi?: string
    dirasakan?: string
    shakemap?: string
}

interface WeatherData {
    current_weather: {
        temperature: number
        windspeed: number
        winddirection: number
        is_day: number
        weathercode: number
    }
    air_quality?: {
        time: string[]
        us_aqi: number[]
        pm2_5: number[]
        pm10: number[]
    }
    precision_aqi?: {
        source: string
        aqi: number
        pm2_5: number
        pm10: number
        time: string
    }
    description?: string
}

interface FloodData {
    region: string
    title: string
    location: string
    status: string
    height_desc: string
    weather_support?: string
    image_url?: string | null
    coordinates?: { lat: number; lon: number }
    updated_at: string
}

interface NearbyData {
    user_location: { lat: number; lon: number }
    safety_status: "SAFE" | "WARNING" | "DANGER"
    alerts: string[]
    summary: {
        nearest_flood: any
        nearest_quake: any
    }
}

interface VolcanoData {
    name: string
    status: string
    link: string
}

interface TsunamiData {
    status: string
    description: string
    gempa_terkait: {
        magnitude: string
        wilayah: string
        jam: string
        tanggal: string
        coordinates: string
    }
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

// ==================== HELPER FUNCTIONS ====================

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

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

function parseCoordinates(coords: string): { lat: number; lon: number } {
    const [lat, lon] = coords.split(',').map(c => parseFloat(c.trim()))
    return { lat, lon }
}

function getImpactLevel(distance: number, magnitude: string): "aman" | "waspada" | "siaga" | "bahaya" {
    const mag = parseFloat(magnitude)
    if (mag >= 7) {
        if (distance < 100) return "bahaya"
        if (distance < 300) return "siaga"
        if (distance < 600) return "waspada"
    } else if (mag >= 6) {
        if (distance < 50) return "bahaya"
        if (distance < 150) return "siaga"
        if (distance < 350) return "waspada"
    } else if (mag >= 5) {
        if (distance < 20) return "bahaya"
        if (distance < 60) return "siaga"
        if (distance < 150) return "waspada"
    } else if (mag >= 4) {
        if (distance < 20) return "siaga"
        if (distance < 80) return "waspada"
    } else {
        if (distance < 30) return "waspada"
    }
    return "aman"
}

function getImpactInfo(level: "aman" | "waspada" | "siaga" | "bahaya") {
    switch (level) {
        case "bahaya":
            return { label: "BAHAYA", color: "bg-red-600 text-white", borderColor: "border-red-600", icon: AlertTriangle, message: "Lokasi Anda berada dalam zona dampak gempa. Segera lakukan evakuasi ke tempat aman!" }
        case "siaga":
            return { label: "SIAGA", color: "bg-orange-500 text-white", borderColor: "border-orange-500", icon: AlertCircle, message: "Lokasi Anda cukup dekat dengan episentrum. Tetap waspada dan siapkan jalur evakuasi." }
        case "waspada":
            return { label: "WASPADA", color: "bg-yellow-500 text-black", borderColor: "border-yellow-500", icon: AlertCircle, message: "Gempa mungkin terasa di lokasi Anda. Tetap tenang dan pantau informasi terbaru." }
        default:
            return { label: "AMAN", color: "bg-green-500 text-white", borderColor: "border-green-500", icon: CheckCircle, message: "Lokasi Anda berada jauh dari episentrum gempa terbaru." }
    }
}

function getAqiInfo(aqi: number) {
    if (aqi <= 50) return { label: "Baik", color: "bg-green-500", textColor: "text-green-700", bgLight: "bg-green-100 dark:bg-green-900/30" }
    if (aqi <= 100) return { label: "Sedang", color: "bg-yellow-500", textColor: "text-yellow-700", bgLight: "bg-yellow-100 dark:bg-yellow-900/30" }
    if (aqi <= 150) return { label: "Tidak Sehat (Sensitif)", color: "bg-orange-500", textColor: "text-orange-700", bgLight: "bg-orange-100 dark:bg-orange-900/30" }
    if (aqi <= 200) return { label: "Tidak Sehat", color: "bg-red-500", textColor: "text-red-700", bgLight: "bg-red-100 dark:bg-red-900/30" }
    if (aqi <= 300) return { label: "Sangat Tidak Sehat", color: "bg-purple-600", textColor: "text-purple-700", bgLight: "bg-purple-100 dark:bg-purple-900/30" }
    return { label: "Berbahaya", color: "bg-red-900", textColor: "text-red-900", bgLight: "bg-red-100 dark:bg-red-900/30" }
}

function getWeatherIcon(code: number, isDay: number) {
    if (code <= 1) return isDay ? <Sun className="h-6 w-6 text-yellow-400" /> : <Moon className="h-6 w-6 text-blue-300" />
    if (code <= 3) return <Cloud className="h-6 w-6 text-gray-400" />
    if (code >= 61 && code <= 67) return <CloudRain className="h-6 w-6 text-blue-500" />
    if (code >= 80 && code <= 82) return <CloudRain className="h-6 w-6 text-blue-600" />
    if (code >= 95) return <CloudRain className="h-6 w-6 text-indigo-500" />
    return <Cloud className="h-6 w-6 text-gray-400" />
}

function getWeatherDesc(code: number): string {
    if (code === 0) return "Cerah"
    if (code <= 2) return "Cerah Berawan"
    if (code === 3) return "Berawan"
    if (code === 45 || code === 48) return "Berkabut"
    if (code >= 51 && code <= 55) return "Gerimis"
    if (code >= 61 && code <= 65) return "Hujan"
    if (code >= 80 && code <= 82) return "Hujan Lebat"
    if (code >= 95) return "Hujan Petir"
    return "Berawan"
}

// ==================== MAIN COMPONENT ====================
export default function BencanaPage() {
    // Gempa state
    const [autoGempa, setAutoGempa] = useState<AutoGempa | null>(null)
    const [gempaRecent, setGempaRecent] = useState<GempaData[]>([])
    const [gempaFelt, setGempaFelt] = useState<GempaData[]>([])

    const [volcanoData, setVolcanoData] = useState<VolcanoData[]>([])
    const [tsunamiData, setTsunamiData] = useState<TsunamiData | null>(null)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)


    // Weather state
    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [weatherLoading, setWeatherLoading] = useState(true)
    const [precisionAqi, setPrecisionAqi] = useState<WeatherData['precision_aqi'] | null>(null)

    // Existing state
    const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>('default')
    const [location, setLocation] = useState<LocationData>({ latitude: 0, longitude: 0, loading: false, verified: false })
    const [nearestQuake, setNearestQuake] = useState<NearestQuake | null>(null)
    const [installPrompt, setInstallPrompt] = useState<any>(null)
    const [showInstallModal, setShowInstallModal] = useState(false)

    // ==================== DATA FETCHING ====================
    const fetchGempaData = async () => {
        setLoading(true)
        setError(null)
        try {
            const [quakeRes, recentRes, feltRes, floodRes, volcanoRes, tsunamiRes] = await Promise.all([
                fetch(`${API_BASE}/quake`),
                fetch(`${API_BASE}/quake/recent`),
                fetch(`${API_BASE}/quake/felt`),
                fetch(`${API_BASE}/flood`),
                fetch(`${API_BASE}/volcano`),
                fetch(`${API_BASE}/tsunami`)
            ])
            const [quakeJson, recentJson, feltJson, floodJson, volcanoJson, tsunamiJson] = await Promise.all([
                quakeRes.json(),
                recentRes.json(),
                feltRes.json(),
                floodRes.json(),
                volcanoRes.json(),
                tsunamiRes.json()
            ])

            if (quakeJson.success) setAutoGempa(quakeJson.data)
            if (recentJson.success) setGempaRecent(recentJson.data)
            if (feltJson.success) setGempaFelt(feltJson.data)

            if (volcanoJson.success) setVolcanoData(volcanoJson.data)
            if (tsunamiJson.success) setTsunamiData(tsunamiJson.data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal mengambil data gempa")
        } finally {
            setLoading(false)
        }
    }

    const fetchWeather = async () => {
        setWeatherLoading(true)
        try {
            // Always fetch Surakarta as requested by user
            const res = await fetch(`${API_BASE}/weather/jawa-tengah/surakarta`)
            const json = await res.json()
            if (json.success) {
                setWeather(json.data)
                if (json.data.precision_aqi) {
                    setPrecisionAqi(json.data.precision_aqi)
                }
            }
        } catch {
            // Silent fail
        } finally {
            setWeatherLoading(false)
        }
    }



    // ==================== INSTALL/NOTIFICATION LOGIC ====================
    useEffect(() => {
        const handleInstallPrompt = (e: any) => { e.preventDefault(); setInstallPrompt(e) }
        window.addEventListener('beforeinstallprompt', handleInstallPrompt)
        return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
    }, [])

    useEffect(() => {
        if ('Notification' in window) {
            setNotificationStatus(Notification.permission)
        }
        if (Notification.permission === 'granted') {
            registerServiceWorker()
        }
    }, [])

    const registerServiceWorker = async () => {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/notify-sw.js')
                if (navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({ action: 'START_MONITORING' })
                }
                if ('periodicSync' in registration) {
                    try {
                        await (registration as any).periodicSync.register('check-gempa', { minInterval: 24 * 60 * 60 * 1000 })
                    } catch { /* not supported */ }
                }
            } catch (error) {
                console.error('SW Registration failed:', error)
            }
        }
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search)
            if (urlParams.get('source') === 'notification' && installPrompt) {
                setShowInstallModal(true)
            }
        }
    }, [installPrompt])

    const triggerInstall = async () => {
        if (!installPrompt) return
        const result = await installPrompt.prompt()
        if (result.outcome === 'accepted') { setInstallPrompt(null); setShowInstallModal(false) }
    }

    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) { alert('Browser Anda tidak mendukung notifikasi.'); return }
        const permission = await Notification.requestPermission()
        setNotificationStatus(permission)
        if (permission === 'granted') {
            registerServiceWorker()
            new Notification("Monitoring Gempa Aktif", { body: "Sistem akan memantau gempa di area Surakarta.", icon: "/icon-192.webp" })
        }
    }

    // ==================== GPS/LOCATION LOGIC ====================
    const reverseGeocode = async (lat: number, lon: number) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, { headers: { 'Accept-Language': 'id' } })
            if (!response.ok) throw new Error("Gagal mendapatkan alamat")
            const data = await response.json()
            const address = data.address || {}
            return { address: data.display_name, city: address.city || address.town || address.municipality || address.county || address.village || address.suburb, province: address.state || address.region, country: address.country }
        } catch { return null }
    }

    const isWithinIndonesia = (lat: number, lon: number): boolean => lat >= -11.5 && lat <= 6.5 && lon >= 94.5 && lon <= 141.5
    const isAccuracyAcceptable = (accuracy: number): boolean => accuracy <= 150

    const validateGPSReading = (position: GeolocationPosition): { valid: boolean; reason?: string } => {
        const { coords, timestamp } = position
        if (coords.accuracy > 1000) return { valid: false, reason: "Akurasi GPS terlalu rendah (>1km). Pastikan GPS aktif." }
        if (coords.accuracy < 1) return { valid: false, reason: "Terdeteksi lokasi palsu (akurasi tidak realistis)." }
        if (Math.abs(Date.now() - timestamp) > 60000) return { valid: false, reason: "Data lokasi sudah kadaluarsa." }
        if (coords.latitude === 0 && coords.longitude === 0) return { valid: false, reason: "Lokasi tidak valid (Null Island)." }
        if (coords.latitude < -90 || coords.latitude > 90 || coords.longitude < -180 || coords.longitude > 180) return { valid: false, reason: "Koordinat tidak valid." }
        return { valid: true }
    }

    const getMultipleSamples = (): Promise<GeolocationPosition[]> => {
        return new Promise((resolve) => {
            const samples: GeolocationPosition[] = []
            const targetSamples = 3
            let attempts = 0
            const maxAttempts = 5
            let resolved = false

            const globalTimeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true
                    if (samples.length > 0) { resolve(samples) }
                    else {
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
                        if (samples.length >= targetSamples) { resolved = true; clearTimeout(globalTimeout); resolve(samples) }
                        else if (attempts < maxAttempts) { attempts++; setTimeout(getSample, 200) }
                        else { resolved = true; clearTimeout(globalTimeout); resolve(samples) }
                    },
                    () => {
                        if (resolved) return
                        attempts++
                        if (attempts < maxAttempts && samples.length < targetSamples) { setTimeout(getSample, 200) }
                        else { resolved = true; clearTimeout(globalTimeout); resolve(samples) }
                    },
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                )
            }
            getSample()
        })
    }

    const calculateWeightedPosition = (samples: GeolocationPosition[]): { lat: number; lon: number; accuracy: number } => {
        if (samples.length === 0) return { lat: 0, lon: 0, accuracy: 9999 }
        let totalWeight = 0, weightedLat = 0, weightedLon = 0, minAccuracy = Infinity
        for (const sample of samples) {
            const weight = 1 / sample.coords.accuracy
            totalWeight += weight
            weightedLat += sample.coords.latitude * weight
            weightedLon += sample.coords.longitude * weight
            if (sample.coords.accuracy < minAccuracy) minAccuracy = sample.coords.accuracy
        }
        return { lat: weightedLat / totalWeight, lon: weightedLon / totalWeight, accuracy: minAccuracy }
    }

    const checkPositionConsistency = (samples: GeolocationPosition[]): { consistent: boolean; maxDeviation: number } => {
        if (samples.length < 2) return { consistent: true, maxDeviation: 0 }
        const avgLat = samples.reduce((acc, s) => acc + s.coords.latitude, 0) / samples.length
        const avgLon = samples.reduce((acc, s) => acc + s.coords.longitude, 0) / samples.length
        let maxDeviation = 0
        for (const sample of samples) {
            const dist = calculateDistance(avgLat, avgLon, sample.coords.latitude, sample.coords.longitude) * 1000
            if (dist > maxDeviation) maxDeviation = dist
        }
        const tooInconsistent = maxDeviation > 500
        return { consistent: !tooInconsistent, maxDeviation }
    }

    const getAccuracyDeviation = (samples: GeolocationPosition[]): number => {
        if (samples.length < 2) return 999
        const accuracies = samples.map(s => s.coords.accuracy)
        const mean = accuracies.reduce((a, b) => a + b, 0) / accuracies.length
        const variance = accuracies.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / accuracies.length
        return Math.sqrt(variance)
    }

    const getUserLocation = useCallback(async () => {
        if (!navigator.geolocation) { setLocation(prev => ({ ...prev, error: "Geolocation tidak didukung browser Anda", verified: false })); return }
        setLocation(prev => ({ ...prev, loading: true, error: undefined }))

        try {
            if (navigator.permissions) {
                const permissionStatus = await navigator.permissions.query({ name: 'geolocation' })
                if (permissionStatus.state === 'denied') {
                    setLocation(prev => ({ ...prev, loading: false, error: "Akses lokasi ditolak. Silakan aktifkan izin lokasi di pengaturan browser Anda:\n\n📱 Android Chrome: Ketuk ikon gembok/info di address bar → Izin → Lokasi → Izinkan\n\n🖥️ Desktop: Klik ikon gembok di address bar → Izin situs → Lokasi → Izinkan", verified: false }))
                    return
                }
            }
        } catch { /* Permissions API not supported */ }

        try {
            const samples = await getMultipleSamples()
            if (samples.length === 0) {
                setLocation(prev => ({ ...prev, loading: false, error: "Gagal mendapatkan lokasi.\n\n🔹 Pastikan GPS/Lokasi aktif di perangkat Anda\n🔹 Izinkan akses lokasi saat browser meminta\n🔹 Jika sudah ditolak sebelumnya, buka pengaturan browser dan aktifkan izin lokasi untuk situs ini", verified: false }))
                return
            }
            const validSamples = samples.filter(s => validateGPSReading(s).valid)
            if (validSamples.length === 0) {
                const firstInvalid = validateGPSReading(samples[0])
                setLocation(prev => ({ ...prev, loading: false, error: firstInvalid.reason || "Lokasi tidak valid", verified: false }))
                return
            }

            const consistency = checkPositionConsistency(validSamples)
            const accuracyDeviation = getAccuracyDeviation(validSamples)
            const finalPos = calculateWeightedPosition(validSamples)
            const bestSample = validSamples.reduce((best, current) => current.coords.accuracy < best.coords.accuracy ? current : best)

            let verified = true
            let verificationMethod = ""
            const warnings: string[] = []

            if (!consistency.consistent) {
                warnings.push("Posisi tidak stabil")
            }
            if (!isAccuracyAcceptable(finalPos.accuracy)) { verified = false; warnings.push("Akurasi rendah") }

            if (verified && warnings.length === 0) {
                if (finalPos.accuracy <= 10) verificationMethod = "✓ GPS Presisi Tinggi"
                else if (finalPos.accuracy <= 30) verificationMethod = "✓ GPS Sangat Akurat"
                else if (finalPos.accuracy <= 50) verificationMethod = "✓ GPS Akurat"
                else if (finalPos.accuracy <= 100) verificationMethod = "✓ GPS Terverifikasi"
                else verificationMethod = "✓ GPS Standard"
                if (!isWithinIndonesia(finalPos.lat, finalPos.lon)) verificationMethod += " (Luar Indonesia)"
            } else if (warnings.length > 0) { verificationMethod = "⚠ " + warnings.join(", ") }
            else { verificationMethod = "⚠ Tidak Terverifikasi" }

            const geoData = await reverseGeocode(finalPos.lat, finalPos.lon)

            setLocation({
                latitude: finalPos.lat, longitude: finalPos.lon, accuracy: finalPos.accuracy,
                altitude: bestSample.coords.altitude, altitudeAccuracy: bestSample.coords.altitudeAccuracy,
                speed: bestSample.coords.speed, heading: bestSample.coords.heading, timestamp: bestSample.timestamp,
                address: geoData?.address, city: geoData?.city, province: geoData?.province, country: geoData?.country,
                loading: false, verified, verificationMethod, sampleCount: validSamples.length
            })

            // Fetch weather for user location
            fetchWeather()
        } catch (err) {
            setLocation(prev => ({ ...prev, loading: false, error: err instanceof Error ? err.message : "Gagal mendapatkan lokasi", verified: false }))
        }
    }, [])



    // ==================== EFFECTS ====================
    // Nearest quake calculation
    useEffect(() => {
        if (!autoGempa || (!gempaRecent.length && !gempaFelt.length) || !location.latitude || !location.longitude) return
        const allQuakes = [...gempaRecent, ...gempaFelt]
        let nearest: NearestQuake | null = null
        let minDistance = Infinity
        const now = new Date()
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const isRecent = (dt: string) => { try { return new Date(dt) >= twentyFourHoursAgo } catch { return false } }

        for (const gempa of allQuakes) {
            if (!isRecent(gempa.DateTime)) continue
            const { lat, lon } = parseCoordinates(gempa.Coordinates)
            const distance = calculateDistance(location.latitude, location.longitude, lat, lon)
            if (distance < minDistance) {
                minDistance = distance
                nearest = { gempa, distance, impactLevel: getImpactLevel(distance, gempa.Magnitude) }
            }
        }

        // Check autogempa too
        if (autoGempa.datetime && isRecent(autoGempa.datetime)) {
            const { lat, lon } = parseCoordinates(autoGempa.coordinates)
            const distance = calculateDistance(location.latitude, location.longitude, lat, lon)
            if (distance < minDistance) {
                const asGempaData: GempaData = {
                    Tanggal: autoGempa.tanggal, Jam: autoGempa.jam, DateTime: autoGempa.datetime,
                    Coordinates: autoGempa.coordinates, Lintang: autoGempa.lintang, Bujur: autoGempa.bujur,
                    Magnitude: autoGempa.magnitude, Kedalaman: autoGempa.kedalaman, Wilayah: autoGempa.wilayah,
                    Potensi: autoGempa.potensi, Dirasakan: autoGempa.dirasakan
                }
                nearest = { gempa: asGempaData, distance, impactLevel: getImpactLevel(distance, autoGempa.magnitude) }
            }
        }
        setNearestQuake(nearest)
    }, [autoGempa, gempaRecent, gempaFelt, location.latitude, location.longitude])

    // Initial load
    useEffect(() => {
        fetchGempaData()
        fetchWeather()

        // Auto refresh every 5 minutes
        const interval = setInterval(() => {
            fetchGempaData()
            fetchWeather()
        }, 5 * 60 * 1000)

        return () => clearInterval(interval)

    }, [])

    // Current AQI
    const getCurrentAqi = () => {
        if (!weather?.air_quality) return null
        const now = new Date().toISOString().slice(0, 13)
        const idx = weather.air_quality.time.findIndex(t => t.startsWith(now))
        const i = idx >= 0 ? idx : 0
        return {
            aqi: weather.air_quality.us_aqi[i],
            pm25: weather.air_quality.pm2_5[i],
            pm10: weather.air_quality.pm10[i]
        }
    }

    const impactInfo = nearestQuake ? getImpactInfo(nearestQuake.impactLevel) : null
    const ImpactIcon = impactInfo?.icon || Shield
    const currentAqi = getCurrentAqi()

    // ==================== RENDER ====================
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
                        Informasi gempa bumi, cuaca, dan kualitas udara real-time untuk Surakarta dan sekitarnya.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Notification Card */}
                <section className="mb-6">
                    <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl p-3 text-white shadow-md relative overflow-hidden flex items-center justify-between gap-3">
                        <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none"><ShieldAlert className="w-16 h-16" /></div>
                        <div className="relative z-10 flex-1 min-w-0">
                            <h2 className="text-sm font-bold flex items-center gap-1.5 mb-0.5 whitespace-nowrap">
                                <ShieldCheck className="h-4 w-4 text-blue-200" /> Monitor Gempa Surakarta
                            </h2>
                            <p className="text-blue-200 text-xs truncate">Notifikasi otomatis gempa area Surakarta (Background).</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {installPrompt && (
                                <button onClick={triggerInstall} className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 bg-white text-blue-700 active:bg-blue-50">
                                    <Download className="h-3.5 w-3.5" /> Install
                                </button>
                            )}
                            <button onClick={requestNotificationPermission} disabled={!!installPrompt || notificationStatus === 'granted'}
                                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 ${installPrompt ? 'bg-white/20 text-white/50 cursor-not-allowed' : notificationStatus === 'granted' ? 'bg-green-500 text-white cursor-default' : 'bg-white text-blue-700 active:bg-blue-50'}`}>
                                {installPrompt ? (<><Lock className="h-3.5 w-3.5" /> Wajib Install</>) : notificationStatus === 'granted' ? (<><CheckCircle className="h-3.5 w-3.5" /> Aktif</>) : (<><Shield className="h-3.5 w-3.5" /> Aktifkan</>)}
                            </button>
                        </div>
                    </div>
                    <p className="text-[10px] text-center mt-1 text-gray-400 dark:text-gray-500">*Tips: Install App &amp; Matikan Battery Saver agar notifikasi lancar.</p>
                </section>

                {/* Weather + AQI Widget */}
                {/* Weather + AQI Widget (Compact) */}
                <section className="mb-6">
                    <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-4 text-white shadow-xl">
                        <h2 className="text-base font-bold mb-3 flex items-center gap-2">
                            <Thermometer className="h-4 w-4" /> Cuaca &amp; Kualitas Udara — Surakarta
                        </h2>
                        {weatherLoading ? (
                            <div className="flex items-center gap-3"><RefreshCw className="h-4 w-4 animate-spin" /> <span className="text-sm">Memuat...</span></div>
                        ) : weather ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* Current Weather */}
                                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
                                    <div className="flex items-center gap-3 mb-2">
                                        {getWeatherIcon(weather.current_weather.weathercode, weather.current_weather.is_day)}
                                        <div>
                                            <p className="text-xl font-bold">{weather.current_weather.temperature}°C</p>
                                            <p className="text-white/80 text-xs">{getWeatherDesc(weather.current_weather.weathercode)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-white/80">
                                        <span className="flex items-center gap-1"><Wind className="h-3 w-3" /> {weather.current_weather.windspeed} km/h</span>
                                        <span className="flex items-center gap-1"><Navigation className="h-3 w-3" style={{ transform: `rotate(${weather.current_weather.winddirection}deg)` }} /> {weather.current_weather.winddirection}°</span>
                                    </div>
                                </div>

                                {/* AQI Satelit */}
                                {currentAqi && (
                                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
                                        <p className="text-white/70 text-[10px] uppercase tracking-wide mb-1">Kualitas Udara (Satelit)</p>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`inline-block px-2 py-1 rounded-md font-bold text-base text-white ${getAqiInfo(currentAqi.aqi).color}`}>{currentAqi.aqi}</span>
                                            <span className="font-semibold text-sm">{getAqiInfo(currentAqi.aqi).label}</span>
                                        </div>
                                        <div className="flex gap-3 text-xs text-white/80">
                                            <span><Droplets className="h-3 w-3 inline mr-1" />PM2.5: {currentAqi.pm25}</span>
                                            <span>PM10: {currentAqi.pm10}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Precision AQI */}
                                {precisionAqi && (
                                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
                                        <p className="text-white/70 text-[10px] uppercase tracking-wide mb-1">📍 Stasiun Presisi</p>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`inline-block px-2 py-1 rounded-md font-bold text-base text-white ${getAqiInfo(precisionAqi.aqi).color}`}>{precisionAqi.aqi}</span>
                                            <span className="font-semibold text-sm">{getAqiInfo(precisionAqi.aqi).label}</span>
                                        </div>
                                        <p className="text-[10px] text-white/70 truncate">{precisionAqi.source}</p>
                                        <p className="text-[10px] text-white/60 mt-0.5">Update: {precisionAqi.time}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-white/70 text-sm">Gagal memuat data cuaca.</p>
                        )}
                    </div>
                </section>

                {/* Location Tracking Card */}
                <section className="mb-8">
                    <div className={`rounded-2xl p-6 border-2 ${nearestQuake ? impactInfo?.borderColor : location.latitude ? 'border-green-500 dark:border-green-600' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 shadow-lg`}>
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-primary/10 p-3 rounded-full"><Navigation className="h-6 w-6 text-primary" /></div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Lokasi Anda</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Pelacakan GPS Presisi Tinggi dengan Anti-Spoofing</p>
                                    </div>
                                </div>

                                {location.loading ? (
                                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                        <div><span className="block">Mendeteksi lokasi GPS...</span><span className="text-xs text-gray-500">Mohon tunggu maksimal 15 detik</span></div>
                                    </div>
                                ) : location.error ? (
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2 text-red-500"><ShieldAlert className="h-5 w-5 flex-shrink-0 mt-0.5" /><p className="text-sm font-medium whitespace-pre-line">{location.error}</p></div>
                                        <button onClick={getUserLocation} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"><Navigation className="h-4 w-4" /> Coba Lagi</button>
                                    </div>
                                ) : location.latitude ? (
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{location.city || 'Lokasi'}{location.province ? `, ${location.province}` : ''}</p>
                                                {location.address && <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{location.address}</p>}
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${location.verified ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                                            {location.verified ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                                            <span className="font-medium">{location.verificationMethod}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                            <div><span className="block font-medium">Koordinat</span><span>{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</span></div>
                                            <div><span className="block font-medium">Akurasi</span><span>±{location.accuracy?.toFixed(1) || 'N/A'} meter</span></div>
                                            <div><span className="block font-medium">Sampel GPS</span><span>{location.sampleCount || 1} pembacaan</span></div>
                                            <div><span className="block font-medium">Waktu</span><span>{location.timestamp ? new Date(location.timestamp).toLocaleTimeString('id-ID') : 'N/A'}</span></div>
                                        </div>
                                        <button onClick={getUserLocation} className="text-sm text-primary hover:underline flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Perbarui lokasi</button>
                                    </div>
                                ) : (
                                    <button onClick={getUserLocation} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"><Navigation className="h-4 w-4" /> Lacak Lokasi Saya</button>
                                )}
                            </div>

                            {/* Impact Status */}
                            {nearestQuake && location.latitude ? (
                                <div className={`rounded-xl p-5 ${impactInfo?.color} min-w-[280px]`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <ImpactIcon className="h-8 w-8" />
                                        <div><p className="text-sm opacity-80">Status Dampak</p><p className="text-2xl font-bold">{impactInfo?.label}</p></div>
                                    </div>
                                    <p className="text-sm opacity-90 mb-4">{impactInfo?.message}</p>
                                    <div className="bg-black/20 rounded-lg p-3 space-y-1 text-sm">
                                        <p>📍 Jarak: <strong>{nearestQuake.distance.toFixed(1)} km</strong></p>
                                        <p>📊 Magnitudo: <strong>M {nearestQuake.gempa.Magnitude}</strong></p>
                                        <p>🕒 Waktu: <strong>{nearestQuake.gempa.Jam}</strong> ({nearestQuake.gempa.Tanggal})</p>
                                        <p>🗺️ {nearestQuake.gempa.Wilayah}</p>
                                    </div>
                                    {!location.verified && <div className="mt-3 text-xs bg-black/20 rounded px-2 py-1">⚠️ Lokasi belum terverifikasi penuh</div>}
                                </div>
                            ) : location.latitude && !nearestQuake ? (
                                <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-5 min-w-[280px] text-center flex flex-col items-center justify-center h-full">
                                    <div className="bg-green-200 dark:bg-green-800 p-3 rounded-full mb-3"><CheckCircle className="h-8 w-8 text-green-700 dark:text-green-400" /></div>
                                    <h3 className="text-lg font-bold text-green-800 dark:text-green-300 mb-1">Status Aman</h3>
                                    <p className="text-sm text-green-700 dark:text-green-400">Tidak ada aktivitas gempa signifikan di dekat Anda dalam 24 jam terakhir.</p>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </section>

                {/* Refresh Button */}
                <div className="flex justify-end mb-6">
                    <button onClick={fetchGempaData} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
                    </button>
                </div>

                {loading && !autoGempa ? (
                    <div className="flex flex-col items-center justify-center py-20"><RefreshCw className="h-12 w-12 text-primary animate-spin mb-4" /><p className="text-gray-600 dark:text-gray-400">Memuat data gempa...</p></div>
                ) : error ? (
                    <div className="text-center py-20">
                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" /><p className="text-red-500 font-medium">{error}</p>
                        <button onClick={fetchGempaData} className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">Coba Lagi</button>
                    </div>
                ) : autoGempa ? (
                    <div className="space-y-8">
                        {/* Auto Gempa - Featured Card */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center"><Activity className="h-6 w-6 text-red-500 mr-2" /> Gempa Terbaru</h2>
                            <div className="bg-gradient-to-br from-red-600 to-orange-500 rounded-2xl p-6 md:p-8 text-white shadow-xl">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`text-4xl md:text-5xl font-bold px-4 py-2 rounded-xl ${getMagnitudeColor(autoGempa.magnitude)}`}>M {autoGempa.magnitude}</div>
                                            <div><p className="text-white/80 text-sm">Kekuatan</p><p className="font-semibold">{getMagnitudeLabel(autoGempa.magnitude)}</p></div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3"><MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" /><div><p className="font-medium">{autoGempa.wilayah}</p><p className="text-white/70 text-sm">{autoGempa.lintang}, {autoGempa.bujur}</p></div></div>
                                            <div className="flex items-center gap-3"><Clock className="h-5 w-5 flex-shrink-0" /><p>{autoGempa.tanggal} • {autoGempa.jam}</p></div>
                                            <div className="flex items-center gap-3"><CircleDot className="h-5 w-5 flex-shrink-0" /><p>Kedalaman: {autoGempa.kedalaman}</p></div>
                                            {autoGempa.dirasakan && (<div className="flex items-start gap-3"><Waves className="h-5 w-5 mt-0.5 flex-shrink-0" /><p>Dirasakan: {autoGempa.dirasakan}</p></div>)}
                                        </div>
                                        {autoGempa.potensi && (
                                            <div className={`mt-4 p-3 rounded-lg ${autoGempa.potensi.toLowerCase().includes('tsunami') && !autoGempa.potensi.toLowerCase().includes('tidak') ? 'bg-red-700' : 'bg-green-600'}`}>
                                                <p className="font-medium">{autoGempa.potensi}</p>
                                            </div>
                                        )}
                                    </div>
                                    {autoGempa.shakemap && (
                                        <div className="flex items-center justify-center">
                                            <img src={autoGempa.shakemap} alt="Shakemap" className="rounded-xl shadow-lg max-w-full h-auto max-h-80 object-contain bg-white p-2" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>





                        {/* Volcano Status Removed */}



                        {/* Unified Gempa List */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Daftar Gempa Terkini & Dirasakan</h2>
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-900">
                                    Total: {[...gempaRecent, ...gempaFelt].filter((v, i, a) => a.findIndex(t => t.DateTime === v.DateTime) === i).length}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[...gempaRecent, ...gempaFelt]
                                    .filter((v, i, a) => a.findIndex(t => t.DateTime === v.DateTime) === i) // Deduplicate by DateTime
                                    .sort((a, b) => new Date(b.DateTime).getTime() - new Date(a.DateTime).getTime()) // Sort new to old
                                    .map((gempa, index) => {
                                        let distanceInfo: number | null = null
                                        if (location.latitude && location.longitude) {
                                            const { lat, lon } = parseCoordinates(gempa.Coordinates)
                                            distanceInfo = calculateDistance(location.latitude, location.longitude, lat, lon)
                                        }
                                        return (
                                            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
                                                <div className="flex items-start justify-between mb-3">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getMagnitudeColor(gempa.Magnitude)}`}>M {gempa.Magnitude}</span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{gempa.Kedalaman}</span>
                                                </div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{gempa.Wilayah}</h3>
                                                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                                    <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> {gempa.Tanggal} • {gempa.Jam}</p>
                                                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {gempa.Lintang}, {gempa.Bujur}</p>
                                                    {distanceInfo !== null && <p className="flex items-center gap-2 text-primary font-medium"><Navigation className="h-4 w-4" /> {distanceInfo.toFixed(1)} km dari lokasi Anda</p>}
                                                </div>
                                                {gempa.Dirasakan && (<div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700"><p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-medium">Dirasakan:</span> {gempa.Dirasakan}</p></div>)}
                                                {gempa.Potensi && (<div className={`mt-3 px-3 py-2 rounded-lg text-xs font-medium ${gempa.Potensi.toLowerCase().includes('tsunami') && !gempa.Potensi.toLowerCase().includes('tidak') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>{gempa.Potensi}</div>)}
                                            </div>
                                        )
                                    })}
                            </div>
                        </section>

                        {/* Interactive Disaster Map Removed as per request */}



                        {/* Info Footer */}
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Data gempa bersumber dari <strong>BMKG</strong> • Cuaca dari <strong>Open-Meteo</strong> • AQI Presisi dari <strong>KLHK Stasiun Manahan</strong>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                Data diperbarui otomatis setiap 5 menit • GPS Anti-Spoofing aktif
                            </p>
                        </div>
                    </div>
                ) : null}
            </main>

            {/* Install Prompt Modal */}
            {showInstallModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="text-center mb-6">
                            <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" /></div>
                            <h3 className="text-xl font-bold mb-2">Install Aplikasi</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">Agar notifikasi gempa berjalan optimal di background, silakan install aplikasi ini ke layar utama Anda.</p>
                        </div>
                        <div className="space-y-3">
                            <button onClick={triggerInstall} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"><Download className="w-5 h-5" /> Install Sekarang</button>
                            <button onClick={() => setShowInstallModal(false)} className="w-full py-3 text-gray-500 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">Nanti Saja</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
