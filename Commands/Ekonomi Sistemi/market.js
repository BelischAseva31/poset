const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
} = require("discord.js");
const mzrdb = require("croxydb");
const { demirKazmaFiyat, elmasKazmaFiyat } = require("../../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("market")
        .setDescription("Marketden Bir Şeyler Alırsınız")
        .addStringOption((option) =>
            option
                .setName("seç")
                .setDescription("Alacağınız Ürünü Seçiniz")
                .setRequired(true)
                .addChoices(
                    { name: "Demir Kazma", value: "mzrdemirkazma" },
                    { name: "Elmas Kazma", value: "mzrelmaskazma" },
                ),
        ),
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const { user, options } = interaction;

        await interaction.deferReply({ ephemeral: false });

        const kazma = options.getString("seç");
        const bakiye = mzrdb.get(`mzrbakiye.${user.id}`) || 0;
        const kazmalar = mzrdb.get(`mzrkazma.${user.id}`) || {};
        const buKazma = kazmalar.kazma;
        let fiyat;

        if (kazma === "mzrdemirkazma") {
            fiyat = demirKazmaFiyat;

            if (fiyat > bakiye || !bakiye) {
                return interaction.editReply({
                    content: `> Cüzlanında bu kadar para yok! Bu kazmayı alabilmen için **${fiyat}TL**'ye ihtiyacın var.\n> **Mevcut paran:** ${bakiye}TL`,
                    ephemeral: true,
                });
            }

            if (buKazma) {
                return interaction.editReply({
                    content: "> Mevcut bir kazman bulunuyor!",
                });
            }

            const mzrEmbed = new EmbedBuilder()
                .setTitle("Satın Aldın ✅")
                .setDescription(
                    `**${fiyat}TL** vererek bir **Demir Kazma** satın aldın!`,
                )
                .setColor("Green")
                .setTimestamp()
                .setFooter({
                    text: "Sweat Bonanza 🍬",
                    iconURL: user.displayAvatarURL(),
                });

            interaction.editReply({ embeds: [mzrEmbed] });

            mzrdb.set(`mzrkazma.${user.id}`, {
                kazma: "Demir Kazma",
                fiyat: fiyat,
            });
            mzrdb.subtract(`mzrbakiye.${user.id}`, fiyat);
        } else if (kazma === "mzrelmaskazma") {
            fiyat = elmasKazmaFiyat;

            if (fiyat > bakiye || !bakiye) {
                return interaction.editReply({
                    content: `> Cüzlanında bu kadar para yok! Bu kazmayı alabilmen için **${fiyat}TL**'ye ihtiyacın var.\n> **Mevcut paran:** ${bakiye}TL`,
                    ephemeral: true,
                });
            }

            if (buKazma === "Elmas Kazma") {
                return interaction.editReply({
                    content: "> Mevcut bir **Elmas** kazamn bulunuyor!",
                });
            }

            const mzrEmbed = new EmbedBuilder()
                .setTitle("Satın Aldın ✅")
                .setDescription(
                    `**${fiyat}TL** vererek bir **Elmas Kazma** satın aldın!`,
                )
                .setColor("Green")
                .setTimestamp()
                .setFooter({
                    text: "Sweat Bonanza 🍬",
                    iconURL: user.displayAvatarURL(),
                });

            interaction.editReply({ embeds: [mzrEmbed] });

            mzrdb.set(`mzrkazma.${user.id}`, {
                kazma: "Elmas Kazma",
                fiyat: fiyat,
            });
            mzrdb.subtract(`mzrbakiye.${user.id}`, fiyat);
        }
    },
};
