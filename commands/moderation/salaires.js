const { EmbedBuilder, ApplicationCommandOptionType, time, spoiler } = require("discord.js");

module.exports = {
    category: { "en": "moderation", "fr": "modération" },
    name: "salaires",
    nameLocalizations: {
        "fr": "salaires",
        "en-GB": "salaries",
        "en-US": "salaries"
    },
    description: "Ouvre ou ferme les demandes de salaires.",
    descriptionLocalizations: {
        "fr": "Ouvre ou ferme les demandes de salaires.",
        "en-GB": "Open or close the salary requests.",
        "en-US": "Open or close the salary requests."
    },
    options: [
        {
            name: "ouvrir",
            nameLocalizations: {
                "fr": "ouvrir",
                "en-GB": "open",
                "en-US": "open"
            },  
            description: "Ouvre les demandes de salaires.",
            descriptionLocalizations: {
                "fr": "Ouvre les demandes de salaires.",
                "en-GB": "Open the salary requests.",
                "en-US": "Open the salary requests."
            },
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "fermer",
            nameLocalizations: {
                "fr": "fermer",
                "en-GB": "close",
                "en-US": "close"
            },
            description: "Ferme les demandes de salaires.",
            descriptionLocalizations: {
                "fr": "Ferme les demandes de salaires.",
                "en-GB": "Close the salary requests.",
                "en-US": "Close the salary requests."
            },
            type: ApplicationCommandOptionType.Subcommand,
    }],
    moderation: true,
    run: async(client, interaction, { t, errorEmbed }) => {

        try {
        
        const method = interaction.options.getSubcommand();
        const salariesState = await client.db.getOption(interaction.guildId, "economy.salaries_open");
        if(method == "ouvrir" && salariesState == true) return errorEmbed(t("already_open"));
        if(method == "fermer" && salariesState == false) return errorEmbed(t("already_close"));

        const embed = new EmbedBuilder()
        .setColor(method == "ouvrir" ? "Green" : "Red")
        .setTitle(t(`title_${method == "ouvrir" ? "open" : "close"}`))
        .setThumbnail(interaction.guild.iconURL())
        .setDescription(t(`description_${method == "ouvrir" ? "open" : "close"}`, { member: interaction.member.toString(), date: time(new Date(), "d"), hours: time(new Date(), "t") }));

        await client.db.setOption(interaction.guildId, "economy.salaries_open", method == "ouvrir" ? true : false);

        interaction.reply({ embeds: [embed] }).catch(() => {});

        } catch (err) {
            console.error(err);
            client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    }
};
