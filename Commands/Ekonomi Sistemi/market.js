const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const mzrdb = require("croxydb");
const { demirKazmaFiyat, elmasKazmaFiyat, tahtaOltaFiyat, demirOltaFiyat, elmasOltaFiyat,
        ceyrekBiletFiyat, yarimBiletFiyat, tamBiletFiyat } = require("../../config.json");

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
                    { name: "Tahta Olta", value: "mzrtahtaolta" },
                    { name: "Demir Olta", value: "mzrdemirolta" },
                    { name: "Elmas Olta", value: "mzrelmasolta" },
                    { name: "Çeyrek Bilet", value: "mzrceyrekbilet" },
                    { name: "Yarım Bilet", value: "mzryarimbilet" },
                    { name: "Tam Bilet", value: "mzrtambilet" },
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

        // 🔨 Kazma Sistemi
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
        
        // 🎣 Olta Sistemi
        if (secim === "mzrtahtaolta") {
            if (bakiye < tahtaOltaFiyat) return interaction.editReply(`> Yeterli paran yok! (${tahtaOltaFiyat}TL gerekli)`);
            if (mzrdb.get(`mzrolta.${user.id}`)) return interaction.editReply("> Zaten bir oltan var!");
            mzrdb.set(`mzrolta.${user.id}`, { olta: "Tahta Olta", fiyat: tahtaOltaFiyat, bonus: 1 });
            mzrdb.subtract(`mzrbakiye.${user.id}`, tahtaOltaFiyat);
            return interaction.editReply({ embeds: [new EmbedBuilder().setTitle("Satın Aldın ✅").setDescription(`🎣 Tahta Olta aldın! **${tahtaOltaFiyat}TL** gitti.\n> Bonus: **x1** kazanç`).setColor("Green")] });
        }
        
        if (secim === "mzrdemirolta") {
            if (bakiye < demirOltaFiyat) return interaction.editReply(`> Yeterli paran yok! (${demirOltaFiyat}TL gerekli)`);
            const mevcutOlta = mzrdb.get(`mzrolta.${user.id}`);
            if (mevcutOlta?.olta === "Demir Olta") return interaction.editReply("> Zaten bir Demir oltan var!");
            if (mevcutOlta?.olta === "Elmas Olta") return interaction.editReply("> Zaten daha iyi bir oltan var!");
            mzrdb.set(`mzrolta.${user.id}`, { olta: "Demir Olta", fiyat: demirOltaFiyat, bonus: 1.5 });
            mzrdb.subtract(`mzrbakiye.${user.id}`, demirOltaFiyat);
            return interaction.editReply({ embeds: [new EmbedBuilder().setTitle("Satın Aldın ✅").setDescription(`🎣 Demir Olta aldın! **${demirOltaFiyat}TL** gitti.\n> Bonus: **x1.5** kazanç`).setColor("Green")] });
        }
        
        if (secim === "mzrelmasolta") {
            if (bakiye < elmasOltaFiyat) return interaction.editReply(`> Yeterli paran yok! (${elmasOltaFiyat}TL gerekli)`);
            const mevcutOlta = mzrdb.get(`mzrolta.${user.id}`);
            if (mevcutOlta?.olta === "Elmas Olta") return interaction.editReply("> Zaten bir Elmas oltan var!");
            mzrdb.set(`mzrolta.${user.id}`, { olta: "Elmas Olta", fiyat: elmasOltaFiyat, bonus: 2 });
            mzrdb.subtract(`mzrbakiye.${user.id}`, elmasOltaFiyat);
            return interaction.editReply({ embeds: [new EmbedBuilder().setTitle("Satın Aldın ✅").setDescription(`🎣 Elmas Olta aldın! **${elmasOltaFiyat}TL** gitti.\n> Bonus: **x2** kazanç`).setColor("Green")] });
        }
        // 🎟️ Bilet Sistemi
        if (secim === "mzrceyrekbilet") {
            if (bakiye < ceyrekBiletFiyat) return interaction.editReply(`> Yeterli paran yok! (${ceyrekBiletFiyat}TL gerekli)`);
            mzrdb.set(`mzrbilet.${user.id}`, { tur: "ceyrek", fiyat: ceyrekBiletFiyat });
            mzrdb.subtract(`mzrbakiye.${user.id}`, ceyrekBiletFiyat);
            return interaction.editReply({ embeds: [new EmbedBuilder().setTitle("Satın Aldın ✅").setDescription(`🎟️ Çeyrek Bilet aldın! **${ceyrekBiletFiyat}TL** gitti.`).setColor("Green")] });
        }

        if (secim === "mzryarimbilet") {
            if (bakiye < yarimBiletFiyat) return interaction.editReply(`> Yeterli paran yok! (${yarimBiletFiyat}TL gerekli)`);
            mzrdb.set(`mzrbilet.${user.id}`, { tur: "yarim", fiyat: yarimBiletFiyat });
            mzrdb.subtract(`mzrbakiye.${user.id}`, yarimBiletFiyat);
            return interaction.editReply({ embeds: [new EmbedBuilder().setTitle("Satın Aldın ✅").setDescription(`🎟️ Yarım Bilet aldın! **${yarimBiletFiyat}TL** gitti.`).setColor("Green")] });
        }

        if (secim === "mzrtambilet") {
            if (bakiye < tamBiletFiyat) return interaction.editReply(`> Yeterli paran yok! (${tamBiletFiyat}TL gerekli)`);
            mzrdb.set(`mzrbilet.${user.id}`, { tur: "tam", fiyat: tamBiletFiyat });
            mzrdb.subtract(`mzrbakiye.${user.id}`, tamBiletFiyat);
            return interaction.editReply({ embeds: [new EmbedBuilder().setTitle("Satın Aldın ✅").setDescription(`🎟️ Tam Bilet aldın! **${tamBiletFiyat}TL** gitti.`).setColor("Green")] });
        }
    }
};

