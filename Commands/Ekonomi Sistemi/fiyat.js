const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require("discord.js");
const {
    demirKazmaFiyat,
    elmasKazmaFiyat,
    tahtaOltaFiyat,
    demirOltaFiyat,
    elmasOltaFiyat,
    ceyrekBiletFiyat,
    yarimBiletFiyat,
    tamBiletFiyat
} = require("../../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("fiyat")
        .setDescription("Markette satılan ürünlerin fiyatlarını gösterir"),
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle("🛒 Market Fiyatları")
            .setDescription("Markette satılan tüm ürünlerin güncel fiyatları aşağıda listelenmiştir:")
            .setColor("Blue")
            .addFields(
                { name: "⛏️ Kazmalar", value: 
                    `• Demir Kazma: **${demirKazmaFiyat} TL**\n` +
                    `• Elmas Kazma: **${elmasKazmaFiyat} TL**`, inline: false },
                { name: "🎣 Oltalar", value: 
                    `• Tahta Olta: **${tahtaOltaFiyat} TL**\n` +
                    `• Demir Olta: **${demirOltaFiyat} TL**\n` +
                    `• Elmas Olta: **${elmasOltaFiyat} TL**`, inline: false },
                { name: "🎟️ Biletler", value: 
                    `• Çeyrek Bilet: **${ceyrekBiletFiyat} TL**\n` +
                    `• Yarım Bilet: **${yarimBiletFiyat} TL**\n` +
                    `• Tam Bilet: **${tamBiletFiyat} TL**`, inline: false }
            )
            .setFooter({ text: "💡 Fiyatlar belirlenirken enflansyon baz alınmaktadır." })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: false });
    }
};
