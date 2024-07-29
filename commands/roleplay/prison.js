const { EmbedBuilder, ApplicationCommandOptionType, time, spoiler } = require("discord.js");

module.exports = {
    category: { "en": "roleplay", "fr": "roleplay" },
    name: "prison",
    nameLocalizations: {
        "fr": "prison",
        "en-GB": "jail",
        "en-US": "jail"
    },
    description: "Gère la prison.",
    descriptionLocalizations: {
        "fr": "Gère la prison.",
        "en-GB": "Manage the jail.",
        "en-US": "Manage the jail."
    },
    options: [
        {
            name: "entrer",
            nameLocalizations: {
                "fr": "entrer",
                "en-GB": "enter",
                "en-US": "enter"
            },  
            description: "Fait entrer un joueur en prison.",
            descriptionLocalizations: {
                "fr": "Fait entrer un joueur en prison.",
                "en-GB": "Make a player enter the jail.",
                "en-US": "Make a player enter the jail."
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "joueur",
                    nameLocalizations: {
                        "fr": "joueur",
                        "en-GB": "player",
                        "en-US": "player"
                    },
                    description: "Mentionnez le joueur à envoyer en prison.",
                    descriptionLocalizations: {
                        "fr": "Mentionnez le joueur à envoyer en prison.",
                        "en-GB": "Mention the player to send to jail.",
                        "en-US": "Mention the player to send to jail."
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
            ],
        },
        {
            name: "sortir",
            nameLocalizations: {
                "fr": "sortir",
                "en-GB": "exit",
                "en-US": "exit"
            },
            description: "Fait sortir un joueur de prison.",
            descriptionLocalizations: {
                "fr": "Fait sortir un joueur de prison.",
                "en-GB": "Make a player exit the jail.",
                "en-US": "Make a player exit the jail."
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "joueur",
                    nameLocalizations: {
                        "fr": "joueur",
                        "en-GB": "player",
                        "en-US": "player"
                    },
                    description: "Mentionnez le joueur à faire sortir de prison.",
                    descriptionLocalizations: {
                        "fr": "Mentionnez le joueur à faire sortir de prison.",
                        "en-GB": "Mention the player to make exit the jail.",
                        "en-US": "Mention the player to make exit the jail."
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
            ],
    }],
    run: async(client, interaction, { t, errorEmbed, verify }) => {

        try {
        
        const method = interaction.options.getSubcommand();
        const member = interaction.options.getMember("joueur");

        if (verify("member", { cantBotInclued: true })) return;

        const cityName = (await client.db.getOption(interaction.guildId, "global.city_name")) || interaction.guild.name;
        const embed = new EmbedBuilder().setTitle(t("prison_embed.author", { city: cityName }))

        switch (method) {
            case "entrer":

                    await client.db.putJail(interaction.guildId, member.id);

                    embed.setColor("Blue")
                    .setThumbnail("https://media.tenor.com/images/f9da0e36d2e3720cc64bf60c350ee88d/tenor.gif")
                    .setDescription(t("prison_embed.description.enter", { member: member.toString(), time: time(new Date(), "D") }));
                    break;

            case "sortir":

                    await client.db.removeJail(interaction.guildId, member.id);
                    
                    embed.setColor("Green")
                    .setThumbnail("https://creativemedia-image.canalplus.pro/content/0001/23/1fab2382f67f4bab572a6fcf1c06e48f990c1d06.gif")
                    .setDescription(t("prison_embed.description.leave", { member: member.toString(), time: time(new Date(), "D") }));
                    break;
        }

        interaction.reply({ content: spoiler(member.toString()), embeds: [embed] }).catch(() => {});

        
        } catch (err) {
            console.error(err);
            
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    }
};
