const { EmbedBuilder, ApplicationCommandOptionType, spoiler } = require("discord.js");

module.exports = {
    category: { "en": "moderation", "fr": "modération" },
    name: "candidature",
    nameLocalizations: {
        "fr": "candidature",
        "en-GB": "application",
        "en-US": "application"
    },
    description: "Valide ou refuse une candidature écrite ou vocale d'un joueur",
    descriptionLocalizations: {
        "fr": "Valide ou refuse une candidature écrite ou vocale d'un joueur",
        "en-GB": "Validates or rejects a written or vocal application from a player",
        "en-US": "Validates or rejects a written or vocal application from a player"
    },
    options: [
        {
            name: "valider",
            nameLocalizations: {
                "fr": "valider",
                "en-GB": "validate",
                "en-US": "validate"
            },
            description: "Valide une candidature écrite ou vocale d'un joueur",
            descriptionLocalizations: {
                "fr": "Valide une candidature écrite ou vocale d'un joueur",
                "en-GB": "Validates a written or vocal application from a player",
                "en-US": "Validates a written or vocal application from a player"
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
                    description: "Mentionnez le joueur auquel valider la candidature",
                    descriptionLocalizations: {
                        "fr": "Mentionnez le joueur auquel valider la candidature",
                        "en-GB": "Mention the player whose application you want to validate",
                        "en-US": "Mention the player whose application you want to validate"
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: "type",
                    description: "Le type de validation",
                    descriptionLocalizations: {
                        "fr": "Le type de validation",
                        "en-GB": "The type of validation",
                        "en-US": "The type of validation"   
                    },
                    type: ApplicationCommandOptionType.Number,
                    required: true,
                    choices: [
                        {
                            name: "Candidature écrite : retire @Candidat Ecrit et ajoute @Candidat Vocal",
                            nameLocalizations: {
                                "fr": "Candidature écrite : retire @Candidat Ecrit et ajoute @Candidat Vocal",
                                "en-GB": "Written application: removes @Candidate Written and adds @Vocal Candidate",
                                "en-US": "Written application: removes @Candidate Written and adds @Vocal Candidate"
                            },
                            value: 0,
                        },
                        {
                            name: "Candidature vocale : retire @Candidat Vocal et ajoute @Citoyen",
                            nameLocalizations: {
                                "fr": "Candidature vocale : retire @Candidat Vocal et ajoute @Citoyen",
                                "en-GB": "Vocal application: removes @Vocal Candidate and adds @Citizen",
                                "en-US": "Vocal application: removes @Vocal Candidate and adds @Citizen"
                            },
                            value: 1,
                        },
                        {
                            name: "Accès rapide : retire @Candidat Ecrit et ajoute @Citoyen",
                            nameLocalizations: {
                                "fr": "Accès rapide : retire @Candidat Ecrit et ajoute @Citoyen",
                                "en-GB": "Quick access: removes @Candidate Written and adds @Citizen",
                                "en-US": "Quick access: removes @Candidate Written and adds @Citizen"
                            },
                            value: 2,
                        },
                    ],
                },
                {
                    name: "commentaire",
                    nameLocalizations: {
                        "fr": "commentaire",
                        "en-GB": "comment",
                        "en-US": "comment"
                    },
                    description: "Commentaire sur la candidature",
                    descriptionLocalizations: {
                        "fr": "Commentaire sur la candidature",
                        "en-GB": "Comment on the application",
                        "en-US": "Comment on the application"
                    },
                    type: ApplicationCommandOptionType.String,
                },
            ],
        },
        {
            name: "refuser",
            nameLocalizations: {
                "fr": "refuser",
                "en-GB": "reject",
                "en-US": "reject"
            },
            description: "Refuse une candidature écrite ou vocale d'un joueur",
            descriptionLocalizations: {
                "fr": "Refuse une candidature écrite ou vocale d'un joueur",
                "en-GB": "Rejects a written or vocal application from a player",
                "en-US": "Rejects a written or vocal application from a player"
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
                    description: "Mentionnez le joueur auquel refuser la candidature",
                    descriptionLocalizations: {
                        "fr": "Mentionnez le joueur auquel refuser la candidature",
                        "en-GB": "Mention the player whose application you want to reject",
                        "en-US": "Mention the player whose application you want to reject"
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: "type",
                    description: "Le type de refus",
                    descriptionLocalizations: {
                        "fr": "Le type de refus",
                        "en-GB": "The type of rejection",
                        "en-US": "The type of rejection"
                    },
                    type: ApplicationCommandOptionType.Number,
                    required: true,
                    choices: [
                        {
                            name: "Candidature écrite",
                            nameLocalizations: {
                                "fr": "Candidature écrite",
                                "en-GB": "Written application",
                                "en-US": "Written application"
                            },
                            value: 0,
                        },
                        {
                            name: "Candidature vocale",
                            nameLocalizations: {
                                "fr": "Candidature vocale",
                                "en-GB": "Vocal application",
                                "en-US": "Vocal application"
                            },
                            value: 1,
                        },
                    ],
                },
                {
                    name: "commentaire",
                    nameLocalizations: {
                        "fr": "commentaire",
                        "en-GB": "comment",
                        "en-US": "comment"
                    },
                    description: "Commentaire sur la candidature",
                    descriptionLocalizations: {
                        "fr": "Commentaire sur la candidature",
                        "en-GB": "Comment on the application",
                        "en-US": "Comment on the application"
                    },
                    type: ApplicationCommandOptionType.String,
                },
            ],
        }
    ],
    moderation: true,
    run: async(client, interaction, { t, errorEmbed, verify }) => {

        try {

        const method = interaction.options.getSubcommand();
        const member = interaction.options.getMember("joueur") || interaction.member;

        if(verify("member", { cantBotInclued: true, cantSelfInclued: true }, t("self"))) return;

        switch (method) {
            case "valider": {

                const type = interaction.options.getNumber("type");
                const options = await client.db.getOptions(interaction.guildId, [
                    "roles.citizen",
                    "roles.voice_applicant",
                    "roles.write_applicant",
                    "applications.allow_description",
                    "global.city_name",
                ]);

                let neededRole, nextRole;
                switch (type) {
                    case 0:
                        neededRole = options["roles.write_applicant"];
                        nextRole = options["roles.voice_applicant"];
                        break;
                    case 2:
                        neededRole = options["roles.write_applicant"];
                        nextRole = options["roles.citizen"];
                        break;
                    case 1:
                        neededRole = options["roles.voice_applicant"];
                        nextRole = options["roles.citizen"];
                        break;
                }

                if(!interaction.guild.roles.cache.has(neededRole))
                    return errorEmbed(`${t("role_undefined", { role: type == 1 ? t("roles.vocal") : t("roles.written"),  })} ${t("contact", { url: client.constants.links.dashboard })}`)

                if(!interaction.guild.roles.cache.has(nextRole))
                    return errorEmbed(`${t("role_undefined", { role: type == 1 ? t("roles.vocal") : t("roles.citizen") })} ${t("contact", { url: client.constants.links.dashboard })}`) 

                if(!member.roles.cache.has(neededRole)) return errorEmbed(t("neededRole", { member: member.toString(), id: neededRole }));

                // Remove role
                try {
                    await member.roles.remove(neededRole);
                } catch (e) {
                    return errorEmbed(t("remove_role", { id: neededRole, member: member.toString() }));
                }

                // Add role
                try {
                    await member.roles.add(nextRole)
                } catch (e) {
                    return errorEmbed(t("add_role", { id: nextRole, member: member.toString() }));
                }

                const description = options["applications.allow_description"]
                    .replace(/\{nom_serveur\}/gi, options["global.city_name"] || interaction.guild.name)
                    .replace(/\{surnom_migrant\}/gi, member.displayName)
                    .replace(/\{mention_migrant\}/gi, member.toString())
                    .replace(/\{surnom_douanier\}/gi, interaction.member.displayName)
                    .replace(/\{mention_douanier\}/gi, interaction.user.toString());
                const comment = interaction.options.getString("commentaire", false);

                // End
                const embed = new EmbedBuilder()
                    .setColor("Green")
                    .setThumbnail("https://media.tenor.com/images/9e0934a91f1e5885d2ada8963b1dd873/tenor.gif")
                    .setAuthor({ name: member.displayName, iconURL: member.user.displayAvatarURL() })
                    .addFields([
                        { name: t("logs.role_removed"), value: `<@&${neededRole}>`, inline: true },
                        { name: t("logs.role_added"), value: `<@&${nextRole}>`, inline: true },
                    ]);

                if(description) embed.setDescription(description);
                if(comment) embed.addFields([{ name: t("comment"), value: comment }]);

                await interaction.reply({ content: spoiler(member.toString()), embeds: [embed] }).catch(() => {})

                const logsEmbed = new EmbedBuilder()
                    .setTitle(t("logs.title_yes"))
                    .addFields([
                        { name: t("logs.customs_officer"), value: `${interaction.user.toString()} (${interaction.user.id})`, inline: true },
                        { name: t("logs.migrant"), value: `${member.toString()} (${member.id})`, inline: true },
                        { name: t("logs.role_removed"), value: `<@&${neededRole}>` },
                        { name: t("logs.role_added"), value: `<@&${nextRole}>` }
                    ])
                    .setThumbnail(interaction.user.displayAvatarURL())

                if(comment) logsEmbed.addFields([{ name: t("comment"), value: comment }]);
                client.functions.logs.send(interaction, logsEmbed, "creation");

                break;
            }

            case "refuser": {

                const type = interaction.options.getNumber("type");
                const options = await client.db.getOptions(interaction.guildId, [
                    "roles.voice_applicant",
                    "roles.write_applicant",
                    "applications.deny_description",
                    "global.city_name",
                ]);

                let neededRole;
                switch (type) {
                    case 0: neededRole = options["roles.write_applicant"]; break;
                    case 1: neededRole = options["roles.voice_applicant"]; break;
                }

                if(!interaction.guild.roles.cache.has(neededRole)) return errorEmbed(`${t("role_undefined", { role: type == 0 ? t("roles.written") : t("roles.vocal") })} ${t("contact", { url: client.constants.links.dashboard })}`)
                if(!member.roles.cache.has(neededRole)) return errorEmbed(t("neededRole", { member: member.toString(), id: neededRole }));

                const description = options["applications.deny_description"]
                    .replace(/\{nom_serveur\}/gi, options["global.city_name"] || interaction.guild.name)
                    .replace(/\{surnom_migrant\}/gi, member.displayName)
                    .replace(/\{mention_migrant\}/gi, member.toString())
                    .replace(/\{surnom_douanier\}/gi, interaction.member.displayName)
                    .replace(/\{mention_douanier\}/gi, interaction.user.toString());
                const comment = interaction.options.getString("commentaire", false);

                // End
                const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setThumbnail("https://cdn.discordapp.com/attachments/850491658339352577/881924058239889488/invalid.gif")
                    .setAuthor({ name: member.displayName, iconURL: member.user.displayAvatarURL() });

                if(description) embed.setDescription(description);
                if(comment) embed.addFields([{ name: t("comment"), value: comment }]);

                await interaction.reply({ content: spoiler(member.toString()), embeds: [embed] }).catch(() => {})

                const logsEmbed = new EmbedBuilder()
                    .setTitle(t("logs.title_no"))
                    .addFields([
                        { name: t("logs.customs_officer"), value: `${interaction.user.toString()} (${interaction.user.id})`, inline: true },
                        { name: t("logs.migrant"), value: `${member.toString()} (${member.id})`, inline: true }
                    ])
                    .setThumbnail(interaction.user.displayAvatarURL());

                    if(comment) logsEmbed.addFields([{ name: t("comment"), value: comment }]);

                client.functions.logs.send(interaction, logsEmbed, "deletion");
                break;

            }
        }


        } catch (err) {
            console.error(err);
client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
        
    }
};
