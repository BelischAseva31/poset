const {
    ChatInputCommandInteraction,
    Client,
    SlashCommandBuilder,
    EmbedBuilder,
} = require("discord.js");
const mzrdb = require("croxydb");
const { slotLimit } = require("../../config.json");

const slotItems = ["🍬", "🍋", "🍓", "🍒", "🍐"];
const winRates = {
    "🍬": 2,
    "🍋": 2,
    "🍓": 2,
    "🍒": 2,
    "🍐": 2,
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("slot")
        .setDescription("Slot Oynarsınız")
        .addIntegerOption((option) =>
            option
                .setName("miktar")
                .setDescription("Slot Oynamak İstediğin Miktarı Yaz")
                .setRequired(true),
        ),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { user, options } = interaction;

        await interaction.deferReply({ ephemeral: false });

        const bakiye = mzrdb.get(`mzrbakiye.${user.id}`) || 0;
        let miktar = options.getInteger("miktar");
        let win = false;

        if (miktar > bakiye || !bakiye) {
            return interaction.editReply({
                content: `> Bu kadar paran yok. Kendini zengin sanma! Orospu çocuğu bir fakirsin!\n> **Mevcut paran:** ${bakiye}TL`,
            });
        }

        if (miktar < slotLimit) {
            return interaction.editReply({
                content: `> **${miktar}TL** mi ha ha ha AMINA KODUĞUMUN OROSPU ÇOCUĞU SENİ. APTAL FAKİR HERİF! Siktirgit! Çocuk mu kandırıyorsun? Yoksa fakir misin?\n> **Minimum Miktar:** ${slotLimit}TL Biraz ciddi oyna unutma **DEDEN HER DAİM YANINDA!**`,
            });
        }

        const slotResult = [];
        for (let i = 0; i < 3; i++) {
            const randomEmoji =
                slotItems[Math.floor(Math.random() * slotItems.length)];
            slotResult.push(randomEmoji);
        }

        const resultMessage = slotResult.join(" | ");

        let para;
        if (
            slotResult[0] === slotResult[1] ||
            slotResult[1] === slotResult[2]
        ) {
            const symbol =
                slotResult[0] === slotResult[1] ? slotResult[0] : slotResult[1];
            para = miktar * winRates[symbol];
            win = true;
        } else if (
            slotResult[0] === slotResult[1] &&
            slotResult[1] === slotResult[2]
        ) {
            para = miktar * winRates[slotResult[0]];
            win = true;
        }

        if (win) {
            let slotsEmbed1 = new EmbedBuilder()
                .setTitle(`**Sweat Bonanza 🍬 | Slot Makinesi**`)
                .setDescription(
                    `\`${resultMessage}\`\n\n**SENSATİONAL!** Başardın! Bunu biliyordum! **${para}TL** kazandın!`,
                )
                .setColor("Green");

            await interaction.editReply({ embeds: [slotsEmbed1] });
            mzrdb.add(`mzrbakiye.${user.id}`, para);
        } else {
            let slotsEmbed = new EmbedBuilder()
                .setTitle(`**Sweat Bonanza 🍬 | Slot Makinesi**`)
                .setDescription(
                    `\`${resultMessage}\`\n\n**DEDE SENİ BİTİRDİ EVLAT!** Amına Kodumun cahili nasıl kazanmayı bekliyordun ki? Çoluğunun Çocuğunun rızkını kumara yatır aynen! **(Kumarda Her Zaman Kumarhane Kazanır!)** **${miktar}TL** kaybettin!`,
                )
                .setColor("Red");

            await interaction.editReply({ embeds: [slotsEmbed] });
            mzrdb.subtract(`mzrbakiye.${user.id}`, miktar);
        }
    },
};
