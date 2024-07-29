const { EmbedBuilder, ApplicationCommandOptionType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const code = Math.floor(Math.random() * 9000000000) + 1000000000
module.exports = {
    category: { "en": "moderation", "fr": "modération" },
    name: "carte-identite",
    nameLocalizations: {
        "fr": "carte-identite",
        "en-GB": "identity-card",
        "en-US": "identity-card"
    },
    description: "Crée ou supprime une carte d'identité",
    descriptionLocalizations: {
        "fr": "Crée ou supprime une carte d'identité",
        "en-GB": "Creates or deletes an identity card",
        "en-US": "Creates or deletes an identity card"
    },  
    options: [
        {
            name: "créer",
            nameLocalizations: {
                "fr": "créer",
                "en-GB": "create",
                "en-US": "create"
            },
            description: "Crée une carte d'identité",
            descriptionLocalizations: {
                "fr": "Crée une carte d'identité",
                "en-GB": "Creates an identity card",
                "en-US": "Creates an identity card"
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
                    description: "Mentionnez le joueur auquel créer ou modifier la carte d'identité",
                    descriptionLocalizations: {
                        "fr": "Mentionnez le joueur auquel créer ou modifier la carte d'identité",
                        "en-GB": "Mention the player to create or modify the ID card",
                        "en-US": "Mention the player to create or modify the ID card"
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: "prénom",
                    nameLocalizations: {
                        "fr": "prénom",
                        "en-GB": "first-name",
                        "en-US": "first-name"   
                    },
                    description: "Prénom",
                    descriptionLocalizations: {
                        "fr": "Prénom",
                        "en-GB": "First name",
                        "en-US": "First name"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "nom",
                    nameLocalizations: {
                        "fr": "nom",
                        "en-GB": "last-name",
                        "en-US": "last-name"
                    },
                    description: "Nom de famille",
                    descriptionLocalizations: {
                        "fr": "Nom de famille",
                        "en-GB": "Last name",
                        "en-US": "Last name"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "sexe",
                    nameLocalizations: {
                        "fr": "sexe",
                        "en-US": "sex",
                        "en-GB": "sex"
                    },  
                    description: "Sexe",
                    descriptionLocalizations: {
                        "fr": "Sexe",
                        "en-US": "Sex",
                        "en-GB": "Sex"
                    },  
                    type: ApplicationCommandOptionType.Number,
                    required: true,
                    choices: [
                        {
                            name: "Homme",
                            nameLocalizations: {
                                "fr": "Homme",
                                "en-US": "Man",
                                "en-GB": "Man"
                            },
                            value: 1,
                        },
                        {
                            name: "Femme",
                            nameLocalizations: {
                                "fr": "Femme",
                                "en-US": "Female",
                                "en-GB": "Female"
                            },
                            value: 2,
                        },
                    ],
                },
                {
                    name: "date-de-naissance",
                    nameLocalizations: {
                        "fr": "date-de-naissance",
                        "en-US": "date-of-birth",   
                        "en-GB": "date-of-birth"
                    },
                    description: "Date de naissance",
                    descriptionLocalizations: {
                        "fr": "Date de naissance",
                        "en-US": "Date of birth",
                        "en-GB": "Date of birth"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "lieu-de-naissance",
                    nameLocalizations: {
                        "fr": "lieu-de-naissance",
                        "en-US": "place-of-birth",
                        "en-GB": "place-of-birth"
                    },
                    description: "Lieu de naissance",
                    descriptionLocalizations: {
                        "fr": "Lieu de naissance",
                        "en-US": "Place of birth",
                        "en-GB": "Place of birth"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "fausse",
                    nameLocalizations: {
                        "fr": "fausse",
                        "en-US": "fake",
                        "en-GB": "fake"
                    },
                    description: "Est-ce une fause carte d'identité ?",
                    descriptionLocalizations: {
                        "fr": "Est-ce une fause carte d'identité ?",
                        "en-US": "Is it a fake ID card?",
                        "en-GB": "Is it a fake ID card?"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: false,
                    choices: [
                        {
                            name: "Oui",
                            nameLocalizations: {
                                "fr": "Oui",
                                "en-US": "Yes",
                                "en-GB": "Yes"
                            },
                            value: "yes",
                        },
                        {
                            name: "Non",
                            nameLocalizations: {
                                "fr": "Non",
                                "en-US": "No",
                                "en-GB": "No"
                            },
                            value: "no",
                        },
                    ]
                }
            ]
        },
        {
            name: "supprimer",
            nameLocalizations: {
                "fr": "supprimer",
                "en-GB": "delete",
                "en-US": "delete"
            },
            description: "Supprime une carte d'identité",
            descriptionLocalizations: {
                "fr": "Supprime une carte d'identité",
                "en-GB": "Deletes an identity card",
                "en-US": "Deletes an identity card"
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
                    description: "Le joueur dont vous voulez supprimer la carte d'identité",
                    descriptionLocalizations: {
                        "fr": "Le joueur dont vous voulez supprimer la carte d'identité",
                        "en-GB": "The player whose identity card you want to delete",
                        "en-US": "The player whose identity card you want to delete"
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: "carte",
                    nameLocalizations: {
                        "fr": "carte",
                        "en-GB": "card",
                        "en-US": "card"
                    },
                    description: "Choissisez la carte que vous souhaitez supprimer.",
                    descriptionLocalizations: {
                        "fr": "Choissisez la carte que vous souhaitez supprimer.",
                        "en-GB": "Choose the card you want to delete.",
                        "en-US": "Choose the card you want to delete."
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                }
            ]
        },
        {
            name: "rendre",
            nameLocalizations: {
                "fr": "rendre",
                "en-GB": "return",
                "en-US": "return"
            },
            description: "Rendre une carte d'identité",
            descriptionLocalizations: {
                "fr": "Rendre une carte d'identité",
                "en-GB": "Return an identity card",
                "en-US": "Return an identity card"
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
                    description: "Le joueur dont vous voulez rendre la carte d'identité",
                    descriptionLocalizations: {
                        "fr": "Le joueur dont vous voulez rendre la carte d'identité",
                        "en-GB": "The player whose identity card you want to return",
                        "en-US": "The player whose identity card you want to return"
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: "carte-identite",
                    nameLocalizations: {
                        "fr": "carte-identite",
                        "en-GB": "identity-card",
                        "en-US": "identity-card"
                    },
                    description: "La carte d'identité que vous voulez rendre",
                    descriptionLocalizations: {
                        "fr": "La carte d'identité que vous voulez rendre",
                        "en-GB": "The identity card you want to return",
                        "en-US": "The identity card you want to return"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                }
            ]
        }
    ],
    cooldown: 4,
    moderation: true,
    run: async(client, interaction, { t, isPremium, errorEmbed, successEmbed, verify, lang }) => {

        try {
        
        const method = interaction.options.getSubcommand();
        const member = interaction.options.getMember("joueur") || interaction.member;
        const own = member.id === interaction.member.id;

        switch (method) {

            case "créer": {

                if (verify("member", { cantBotInclued: true })) return;

                // Validate birthdate data
                const dateMatch = interaction.options.getString("date-de-naissance").match(/^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/);
                const birthdate = new Date(`${dateMatch?.[3]}/${dateMatch?.[2]}/${dateMatch?.[1]}`);
                if (!birthdate.getTime() || birthdate.getFullYear() < 1000 || birthdate.getFullYear() > 3000) return interaction.reply({ embeds: [errorEmbed(t("date_of_birth"), true)] }).catch(() => {});
                
                const hasCard = await client.db.getIDCard(interaction.guildId, member.user.id, interaction.options.getString("fausse") == "yes");
                const idCard = {
                    first_name: interaction.options.getString("prénom"),
                    last_name: interaction.options.getString("nom"),
                    gender: interaction.options.getNumber("sexe"),
                    birthplace: interaction.options.getString("lieu-de-naissance"),
                    birthdate: birthdate,
                    fake: hasCard?.fake ?? (interaction.options.getString("fausse") == "yes" ? 1 : 0),
                    hidden: hasCard?.hidden ?? 0,
                    taken: hasCard?.taken ?? 0
                };

                const roleStaff = await client.db.getOption(interaction.guildId, "roles.moderator");
                if (own && (roleStaff && !interaction.member.roles.cache.has(roleStaff)) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                
                    for (const key in hasCard) {
                        if (hasCard.hasOwnProperty(key) && idCard.hasOwnProperty(key)) {
                            idCard[key] = hasCard[key] !== idCard[key] ? `${idCard[key]}&#42;` : idCard[key];
                        }
                    }

                    const embed = new EmbedBuilder()
                    .setTitle(t(`embed_creation.title${hasCard ? "_edit" : ""}`))
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setDescription(t(`embed_creation.description${hasCard ? "_edit" : ""}`, { member: interaction.member.toString() }))
                    .addFields([
                        { name: `${t("embed_creation.fields.first_name")}${idCard.first_name.includes("&#42;") ? "*" : ""}`, value: idCard.first_name.replace("&#42;", ""), inline: true },
                        { name: `${t("embed_creation.fields.last_name")}${idCard.last_name.includes("&#42;") ? "*" : ""}`, value: idCard.last_name.replace("&#42;", ""), inline: true },
                        { name: `${t("embed_creation.fields.gender")}${`${idCard.gender}`.includes("&#42;") ? "*" : ""}`, value: idCard.gender == 1 ? t("words.man", false, "global") : t("words.woman", false, "global") },
                        { name: `${t("embed_creation.fields.birthdate")}${`${idCard.birthdate}`.includes("&#42;") ? "*" : ""}`, value: client.dayjs(`${idCard.birthdate}`.replace("&#42;", "")).format("DD/MM/YYYY"), inline: true },
                        { name: `${t("embed_creation.fields.birthplace")}${idCard.birthplace.includes("&#42;") ? "*" : ""}`, value: idCard.birthplace.replace("&#42;", ""), inline: true },
                        { name: `${t("embed_creation.fields.fake")}${`${idCard.fake}`.includes("&#42;") ? "*" : ""}`, value: parseInt(`${idCard.fake}`.replace("&#42;", "")) == 1 ? t("words.yes", false, "global") : t("words.no", false, "global") }
                    ])

                    const rows = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId(`${hasCard ? "edit" : "create"}_idcard_accept`).setLabel(t("words.accept", false, "global")).setStyle(ButtonStyle.Success),
                        new ButtonBuilder().setCustomId(`${hasCard ? "edit" : "create"}_idcard_refuse`).setLabel(t("words.refuse", false, "global")).setStyle(ButtonStyle.Danger)
                    )

                    return interaction.reply({ embeds: [embed], components: [rows] })

                } else {

                    if (!hasCard) {

                        await client.db.createIDCard(interaction.guildId, member.user.id, idCard);

                        successEmbed(own ? t("create_id_card.classic") : t("create_id_card.member", { member: member.toString() }))

                        const logsEmbed = new EmbedBuilder()
                            .setTitle(t("logs_create.title"))
                            .setThumbnail(interaction.user.displayAvatarURL())
                            .addFields([
                                { name: t("logs_create.field_by"), value: `${interaction.user.toString()} (${interaction.user.id})`, inline: true },
                                { name: t("logs_create.field_beneficiary"), value: `${member.toString()} (${member.id})`, inline: true }
                            ])

                        return client.functions.logs.send(interaction, logsEmbed, "creation");

                    } else {

                        const result = await client.functions.userinput.askValidation(interaction, own ? t("your_already_card") : t("member_already_card", { member: member.toString() }), false, "reply");
                        if (!result) return;

                        await client.db.editIDCard(interaction.guildId, member.user.id, idCard);
                        result.update({ embeds: [successEmbed(own ? t("card_edited.yourself") : t("card_edited.member", { member: member.toString() }), true)], components: [] });

                    }

                }


                break;
            }

            case "supprimer": {

                if (verify("member", { cantBotInclued: true })) return;
                if (!own && !(await client.functions.permissions.configModerator(interaction, "carte-identite supprimer"))) return;
                
                if (!interaction.options.getString("carte").startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == "fr" ? "carte" : "card" }, "errors"))

                const packet = await client.db.deleteIDCard(interaction.guildId, member.user.id, interaction.options.getString("carte").split("&#46;")[1] == "fake");
                if (packet.affectedRows > 0) {
                    await successEmbed(own ? t("card_deleted.yourself") : t("card_deleted.member", { member: member.toString() }));

                    const logsEmbed = new EmbedBuilder()
                        .setTitle(t("logs_delete.title"))
                        .setThumbnail(interaction.member.displayAvatarURL())
                        .addFields([
                            { name: t("logs_delete.field_by"), value: `${interaction.user.toString()} (${interaction.user.id})`, inline: true },
                            { name: t("logs_delete.field_beneficiary"), value: `${member.toString()} (${member.id})`, inline: true }
                        ])

                    return client.functions.logs.send(interaction, logsEmbed, "deletion");
                } else
                    return errorEmbed(own ? t("idcard_user", false, "errors") : t("idcard_member", { member: member.toString() }, "errors"));
            }

            case "rendre": {

                if (verify("member", { cantBotInclued: true })) return;

                const policeRole = await client.db.getOption(interaction.guildId, "roles.police")
                if ((policeRole ? !interaction.member.roles.cache.has(policeRole) : true) && !own && !(await client.functions.permissions.configModerator(interaction, "carte-identite rendre"))) return;

                if (!interaction.options.getString("carte-identite").startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == 'fr' ? "carte-identite" : "identity-card" }, "errors"));
                const ci = parseInt(interaction.options.getString("carte-identite").split("&#46;")[2]);

                const idCard = await client.db.getIDCardById(ci);
                if (!idCard) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"));

                await client.db.returnIDCard(ci);
                return successEmbed(t(own ? "card_returned.yourself" : "card_returned.member", { member: member.toString() }));

            }

        }


        } catch (err) {
            console.error(err);
            
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
        
    },

    runAutocomplete: async(client, interaction, { t }) => {

        const idCards = [await client.db.getIDCard(interaction.guildId, interaction.options._hoistedOptions[0].value), await client.db.getIDCard(interaction.guildId, interaction.options._hoistedOptions[0].value, true)];
        await interaction.respond(idCards
            .filter(ci => ci?.first_name && ci.taken == (interaction.options._subcommand == "rendre" ? 1 : 0))
            .sort((a, b) => a.first_name.localeCompare(b.first_name))
            .map(ci => ({
                name: `🪪 ・ ${ci.first_name} ${ci.last_name} (${t("born_the_at", { date: client.dayjs(ci.birthdate).format("DD/MM/YYYY"), place: ci.birthplace, e: ci.gender == 2 ? "e" : "" })})`,
                value: `${code}&#46;${ci.fake == 1 ? "fake" : "real"}&#46;${ci.id}` })
            )
        ).catch(() => {});

    }
};
