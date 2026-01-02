const { ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js");
const mzrdb = require("croxydb");
const mzrdjs = require("mzrdjs");

// Balık tablosu
const baliklar = {
    Ender: { sans: 40, min: 20, max: 35, isimler: ["Hamsi","İstavrit","Sardalya","Uskumru","Mezgit"] },
    SuperEnder: { sans: 25, min: 35, max: 60, isimler: ["Levrek","Çipura","Mercan","Palamut","Kalkan"] },
    Destansi: { sans: 18, min: 60, max: 100, isimler: ["Somon","Orkinos","Kılıç Balığı","Barakuda","Ton Balığı"] },
    Gizemli: { sans: 12, min: 100, max: 160, isimler: ["Elektrikli Yılan","Derin Deniz Balığı","Hayalet Balık","Gece Avcısı","Karanlık Yüzgeç"] },
    Efsanevi: { sans: 5, min: 160, max: 300, isimler: ["Altın Balık","Poseidon’un Laneti","Kraken Yavrusu","Ejder Balığı","Kadim Deniz Ruhu"] }
};

// Balık türü seçimi
function nadirlikSec() {
    const rand = mzrdjs.random(1,100);
    let toplam = 0;
    for(const tur in baliklar){
        toplam += baliklar[tur].sans;
        if(rand <= toplam) return tur;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("balıktut")
        .setDescription("Olta ile balık tutarsın"),
    async execute(interaction){
        const { user } = interaction;
        await interaction.deferReply({ ephemeral: false });

        // Olta kontrol
        const olta = mzrdb.get(`mzrolta.${user.id}`);
        if(!olta) return interaction.editReply("> 🎣 Olta olmadan balık tutamazsın! Markete git.");

        // Cooldown 7dk
        const süre = 7*60*1000;
        const sonBalik = mzrdb.get(`mzrbaliktime.${user.id}`);
        const kalan = süre - (Date.now() - (sonBalik||0));
        if(sonBalik && kalan>0) return interaction.editReply(`> Balık tutmak için beklemelisin! Kalan süre: <t:${Math.floor((Date.now()+kalan)/1000)}:R>`);

        // Balık seç
        const nadirlik = nadirlikSec();
        const veri = baliklar[nadirlik];
        const balik = veri.isimler[mzrdjs.random(0,veri.isimler.length-1)];
        const para = mzrdjs.random(veri.min,veri.max);

        mzrdb.set(`mzrbaliktime.${user.id}`, Date.now());
        mzrdb.add(`mzrbakiye.${user.id}`, para);

        interaction.editReply(`> 🎣 Suya oltanı attın...\n> 🐟 **${balik}** tuttun!\n> ⭐ Tür: **${nadirlik}**\n> 💰 Balığı satıp **${para}TL** kazandın!`);
    }
}
