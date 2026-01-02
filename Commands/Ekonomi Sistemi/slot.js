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

const SPIN_EMOJI = "<a:slot:1456618025456373993>";

const SYMBOLS = ["🍒", "🍋", "🍇", "🍬", "⭐"];

// ⏱️ SLOT DÖNME SÜRESİ
const SPIN_TIME = 2500;

/* =======================
   YARDIMCI FONKSİYONLAR
   ======================= */

function getRandomSymbol() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function getThreeDifferentSymbols() {
    const shuffled = [...SYMBOLS].sort(() => Math.random() - 0.5);
    return [shuffled[0], shuffled[1], shuffled[2]];
}

/* =======================
   KOMUT
   ======================= */

module.exports = {
    data: new SlashCommandBuilder()
        .setName("slot")
        .setDescription("Slot oynarsın")
        .addIntegerOption(option =>
            option.setName("miktar").setDescription("Bahis miktarı").setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.user;
        const miktar = interaction.options.getInteger("miktar");
        const bakiye = db.get(`mzrbakiye.${user.id}`) || 0;

        if (miktar < slotLimit)
            return interaction.reply({ content: `❌ Minimum bahis ${slotLimit}TL`, ephemeral: true });

        if (bakiye < miktar)
            return interaction.reply({ content: `❌ Yetersiz bakiye (${bakiye}TL)`, ephemeral: true });

        /* SLOT DÖNÜYOR */
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
        await new Promise(res => setTimeout(res, SPIN_TIME));

        /* =======================
           KAZANMA MANTIĞI
           %45 lose
           %40 double
           %15 triple
           ======================= */

        const roll = Math.random();
        let result;
        let winType;

        if (roll <= 0.15) {
            // 🔥 TRIPLE
            const sym = getRandomSymbol();
            result = [sym, sym, sym];
            winType = "triple";
        } else if (roll <= 0.55) {
            // ✅ DOUBLE
            const sym = getRandomSymbol();
            let other;
            do {
                other = getRandomSymbol();
            } while (other === sym);

            result = [sym, sym, other].sort(() => Math.random() - 0.5);
            winType = "double";
        } else {
            // ❌ LOSE (3'Ü DE FARKLI)
            result = getThreeDifferentSymbols();
            winType = "lose";
        }

        /* =======================
           PARA HESAPLAMA
           ======================= */

        let text;

        if (winType === "double") {
            const kazanilan = miktar * 2;
            db.add(`mzrbakiye.${user.id}`, kazanilan);
            text = `✅ **Kazandın!**\n+${kazanilan}TL`;
        } else if (winType === "triple") {
            const kazanilan = miktar * 3;
            db.add(`mzrbakiye.${user.id}`, kazanilan);
            text = `🔥 **BÜYÜK KAZANÇ!**\n+${kazanilan}TL`;
        } else {
            db.subtract(`mzrbakiye.${user.id}`, miktar);
            text = `❌ **Kaybettin!**\n-${miktar}TL`;
        }

        /* SONUÇ */
        const finalEmbed = new EmbedBuilder()
            .setTitle("🎰 SLOTS")
            .setDescription(
                `╔═══════ 🎰 ═══════╗\n` +
                `  ${result[0]} | ${result[1]} | ${result[2]}\n` +
                `╚═════════════════╝\n\n` +
                text
            )
            .setColor(winType === "lose" ? "Red" : "Green");

        await interaction.editReply({ embeds: [finalEmbed] });
    },
};
