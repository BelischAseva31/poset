const { ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js");
const mzrdb = require("croxydb");
const mzrdjs = require("mzrdjs");

// 🐟 BALIK TABLOSU
const baliklar = {
    Ender: {
        sans: 40,
        min: 20,
        max: 35,
        isimler: ["Hamsi", "İstavrit", "Sardalya", "Uskumru", "Mezgit"]
    },
    SuperEnder: {
        sans: 25,
        min: 35,
        max: 60,
        isimler: ["Levrek", "Çipura", "Mercan", "Palamut", "Kalkan"]
    },
    Destansi: {
        sans: 18,
        min: 60,
        max: 100,
        isimler: ["Somon", "Orkinos", "Kılıç Balığı", "Barakuda", "Ton Balığı"]
    },
    Gizemli: {
        sans: 12,
        min: 100,
        max: 160,
        isimler: ["Elektrikli Yılan", "Derin Deniz Balığı", "Hayalet Balık", "Gece Avcısı", "Karanlık Yüzgeç"]
    },
    Efsanevi: {
        sans: 5,
        min: 160,
        max: 300,
        isimler: ["Altın Balık", "Poseidon’un Laneti", "Kraken Yavrusu", "Ejder Balığı", "Kadim Deniz Ruhu"]
    }
};

// 🎲 NADİRLİK SEÇİMİ
function nadirlikSec() {
    const rand = mzrdjs.random(1, 100);
    let toplam = 0;

    for (const tur in baliklar) {
        toplam += baliklar[tur].sans;
        if (rand <= toplam) return tur;
    }
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

        // 🎣 OLTA KONTROL
        const olta = mzrdb.get(`mzrolta.${user.id}`);
        if (!olta) {
            return interaction.editReply({
                content: "> 🎣 Olta olmadan balık tutamazsın! Markete git.",
            });
        }

        // ⏱️ COOLDOWN (7 DK)
        const süre = 7 * 60 * 1000;
        const sonBalik = await mzrdb.fetch(`mzrbaliktime.${user.id}`);
        const kalanSüre = süre - (Date.now() - sonBalik);

        if (sonBalik !== null && süre - (Date.now() - sonBalik) > 0) {
            return interaction.editReply({
                content: `> Balık tutmak için beklemelisin!\n> Kalan Süre: <t:${Math.floor((Date.now() + kalanSüre) / 1000)}:R>`,
            });
        }

        // 🎲 BALIK SEÇ
        const nadirlik = nadirlikSec();
        const veri = baliklar[nadirlik];
        const balik = veri.isimler[mzrdjs.random(0, veri.isimler.length - 1)];
        const kazanc = mzrdjs.random(veri.min, veri.max);

        mzrdb.set(`mzrbaliktime.${user.id}`, Date.now());

        interaction.editReply({
            content: "> 🎣 Olta suya atıldı... Balık bekleniyor...",
        });

        setTimeout(() => {
            interaction.editReply({
                content:
                    `> 🐟 **${balik}** tuttun!\n` +
                    `> ⭐ Tür: **${nadirlik}**\n` +
                    `> 💰 Balığı satıp **${kazanc}TL** kazandın!`,
            });

            mzrdb.add(`mzrbakiye.${user.id}`, kazanc);
        }, 7000);
    },
};
