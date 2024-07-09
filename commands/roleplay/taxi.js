const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    category: { "en": "roleplay", "fr": "roleplay" },
    name: "taxi",
    description: "Appelle un taxi.",
    descriptionLocalizations: {
        "fr": "Appelle un taxi.",
        "en-GB": "Call a taxi.",    
        "en-US": "Call a taxi."
    },
    options: [{
        name: "localisation",
        description: "Spécifiez votre localisation actuelle",
        descriptionLocalizations: {
            "fr": "Spécifiez votre localisation actuelle",
            "en-GB": "Specify your current location",
            "en-US": "Specify your current location"
        },
        type: ApplicationCommandOptionType.String,
        required: true,
    }],
    run: async(client, interaction, { t, errorEmbed }) => {

        try {

        const roleId = await client.db.getOption(interaction.guildId, "roles.taxi");
        const role = interaction.guild.roles.cache.get(roleId);

        if(!role) return errorEmbed(t("role_not_defined", { link: client.constants.links.dashboard }));

        const place = interaction.options.getString("localisation");
        const embed = new EmbedBuilder()
            .setColor("Gold")
            .setThumbnail("https://cdn.discordapp.com/attachments/739811783912587284/743569122884976781/taxi.gif")
            .setTitle(t("taxi_embed.title"))
            .setDescription(t("taxi_embed.description", { place: place }))
            .setFooter({ text: interaction.member.displayName, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        return interaction.reply({ content: role.toString(), embeds: [embed] }).catch(() => {});


        } catch (err) {
            console.error(err);
client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    }
};
