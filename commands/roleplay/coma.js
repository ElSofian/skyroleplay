const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    category: { "en": "roleplay", "fr": "roleplay" },
    name: "coma",
    description: "Signale une personne tombée dans le coma",
    descriptionLocalizations: {
        "fr": "Signale une personne tombée dans le coma",
        "en-GB": "Report a person who fell into a coma",
        "en-US": "Report a person who fell into a coma"
    },
    options: [{
        name: "joueur",
        nameLocalizations: {
            "fr": "joueur",
            "en-GB": "player",
            "en-US": "player"
        },
        description: "Mentionnez le joueur qui est tombé dans le coma",
        descriptionLocalizations: {
            "fr": "Mentionnez le joueur qui est tombé dans le coma",
            "en-GB": "Mention the player who fell into a coma",
            "en-US": "Mention the player who fell into a coma"
        },
        type: ApplicationCommandOptionType.User,
        required: true,
    }],
    run: async(client, interaction, { t, errorEmbed, verify }) => {

        try {

        const member = interaction.options.getMember("joueur");
        if (verify("member", { cantBotInclued: true })) return;
        
        const durations = ["5m", "10m", "15m", "1h", "3h"];
        const duration = durations[Math.floor(Math.random() * durations.length)];

        const cityName = (await client.db.getOption(interaction.guildId, "global.city_name")) || interaction.guild.name;
        const options = await client.db.getOptions(interaction.guildId, ["hunger_thirst.channel"]);

        await client.db.putComa(interaction.guildId, member.user.id)

        const embed = new EmbedBuilder()
            .setColor("White")
            .setImage("https://media1.tenor.com/images/407a435d179a40d371f0fc15920d18bc/tenor.gif")
            .setTitle(t("coma_embed.title"))
            .setDescription(t("coma_embed.description", { member: member.toString(), duration: t(`durations.${duration}`) }))
            .setFooter({ text: cityName, iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        const channel = interaction.guild.channels.cache.get(options["hunger_thirst.channel"]) ?? interaction.channel;

        try {
            const sendEmbed = await channel.send({ content: `||${member.toString()}||`, embeds: [embed] });
            if (sendEmbed) successEmbed(t("sended", { link: sendEmbed.url }), false, true);
        } catch {
            return errorEmbed(t("perms_send", { channel: channel.toString() }, "errors"));
        }


        } catch (err) {
            console.error(err);

            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    }
};
