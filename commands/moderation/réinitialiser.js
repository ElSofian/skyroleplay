const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    category: { "en": "moderation", "fr": "modération" },
    name: "réinitialiser",
    nameLocalizations: {
        "fr": "réinitialiser",
        "en-GB": "reset",
        "en-US": "reset"
    },
    description: "Réinitialise les configurations du bot et les données des membres sur ce serveur.",
    descriptionLocalizations: {
        "fr": "Réinitialise les configurations du bot et les données des membres sur ce serveur.",
        "en-GB": "Resets bot configurations and member data on this server.",
        "en-US": "Resets bot configurations and member data on this server."
    },
    options: [{
        name: "données",
        nameLocalizations: {
            "fr": "données",
            "en-GB": "data",
            "en-US": "data"
        },
        description: "Choisissez les données de ce serveur à réinitialiser.",
        descriptionLocalizations: {
            "fr": "Choisissez les données de ce serveur à réinitialiser.",
            "en-GB": "Choose the data of this server to reset.",
            "en-US": "Choose the data of this server to reset."
        },
        type: ApplicationCommandOptionType.String,
        choices: [
            {
                name: "Toutes les configurations et données des membres",
                nameLocalizations: {
                    "fr": "Toutes les configurations et données des membres",
                    "en-GB": "All configuration and member data",
                    "en-US": "All configuration and member data"
                },
                value: "resetGuild"
            },
            {
                name: "Configurations du Dashboard",
                nameLocalizations: {
                    "fr": "Configurations du Dashboard",
                    "en-GB": "Dashboard settings",
                    "en-US": "Dashboard settings"
                },
                value: "resetGuildDashboardOptions"
            },
            {
                name: "Données des membres",
                nameLocalizations: {
                    "fr": "Données des membres",
                    "en-GB": "Member data",
                    "en-US": "Member data"
                },
                value: "resetGuildMembers"
            },
            {
                name: "Économie",
                nameLocalizations: {
                    "fr": "Économie",
                    "en-GB": "Economy",
                    "en-US": "Economy"
                },
                value: "resetGuildEconomy"
            },
            {
                name: "Boutique",
                nameLocalizations: {
                    "fr": "Boutique",
                    "en-GB": "Shop",
                    "en-US": "Shop"
                },
                value: "resetGuildShopItems"
            },
            {
                name: "Inventaires",
                nameLocalizations: {
                    "fr": "Inventaires",
                    "en-GB": "Inventories",
                    "en-US": "Inventories"
                },
                value: "resetGuildInventories"
            },
            {
                name: "Entreprises",
                nameLocalizations: {
                    "fr": "Entreprises",
                    "en-GB": "Companies",
                    "en-US": "Companies"
                },
                value: "resetGuildCompanies"
            },
            {
                name: "Cartes",
                nameLocalizations: {
                    "fr": "Cartes",
                    "en-GB": "Cards",
                    "en-US": "Cards"
                },
                value: "resetGuildCards"
            },
            {
                name: "Casiers judiciaires",
                nameLocalizations: {
                    "fr": "Casiers judiciaires",
                    "en-GB": "Criminal records",
                    "en-US": "Criminal records"
                },
                value: "resetGuildCriminalRecords"
            }
        ],
        required: true
    },
    {
        name: "nom-du-serveur",
        nameLocalizations: {
            "fr": "nom-du-serveur",
            "en-GB": "server-name",
            "en-US": "server-name"  
        },
        description: "Entrez le nom du serveur (pour confirmer cette action).",
        descriptionLocalizations: {
            "fr": "Entrez le nom du serveur (pour confirmer cette action).",
            "en-GB": "Enter the server name (to confirm this action).",
            "en-US": "Enter the server name (to confirm this action)."
        },
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    cooldown: 60,
    moderation: true,
    run: async(client, interaction, { t, errorEmbed, successEmbed, lang }) => {

        try {

        //if(interaction.guild.ownerId !== interaction.user.id) return errorEmbed(t("owner", { id: interaction.guild.ownerId }));

        const data_to_reset = interaction.options.getString("données");
        const serverName = interaction.options.getString("nom-du-serveur");
        if(serverName !== interaction.guild.name) return errorEmbed(t("srv_name"))

        await interaction?.deferReply().catch(() => {});

        const embed = new EmbedBuilder()
            .setColor("Gold")
            .setTitle(`${client.constants.emojis.warns} ${t("reset")}`)
            .setDescription(t("warning"));

        switch (data_to_reset) {

            case "resetGuild" : {

                embed.addFields([
                    { name: t("delete"), value: t("all_delete") },
                    { name: t("keep"), value: t("all_keep") }
                ]);
                break;

            }

            case "resetGuildDashboardOptions" : {

                embed.addFields([
                    { name: t("delete"), value: t("dashboard_delete") },
                    { name: t("keep"), value: t("dashboard_keep") }
                ]);
                break;

            }

            case "resetGuildMembers" : {

                embed.addFields([
                    { name: t("delete"), value: t("members_delete") },
                    { name: t("keep"), value: t("members_keep") }
                ]);
                break;

            }

            case "resetGuildEconomy" : {

                embed.addFields([
                    { name: t("delete"), value: t("economy_delete") },
                    { name: t("keep"), value: t("economy_keep") }
                ]);
                break;

            }

            case "resetGuildShopItems" : {

                embed.addFields([
                    { name: t("delete"), value: t("shop_delete") },
                    { name: t("keep"), value: t("shop_keep") }
                ]);
                break;

            }

            case "resetGuildInventories" : {

                embed.addFields([
                    { name: t("delete"), value: t("inventories_delete") },
                    { name: t("keep"), value: t("inventories_keep") }
                ]);
                break;

            }

            case "resetGuildCompanies" : {

                embed.addFields([
                    { name: t("delete"), value: t("companies_delete") },
                    { name: t("keep"), value: t("companies_keep") }
                ]);
                break;

            }

            case "resetGuildCards" : {

                embed.addFields([
                    { name: t("delete"), value: t("cards_delete") },
                    { name: t("keep"), value: t("cards_keep") }
                ]);
                break;

            }

            case "resetGuildCriminalRecords" : {

                embed.addFields([
                    { name: t("delete"), value: t("criminal_records_delete") },
                    { name: t("keep"), value: t("criminal_records_keep") }
                ]);
                break;

            }

        };

        embed.addFields([{ name: "\u200b", value: t("confirmation") }]);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("reset_sky").setLabel(t("reset")).setStyle(ButtonStyle.Danger).setDisabled(true),
            new ButtonBuilder()
                .setCustomId("cancel_reset_sky")
                .setLabel(t("back"))
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true)
        );

        const message = await interaction.editReply({ embeds: [embed], components: [row], fetchReply: true })
        if(!message) return; // interaction isn't edited

        // This timeout is used to make the user sure of their decision
        setTimeout(() => {

            row.components.forEach((button) => button.setDisabled(false));
            interaction.editReply({ embeds: [embed], components: [row] }).catch(() => {});

        }, 5000);

        const collector = message.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.user.id, time: 60000 });
        if(!collector) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");

        collector.on("collect", async (i) => {
            switch (i.customId) {

                case "reset_sky": {

                    embed.setDescription(t("reset_confirmation")).setFields([]);
                    await i.update({ embeds: [embed], components: [] })
                    
                    try {
                        // Reset
                        await client.db[data_to_reset](interaction.guildId);
                        return i.editReply({ embeds: [successEmbed(t(`success${data_to_reset == "resetGuild" ? "_all" : ""}`, { data: client.commands.get(interaction.commandName).options[0].choices.find((c) => c.value === data_to_reset).nameLocalizations[lang == 'en' ? "en-US" : lang] }), true)], components: [] });

                    } catch (e) {

                        console.log(e)
                        await i.editReply({ embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], components: [] })

                    }
                    break;
                }

                case "cancel_reset_sky":
                default: {
                    await i.update({ embeds: [errorEmbed(t("cancel"), true)], components: [] })
                    break;
                }
            }
        });

        collector.on("end", async (collected) => {
            if(collected.size) return;

            return errorEmbed(t("time", false, "errors"), false, true, "editReply")
        });


    } catch (err) {
        console.error(err);
        client.bugsnag.notify(err);
        return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
    }

    }
};
