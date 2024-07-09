const { EmbedBuilder, ApplicationCommandOptionType, time, spoiler } = require("discord.js");

module.exports = {
    category: { "en": "roleplay", "fr": "roleplay" },
    name: "menottes",
    nameLocalizations: {
        "fr": "menottes",
        "en-GB": "handcuffs",
        "en-US": "handcuffs"
    },
    description: "Menotte ou démenotte un joueur.",
    descriptionLocalizations: {
        "fr": "Menotte ou démenotte un joueur.",
        "en-GB": "Handcuff or unhandcuff a player.",
        "en-US": "Handcuff or unhandcuff a player."
    },
    options: [
        {
            name: "mettre",
            nameLocalizations: {
                "fr": "mettre",
                "en-GB": "put",
                "en-US": "put"
            },
            description: "Met les menottes à un joueur.",
            descriptionLocalizations: {
                "fr": "Met les menottes à un joueur.",
                "en-GB": "Put the handcuffs on a player.",
                "en-US": "Put the handcuffs on a player."
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
                    description: "Mentionnez le joueur à qui mettre les menottes",
                    descriptionLocalizations: {
                        "fr": "Mentionnez le joueur à qui mettre les menottes",
                        "en-GB": "Mention the player to whom to put the handcuffs",
                        "en-US": "Mention the player to whom to put the handcuffs"
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
            ],
        },
        {
            name: "enlever",
            nameLocalizations: {
                "fr": "enlever",
                "en-GB": "remove",
                "en-US": "remove"
            },
            description: "Enlève les menottes à un joueur.",
            descriptionLocalizations: {
                "fr": "Enlève les menottes à un joueur.",
                "en-GB": "Remove the handcuffs from a player.",
                "en-US": "Remove the handcuffs from a player."
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
                    description: "Mentionnez le joueur à qui enlever les menottes",
                    descriptionLocalizations: {
                        "fr": "Mentionnez le joueur à qui enlever les menottes",    
                        "en-GB": "Mention the player to whom to remove the handcuffs",
                        "en-US": "Mention the player to whom to remove the handcuffs"
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

        if(verify("member", { cantBotInclued: true })) return;
        
        const memberState = await client.db.getMember(interaction.guildId, member.id);
        const embed = new EmbedBuilder();
        
        switch (method) {
            case "mettre":
                if(memberState.handcuffed) return errorEmbed(t("already_handcuffed", { member: member.toString() }));
                embed.setColor("Red").setDescription(t("cuff", { member: member.toString(), time: time(new Date(), "D"), hm: time(new Date(), "t") }));
                break;

            case "enlever":
                if(!memberState.handcuffed) return errorEmbed(t("not_handcuffed", { member: member.toString() }));
                embed.setColor("Green").setDescription(t("uncuff", { member: member.toString(), time: time(new Date(), "D"), hm: time(new Date(), "t") }));
                break;
        }

        await client.db[`${method == "mettre" ? "put" : "remove"}Handcuffs`](interaction.guildId, member.id)
        interaction.reply({ embeds: [embed] }).catch(() => {})

        
        } catch (err) {
            console.error(err);
            client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    }
};