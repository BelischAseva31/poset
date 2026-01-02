const { ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js");
const mzrdb = require("croxydb");
const mzrdjs = require("mzrdjs");

// 🐟 Balık tablosu
const baliklar = {
    Ender: { sans: 40, min: 20, max: 35, isimler: ["Hamsi","İstavrit","Sardalya","Uskumru","Mezgit"] },
    SuperEnder: { sans: 25, min: 35, max: 60, isimler: ["Levrek","Çipura","Mercan","Palamut","Kalkan"] },
    Destansi: { sans: 18, min: 60, max: 100, isimler: ["Somon","Orkinos","Kılıç Balığı","Barakuda","Ton Balığı"] },
    Gizemli: { sans: 12, min: 100, max: 160, isimler: ["Elektrikli Yılan","Derin Deniz Balığı","Hayalet Balık","Gece Avcısı","Karanlık Yüzgeç"] },
    Efsanevi: { sans: 5, min: 160, max: 300, isimler: ["Altın Balık","Poseidon'un Laneti","Kraken Yavrusu","Ejder Balığı","Kadim Deniz Ruhu"] }
};

// 🎲 Nadirlik seç (Olta bonusuna göre)
function nadirlikSec(oltaBonus = 1) {
    let rand = mzrdjs.random(1, 100);
    
    if (oltaBonus >= 1.5) {
        if (rand <= 40) rand = mzrdjs.random(20, 100);
    }
    if (oltaBonus >= 2) {
        if (rand <= 40) rand = mzrdjs.random(30, 100);
    }
    
    let toplam = 0;
    for (const tur in baliklar) {
        toplam += baliklar[tur].sans;
        if (rand <= toplam) return tur;
    }
    return "Ender"; // Emniyet kemeri
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("balıktut")
        .setDescription("Olta ile balık tutarsın"),
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const { user } = interaction;
        await interaction.deferReply({ ephemeral: false });
        
        // 🎣 Olta kontrol
        const oltaVeri = await mzrdb.get(`mzrolta.${user.id}`);
        if (!oltaVeri) return interaction.editReply("> 🎣 Olta olmadan balık tutamazsın! Markete gidip bir olta almalısın.");
        
        const oltaTuru = oltaVeri.olta || "Tahta Olta";
        const oltaBonus = oltaVeri.bonus || 1;
        
        // ⏱️ Cooldown Sistemi (Düzeltildi)
        const cooldown = 7 * 60 * 1000; // 7 dakika
        const last = await mzrdb.get(`mzrbaliktime.${user.id}`) || 0;
        const gecenSure = Date.now() - last;
        const kalan = cooldown - gecenSure;
        
        if (last !== 0 && kalan > 0) {
            return interaction.editReply(`> Balık tutmak için beklemelisin! Kalan: <t:${Math.floor((Date.now() + kalan) / 1000)}:R>`);
        }
        
        // 🎲 Balık seçimi ve hesaplamalar
        const tur = nadirlikSec(oltaBonus);
        const veri = baliklar[tur];
        const balik = veri.isimler[mzrdjs.random(0, veri.isimler.length - 1)];
        const temelKazanc = mzrdjs.random(veri.min, veri.max);
        const kazanc = Math.floor(temelKazanc * oltaBonus);
        
        // Zamanı kaydet ve ilk mesajı at
        await mzrdb.set(`mzrbaliktime.${user.id}`, Date.now());
        await interaction.editReply(`> 🎣 **${oltaTuru}** suya atıldı... Balık bekleniyor...`);
        
        // 7 saniye sonra balığı çek
        setTimeout(async () => {
            await mzrdb.add(`mzrbakiye.${user.id}`, kazanc);
            interaction.editReply(`> 🐟 **${balik}** tuttun!\n> ⭐ Tür: **${tur}**\n> 🎣 Olta: **${oltaTuru}** (x${oltaBonus} bonus)\n> 💰 **${kazanc} TL** kazandın!`);
        }, 7000);
    }
};
