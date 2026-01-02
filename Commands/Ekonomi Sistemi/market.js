const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
} = require("discord.js");
const mzrdb = require("croxydb");
const {
    demirKazmaFiyat,
    elmasKazmaFiyat,
    oltaFiyat,
} = require("../../config.json");

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
                    { name: "Olta", value: "mzrolta" },
                ),
        ),
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const { user, options } = interaction;

        await interaction.deferReply({ ephemeral: false });

        const secim = options.getString("seç");
        const bakiye = mzrdb.get(`mzrbakiye.${user.id}`) || 0;
        const kazmalar = mzrdb.get(`mzrkazma.${user.id}`) || {};
        const buKazma = kazmalar.kazma;
        const olta = mzrdb.get(`mzrolta.${user.id}`);
        let fiyat;

        // 🪓 DEMİR KAZMA
        if (secim === "mzrdemirkazma") {
            fiyat = demirKazmaFiyat;

            if (fiyat > bakiye || !bakiye) {
                return interaction.editReply({
                    content: `> Cüzdanında bu kadar para yok!\n> **Gerekli:** ${fiyat}TL\n> **Mevcut:** ${bakiye}TL`,
                });
            }

            if (buKazma) {
                return interaction.editReply({
                    content: "> Mevcut bir kazman bulunuyor!",
                });
            }

            const embed = new EmbedBuilder()
                .setTitle("Satın Aldın ✅")
                .setDescription(`**${fiyat}TL** vererek **Demir Kazma** satın aldın!`)
                .setColor("Green")
                .setTimestamp()
                .setFooter({
                    text: "Sweat Bonanza 🍬",
                    iconURL: user.displayAvatarURL(),
                });

            mzrdb.set(`mzrkazma.${user.id}`, {
                kazma: "Demir Kazma",
                fiyat: fiyat,
            });
            mzrdb.subtract(`mzrbakiye.${user.id}`, fiyat);

            return interaction.editReply({ embeds: [embed] });
        }

        // 💎 ELMAS KAZMA
        else if (secim === "mzrelmaskazma") {
            fiyat = elmasKazmaFiyat;

            if (fiyat > bakiye || !bakiye) {
                return interaction.editReply({
                    content: `> Cüzdanında bu kadar para yok!\n> **Gerekli:** ${fiyat}TL\n> **Mevcut:** ${bakiye}TL`,
                });
            }

            if (buKazma === "Elmas Kazma") {
                return interaction.editReply({
                    content: "> Zaten **Elmas Kazma**n var!",
                });
            }

            const embed = new EmbedBuilder()
                .setTitle("Satın Aldın ✅")
                .setDescription(`**${fiyat}TL** vererek **Elmas Kazma** satın aldın!`)
                .setColor("Green")
                .setTimestamp()
                .setFooter({
                    text: "Sweat Bonanza 🍬",
                    iconURL: user.displayAvatarURL(),
                });

            mzrdb.set(`mzrkazma.${user.id}`, {
                kazma: "Elmas Kazma",
                fiyat: fiyat,
            });
            mzrdb.subtract(`mzrbakiye.${user.id}`, fiyat);

            return interaction.editReply({ embeds: [embed] });
        }

        // 🎣 OLTA
        else if (secim === "mzrolta") {
            fiyat = oltaFiyat;

            if (fiyat > bakiye || !bakiye) {
                return interaction.editReply({
                    content: `> Olta almak için **${fiyat}TL** lazım!\n> **Mevcut paran:** ${bakiye}TL`,
                });
            }

            if (olta) {
                return interaction.editReply({
                    content: "> Zaten bir oltan var!",
                });
            }

            const embed = new EmbedBuilder()
                .setTitle("Satın Aldın 🎣")
                .setDescription(`**${fiyat}TL** vererek **Olta** satın aldın!`)
                .setColor("Blue")
                .setTimestamp()
                .setFooter({
                    text: "Sweat Bonanza 🍬",
                    iconURL: user.displayAvatarURL(),
                });

            mzrdb.set(`mzrolta.${user.id}`, true);
            mzrdb.subtract(`mzrbakiye.${user.id}`, fiyat);

            return interaction.editReply({ embeds: [embed] });
        }
    },
};
