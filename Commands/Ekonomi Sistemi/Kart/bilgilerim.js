const {
  EmbedBuilder,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const mzrdb = require("croxydb");

module.exports = {
  subCommand: "kart.bilgilerim",
  async execute(interaction) {
    const { user } = interaction;

    await interaction.deferReply({ ephemeral: true });

    const kart = mzrdb.get(`mzrkart.${user.id}`) || {};
    const kartNumara = kart.kartNumara;
    const kartCVC = kart.cvc;
    const kartSonKullanım = kart.sonKullanım;

    if (!kartNumara) {
      const mzrEmbed = new EmbedBuilder()
        .setTitle("Kart Nasıl Oluştururum?")
        .setDescription(
          "Aşağıdaki **Kart Oluştur** butonuna basarak kredi kartı oluştura bilirsiniz. Bu sayede banka hesabınıza para yatıra bilir ve para çekebilirsiniz.",
        )
        .setColor("Green")
        .setTimestamp()
        .setFooter({ text: user.username, iconURL: user.displayAvatarURL() });

      const mzrButon = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Kart Oluştur")
          .setCustomId("mzrkartolustur")
          .setEmoji("💳")
          .setStyle(ButtonStyle.Success),
      );

      return interaction.editReply({
        content: "**Mevcut kredi kartın yok!**",
        embeds: [mzrEmbed],
        components: [mzrButon],
      });
    }

    const mzrEmbed = new EmbedBuilder()
      .setTitle("Kart Bilgilerin")
      .addFields(
        { name: "🙍‍♂️ Kart Sahibi", value: `${user}`, inline: true },
        { name: "💳 Kart Numarası", value: `${kartNumara}`, inline: true },
        { name: "💳 Kart CVC", value: `${kartCVC}`, inline: true },
        {
          name: "💳 Kart Son Kullanım Tarihi",
          value: `${kartSonKullanım}`,
          inline: true,
        },
        //{ name: '💰 Bankadaki Para', value: `${banka}`, inline: true }
      )
      .setColor("Blue")
      .setTimestamp()
      .setImage(
        "https://cdn.glitch.global/265a4440-b7dc-4f45-afcc-83df8d374a97/creditcard.png?v=1721481438477",
      )
      .setFooter({ text: user.username, iconURL: user.displayAvatarURL() });

    interaction.editReply({ embeds: [mzrEmbed] });
  },
};
