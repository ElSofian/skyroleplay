const { EmbedBuilder, ApplicationCommandOptionType, time } = require("discord.js");

module.exports = {
    category: { "en": "roleplay", "fr": "roleplay" },
    name: "mandat",
    nameLocalizations: {
        "fr": "mandat",
        "en-GB": "warrant",
        "en-US": "warrant"
    },
    description: "Crée un mandat.",
    descriptionLocalizations: {
        "fr": "Crée un mandat.",
        "en-GB": "Create a warrant.",
        "en-US": "Create a warrant."
    },
    options: [
        {
            name: "joueur",
            nameLocalizations: {
                "fr": "joueur",
                "en-GB": "player",
                "en-US": "player"
            },
            description: "Mentionnez le joueur qui recevra ce mandat.",
            descriptionLocalizations: {
                "fr": "Mentionnez le joueur qui recevra ce mandat.",
                "en-GB": "Mention the player who will receive this warrant.",
                "en-US": "Mention the player who will receive this warrant."
            },
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "type",
            description: "Spécifiez le type de mandat.",
            descriptionLocalizations: {
                "fr": "Spécifiez le type de mandat.",
                "en-GB": "Specify the type of warrant.",
                "en-US": "Specify the type of warrant."
            },
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "contenu",
            nameLocalizations: {
                "fr": "contenu",
                "en-GB": "content",
                "en-US": "content"
            },
            description: "Les faits du mandat d'arrêt.",
            descriptionLocalizations: {
                "fr": "Les faits du mandat d'arrêt.",
                "en-GB": "The facts of the arrest warrant.",
                "en-US": "The facts of the arrest warrant."
            },
            type: ApplicationCommandOptionType.String,
            required: true,
    }],
    run: async(client, interaction, { t, errorEmbed, verify }) => {

        try {

        const member = interaction.options.getMember("joueur");
        const content = interaction.options.getString("contenu");
        const cityName = (await client.db.getOption(interaction.guildId, "global.city_name")) || interaction.guild.name;

        if (verify("member", { cantBotInclued: true })) return;

        const embed = new EmbedBuilder()
            .setColor("White")
            .setTitle(t("mandate_embed.title"))
            .setDescription(t("mandate_embed.description", { user: interaction.user.toString(), time: time(new Date(), "D"), city: cityName, member: member.toString(), content: content.substr(0, 3500) }));

        await interaction.reply({ embeds: [embed] }).catch(() => {})


        } catch (err) {
            console.error(err);

            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    }
};
