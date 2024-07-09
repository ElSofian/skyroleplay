const { ApplicationCommandOptionType, time } = require("discord.js");

const vehicleTypes = [
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
        name: "🚤 Bateau",
        nameLocalizations: {
            "fr": "🚤 Bateau",  
            "en-GB": "🚤 Boat",
            "en-US": "🚤 Boat"
        },
        value: "boat",
    },
];

module.exports = {
    category: { "en": "moderation", "fr": "modération" },
    name: "carte-grise",
    nameLocalizations: {
        "fr": "carte-grise",
        "en-GB": "car-registration-document",
        "en-US": "car-registration-document"
    },
    description: "Gère les cartes grises",
    descriptionLocalizations: {
        "fr": "Gère les cartes grises",
        "en-GB": "Manages car registration documents",
        "en-US": "Manages car registration documents"
    },
    options: [
        {
            name: "créer",
            nameLocalizations: {
                "fr": "créer",
                "en-GB": "create",
                "en-US": "create"
            },
            description: "Créer une carte grise pour un joueur",
            descriptionLocalizations: {
                "fr": "Créer une carte grise pour un joueur",
                "en-GB": "Create a car registration document for a player",
                "en-US": "Create a car registration document for a player"
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
                    description: "Mentionnez le joueur qui possèdera la carte grise",
                    descriptionLocalizations: {
                        "fr": "Mentionnez le joueur qui possèdera la carte grise",
                        "en-GB": "Mention the player who will own the car registration document",
                        "en-US": "Mention the player who will own the car registration document"
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: "nom",
                    nameLocalizations: {
                        "fr": "nom",
                        "en-GB": "name",
                        "en-US": "name"
                    },
                    description: "Nom du véhicule",
                    descriptionLocalizations: {
                        "fr": "Nom du véhicule",
                        "en-GB": "Vehicle name",
                        "en-US": "Vehicle name"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "type",
                    description: "Type du véhicule",
                    descriptionLocalizations: {
                        "fr": "Type du véhicule",
                        "en-GB": "Vehicle type",
                        "en-US": "Vehicle type"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: vehicleTypes
                },
                {
                    name: "plaque",
                    nameLocalizations: {
                        "fr": "plaque",
                        "en-GB": "plate",
                        "en-US": "plate"
                    },
                    description: "Plaque d'immatriculation du véhicule",
                    descriptionLocalizations: {
                        "fr": "Plaque d'immatriculation du véhicule",
                        "en-GB": "Vehicle registration plate",
                        "en-US": "Vehicle registration plate"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "adresse",
                    nameLocalizations: {
                        "fr": "adresse",
                        "en-GB": "address",
                        "en-US": "address"
                    },
                    description: "Adresse du propriétaire",
                    descriptionLocalizations: {
                        "fr": "Adresse du propriétaire",
                        "en-GB": "Owner's address",
                        "en-US": "Owner's address"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
            ]
        },
        {
            name: "supprimer",
            nameLocalizations: {
                "fr": "supprimer",
                "en-GB": "delete",
                "en-US": "delete"
            },
            description: "Supprime une carte grise d'un joueur",
            descriptionLocalizations: {
                "fr": "Supprime une carte grise d'un joueur",
                "en-GB": "Delete a car registration document of a player",
                "en-US": "Delete a car registration document of a player"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "plaque",
                    nameLocalizations: {
                        "fr": "plaque",
                        "en-GB": "plate",
                        "en-US": "plate"
                    },
                    description: "Plaque d'immatriculation à supprimer",
                    descriptionLocalizations: {
                        "fr": "Plaque d'immatriculation à supprimer",
                        "en-GB": "Registration plate to delete",
                        "en-US": "Registration plate to delete"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ]
        },
        {
            name: "donner",
            nameLocalizations: {
                "fr": "donner",
                "en-GB": "give",
                "en-US": "give"
            },
            description: "Donne une carte grise à un joueur",
            descriptionLocalizations: {
                "fr": "Donne une carte grise à un joueur",
                "en-GB": "Give a car registration document to a player",
                "en-US": "Give a car registration document to a player"
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
                    description: "Mentionnez le joueur à qui donner la carte grise",
                    descriptionLocalizations: {
                        "fr": "Mentionnez le joueur à qui donner la carte grise",
                        "en-GB": "Mention the player to whom to give the car registration document",
                        "en-US": "Mention the player to whom to give the car registration document"
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: "plaque",
                    nameLocalizations: {
                        "fr": "plaque",
                        "en-GB": "plate",   
                        "en-US": "plate"
                    },
                    description: "Plaque d'immatriculation à donner",
                    descriptionLocalizations: {
                        "fr": "Plaque d'immatriculation à donner",
                        "en-GB": "Registration plate to give",
                        "en-US": "Registration plate to give"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ]
        },
        {
            name: "confisquer",
            nameLocalizations: {
                "fr": "confisquer",
                "en-GB": "confiscate",
                "en-US": "confiscate"
            },
            description: "Confisque une carte grise",
            descriptionLocalizations: {
                "fr": "Confisque une carte grise",
                "en-GB": "Confiscate a car registration document",
                "en-US": "Confiscate a car registration document"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "plaque",
                    nameLocalizations: {
                        "fr": "plaque",
                        "en-GB": "plate",
                        "en-US": "plate"
                    },
                    description: "Plaque d'immatriculation à confisquer",
                    descriptionLocalizations: {
                        "fr": "Plaque d'immatriculation à confisquer",
                        "en-GB": "Registration plate to confiscate",
                        "en-US": "Registration plate to confiscate"
                    },  
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ]
        },
        {
            name: "rendre",
            nameLocalizations: {    
                "fr": "rendre",
                "en-GB": "give-back",
                "en-US": "give-back"
            },
            description: "Rend une carte grise confisquée",
            descriptionLocalizations: {
                "fr": "Rend une carte grise confisquée",
                "en-GB": "Give back a confiscated car registration document",
                "en-US": "Give back a confiscated car registration document"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "plaque",
                    nameLocalizations: {
                        "fr": "plaque",
                        "en-GB": "plate",
                        "en-US": "plate"
                    },
                    description: "Plaque d'immatriculation à rendre",
                    descriptionLocalizations: {
                        "fr": "Plaque d'immatriculation à rendre",
                        "en-GB": "Registration plate to give back",
                        "en-US": "Registration plate to give back"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ]
        },
        {
            name: "modifier",
            nameLocalizations: {
                "fr": "modifier",
                "en-GB": "edit",
                "en-US": "edit"
            },
            description: "Modifie une carte grise vous appartenant",
            descriptionLocalizations: {
                "fr": "Modifie une carte grise vous appartenant",
                "en-GB": "Edit a car registration document you own",
                "en-US": "Edit a car registration document you own"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "ancienne-plaque",
                    nameLocalizations: {
                        "fr": "ancienne-plaque",
                        "en-GB": "old-plate",
                        "en-US": "old-plate"
                    },
                    description: "Plaque d'immatriculation à modifier",
                    descriptionLocalizations: {
                        "fr": "Plaque d'immatriculation à modifier",
                        "en-GB": "Registration plate to edit",
                        "en-US": "Registration plate to edit"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "nom",
                    nameLocalizations: {
                        "fr": "nom",
                        "en-GB": "name",
                        "en-US": "name"
                    },
                    description: "Nouveau nom du véhicule",
                    descriptionLocalizations: {
                        "fr": "Nouveau nom du véhicule",
                        "en-GB": "New vehicle name",
                        "en-US": "New vehicle name"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
                {
                    name: "adresse",
                    nameLocalizations: {
                        "fr": "adresse",
                        "en-GB": "address",
                        "en-US": "address"
                    },
                    description: "Nouvelle adresse",
                    descriptionLocalizations: {
                        "fr": "Nouvelle adresse",
                        "en-GB": "New address",
                        "en-US": "New address"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
                {
                    name: "nouvelle-plaque",
                    nameLocalizations: {
                        "fr": "nouvelle-plaque",
                        "en-GB": "new-plate",
                        "en-US": "new-plate"
                    },
                    description: "Nouvelle plaque d'immatriculation",
                    descriptionLocalizations: {
                        "fr": "Nouvelle plaque d'immatriculation",
                        "en-GB": "New registration plate",
                        "en-US": "New registration plate"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
            ]
        }
    ],
    moderation: true,
    run: async(client, interaction, { t, isPremium, errorEmbed, successEmbed, verify, lang }) => {

        try {
        
        const method = interaction.options.getSubcommand();
        const member = interaction.options.getMember("joueur") || interaction.member;
        const plate = interaction.options.getString("plaque");

        switch(method) {

            case 'créer':
                if(verify("member", { cantBotInclued: true })) return;

                const dataCreate = await client.db.getIDCard(interaction.guildId, member.user.id);
                if(!dataCreate) return errorEmbed(member == interaction.member ? t("idcard_user", false, "errors") : t("idcard_member", { member: member.toString() }, "errors"));

                const cgCreate = await client.db.getMemberCG(interaction.guildId, member.user.id);
                if(!isPremium && cgCreate.length >= 3) return errorEmbed(t("limit_card", { limit: 3, member: member.toString() }));

                if(plate.length > 30) return errorEmbed(t("not_exceeded_plate"));

                const name = interaction.options.getString("nom");
                if(name.length > 30) return errorEmbed(t("name_car_exceeded"));

                const existPlate = await client.db.getPlateCG(interaction.guildId, plate);
                if(existPlate) return errorEmbed(t("already_exist", { plate: plate, name: name }));

                const type = interaction.options.getString("type");
                if(!["car", "motorcycle", "truck", "boat", "helicopter"].includes(type)) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"));

                const adress = interaction.options.getString("adresse") || t("not_informed");
                if(adress.length > 40) return errorEmbed(t("adress_exceeded"));

                await client.db.createCG(member.id, interaction.guildId, name, plate, dataCreate.id, type, adress);

                successEmbed(t("valid_create_card", { member: member.toString(), plate: plate }));
                break;

            case 'supprimer':

                if(!(await client.functions.permissions.configModerator(interaction, "carte-grise supprimer"))) return;

                const existPlateDelete = await client.db.getPlateCG(interaction.guildId, plate);
                if(!existPlateDelete) return errorEmbed(t("plate_no_existent", { plate: plate }));

                await client.db.deleteCG(interaction.guildId, plate);

                successEmbed(t("deleted_driving_licence", { plate: plate }));
                break;

            case 'donner':

                if(verify("member", { cantBotInclued: true, cantSelfInclued: true }, t("not_given_card"))) return;

                const cgGive = await client.db.getMemberCG(interaction.guildId, member.user.id);
                if(!isPremium && cgGive.length >= 3) return errorEmbed(t("valid_create_card", { limit: 3, member: member.toString() }));

                const existPlateGive = await client.db.getPlateCG(interaction.guildId, plate);
                if(!existPlateGive || existPlateGive.user_id != interaction.member.id) return errorEmbed(t("unkown_card", { plate: plate }));

                await client.db.giveCG(interaction.guildId, member.user.id, plate);

                successEmbed(t("valid_give", { member: member.toString(), plate: plate }));
                break;

            case 'confisquer':

                if(!(await client.functions.permissions.configModerator(interaction, "carte-grise confisquer"))) return;

                const existPlateConfiscation = await client.db.getPlateCG(interaction.guildId, plate);
                
                if(!existPlateConfiscation) return errorEmbed(t("plate_not_exist", { plate: plate }));
                if(existPlateConfiscation.status == 1) return errorEmbed(t("already_confistated", { plate: plate }));

                await client.db.setStatusCG(interaction.guildId, interaction.member.id, plate, 1);

                successEmbed(t("is_confistated", { plate: plate, user: existPlateConfiscation.user_id }))
                break;

            case 'rendre':

                if(!(await client.functions.permissions.configModerator(interaction, "carte-grise rendre"))) return;

                const existPlateMake = await client.db.getPlateCG(interaction.guildId, plate);
                
                if(!existPlateMake) return errorEmbed(t("card_no_exist", { plate: plate }));
                if(existPlateMake.status == 0) return errorEmbed(t("not_confiscated", { plate: plate }));

                await client.db.setStatusCG(interaction.guildId, interaction.member.id, plate, 0);

                successEmbed(t("give_back", { plate: plate, id: existPlateMake.user_id }))
                break;

            case 'modifier':

                const plateEdit = interaction.options.getString("ancienne-plaque");
                const existPlateEdit = await client.db.getPlateCG(interaction.guildId, plateEdit);

                if(!existPlateEdit) return errorEmbed(t("plate_dexist", { plate: plateEdit }));

                const newPlate = interaction.options.getString("nouvelle-plaque");
                const newAdress = interaction.options.getString("adresse");
                const newName = interaction.options.getString("nom");

                if(newPlate && newPlate.length > 30) return errorEmbed(("plate"));
                if(newPlate && newPlate.includes(".")) return errorEmbed(t("include_dot", { option: lang == "fr" ? "plaque" : "plate" }, "errors"));
                if(newName && newName.length > 30) return errorEmbed(t("name"))
                if(newName && newName.includes(".")) return errorEmbed(t("include_dot", { option: lang == "fr" ? "nom" : "name" }, "errors"))
                if(newAdress && newAdress.length > 40) return errorEmbed(t("adress"))


                // if not your plate
                if(existPlateEdit.user_id != interaction.member.id && !await client.functions.permissions.isModerator(interaction, interaction.member)) return errorEmbed(t("not_owned"));
                else {

                    if(existPlateEdit.status == 1) return errorEmbed(t("already_confiscated", { name: existPlateEdit.vehicule_name, date: time(existPlateEdit.date_confiscation, "d") }))
                    if(existPlateEdit.status == 2) return errorEmbed(t("untraceable"));

                }

                const builder = {
                    newPlate: newPlate ?? existPlateEdit.license_plate,
                    newAdress: newAdress ?? existPlateEdit.adress,
                    newName: newName ?? existPlateEdit.vehicule_name
                }

                if(!builder.newPlate && !builder.newAdress && !builder.newName) return errorEmbed(t("error_name"))

                await client.db.editCG(interaction.guildId, existPlateEdit.user_id, plateEdit, builder);

                successEmbed(t("confirm_modification", { plate: plateEdit }));
                break;
                
        }

        
        } catch (err) {
            console.error(err);
            client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
    }
    
};
