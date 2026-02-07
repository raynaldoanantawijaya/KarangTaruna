"use client"

import { useState, useEffect } from "react"
import { Send, Loader2, CheckCircle, XCircle, X } from "lucide-react"

// Generate device fingerprint for spam prevention
function getDeviceFingerprint(): string {
    if (typeof window === 'undefined') return 'server'
    const nav = window.navigator
    const screen = window.screen
    const fp = [
        nav.userAgent,
        nav.language,
        screen.width,
        screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset()
    ].join('|')
    // Simple hash
    let hash = 0
    for (let i = 0; i < fp.length; i++) {
        const char = fp.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
    }
    return Math.abs(hash).toString(36)
}

// Get rate limit key from localStorage
function getRateLimitKey(): string {
    return `contact_form_${getDeviceFingerprint()}`
}

// Check if user can submit (rate limiting)
function canSubmit(): { allowed: boolean; waitTime: number } {
    if (typeof window === 'undefined') return { allowed: true, waitTime: 0 }

    const key = getRateLimitKey()
    const lastSubmit = localStorage.getItem(key)

    if (!lastSubmit) return { allowed: true, waitTime: 0 }

    const lastTime = parseInt(lastSubmit, 10)
    const now = Date.now()
    const cooldown = 60 * 1000 // 1 minute cooldown

    if (now - lastTime < cooldown) {
        return { allowed: false, waitTime: Math.ceil((cooldown - (now - lastTime)) / 1000) }
    }

    return { allowed: true, waitTime: 0 }
}

// Record submission time
function recordSubmission() {
    if (typeof window === 'undefined') return
    const key = getRateLimitKey()
    localStorage.setItem(key, Date.now().toString())
}

type NotificationType = 'success' | 'error' | null

export function ContactForm() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [subject, setSubject] = useState('Pertanyaan Umum')
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [notification, setNotification] = useState<{ type: NotificationType; message: string }>({ type: null, message: '' })
    const [errors, setErrors] = useState<{ name?: string; message?: string }>({})
    const [waitTime, setWaitTime] = useState(0)

    // Check rate limit on mount and update countdown
    useEffect(() => {
        const check = canSubmit()
        if (!check.allowed) {
            setWaitTime(check.waitTime)
        }
    }, [])

    // Countdown timer
    useEffect(() => {
        if (waitTime > 0) {
            const timer = setTimeout(() => setWaitTime(waitTime - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [waitTime])

    // Auto-hide notification after 5 seconds
    useEffect(() => {
        if (notification.type) {
            const timer = setTimeout(() => {
                setNotification({ type: null, message: '' })
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [notification])

    const validateForm = (): boolean => {
        const newErrors: { name?: string; message?: string } = {}

        if (!name.trim()) {
            newErrors.name = 'Nama wajib diisi'
        }

        if (!message.trim()) {
            newErrors.message = 'Pesan wajib diisi'
        } else if (message.trim().length < 10) {
            newErrors.message = 'Pesan minimal 10 karakter'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate form
        if (!validateForm()) return

        // Check rate limit
        const rateCheck = canSubmit()
        if (!rateCheck.allowed) {
            setWaitTime(rateCheck.waitTime)
            setNotification({
                type: 'error',
                message: `Mohon tunggu ${rateCheck.waitTime} detik sebelum mengirim pesan lagi`
            })
            return
        }

        setIsLoading(true)
        setErrors({})

        try {
            // Create form data for Web3Forms
            const formData = new FormData()
            formData.append("access_key", "1d95a89f-51f0-4ac5-bcd7-adf26563a0cb")
            formData.append("name", name)
            formData.append("email", email || "Tidak diisi")
            formData.append("subject", subject)
            formData.append("message", message)
            formData.append("from_name", "Karang Taruna Contact Form")

            // Get user IP for logging (optional)
            let userIP = 'unknown'
            try {
                const ipRes = await fetch('https://api.ipify.org?format=json')
                const ipData = await ipRes.json()
                userIP = ipData.ip
            } catch {
                // IP fetch failed, continue anyway
            }
            formData.append("ip_address", userIP)
            formData.append("device_fingerprint", getDeviceFingerprint())

            // Send to Web3Forms API
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            })

            const data = await response.json()

            if (response.ok && data.success) {
                // Record submission for rate limiting
                recordSubmission()

                // Show success
                setNotification({
                    type: 'success',
                    message: 'Pesan Anda berhasil terkirim! Kami akan segera menghubungi Anda.'
                })

                // Reset form
                setName('')
                setEmail('')
                setSubject('Pertanyaan Umum')
                setMessage('')
            } else {
                throw new Error(data.message || 'Gagal mengirim pesan')
            }

        } catch (err) {
            setNotification({
                type: 'error',
                message: err instanceof Error ? err.message : 'Gagal mengirim pesan. Silakan coba lagi nanti.'
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative">
            {/* Centered Notification Modal */}
            {notification.type && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className={`
                        relative mx-4 p-6 rounded-2xl shadow-2xl max-w-md w-full text-center
                        ${notification.type === 'success'
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                        }
                        animate-scaleIn
                    `}>
                        <button
                            onClick={() => setNotification({ type: null, message: '' })}
                            className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="flex flex-col items-center">
                            {notification.type === 'success' ? (
                                <CheckCircle className="h-16 w-16 mb-4 animate-bounce" />
                            ) : (
                                <XCircle className="h-16 w-16 mb-4 animate-shake" />
                            )}
                            <h3 className="text-xl font-bold mb-2">
                                {notification.type === 'success' ? 'Berhasil!' : 'Gagal!'}
                            </h3>
                            <p className="text-white/90">{notification.message}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-gray-900 dark:bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mt-8 lg:mt-12">
                <h3 className="text-xl md:text-2xl font-bold text-white dark:text-gray-900 mb-4 md:mb-6">Kirim Pesan</h3>
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 dark:text-gray-700 mb-2">
                                Nama Lengkap <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-700 dark:border-gray-300'} bg-gray-800 dark:bg-gray-50 text-white dark:text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-500 dark:placeholder-gray-400`}
                                placeholder="Nama Anda"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 dark:text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-700 dark:border-gray-300 bg-gray-800 dark:bg-gray-50 text-white dark:text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-500 dark:placeholder-gray-400"
                                placeholder="email@contoh.com"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-300 dark:text-gray-700 mb-2">Subjek</label>
                        <select
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-700 dark:border-gray-300 bg-gray-800 dark:bg-gray-50 text-white dark:text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        >
                            <option>Pertanyaan Umum</option>
                            <option>Pendaftaran Anggota</option>
                            <option>Kerjasama / Sponsorship</option>
                            <option>Saran &amp; Masukan</option>
                            <option>Lainnya</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-300 dark:text-gray-700 mb-2">
                            Pesan <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="message"
                            rows={6}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.message ? 'border-red-500' : 'border-gray-700 dark:border-gray-300'} bg-gray-800 dark:bg-gray-50 text-white dark:text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-500 dark:placeholder-gray-400`}
                            placeholder="Tulis pesan Anda di sini..."
                        ></textarea>
                        {errors.message && (
                            <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || waitTime > 0}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Mengirim...
                            </>
                        ) : waitTime > 0 ? (
                            <>Tunggu {waitTime} detik</>
                        ) : (
                            <>
                                <Send className="h-5 w-5 mr-2" /> Kirim Pesan
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
