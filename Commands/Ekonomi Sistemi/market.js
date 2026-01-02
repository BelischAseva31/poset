const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const mzrdb = require("croxydb");
const { demirKazmaFiyat, elmasKazmaFiyat, oltaFiyat } = require("../../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("market")
        .setDescription("Marketten bir şeyler alırsınız")
        .addStringOption(option =>
            option.setName("seç")
                .setDescription("Alacağınız ürünü seçin")
                .setRequired(true)
                .addChoices(
                    { name: "Demir Kazma", value: "mzrdemirkazma" },
                    { name: "Elmas Kazma", value: "mzrelmaskazma" },
                    { name: "Olta", value: "mzrolta" },
                )
        ),

    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const { user, options } = interaction;
        const secim = options.getString("seç");
        const bakiye = mzrdb.get(`mzrbakiye.${user.id}`) || 0;

        await interaction.deferReply({ ephemeral: false });

        if (secim === "mzrdemirkazma") {
            if (bakiye < demirKazmaFiyat) return interaction.editReply(`> Yeterli paran yok! (${demirKazmaFiyat}TL gerekli)`);
            if (mzrdb.get(`mzrkazma.${user.id}`)) return interaction.editReply("> Zaten bir kazman var!");
            mzrdb.set(`mzrkazma.${user.id}`, { kazma: "Demir Kazma", fiyat: demirKazmaFiyat });
            mzrdb.subtract(`mzrbakiye.${user.id}`, demirKazmaFiyat);
            return interaction.editReply({ embeds: [new EmbedBuilder().setTitle("Satın Aldın ✅").setDescription(`Demir Kazma aldın! **${demirKazmaFiyat}TL** gitti.`).setColor("Green")] });
        }

        if (secim === "mzrelmaskazma") {
            if (bakiye < elmasKazmaFiyat) return interaction.editReply(`> Yeterli paran yok! (${elmasKazmaFiyat}TL gerekli)`);
            if (mzrdb.get(`mzrkazma.${user.id}`)?.kazma === "Elmas Kazma") return interaction.editReply("> Zaten bir Elmas kazman var!");
            mzrdb.set(`mzrkazma.${user.id}`, { kazma: "Elmas Kazma", fiyat: elmasKazmaFiyat });
            mzrdb.subtract(`mzrbakiye.${user.id}`, elmasKazmaFiyat);
            return interaction.editReply({ embeds: [new EmbedBuilder().setTitle("Satın Aldın ✅").setDescription(`Elmas Kazma aldın! **${elmasKazmaFiyat}TL** gitti.`).setColor("Green")] });
        }

        if (secim === "mzrolta") {
            if (bakiye < oltaFiyat) return interaction.editReply(`> Yeterli paran yok! (${oltaFiyat}TL gerekli)`);
            mzrdb.set(`mzrolta.${user.id}`, true);
            mzrdb.subtract(`mzrbakiye.${user.id}`, oltaFiyat);
            return interaction.editReply({ embeds: [new EmbedBuilder().setTitle("Satın Aldın ✅").setDescription(`Olta aldın! **${oltaFiyat}TL** gitti.`).setColor("Green")] });
        }
    }
};
