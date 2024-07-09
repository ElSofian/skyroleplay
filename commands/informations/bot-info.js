const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, time, inlineCode } = require("discord.js");

module.exports = {
    category: { "en": "informations", "fr": "informations" },
    name: "bot-info",
    description: "Affiche les informations sur le bot.",
    descriptionLocalizations: {
        "fr": "Affiche les informations sur le bot.",
        "en-US": "Displays information about the bot.",
        "en-GB": "Displays information about the bot."
    },
    run: async(client, interaction, { t, errorEmbed, lang }) => {

        try {
        
        const embed = new EmbedBuilder()
            .setColor("Green")
            .addFields([
                {
                    name: (t("info_title")), // prettier-ignore
                    value: (t("infos", { bot: client.user.toString(), creation: time(client.user.createdAt, "D") }))
                },
                {
                    name: (t("stat_title")), // prettier-ignore
                    value: (t("stats", { commands: client.commands.filter(c => c.category !== "admindev").size, servers: (await client.functions.other.total(client, "guilds")).toLocaleString(lang), users: (await client.functions.other.total(client, "users")).toLocaleString(lang), channels: (await client.functions.other.total(client, "channels")).toLocaleString(lang) })),
                    inline: true
                },
                {
                    name: (t("system_title")), // prettier-ignore
                    value: (t("system", { plateform: inlineCode(process.platform), ping: client.ws.ping.toLocaleString(lang), shard: interaction.guild.shardId+1, cluser: client.cluster?.id+1, totalCluster: client.cluster.count, lancement: time(client.readyAt, "R") })),
                    inline: true
                }
            ])
            .setFooter({ text: interaction.member.displayName, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(t("embed_info.invitation")).setURL(client.constants.links.invite),
            new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(t("embed_info.support")).setURL(client.constants.links.support),
            new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(t("embed_info.website")).setURL(client.constants.links.website)
        );
        interaction.reply({ embeds: [embed], components: [row] }).catch(() => {});

        
        } catch (err) {
            console.error(err);
client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    }
};
