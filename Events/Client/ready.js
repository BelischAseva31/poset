const { ActivityType } = require("discord.js");
const { loadCommands } = require("../../Handlers/commandHandler");
const djs = require("mzrdjs");

module.exports = {
    name: "ready",
    once: true,
    execute(client) {
        client.user.setActivity({
            name: "Şekerin ve O Dedeyin a*ına koyim!",
            type: ActivityType.Streaming,
            url: "https://www.twitch.tv/mzrdev",
        });

        loadCommands(client).then(() => djs.slashBuilder);
    },
};
