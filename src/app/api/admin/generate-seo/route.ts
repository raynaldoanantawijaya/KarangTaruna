import { NextResponse } from 'next/server';

const AGENT_ROUTER_TOKEN = 'sk-FL5PqbD2LjtjNZ8K9dJrnosKUPF8JaYw0OUuNrQ74Hari8yh';
const AGENT_ROUTER_URL = 'https://agentrouter.org/v1/chat/completions';

export async function POST(req: Request) {
    try {
        const { title, content } = await req.json();

        if (!title && !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        const systemPrompt = `Anda adalah ahli SEO dan Editor Jurnalistik profesional berbahasa Indonesia. Tugas Anda adalah menganalisis teks artikel, lalu menghasilkan metadata dalam format JSON murni TANPA markdown block (seperti \`\`\`json) atau teks pengantar apapun. Pastikan respon Anda HANYA berupa objek JSON yang valid.

FORMAT WAJIB JSON:
{
  "metaTitle": "Tulis ulang atau perbaiki judul agar SEO friendly dan padat. Maksimal 70 karakter.",
  "metaDesc": "Buat 1-2 kalimat deskripsi meta yang kuat, merangkum inti arikel, dan mengundang klik. Maksimal 160 karakter agar tidak terpotong di Google.",
  "tags": ["Tag1", "Tag2"], 
  "categories": ["Kategori1"]
}

Aturan Tags:
- Berikan maksimal 5 tag yang PALING merepresentasikan topik utama tulisan (bukan potongan kata yang tidak penting). 
- Gunakan Title Case (Cth: Karang Taruna, Donor Darah, Pemerintahan).

Aturan Categories:
- Pilih HANYA 1 atau 2 kategori dari daftar mutlak berikut: "Berita", "Kegiatan", "Pengumuman", "Program Kerja".
- Pilih berdasarkan konteks isi. Jika ini adalah peringatan / perayaan / musyawarah -> Kegiatan. Jika ini laporan kejadian umum -> Berita.`;

        // Ambil maksimal 2000 karakter pertama agar token tidak meledak dan AI fokus ke pembukaan
        const userPrompt = `Judul Asli: ${title}\n\nIsi Artikel:\n${content.substring(0, 2000)}`;

        const response = await fetch(AGENT_ROUTER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AGENT_ROUTER_TOKEN}`
            },
            body: JSON.stringify({
                model: 'deepseek-v3.1',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.2, // Rendah agar hasil stabil dan deterministik
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error('AgentRouter API Error:', errBody);
            throw new Error(`AgentRouter API Error: ${response.status}`);
        }

        const data = await response.json();
        let aiMessage = data.choices?.[0]?.message?.content;

        if (!aiMessage) {
            throw new Error('Empty response from AI');
        }

        // Hapus backtick markdown jika terbawa (terkadang response_format json_object masih menyisakan markdown tilde)
        aiMessage = aiMessage.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();

        let parsedJson;
        try {
            parsedJson = JSON.parse(aiMessage);
        } catch (e) {
            console.error("Failed to parse AI JSON:", aiMessage);
            throw new Error("AI membalas dengan format JSON yang cacat.");
        }

        return NextResponse.json({ data: parsedJson });
    } catch (error: any) {
        console.error('generate-seo api error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
