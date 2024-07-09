const { EmbedBuilder, ActionRowBuilder, WebhookClient } = require("discord.js");

module.exports.run = async(client, message) => {
    return

    try {

        if(message.author.bot) return;
        if(message.author.id == client.user.id) return;

        let type;
        const [twitterChannel, instagramChannel, twitterWebhook, instagramWebhook] = await Promise.all([
            client.db.getOption(message.guildId, "channel.twitter"),
            client.db.getOption(message.guildId, "channel.instagram"),
            client.db.getOption(message.guildId, "twitter.webhook_url"),
            client.db.getOption(message.guildId, "instagram.webhook_url")
        ])
        
        if(message.channelId == twitterChannel) type = "twitter";
        else if(message.channelId == instagramChannel) type = "instagram";

        if(type) {

            const webhook = new WebhookClient({ url: type == "twitter" ? twitterWebhook : instagramWebhook });
            if(!webhook) return;

            const lang = await client.db.getOption(message.guildId, "guild.lang");
            message.delete().catch(() => {});

            if(message.content == "") {
                message.channel.send({ embeds: [new EmbedBuilder().setColor("Red").setDescription(client.translate.t(lang, "messageCreate.no_bot_mention", false, "events"))] }).then((msg) => {
                    setTimeout(() => msg.delete(), 2000)
                })
                return
            }

            const embed = new EmbedBuilder()
            .setColor(type == "twitter" ? "Blue" : "LuminousVividPink")
            .setAuthor({ name: message.member.displayName, iconURL: message.author.displayAvatarURL() })
            .setDescription(message.content.replace("<@710966762425810995> ", ""))

            if(message.attachments.size > 0) embed.setImage(message.attachments.first().url);

            await webhook.send({ embeds: [embed] }).then(msg => {
                msg = message.channel.messages.cache.get(msg.id);
                msg.react("❤️").catch(() => {})
                msg.react("🔁").catch(() => {})
            })
            
            
        }

    } catch(err) {
        console.log(err);
    } 

}