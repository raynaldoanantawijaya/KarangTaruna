"use client";

import { useEffect } from "react";

export default function AntiScrape() {
    useEffect(() => {
        // Pastikan ini berjalan hanya di environment production/browser
        if (typeof window === "undefined") return;

        // --- VARIABEL PELACAKAN INTERAKSI MANUSIA ---
        let mouseMoves = 0;
        let scrollCount = 0;
        let clickCount = 0;
        let lastClickTime = 0;
        let isHuman = false;

        // --- FUNGSI PEMBLOKIRAN BOT ---
        const blockBot = (reason: string) => {
            document.body.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f8d7da; color: #721c24; font-family: sans-serif; text-align: center; padding: 20px;">
          <div>
            <h1 style="font-size: 2rem; margin-bottom: 10px;">🛡️ Akses Ditolak</h1>
            <p>Sistem kami mendeteksi aktivitas yang mencurigakan (${reason}). Akses dari alat scraping atau browser otomatis tidak diizinkan.</p>
          </div>
        </div>
      `;
            throw new Error(`Bot detected: ${reason}`);
        };

        // --- 1. DETEKSI SCRAPER TINGKAT LANJUT (Environment) ---
        const checkBot = () => {
            const w = window as any;
            const n = navigator as any;
            const doc = document as any;
            const userAgent = n.userAgent ? n.userAgent.toLowerCase() : "";

            // Detect mobile devices (skip desktop-only checks for them)
            const isMobile = /android|iphone|ipad|ipod|mobile/i.test(userAgent);

            const isAutomated =
                n.webdriver || w.callPhantom || w._phantom || w.__nightmare ||
                w.domAutomation || w.domAutomationController ||
                w._selenium || w._Selenium_IDE_Recorder;

            // Desktop-only checks (Android Chrome doesn't have window.chrome or plugins)
            const isFakeChrome = !isMobile && userAgent.includes('chrome') && !w.chrome;
            const hasNoPlugins = !isMobile && typeof n.plugins !== "undefined" && n.plugins.length === 0 && userAgent.includes('chrome');
            const hasNoLanguages = !n.languages || n.languages.length === 0;

            // Strict bot detection: avoid matching generic words like "bot" which appear in legit UAs
            const isScriptClient =
                userAgent.includes("python-requests") || userAgent.includes("python-urllib") ||
                userAgent.includes("curl/") || userAgent.includes("wget/") ||
                userAgent.includes("scrapy") || userAgent.includes("postman") ||
                userAgent.includes("httpclient") || userAgent.includes("headlesschrome") ||
                userAgent.includes("phantomjs") || userAgent.includes("selenium");

            const hasSeleniumAttr = doc.documentElement.getAttribute("webdriver") !== null;

            if (isAutomated || isFakeChrome || hasNoPlugins || hasNoLanguages || isScriptClient || hasSeleniumAttr) {
                blockBot("Automated Environment/Bot Script");
            }
        };

        // Jalankan pengecekan environment bot
        checkBot();

        // --- 2. HONEYPOT (Jebakan Tautan Tersembunyi) ---
        // Membuat elemen link yang tidak terlihat oleh mata manusia tapi bisa di-"crawl" oleh bot.
        const createHoneypot = () => {
            const hp = document.createElement("a");
            hp.href = "#trap";
            hp.id = "honeypot-link";
            hp.innerText = "Admin Login Portal";
            hp.style.position = "absolute";
            hp.style.top = "-9999px";
            hp.style.left = "-9999px";
            hp.style.opacity = "0";
            hp.style.zIndex = "-1";
            hp.setAttribute("aria-hidden", "true");

            // Jika ada yang mengklik link ini, langsung ditandai sebagai Bot
            hp.addEventListener("click", (e) => {
                e.preventDefault();
                blockBot("Honeypot Triggered");
            });

            document.body.appendChild(hp);
        };

        // Delay sedikit pembuatan honeypot agar tereksekusi pasca reder
        setTimeout(createHoneypot, 1000);

        // --- 3. PELACAKAN INTERAKSI MANUSIA (Mouse & Scroll Behavior) ---
        // Manusia akan menggerakkan mouse, scroll, atau menggunakan touch screen.
        const onMouseMove = () => { mouseMoves++; checkHuman(); };
        const onScroll = () => { scrollCount++; checkHuman(); };
        const onTouch = () => { mouseMoves += 5; checkHuman(); }; // Touch screen disamakan dengan gerakan

        const checkHuman = () => {
            // Jika ada pergerakan mouse yang cukup atau scroll yang wajar, tandai sebagai manusia
            if (mouseMoves > 10 || scrollCount > 3) {
                isHuman = true;
                // Hapus pendengar setelah yakin ini manusia (menghemat memori)
                window.removeEventListener("mousemove", onMouseMove);
                window.removeEventListener("scroll", onScroll);
                window.removeEventListener("touchstart", onTouch);
            }
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("scroll", onScroll);
        window.addEventListener("touchstart", onTouch);

        // --- 4. RATE LIMITING & KECEPATAN KLIK TAK WAJAR ---
        // Scraper seringkali mengklik halaman sangat cepat beruntun secara instan
        const onClick = (e: MouseEvent) => {
            clickCount++;
            const now = new Date().getTime();

            // Memeriksa jika ini adalah klik pertama dan tanpa pergerakan mouse (Sangat tak wajar bagi manusia di desktop)
            // (Kecuali TouchScreen, yang mouseMoves-nya kita naikkan di event touchstart)
            if (clickCount === 1 && !isHuman && mouseMoves === 0 && (e as PointerEvent).pointerType === "mouse") {
                blockBot("Unnatural Interaction Speed");
            }

            // Memeriksa klik yang terlalu cepat (kurang dari 50ms per klik, mustahil bagi manusia)
            if (lastClickTime !== 0 && (now - lastClickTime < 50)) {
                blockBot("Superhuman Click Speed");
            }

            lastClickTime = now;
        };

        window.addEventListener("click", onClick, true); // Use capture phase

        // --- 5. PROTEKSI PAYLOAD & NETWORK JARINGAN ---
        // Override console methods untuk mencegah reverse engineering data JSON
        const noop = () => { };
        const originalConsole = {
            log: console.log, warn: console.warn, error: console.error,
            info: console.info, table: console.table, debug: console.debug, dir: console.dir,
        };

        if (process.env.NODE_ENV !== "development") {
            console.log = noop; console.warn = noop; console.error = noop;
            console.info = noop; console.table = noop; console.debug = noop; console.dir = noop;
        }

        // --- CLEANUP KETIKA KOMPONEN UNMOUNT ---
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("touchstart", onTouch);
            window.removeEventListener("click", onClick, true);

            const hp = document.getElementById("honeypot-link");
            if (hp && hp.parentNode) hp.parentNode.removeChild(hp);

            if (process.env.NODE_ENV !== "development") {
                console.log = originalConsole.log; console.warn = originalConsole.warn;
                console.error = originalConsole.error; console.info = originalConsole.info;
                console.table = originalConsole.table; console.debug = originalConsole.debug;
                console.dir = originalConsole.dir;
            }
        };
    }, []);

    return null;
}
