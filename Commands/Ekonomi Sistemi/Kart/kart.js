const { ChatInputCommandInteraction, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('kart')
    .setDescription('Kredi Kart Sistemi')
    .addSubcommand((option) => option
      .setName('oluştur')
      .setDescription('Kredi Kartı Oluşturursunuz'))
    .addSubcommand((option) => option
      .setName('bilgilerim')
      .setDescription('Kredi Kartı Bilgilerinizi Görüntülersiniz'))
    .addSubcommand((option) => option
      .setName('sil')
      .setDescription('Kredi Kartınızı Silersiniz'))
    // --- YENİ EKLENENLER ---
    .addSubcommand((option) => option
      .setName('yatır')
      .setDescription('Cüzdanınızdaki parayı bankaya yatırırsınız')
      .addIntegerOption(opt => opt.setName('miktar').setDescription('Yatırılacak miktar').setRequired(true)))
    .addSubcommand((option) => option
      .setName('çek')
      .setDescription('Bankadaki parayı cüzdanınıza çekersiniz')
      .addIntegerOption(opt => opt.setName('miktar').setDescription('Çekilecek miktar').setRequired(true)))
}
