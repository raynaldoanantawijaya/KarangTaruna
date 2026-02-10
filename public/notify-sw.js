const CACHE_NAME = 'karang-taruna-gempa-v1';
const DATA_URL = 'https://api.ryzumi.vip/api/search/bmkg';
const SURAKARTA_LOC = { lat: -7.57, lon: 110.82 }; // Surakarta Coordinates
const RADIUS_KM = 300; // Alert radius
const CHECK_INTERVAL = 60000; // 1 minute

// Install event
self.addEventListener('install', (event) => {
    // Force new SW to take control immediately
    self.skipWaiting();
    console.log('[SW] Service Worker Installed & Skipped Waiting');
});

// Activate event
self.addEventListener('activate', (event) => {
    // Claim clients immediately so we can control open tabs
    event.waitUntil(self.clients.claim());
    console.log('[SW] Service Worker Activated & Claimed Clients');
});


// Helper: Calculate Distance (Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Helper: Parse BMKG Coordinates "-7.57, 110.82"
function parseCoords(str) {
    const [lat, lon] = str.split(',').map(s => parseFloat(s.trim()));
    return { lat, lon };
}

// Helper: Check if Quake is dangerous for Surakarta
function isDangerForSurakarta(gempa) {
    const { lat, lon } = parseCoords(gempa.Coordinates);
    const dist = calculateDistance(SURAKARTA_LOC.lat, SURAKARTA_LOC.lon, lat, lon);
    const mag = parseFloat(gempa.Magnitude);

    // Alert Logic:
    // 1. Very close (< 50km) regardless of magnitude
    // 2. Strong (> M5.0) and relatively close (< 300km)
    // 3. Very Strong (> M6.5) and distant (< 600km)

    // Simplified for "Surakarta Monitor":
    if (dist < 50) return { danger: true, dist }; // Direct hit
    if (mag >= 4.5 && dist < 250) return { danger: true, dist }; // Strong regional
    if (mag >= 6.0 && dist < 500) return { danger: true, dist }; // Major distant

    return { danger: false, dist };
}

// Check for updates
async function checkForQuakes() {
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) return;
        const data = await response.json();

        // Check AutoGempa (The single latest significant quake)
        const gempa = data.autogempa;
        const recentQuakes = data.gempaterkini || [];

        // Combine to find the absolute latest that affects us
        const candidates = [gempa, ...recentQuakes.slice(0, 3)].filter(g => g);

        for (const candidate of candidates) {
            // Check if processed already
            // We use Cache Storage to store the last processed DateTime
            const cache = await caches.open(CACHE_NAME);
            const lastProcessed = await cache.match('last-processed-date');
            let lastDate = '';
            if (lastProcessed) {
                lastDate = await lastProcessed.text();
            }

            // Check if this quake is newer than last processed
            if (candidate.DateTime === lastDate) continue;

            const analysis = isDangerForSurakarta(candidate);

            if (analysis.danger) {
                // Determine freshness (skip if older than 1 hour)
                // Note: DateTime format "2026-02-10T..."
                const quakeTime = new Date(candidate.DateTime).getTime();
                const now = Date.now();
                // If quake is older than 60 mins, ignore notification (it's old news)
                if (now - quakeTime > 60 * 60 * 1000) continue;

                // Send Notification
                const title = `⚠️ GEMPA TERASA DI SURAKARTA!`;

                // Format Time (HH:MM)
                const dateObj = new Date(candidate.DateTime);
                const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                const body = `Magnitudo: ${candidate.Magnitude}\nWaktu: ${timeStr} WIB | Kedalaman: ${candidate.Kedalaman}\nJarak: ${analysis.dist.toFixed(0)}km dari Surakarta\n\nLokasi: ${candidate.Wilayah}\n\nArahan: HINDARI BANGUNAN RETAK & OBYEK TINGGI!`;

                self.registration.showNotification(title, {
                    body: body,
                    icon: '/icon-192.png', // Ensure this exists
                    badge: '/icon-192.png',
                    vibrate: [200, 100, 200, 100, 200],
                    tag: 'gempa-alert-' + candidate.DateTime,
                    data: { url: '/bencana' }
                });

                // Update cache to avoid repeat
                await cache.put('last-processed-date', new Response(candidate.DateTime));
                break; // Notify only once per check interval
            }
        }
    } catch (err) {
        console.error('[SW] Fetch Error:', err);
    }
}

// Listen for messages from Frontend
self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'START_MONITORING') {
        console.log('[SW] Monitoring Started');
        checkForQuakes(); // Immediate check
        // We cannot use setInterval reliably in SW standard events, 
        // BUT Push API or Periodic Sync is locked.
        // We rely on the browser waking us up or the frontend interval keeping us alive if open.
        // For "Closed Browser", this is best-effort dependent on OS.
    }
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/bencana?source=notification')
    );
});

// Periodic Sync (Experimental - might work on installed PWA)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'check-gempa') {
        console.log('[SW] Periodic Sync Triggered');
        event.waitUntil(checkForQuakes());
    }
});

// Push Event (Fallback if we ever add Push Server)
self.addEventListener('push', (event) => {
    console.log('[SW] Push Received');
    event.waitUntil(checkForQuakes());
});

// Fallback Interval (Only works reliably if page is open or SW is kept alive)
// We use a shorter interval to increase chances of catching it before suspension
setInterval(checkForQuakes, CHECK_INTERVAL);
