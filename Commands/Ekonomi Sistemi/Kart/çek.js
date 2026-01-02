const { ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');
const mzrdb = require('croxydb');

module.exports = {
    subCommand: 'kart.çek',
    async execute(interaction) {
        const { user, options } = interaction;
        const miktar = options.getInteger('miktar');

        if (miktar <= 0) return interaction.reply({ content: "> Geçerli bir miktar giriniz!", ephemeral: true });

        const kart = mzrdb.get(`mzrkart.${user.id}`);
        if (!kart) return interaction.reply({ content: "> Bankadan para çekmek için kartın olmalı!", ephemeral: true });

        const banka = mzrdb.get(`mzrbankbakiye.${user.id}`) || 0;

        if (miktar > banka) return interaction.reply({ content: `> Banka hesabında yeterli para yok! Mevcut: **${banka} TL**`, ephemeral: true });

        // İşlemler
        mzrdb.add(`mzrbakiye.${user.id}`, miktar);
        mzrdb.subtract(`mzrbankbakiye.${user.id}`, miktar);

        const embed = new EmbedBuilder()
            .setTitle("Para Çekildi ✅")
            .setDescription(`Banka hesabınızdan cüzdanınıza **${miktar} TL** başarıyla çekildi.`)
            .setColor("Blue")
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    },
};
