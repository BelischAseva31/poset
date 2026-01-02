const { ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');
const mzrdb = require('croxydb');

module.exports = {
    subCommand: 'kart.yatır',
    async execute(interaction) {
        const { user, options } = interaction;
        const miktar = options.getInteger('miktar');

        if (miktar <= 0) return interaction.reply({ content: "> Geçerli bir miktar giriniz!", ephemeral: true });

        const kart = mzrdb.get(`mzrkart.${user.id}`);
        if (!kart) return interaction.reply({ content: "> Bankaya para yatırmak için önce bir kart oluşturmalısın!", ephemeral: true });

        const cüzdan = mzrdb.get(`mzrbakiye.${user.id}`) || 0;

        if (miktar > cüzdan) return interaction.reply({ content: `> Cüzdanında yeterli para yok! Mevcut: **${cüzdan} TL**`, ephemeral: true });

        // İşlemler
        mzrdb.subtract(`mzrbakiye.${user.id}`, miktar);
        mzrdb.add(`mzrbankbakiye.${user.id}`, miktar);

        const embed = new EmbedBuilder()
            .setTitle("Para Yatırıldı ✅")
            .setDescription(`Cüzdanınızdan banka hesabınıza **${miktar} TL** başarıyla yatırıldı.`)
            .setColor("Green")
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    },
};
