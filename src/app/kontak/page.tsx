/* eslint-disable @next/next/no-img-element */
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

export default function Kontak() {
    return (
        <div className="w-full">
            {/* Header */}
            <div className="relative overflow-hidden transition-colors duration-500 min-h-[180px] sm:min-h-[220px] md:min-h-[280px] flex flex-col justify-start pt-10 sm:pt-14 md:pt-20 pb-6 sm:pb-8 md:pb-12">
                {/* Texture removed as requested for pure CSS styling */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
                        Kontak <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-yellow-100">Kami</span>
                    </h1>
                    <p className="text-white/90 dark:text-gray-300 text-sm md:text-base max-w-2xl mx-auto transition-colors">
                        Hubungi kami untuk informasi lebih lanjut, saran, atau kolaborasi.
                    </p>
                </div>
                {/* Wave Divider Removed */}
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

                    {/* Contact Info & Map */}
                    <div className="space-y-12 order-2 lg:order-1">
                        <div>
                            <span className="text-primary font-semibold tracking-wider uppercase text-sm">Informasi Kontak</span>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-6">Sekretariat</h2>

                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="bg-primary/10 p-3 rounded-lg text-primary mr-4">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">Alamat</h3>
                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                            Jl. Sungai Serang I No.313, Mojo<br />
                                            Kec. Ps. Kliwon, Kota Surakarta<br />
                                            Jawa Tengah 57191
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-primary/10 p-3 rounded-lg text-primary mr-4">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">Email</h3>
                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                            astawiradipta@gmail.com
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-primary/10 p-3 rounded-lg text-primary mr-4">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">Telepon</h3>
                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                            +62 87 888 2 666 99
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-primary/10 p-3 rounded-lg text-primary mr-4">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">Jam Operasional</h3>
                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                            Senin - Minggu: 09.00 - 21.00 WIB
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map Embed */}
                        <div className="w-full h-64 md:h-80 bg-gray-200 rounded-2xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700">
                            <iframe
                                src="https://maps.google.com/maps?q=Kelurahan+Mojo,+Pasar+Kliwon,+Surakarta&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Google Map Karang Taruna"
                            ></iframe>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="order-1 lg:order-2">
                        <ContactForm />
                    </div>

                </div>
            </main>
        </div>
    );
}
