const {
    ChatInputCommandInteraction,
    Client,
    SlashCommandBuilder,
    EmbedBuilder,
} = require("discord.js");
const db = require("croxydb");
const { slotLimit } = require("../../config.json");

/* =======================
   SLOT EMOJİLERİ
   ======================= */

// 🔄 SLOT DÖNME EMOJİSİ
// BURAYA OWo TARZI ANİMASYONLU EMOJİ GELECEK
const SPIN_EMOJI = "<a:slot:1456618025456373993>"; // <a:slot_spin:ID>

// 🎰 SLOT SEMBOLLERİ
const SYMBOLS = [
    "🍒", // SYMBOL_CHERRY
    "🍋", // SYMBOL_LEMON
    "🍇", // SYMBOL_GRAPE
    "🍬", // SYMBOL_CANDY
    "⭐"  // SYMBOL_STAR (RARE)
];

// 💰 ÇARPANLAR (OWo BENZERİ)
const MULTIPLIERS = {
    double: 1.5, // 2 aynı
    triple: 3.5, // 3 aynı
};

// ⏱️ SLOT DÖNME SÜRESİ (ms)
const SPIN_TIME = 2500;

/* =======================
   KOMUT
   ======================= */

module.exports = {
    data: new SlashCommandBuilder()
        .setName("slot")
        .setDescription("Slot oynarsın")
        .addIntegerOption(option =>
            option
                .setName("miktar")
                .setDescription("Bahis miktarı")
                .setRequired(true)
        ),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction) {
        const user = interaction.user;
        const miktar = interaction.options.getInteger("miktar");
        const bakiye = db.get(`mzrbakiye.${user.id}`) || 0;

        /* =======================
           KONTROLLER
           ======================= */

        if (miktar < slotLimit) {
            return interaction.reply({
                content: `❌ Minimum bahis **${slotLimit}TL**`,
                ephemeral: true,
            });
        }

        if (bakiye < miktar) {
            return interaction.reply({
                content: `❌ Yetersiz bakiye. (**${bakiye}TL**)`,
                ephemeral: true,
            });
        }

        /* =======================
           SLOT DÖNÜYOR
           ======================= */

        const spinningEmbed = new EmbedBuilder()
            .setTitle("🎰 SLOTS")
            .setDescription(
                `**${user.username}** slot çeviriyor...\n\n` +
                `╔═══════ 🎰 ═══════╗\n` +
                `  ${SPIN_EMOJI} | ${SPIN_EMOJI} | ${SPIN_EMOJI}\n` +
                `╚═════════════════╝`
            )
            .setColor("Yellow");

        await interaction.reply({ embeds: [spinningEmbed] });

        // OWo hissi
        await new Promise(res => setTimeout(res, SPIN_TIME));

        /* =======================
           KAZANMA ORANLARI
           %60 kayıp
           %30 double
           %10 triple
           ======================= */

        const chance = Math.random();
        let result = [];
        let winType = "lose";

        if (chance <= 0.10) {
            // 🔥 3 AYNI
            const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            result = [sym, sym, sym];
            winType = "triple";
        } else if (chance <= 0.40) {
            // ✅ 2 AYNI
            const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            const other = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            result = [sym, sym, other].sort(() => Math.random() - 0.5);
            winType = "double";
        } else {
            // ❌ KAYIP
            result = [
                SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
                SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
                SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            ];
        }

        /* =======================
           PARA HESAPLAMA
           ======================= */

        let kazanilan = 0;
        let resultText = "";

        if (winType === "double") {
            kazanilan = Math.floor(miktar * MULTIPLIERS.double);
            db.add(`mzrbakiye.${user.id}`, kazanilan);
            resultText = `✅ **Kazandın! (2x)**\n+${kazanilan}TL`;
        } else if (winType === "triple") {
            kazanilan = Math.floor(miktar * MULTIPLIERS.triple);
            db.add(`mzrbakiye.${user.id}`, kazanilan);
            resultText = `🔥 **BÜYÜK KAZANÇ! (3x)**\n+${kazanilan}TL`;
        } else {
            db.subtract(`mzrbakiye.${user.id}`, miktar);
            resultText = `❌ **Kaybettin!**\n-${miktar}TL`;
        }

        /* =======================
           SONUÇ
           ======================= */

        const finalEmbed = new EmbedBuilder()
            .setTitle("🎰 SLOTS")
            .setDescription(
                `╔═══════ 🎰 ═══════╗\n` +
                `  ${result[0]} | ${result[1]} | ${result[2]}\n` +
                `╚═════════════════╝\n\n` +
                resultText
            )
            .setColor(winType === "lose" ? "Red" : "Green");

        await interaction.editReply({ embeds: [finalEmbed] });
    },
};

