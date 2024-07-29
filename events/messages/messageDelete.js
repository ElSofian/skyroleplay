const { EmbedBuilder } = require("discord.js");

module.exports.run = async(client, message) => {

    try {

        if (message?.id) {

            const session = await client.db.getSessionByMessageId(message.guildId, message.id);
            if (session) {

                await client.db.deleteSession(message.guildId, message.id);
                
                const lang = await client.db.getOption(message.guildId, "guild.lang");
                const embed = new EmbedBuilder().setColor("Green").setDescription(client.translate.t(lang, "messageDelete.session_delete", false, "events"));
                message.channel.send({ embeds: [embed] }).catch(() => {})

            }

        }

    } catch(err) {
        console.log(err);
    } 

}
