// No import needed for Node 18+
async function checkApi() {
    try {
        const response = await fetch("https://api.ryzumi.vip/api/search/bmkg");
        const data = await response.json();

        console.log("AutoGempa DateTime:", data.autogempa?.DateTime);
        console.log("AutoGempa Tanggal:", data.autogempa?.Tanggal);
        console.log("AutoGempa Jam:", data.autogempa?.Jam);

        if (data.gempaterkini && data.gempaterkini.length > 0) {
            console.log("Gempa Terkini [0] DateTime:", data.gempaterkini[0].DateTime);
            console.log("Gempa Terkini [0] Tanggal:", data.gempaterkini[0].Tanggal);
        }
    } catch (e) {
        console.error(e);
    }
}

checkApi();
