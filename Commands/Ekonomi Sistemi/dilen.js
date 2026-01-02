const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
} = require("discord.js");
const mzrdb = require("croxydb");
const mzrdjs = require("mzrdjs");

// Karakter listesi - Buradaki isimlerle aşağıdaki if-else isimleri aynı olmalı
const karakterler = [
    "Poseidon Dedemiz",
    "MrBeast",
    "Miralvanizm",
    "Esnaf",
    "Öğrenci",
    "RTE",
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("dilen")
        .setDescription("Dilenerek Para Kazanabilirsin"),
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const { user } = interaction;

        await interaction.deferReply({ ephemeral: false });

        const süre = 5 * 60 * 1000; // 5 dakika
        const sonDilenme = await mzrdb.get(`mzrdilenmetime.${user.id}`) || 0;
        const gecenSure = Date.now() - sonDilenme;

        if (gecenSure < süre) {
            const kalanSüreMs = süre - gecenSure;
            return interaction.editReply({
                content: `> **5** dakikada bir dilenebilirsin!\n> Kalan Süre: <t:${Math.floor((Date.now() + kalanSüreMs) / 1000)}:R>`,
            });
        }

        // Rastgele karakter seçimi
        const randomKişi = karakterler[Math.floor(Math.random() * karakterler.length)];

        let title = "";
        let description = "";
        let color = "Green";
        let dilen = 0;

        // Karakterlerin hepsini tek tek tanımlıyoruz
        if (randomKişi === "Poseidon Dedemiz") {
            dilen = mzrdjs.random(15, 25);
            title = "⚓ OHA DEDE GELDİ!!!";
            description = `Üzülme **evlat** seni kurtarmaya geldim al bu **${dilen}TL**'yi hemen hepsini kumara bas unutma **DEDEN YANINDA!** :)`;
            color = "Green";
        } 
        else if (randomKişi === "MrBeast") {
            dilen = mzrdjs.random(20, 50);
            title = "🎬 MrBeast Seni Fark Etti!";
            description = `Kameraya el salla! MrBeast sana tam **${dilen}TL** fırlattı!`;
            color = "Aqua";
        }
        else if (randomKişi === "Miralvanizm") {
            dilen = mzrdjs.random(10, 20);
            title = "📜 Bir Filozof Yaklaşıyor...";
            description = `**Miralvanizm** sana bakıp "Para sadece bir araçtır" dedi ve **${dilen}TL** verdi.`;
            color = "Purple";
        }
        else if (randomKişi === "Esnaf") {
            dilen = mzrdjs.random(5, 15);
            title = "🥖 Esnaf Abi Acıdı...";
            description = `Esnaf abi "Siftahı senden bereketi Allah'tan" diyerek sana **${dilen}TL** uzattı.`;
            color = "Orange";
        }
        else if (randomKişi === "Öğrenci") {
            dilen = mzrdjs.random(2, 8);
            title = "📚 Garibanın Halinden Gariban Anlar";
            description = `Öğrenci kardeşim KYK bursundan artırdığı **${dilen}TL**'yi sana bıraktı.`;
            color = "Yellow";
        }
        else if (randomKişi === "RTE") {
            dilen = mzrdjs.random(15, 30);
            title = "🏰 Saraydan Bir El Uzandı";
            description = `Konvoy geçerken bir paket çay bekliyordun ama sana **${dilen}TL** verdiler!`;
            color = "Red";
        }

        // Veritabanı güncellemeleri
        await mzrdb.add(`mzrbakiye.${user.id}`, dilen);
        await mzrdb.set(`mzrdilenmetime.${user.id}`, Date.now());

        const mzrEmbed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setTimestamp()
            .setFooter({
                text: `${user.username} tarafından istendi`,
                iconURL: user.displayAvatarURL({ dynamic: true }),
            });

        await interaction.editReply({ embeds: [mzrEmbed] });
    },
};
