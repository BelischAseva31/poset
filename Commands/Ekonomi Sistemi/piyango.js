const { ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js");
const mzrdb = require("croxydb");
const mzrdjs = require("mzrdjs");

// 🎟️ Ödül tablosu
const oduller = {
    ceyrek: [
        { isim: "Boş", sans: 30, kazanc: 0 },
        { isim: "Amorti", sans: 70, kazanc: 200 }
    ],
    yarim: [
        { isim: "Boş", sans: 20, kazanc: 0 },
        { isim: "Amorti", sans: 50, kazanc: 400 },
        { isim: "Hediye Çeki", sans: 30, kazanc: mzrdjs.random(500, 1500) }
    ],
    tam: [
        { isim: "Boş", sans: 10, kazanc: 0 },
        { isim: "Amorti", sans: 40, kazanc: 900 },
        { isim: "Hediye Çeki", sans: 45, kazanc: mzrdjs.random(2000, 5000) },
        { isim: "Araba", sans: 4, kazanc: mzrdjs.random(100000, 250000) },
        { isim: "Büyük Piyango", sans: 1, kazanc: 1000000 }
    ]
};

// 🎲 Ödül seç
function odulSec(tur) {
    const tablo = oduller[tur];
    let rand = mzrdjs.random(1, 100);
    let toplam = 0;
    for (const odul of tablo) {
        toplam += odul.sans;
        if (rand <= toplam) return odul;
    }
    return tablo[0]; // emniyet kemeri
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("piyango")
        .setDescription("Satın aldığın bilet ile piyango oynarsın"),
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const { user } = interaction;
        await interaction.deferReply({ ephemeral: false });

        // 🎟️ Kullanıcıda hangi bilet var?
        const bilet = mzrdb.get(`mzrbilet.${user.id}`);
        if (!bilet) return interaction.editReply("> 🎟️ Hiç biletin yok! Markete gidip bilet almalısın.");

        const tur = bilet.tur; // "ceyrek", "yarim", "tam"
        const odul = odulSec(tur);

        if (odul.kazanc > 0) {
            await mzrdb.add(`mzrbakiye.${user.id}`, odul.kazanc);
        }

        return interaction.editReply(
            `🎟️ **${tur.toUpperCase()} Bilet** ile çekilişe katıldın!\n` +
            `🎲 Sonuç: **${odul.isim}**\n` +
            (odul.kazanc > 0 ? `💰 Kazancın: **${odul.kazanc} TL**` : "😢 Maalesef bir şey kazanamadın.")
        );
    }
};
