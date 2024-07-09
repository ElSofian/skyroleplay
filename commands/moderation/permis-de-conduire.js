const { EmbedBuilder, ApplicationCommandOptionType, inlineCode } = require("discord.js");

const code = Math.floor(Math.random() * 9000000000) + 1000000000
const licencesTypes = [
    {
        name: "🏍 Moto",
        nameLocalizations: {
            "fr": "🏍 Moto",
            "en-GB": "🏍 Motorcycle",   
            "en-US": "🏍 Motorcycle"
        },  
        value: "motorcycle",
    },
    {
        name: "🚙 Voiture",
        nameLocalizations: {
            "fr": "🚙 Voiture",
            "en-GB": "🚙 Car",
            "en-US": "🚙 Car"
        },
        value: "car",
    },
    {
        name: "🚚 Camion",
        nameLocalizations: {
            "fr": "🚚 Camion",
            "en-GB": "🚚 Truck",
            "en-US": "🚚 Truck"
        },
        value: "truck",
    },
    {
        name: "🚁 Hélicoptère",
        nameLocalizations: {
            "fr": "🚁 Hélicoptère",
            "en-GB": "🚁 Helicopter",
            "en-US": "🚁 Helicopter"
        },
        value: "helicopter",
    },
    {
        name: "⚓ Bateau",
        nameLocalizations: {
            "fr": "⚓ Bateau",  
            "en-GB": "⚓ Boat",
            "en-US": "⚓ Boat"
        },
        value: "boat",
    },
];

