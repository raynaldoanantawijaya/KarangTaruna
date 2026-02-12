'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MapPin, Navigation, AlertTriangle, Waves } from 'lucide-react'

// Types
interface DisasterMapProps {
    quakes: {
        Coordinates: string
        Lintang: string
        Bujur: string
        Magnitude: string
        Kedalaman: string
        Wilayah: string
        Tanggal: string
        Jam: string
        Potensi?: string
        Dirasakan?: string
    }[]
    userLocation?: {
        latitude: number
        longitude: number
    } | null
}

// Icon generators using Lucide React rendered to HTML string
const createQuakeIcon = (magnitude: number) => {
    const isBig = magnitude >= 5.0
    const color = isBig ? 'text-red-600' : 'text-orange-500'
    const fill = isBig ? 'fill-red-600' : 'fill-orange-500'
    const size = isBig ? 32 : 24

    const iconHtml = renderToStaticMarkup(
        <div className={`relative flex items-center justify-center ${isBig ? 'w-10 h-10' : 'w-6 h-6'}`}>
            {isBig && (
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
            )}
            <div className={`relative inline-flex rounded-full bg-white p-1 shadow-md border-2 ${isBig ? 'border-red-600' : 'border-orange-500'}`}>
                <AlertTriangle size={size - 8} className={`${color} ${fill}`} />
            </div>
        </div>
    )

    return L.divIcon({
        html: iconHtml,
        className: 'custom-quake-marker',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2]
    })
}

const userIcon = L.divIcon({
    html: renderToStaticMarkup(
        <div className="relative flex items-center justify-center w-8 h-8">
            <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>
            <div className="relative inline-flex rounded-full bg-blue-500 p-1.5 shadow-md border-2 border-white">
                <Navigation size={16} className="text-white fill-white" />
            </div>
        </div>
    ),
    className: 'custom-user-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
})

// Component to handle map center updates
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap()
    useEffect(() => {
        map.flyTo(center, map.getZoom())
    }, [center, map])
    return null
}

export default function DisasterMap({ quakes, userLocation }: DisasterMapProps) {
    // Default center: Indonesia
    const defaultCenter: [number, number] = [-2.5489, 118.0149]
    const center = userLocation ? [userLocation.latitude, userLocation.longitude] : defaultCenter
    const zoom = userLocation ? 9 : 5

    return (
        <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 relative z-0">
            <MapContainer
                center={defaultCenter}
                zoom={5}
                style={{ height: '100%', width: '100%', minHeight: '500px' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User Location Marker */}
                {userLocation && (
                    <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
                        <Popup>
                            <div className="p-2 text-center">
                                <h3 className="font-bold text-blue-600">Lokasi Anda</h3>
                                <p className="text-xs">GPS Aktif</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Quake Markers */}
                {quakes.map((quake, idx) => {
                    const lat = parseFloat(quake.Lintang.replace(' LS', '').replace(' LU', '')) * (quake.Lintang.includes('LS') ? -1 : 1)
                    const lon = parseFloat(quake.Bujur.replace(' BT', '').replace(' BB', '')) * (quake.Bujur.includes('BB') ? -1 : 1)
                    const mag = parseFloat(quake.Magnitude)

                    if (isNaN(lat) || isNaN(lon)) return null

                    return (
                        <Marker
                            key={`${quake.Jam}-${idx}`}
                            position={[lat, lon]}
                            icon={createQuakeIcon(mag)}
                        >
                            <Popup>
                                <div className="p-2 min-w-[200px]">
                                    <div className="flex items-center gap-2 mb-2 border-b pb-2">
                                        <AlertTriangle className={`h-4 w-4 ${mag >= 5 ? 'text-red-500' : 'text-orange-500'}`} />
                                        <h3 className="font-bold text-gray-800">Gempa Bumi M {quake.Magnitude}</h3>
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p><strong>Waktu:</strong> {quake.Tanggal}, {quake.Jam}</p>
                                        <p><strong>Wilayah:</strong> {quake.Wilayah}</p>
                                        <p><strong>Kedalaman:</strong> {quake.Kedalaman}</p>
                                        {quake.Potensi && <p><strong>Potensi:</strong> {quake.Potensi}</p>}
                                        {quake.Dirasakan && (
                                            <p className="mt-1 p-1 bg-yellow-50 text-xs rounded border border-yellow-100">
                                                Dirasakan: {quake.Dirasakan}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                })}

                {userLocation && <MapUpdater center={[userLocation.latitude, userLocation.longitude] as [number, number]} />}
            </MapContainer>
        </div>
    )
}