module.exports = {
    category: { "en": "moderation", "fr": "modération" },
    name: "permis-de-conduire",
    nameLocalizations: {
        "fr": "permis-de-conduire",
        "en-GB": "driving-license",
        "en-US": "driving-license"
    },
    description: "Crée ou supprime un permis de conduire",
    descriptionLocalizations: {
        "fr": "Crée ou supprime un permis de conduire",
        "en-GB": "Create or delete a driving license",
        "en-US": "Create or delete a driving license"
    },  
    options: [
        {
            name: "créer",
            nameLocalizations: {
                "fr": "créer",
                "en-GB": "create",
                "en-US": "create"
            },  
            description: "Crée un permis de conduire",
            descriptionLocalizations: {
                "fr": "Crée un permis de conduire",
                "en-GB": "Create a driving license",
                "en-US": "Create a driving license"
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
                    description: "Mentionnez le auquel créer ou modifier le permis de conduire",
                    descriptionLocalizations: {
                        "fr": "Mentionnez le auquel créer ou modifier le permis de conduire",
                        "en-GB": "Mention the player whose driving license you want to create or modify",
                        "en-US": "Mention the player whose driving license you want to create or modify"
                    },
                    required: true,
                    type: ApplicationCommandOptionType.User,
                },
                {
                    name: "type",
                    description: "Le véhicule ajouté à ce permis de conduire",
                    descriptionLocalizations: { 
                        "fr": "Le véhicule ajouté à ce permis de conduire",
                        "en-GB": "The vehicle added to this driving license",
                        "en-US": "The vehicle added to this driving license"    
                    },  
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    choices: licencesTypes,
                },
            ],
        },
        {
            name: "supprimer",
            nameLocalizations: {
                "fr": "supprimer",
                "en-GB": "delete",
                "en-US": "delete"
            },
            description: "Supprime un permis de conduire",
            descriptionLocalizations: {
                "fr": "Supprime un permis de conduire", 
                "en-GB": "Delete a driving license",
                "en-US": "Delete a driving license"
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
                    description: "Mentionnez le joueur auquel supprimer le permis de conduire",
                    descriptionLocalizations: {
                        "fr": "Mentionnez le joueur auquel supprimer le permis de conduire",
                        "en-GB": "Mention the player whose driving license you want to delete",
                        "en-US": "Mention the player whose driving license you want to delete"
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: "type",
                    description: "Le véhicule retiré de ce permis de conduire",
                    descriptionLocalizations: {
                        "fr": "Le véhicule retiré de ce permis de conduire",
                        "en-GB": "The vehicle removed from this driving license",
                        "en-US": "The vehicle removed from this driving license"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                },
            ],
        },
        {
            name: "points",
            description: "Gère les points d'un joueur",
            descriptionLocalizations: {
                "fr": "Gère les points d'un joueur",
                "en-GB": "Manage a player's points",
                "en-US": "Manage a player's points"
            },
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "ajouter",
                    nameLocalizations: {
                        "fr": "ajouter",
                        "en-GB": "add",
                        "en-US": "add"
                    },
                    description: "Ajoute des points à un joueur",
                    descriptionLocalizations: {
                        "fr": "Ajoute des points à un joueur",
                        "en-GB": "Add points to a player",
                        "en-US": "Add points to a player"
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
                            description: "Mentionnez le joueur auquel ajouter les points",
                            descriptionLocalizations: {
                                "fr": "Mentionnez le joueur auquel ajouter les points",
                                "en-GB": "Mention the player to whom you want to add points",
                                "en-US": "Mention the player to whom you want to add points"
                            },
                            type: ApplicationCommandOptionType.User,
                            required: true,
                        },
                        {
                            name: "points",
                            nameLocalizations: {
                                "fr": "points",
                                "en-GB": "points",
                                "en-US": "points"
                            },
                            description: "Le nombre de points à ajouter",
                            descriptionLocalizations: {
                                "fr": "Le nombre de points à ajouter",
                                "en-GB": "The number of points to add",
                                "en-US": "The number of points to add"
                            },
                            type: ApplicationCommandOptionType.Number,
                            required: true,
                            minValue: 1,
                        },
                        {
                            name: "permis",
                            nameLocalizations: {
                                "fr": "permis",
                                "en-GB": "license",
                                "en-US": "license"
                            },
                            description: "Spécifiez le permis auquel retirer les points.",
                            descriptionLocalizations: {
                                "fr": "Spécifiez le permis auquel retirer les points.",
                                "en-GB": "Specify the license from which to remove the points.",
                                "en-US": "Specify the license from which to remove the points."
                            },
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            autocomplete: true
                        }
                    ],
                },
                {
                    name: "retirer",
                    nameLocalizations: {
                        "fr": "retirer",
                        "en-GB": "remove",
                        "en-US": "remove"
                    },
                    description: "Retire des points à un joueur",
                    descriptionLocalizations: {
                        "fr": "Retire des points à un joueur",
                        "en-GB": "Remove points from a player",
                        "en-US": "Remove points from a player"
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
                            description: "Mentionnez le joueur auquel retirer les points",
                            descriptionLocalizations: {
                                "fr": "Mentionnez le joueur auquel retirer les points",
                                "en-GB": "Mention the player from whom you want to remove points",
                                "en-US": "Mention the player from whom you want to remove points"
                            },
                            type: ApplicationCommandOptionType.User,
                            required: true,
                        },
                        {
                            name: "points",
                            description: "Le nombre de points à retirer",
                            descriptionLocalizations: {
                                "fr": "Le nombre de points à retirer",
                                "en-GB": "The number of points to remove",  
                                "en-US": "The number of points to remove"
                            },
                            type: ApplicationCommandOptionType.Number,
                            required: true,
                            minValue: 1,
                        },
                        {
                            name: "permis",
                            nameLocalizations: {
                                "fr": "permis",
                                "en-GB": "license",
                                "en-US": "license"
                            },
                            description: "Spécifiez le permis auquel retirer les points.",
                            descriptionLocalizations: {
                                "fr": "Spécifiez le permis auquel retirer les points.",
                                "en-GB": "Specify the license from which to remove the points.",
                                "en-US": "Specify the license from which to remove the points."
                            },
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            autocomplete: true
                        },
                    ],
                },
            ],
        },
    ],
    cooldown: 5,
    moderation: true,
    run: async(client, interaction,{ t, errorEmbed, successEmbed, verify, lang }) => {

        try {
        
        const method = interaction.options.getSubcommand();
        const member = interaction.options.getMember("joueur") || interaction.member;
        const own = member.id === interaction.member.id;
        if(verify("member", { cantBotInclued: true })) return;

        switch (method) {
            case "créer": {

                const type = interaction.options.getString("type");
                const license = t(`licencesTypes.${type}`)
                if(verify("member", { cantBotInclued: true })) return;

                if(!(await client.db.hasIDCard(interaction.guildId, member.user.id))) return errorEmbed(own ? t("idcard_user", false, "errors") : t("idcard_member", { member: member.toString() }));

                const licenceStatus = await client.db.getDriverLicenseStatus(interaction.guildId, member.user.id, type);
                if(licenceStatus === 1) return errorEmbed(own ? t("already_user") : t("already_member", { member: member.toString() }));

                await client.db.setDriverLicense(interaction.guildId, member.user.id, type, 1);

                // Set maximum points
                const maxPoints = await client.db.getOption(interaction.guildId, "driver_licences.max_points");
                await client.db.setDriverLicensePoints(interaction.guildId, member.user.id, type, maxPoints);

                successEmbed(own ? t("confirm_user", { name: license }) : t("confirm_member", { member: member.toString(), name: license }));

                const logsEmbed = new EmbedBuilder()
                    .setTitle(t("logs_create.title"))
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .addFields([
                        { name: t("logs_create.by"), value: `${interaction.user.toString()} (${interaction.user.id})`, inline: true },
                        { name: t("logs_create.for"), value: `${member.toString()} (${member.id})`, inline: true },
                        { name: t("logs_create.type"), value: inlineCode(license) }
                    ])

                client.functions.logs.send(interaction, logsEmbed, "creation");

                break;
            }

            case "supprimer": {

                if(!(interaction.options.getString("type") ?? `${code}`).startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: "type" }, "errors"));
                
                const type = interaction.options.getString("type").split("&#46;")[1];
                const license = t(`licencesTypes.${type}`)

                if(!(await client.db.hasIDCard(interaction.guildId, member.user.id))) return errorEmbed(own ? t("idcard_user", false, "errors") : t("idcard_member", { member: member.toString() }, "errors"));

                const licenceStatus = await client.db.getDriverLicenseStatus(interaction.guildId, member.user.id, type);
                if(!licenceStatus) return errorEmbed(own ? t("not_yet_user") : t("not_yet_member", { member: member.toString() }));
                if(licenceStatus === 2) return errorEmbed(own ? t("already_not_user") : t("already_not_member", { member: member.toString() }) );

                await client.db.setDriverLicense(interaction.guildId, member.user.id, type, 2);

                successEmbed(own ? t("no_longer_user", { name: license }) : t("no_longer_member", { member: member.toString(), name: license }));

                const logsEmbed = new EmbedBuilder()
                    .setTitle(t("logs_delete"))
                    .addFields([
                        { name: t("logs_create.by"), value: `${interaction.user.toString()} (${interaction.user.id})`, inline: true },
                        { name: t("logs_create.for"), value: `${member.toString()} (${member.id})`, inline: true },
                        { name: t("logs_create.type"), value: inlineCode(license) }
                    ])
                    .setThumbnail(interaction.user.displayAvatarURL());

                client.functions.logs.send(interaction, logsEmbed, "deletion");

                break;
            }


            // ! =========== POINTS =============

            case "ajouter": {

                const driverLicense = interaction.options.getString("permis").split("&#46;")[1];
                if(!(interaction.options.getString("permis") ?? `${code}`).startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == 'fr' ? "permis" : "license" }, "errors"));
                
                const currentPoints = await client.db.getDriverLicensePoints(interaction.guildId, member.user.id, driverLicense);
                if(currentPoints == null) return errorEmbed(own ? t("dont_have.user") : t("dont_have.member", { member: member.toString() }));

                const amount = interaction.options.getNumber("points");
                const maxPoints = await client.db.getOption(interaction.guildId, "driver_licences.max_points");

                if(currentPoints >= maxPoints) return errorEmbed(own ? t("max_user") : t("max_member", { member: member.toString() }));

                const newAmount = currentPoints + amount;
                if(newAmount > maxPoints) return errorEmbed(t("max", { number: maxPoints.toString() }));

                await client.db.setDriverLicensePoints(interaction.guildId, member.user.id, driverLicense, newAmount);

                return successEmbed(own
                            ? t("confirmadd_user", { amount: amount.toString(), newamount: newAmount.toString(), maxamount: maxPoints.toString(), s: amount > 1 ? "s" : "" })
                            : t("confirmadd_member", { member: member.toString(), amount: amount.toString(), newamount: newAmount.toString(), maxamount: maxPoints.toString(), s: amount > 1 ? "s" : "" })
                       )

            }

            case "retirer": {

                const driverLicense = interaction.options.getString("permis").split("&#46;")[1];
                if(!(interaction.options.getString("permis") ?? `${code}`).startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == 'fr' ? "permis" : "license" }, "errors"));
                
                const currentPoints = await client.db.getDriverLicensePoints(interaction.guildId, member.user.id, driverLicense);
                if(currentPoints == null) return errorEmbed(own ? t("dont_have.user") : t("dont_have.member", { member: member.toString() }));

                const amount = interaction.options.getNumber("points");
                const maxPoints = await client.db.getOption(interaction.guildId, "driver_licences.max_points");
                const newAmount = currentPoints - amount;

                if(newAmount < 0) return errorEmbed(own ? t("negate_user") : t("negate_member", { member: member.toString() }));

                await client.db.removeHighwayCode(interaction.guildId, member.user.id);
                await client.db.setDriverLicensePoints(interaction.guildId, member.user.id, driverLicense, newAmount, amount == currentPoints);

                return successEmbed(
                        amount == currentPoints
                        ? t(`confirmremove_${own ? "user" : "member"}_delete`, { member: member.toString(), amount: amount.toString(), newamount: newAmount.toString(), maxamount: maxPoints.toString(), s: amount > 1 ? "s" : "" })
                        : t(`confirmremove_${own ? "user" : "member"}`, { member: member.toString(), amount: amount.toString(), newamount: newAmount.toString(), maxamount: maxPoints.toString(), s: amount > 1 ? "s" : "" })
                    );
            }
        }

        
        } catch (err) {
            console.error(err);
            client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    },

    runAutocomplete: async (client, interaction, { t }) => {

        const response = [];
        const method = interaction.options._subcommand;
        const memberId = await interaction.options._hoistedOptions[0].value;
        const maxPoints = await client.db.getOption(interaction.guildId, "driver_licences.max_points");
        const driverLicences = (await client.db.getDriverLicense(interaction.guildId, memberId)).filter(licence => licence.status !== 2 && (method == "ajouter" ? licence.points < maxPoints : true))

        if((driverLicences.filter(licence => licence.status !== 2)).length > 0) {
            for (const licence of driverLicences) response.push({ name: t(`licencesTypes.${licence.type}`), value: `${code}&#46;${licence.type}` });
        }

        await interaction.respond(response.sort((a, b) => a.name.localeCompare(b.name)));

    }
};
