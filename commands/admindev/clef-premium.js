const { EmbedBuilder, WebhookClient, ActionRowBuilder, ButtonBuilder, ButtonStyle, ApplicationCommandOptionType, inlineCode, time } = require("discord.js");

const { premiumLogsURL, premiumLogsEndedURL, premiumLogsProlongedURL, premiumLogsActivatedURL, premiumLogsTransferredURL } = require("../../config");
// const premiumLogs = new WebhookClient({ url: premiumLogsURL }); // Pause, etc
// const premiumLogsEnded = new WebhookClient({ url: premiumLogsEndedURL }); // Expiration
// const premiumLogsProlonged = new WebhookClient({ url: premiumLogsProlongedURL }); // Prolongation
// const premiumLogsActivated = new WebhookClient({ url: premiumLogsActivatedURL }); // Réactivation
// const premiumLogsTransferred = new WebhookClient({ url: premiumLogsTransferredURL }); // Transfert

module.exports = {
        name: "clef-premium",
        category: { "en": "admindev", "fr": "admindev" },
        nameLocalizations: {
            "fr": "clef-premium",
            "en-GB": "premium-key",
            "en-US": "premium-key"
        },
        description: "Gère les abonnements Premium.",
        descriptionLocalizations: {
            "fr": "Gère les abonnements Premium.",
            "en-GB": "Manages Premium subscriptions.",
            "en-US": "Manages Premium subscriptions."
        },
        options: [
            {
                name: "créer",
                nameLocalizations: {
                    "fr": "créer",
                    "en-GB": "create",
                    "en-US": "create"
                },
                description: "Crée des clés Premium.",
                descriptionLocalizations: {
                    "fr": "Crée des clés Premium.",
                    "en-GB": "Create premium keys.",
                    "en-US": "Create premium keys."
                },
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "durée",
                        nameLocalizations: {
                            "fr": "durée",
                            "en-GB": "duration",
                            "en-US": "duration"
                        },
                        description: "La durée de l'abonnement (par exemple 1a, 1m ou 7j).",
                        descriptionLocalizations: {
                            "fr": "La durée de l'abonnement (par exemple 1a, 1m ou 7j).",
                            "en-GB": "The duration of the subscription (for example 1a for 1 year, 1m or 7j for 7 days).",
                            "en-US": "The duration of the subscription (for example 1a for 1 year, 1m or 7j for 7 days)."
                        },
                        type: ApplicationCommandOptionType.String,
                        required: true,
                    },
                    {
                        name: "nombre",
                        nameLocalizations: {
                            "fr": "nombre",
                            "en-GB": "number",
                            "en-US": "number"
                        },
                        description: "Le nombre de clés Premium à créer.",
                        descriptionLocalizations: {
                            "fr": "Le nombre de clés Premium à créer.",
                            "en-GB": "The number of Premium keys to create.",
                            "en-US": "The number of Premium keys to create."
                        },
                        type: ApplicationCommandOptionType.Number,
                        required: true,
                        minValue: 1,
                        maxValue: 10,
                    },
                    {
                        name: "propriétaire",
                        nameLocalizations: {
                            "fr": "propriétaire",
                            "en-GB": "owner",
                            "en-US": "owner"
                        },
                        description: "L'identifiant Discord du propriétaire.",
                        descriptionLocalizations: {
                            "fr": "L'identifiant Discord du propriétaire.",
                            "en-GB": "The owner's Discord ID.",
                            "en-US": "The owner's Discord ID."
                        },
                        type: ApplicationCommandOptionType.String,
                    },
                    {
                        name: "commentaire",
                        nameLocalizations: {
                            "fr": "commentaire",
                            "en-GB": "comment",
                            "en-US": "comment"
                        },
                        description: "Un commentaire à propos de clé Premium.",
                        descriptionLocalizations: {
                            "fr": "Un commentaire à propos de clé Premium.",
                            "en-GB": "A comment about this Premium key.",
                            "en-US": "A comment about this Premium key."
                        },
                        type: ApplicationCommandOptionType.String,
                    },
                ]
            },
            {
                name: "rechercher",
                nameLocalizations: {
                    "fr": "rechercher",
                    "en-GB": "research",
                    "en-US": "research"
                },
                description: "Recherche un abonnement Premium.",
                descriptionLocalizations: {
                    "fr": "Recherche un abonnement Premium.",
                    "en-GB": "Looking for a Premium subscription.",
                    "en-US": "Looking for a Premium subscription."
                },
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "paramètre",
                        nameLocalizations: {
                            "fr": "paramètre",
                            "en-GB": "setting",
                            "en-US": "setting"
                        },
                        description: "Recherche par...",
                        descriptionLocalizations: {
                            "fr": "Recherche par...",
                            "en-GB": "Research by...",
                            "en-US": "Research by..."
                        },
                        type: ApplicationCommandOptionType.String,
                        choices: [
                            {
                                name: "Propriétaire",
                                nameLocalizations: {
                                    "fr": "Propriétaire",
                                    "en-GB": "Owner",
                                    "en-US": "Owner"
                                },
                                value: "user_id",
                            },
                            {
                                name: "Clé Premium",
                                nameLocalizations: {
                                    "fr": "Clé Premium",
                                    "en-GB": "Premium key",
                                    "en-US": "Premium key"
                                },
                                value: "premium_key",
                            },
                            {
                                name: "Serveur",
                                nameLocalizations: {
                                    "fr": "Serveur",
                                    "en-GB": "Guild",
                                    "en-US": "Guild"
                                },
                                value: "guild_id",
                            },
                            {
                                name: "Numéro de transaction",
                                nameLocalizations: {
                                    "fr": "Numéro de transaction",
                                    "en-GB": "Transaction number",
                                    "en-US": "Transaction number"
                                },
                                value: "transaction_id",
                            }
                        ],
                        required: true,
                    },
                    {
                        name: "valeur",
                        nameLocalizations: {
                            "fr": "valeur",
                            "en-GB": "value",
                            "en-US": "value"
                        },
                        description: "La valeur à rechercher.",
                        descriptionLocalizations: {
                            "fr": "La valeur à rechercher.",
                            "en-GB": "The value to research for.",
                            "en-US": "The value to research for."
                        },
                        type: ApplicationCommandOptionType.String,
                        required: true,
                    }
                ]
            },
            {
                name: "expirer",
                nameLocalizations: {
                    "fr": "expirer",
                    "en-GB": "expire",
                    "en-US": "expire"
                },
                description: "Force l'expiration d'un abonnement Premium (fin).",
                descriptionLocalizations: {
                    "fr": "Force l'expiration d'un abonnement Premium (fin).",
                    "en-GB": "Force expiration of a Premium subscription (end).",
                    "en-US": "Force expiration of a Premium subscription (end)."
                },
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "clé-premium",
                        nameLocalizations: {
                            "fr": "clé-premium",
                            "en-GB": "premium-key",
                            "en-US": "premium-key"
                        },
                        description: "La clé de l'abonnement Premium à expirer.",
                        descriptionLocalizations: {
                            "fr": "La clé de l'abonnement Premium à expirer.",
                            "en-GB": "The Premium subscription key to expire.",
                            "en-US": "The Premium subscription key to expire."
                        },
                        type: ApplicationCommandOptionType.String,
                        required: true,
                    },
                    {
                        name: "raison",
                        nameLocalizations: {
                            "fr": "raison",
                            "en-GB": "reason",
                            "en-US": "reason"
                        },
                        description: "La raison de l'expiration.",
                        descriptionLocalizations: {
                            "fr": "La raison de l'expiration.",
                            "en-GB": "The reason for the expiration.",
                            "en-US": "The reason for the expiration."
                        },
                        type: ApplicationCommandOptionType.String,
                        required: true,
                    }
                ]
            },
            {
                name: "transférer",
                nameLocalizations: {
                    "fr": "transférer",
                    "en-GB": "transfer",
                    "en-US": "transfer"
                },
                description: "Transfère un abonnement Premium vers un autre serveur.",
                descriptionLocalizations: {
                    "fr": "Transfère un abonnement Premium vers un autre serveur.",
                    "en-GB": "Transfers a Premium subscription to another guild.",
                    "en-US": "Transfers a Premium subscription to another guild."
                },
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "ancien-serveur-ou-clé",
                        nameLocalizations: {
                            "fr": "ancien-serveur-ou-clé",
                            "en-GB": "old-guild-or-key",
                            "en-US": "old-guild-or-key"
                        },
                        description: "L'identifiant du serveur d'origine OU la clé Premium.",
                        descriptionLocalizations: {
                            "fr": "L'identifiant du serveur d'origine OU la clé Premium.",
                            "en-GB": "Origin guild ID OR Premium key.",
                            "en-US": "Origin guild ID OR Premium key."
                        },
                        type: ApplicationCommandOptionType.String,
                        required: true,
                    },
                    {
                        name: "nouveau-serveur",
                        nameLocalizations: {
                            "fr": "nouveau-serveur",
                            "en-GB": "new-server",
                            "en-US": "new-server"
                        },
                        description: "L'identifiant du serveur de destination.",
                        descriptionLocalizations: {
                            "fr": "L'identifiant du serveur de destination.",
                            "en-GB": "The destination guild identifier.",
                            "en-US": "The destination guild identifier."
                        },
                        type: ApplicationCommandOptionType.String,
                        required: true,
                    }
                ]
            },
            {
                name: "prolonger",
                nameLocalizations: {
                    "fr": "prolonger",
                    "en-GB": "prolong",
                    "en-US": "prolong"
                },
                description: "Prolonge un abonnement Premium.",
                descriptionLocalizations: {
                    "fr": "Prolonge un abonnement Premium.",
                    "en-GB": "Extends a Premium subscription.",
                    "en-US": "Extends a Premium subscription."
                },
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "clé-premium",
                        nameLocalizations: {
                            "fr": "clé-premium",
                            "en-GB": "premium-key",
                            "en-US": "premium-key"
                        },
                        description: "La clé de l'abonnement Premium à prolonger.",
                        descriptionLocalizations: {
                            "fr": "La clé de l'abonnement Premium à prolonger.",
                            "en-GB": "The key to the Premium subscription to be extended.",
                            "en-US": "The key to the Premium subscription to be extended."
                        },
                        type: ApplicationCommandOptionType.String,
                        required: true,
                    },
                    {
                        name: "durée",
                        nameLocalizations: {
                            "fr": "durée",
                            "en-GB": "duration",
                            "en-US": "duration"
                        },
                        description: "La durée à ajouter (par exemple 1a, 1m ou 7j).",
                        descriptionLocalizations: {
                            "fr": "La durée à ajouter (par exemple 1a, 1m ou 7j).",
                            "en-GB": "The duration to add (for example 1a for 1 year, 1m or 7j for 7 days).",
                            "en-US": "The duration to add (for example 1a for 1 year, 1m or 7j for 7 days)."
                        },
                        type: ApplicationCommandOptionType.String,
                        required: true,
                    },
                    {
                        name: "nouvelle-clé-premium",
                        nameLocalizations: {
                            "fr": "nouvelle-clé-premium",
                            "en-GB": "new-premium-key",
                            "en-US": "new-premium-key"
                        },
                        description: "La clé Premium du nouvel abonnement à supprimer.",
                        descriptionLocalizations: {
                            "fr": "La clé Premium du nouvel abonnement à supprimer.",
                            "en-GB": "The Premium key of the new subscription to be deleted.",
                            "en-US": "The Premium key of the new subscription to be deleted."
                        },
                        type: ApplicationCommandOptionType.String
                    }

                ]
            },
            {
                name: "commenter",
                nameLocalizations: {
                    "fr": "commenter",
                    "en-GB": "comment",
                    "en-US": "comment"
                },
                description: "Modifie le commentaire d'un abonnement Premium.",
                descriptionLocalizations: {
                    "fr": "Modifie le commentaire d'un abonnement Premium.",
                    "en-GB": "Edits the comment of a Premium subscription.",
                    "en-US": "Edits the comment of a Premium subscription."
                },
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "clé-premium",
                        nameLocalizations: {
                            "fr": "clé-premium",
                            "en-GB": "premium-key",
                            "en-US": "premium-key"
                        },
                        description: "La clé de l'abonnement Premium à commenter.",
                        descriptionLocalizations: {
                            "fr": "La clé de l'abonnement Premium à commenter.",
                            "en-GB": "The Premium subscription key to comment.",
                            "en-US": "The Premium subscription key to comment."
                        },
                        type: ApplicationCommandOptionType.String,
                        required: true,
                    },
                    {
                        name: "commentaire",
                        nameLocalizations: {
                            "fr": "commentaire",
                            "en-GB": "comment",
                            "en-US": "comment"
                        },
                        description: "Le nouveau commentaire.",
                        descriptionLocalizations: {
                            "fr": "Le nouveau commentaire.",
                            "en-GB": "The new comment.",
                            "en-US": "The new comment."
                        },
                        type: ApplicationCommandOptionType.String,
                        required: true,
                    }
                ]
            },
            {
                name: "suspendre",
                nameLocalizations: {
                    "fr": "suspendre",
                    "en-GB": "pause",
                    "en-US": "pause"
                },
                description: "Mets en pause un abonnement Premium.",
                descriptionLocalizations: {
                    "fr": "Mets en pause un abonnement Premium.",
                    "en-GB": "Pause a Premium subscription.",
                    "en-US": "Pause a Premium subscription."
                },
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "clé-premium",
                        nameLocalizations: {
                            "fr": "clé-premium",
                            "en-GB": "premium-key",
                            "en-US": "premium-key"
                        },
                        description: "La clé de l'abonnement Premium à mettre en pause.",
                        descriptionLocalizations: {
                            "fr": "La clé de l'abonnement Premium à mettre en pause.",
                            "en-GB": "The key for the Premium subscription to be paused.",
                            "en-US": "The key for the Premium subscription to be paused."
                        },
                        type: ApplicationCommandOptionType.String,
                        required: true,
                    }
                ]
            },
        ],
        staff_level: 2,
        run: async(client, interaction, { t, errorEmbed, successEmbed }) => {

            return interaction.reply({ content: 'Commande désactivée.', ephemeral: true });

            function _colorByStatus(status) {
                switch (status) {
                    case 0: return "Gold";
                    case 1: return "Green";
                    case 2: return "Red";
                    case 3: return "White";
                    default: return "Black";
                }
            }

            const _embed = async(data) => {

                const embed = new EmbedBuilder()
                .setDescription(`**Key**\n${inlineCode(data.premium_key) || "*?*"}`);
                if(data.user_id) embed.addFields([{ name: "Owner", value: `<@${data.user_id}> (${data.user_id})`, inline: true }]);
                embed.addFields([{ name: "Duration", value: await client.functions.other.durationToText(data.duration) || "*?*", inline: true }]);
                if(data.transaction_id) embed.addFields([{ name: "Transaction number", value: inlineCode(data.transaction_id) || "*?*", inline: true }]);
                embed.addFields([{ name: "Status", value: await client.functions.other.statusToText(data) || "*?*", inline: true }]).setColor(_colorByStatus(data.status));

                if(data.status !== 0) {
                    if(data.guild_id) embed.addFields([{ name: "Guild", value: data.guild_id || "*?*", inline: true }]);
                    if(data.activator_id) embed.addFields([{ name: "Activator", value: data.activator_id ? `<@${data.activator_id}> (${data.activator_id})` : "*?*", inline: true }]);
                    if(data.start_date) embed.addFields([{ name: "Start date", value: time(data.start_date, "d") || "*?*", inline: true }]);
                    if(data.status !== 3) embed.addFields([{ name: "End date", value: time(data.end_date, "d") || "*?*", inline: true }]);
                };
                if(data.status === 3) {
                    embed.addFields([
                        { name: "Estimated end date", value: time(client.dayjs().add(data.remaining_time_after_pause, 'seconds').toDate(), "d") || "*?*", inline: true },
                        { name: "Time remaining after the pause", value: `${Math.ceil(data.remaining_time_after_pause / 86400)} day(s)` || "*?*", inline: true }
                    ]);
                };
                if(data.comment) embed.addFields([{ name: "Comment", value: data.comment || "*?*", inline: true }]);

                return embed;
            }

                const method = interaction.options.getSubcommand();

                switch (method) {
                    case "créer": {

                        await interaction.deferReply().catch(() => {});
                        
                        const duration = interaction.options.getString("durée").trim();
                        const number = interaction.options.getNumber("nombre");
                        const owner = interaction.options.getString("propriétaire", false);
                        const comment = interaction.options.getString("commentaire", false);

                        // Validate options
                        if(owner && !owner.match(/^[0-9]{17,19}$/)) return errorEmbed(`Buyer's Discord ID (${owner}) is invalid`);
                        if(!duration.match(/^(-?[0-9]+)([jma])$/i)) return errorEmbed(`The duration (${duration}) is invalid`);

                        const premiumCreated = await client.db.createPremium(duration, number, owner, comment); // array object
                        let embeds = [];

                        for (const premium in premiumCreated) {
                            embeds.push(
                                (await _embed(premiumCreated[premium]))
                                    .setTitle(`${client.constants.emojis.premium}  Premium key creation`)
                                    .setFooter({ text: "Created by " + interaction.member.nickname?.split(" ")[2] || interaction.member.tag, iconURL: interaction.user.displayAvatarURL() })
                            );
                        };

                        premiumLogs.send({ embeds: embeds }).catch(() => {});

                        return interaction.editReply({
                            content: premiumCreated.length == 1 ? inlineCode(premiumCreated[0].premium_key) : null,
                            embeds: embeds
                        }).catch(() => { });

                    }

                    case "rechercher": {
                        const parameter = interaction.options.getString("paramètre");
                        const value = interaction.options.getString("valeur");
                        const premiums = await client.db.searchPremiums(parameter, value);

                        await interaction.deferReply().catch(() => {});

                        let embeds = [];
                        for (const premium of premiums) {
                            embeds.push(await _embed(premium));
                        };

                        if(!embeds?.length) return errorEmbed(`No results were found`);

                        // Function used to render a chunk (embed, select menu, and pages buttons)
                        async function render(embeds, index, total) {

                            const changeEmbedRow = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setStyle(ButtonStyle.Secondary)
                                    .setCustomId(`previous`)
                                    .setEmoji("◀")
                                    .setDisabled(index === 0),
                                new ButtonBuilder()
                                    .setStyle(ButtonStyle.Secondary)
                                    .setCustomId(`next`)
                                    .setEmoji("▶")
                                    .setDisabled(index + 1 === total)
                            );

                            return { embeds: embeds, components: [changeEmbedRow] };
                        }

                        // Create pages
                        const chunks = client.functions.other.chunkArray(embeds, 10);

                        if(!chunks || !chunks[0] || chunks[0].length <= 0)
                            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"));

                        const total = chunks.length;
                        const _render = await(render(chunks[0], 0, total));

                        const message = await interaction.editReply({
                            content: `${embeds.length} results`,
                            embeds: _render.embeds,
                            components: _render.components,
                            fetchReply: true
                        }).catch(() => {});

                        if(!message || total == 1) return; // interaction isn't edited && only one page to display

                        const collector = message.createMessageComponentCollector({
                            filter: (i) => i.user.id === interaction.user.id,
                            time: 120000,
                        });

                        if(!collector) return errorEmbed(t("error_occurred", false, "errors"), false, true, "editReply");

                        let current = 0;

                        collector.on("collect", async (i) => {
                            switch (i.customId) {
                                case `previous`: {
                                    current--;
                                    await i.update(await(render(chunks[current], current, total))).catch(() => {});
                                    break;
                                }

                                case `next`: {
                                    current++;
                                    await i.update(await(render(chunks[current], current, total))).catch(() => {});
                                    break;
                                }
                            }
                        });

                        collector.on("end", (collected) => {
                            return interaction.editReply({ components: [] }).catch(() => {});
                        });

                        break;
                    }

                    case "transférer": {
                        const old = interaction.options.getString("ancien-serveur-ou-clé");
                        const newServer = interaction.options.getString("nouveau-serveur");
                        let type = old.match(/^[0-9]{17,19}$/) ? "guild_id" : "premium_key";

                        const premium = await client.db.searchPremiums(type, old).then(premiums => premiums[0]);
                        if(!premium) return errorEmbed(type === "premium_key" ? `${inlineCode(old)} premium key  does not exist` : `The server whose ID is ${inlineCode(old)} is not currently Premium`);

                        switch (premium.status) {
                            case 0: return errorEmbed(`${inlineCode(old)} premium key has not been activated yet`);
                            case 2: return errorEmbed(`${inlineCode(old)} premium key is expired`);
                        };

                        await client.db.setPremiumGuild(old, newServer);

                        const embed = new EmbedBuilder()
                            .setTitle("Premium subscription transfer")
                            .addFields([ 
                                { name: type === "premium_key" ? "Key" : `Old guild`, value: old || "*?*", inline: true },
                                { name: "New guild", value: newServer || "*?*", inline: true }
                            ])
                            .setFooter({ text: "Transferred by " + interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

                        premiumLogsTransferred.send({ embeds: [embed] }).catch(() => { });
                        return interaction.reply({ embeds: [embed] }).catch(() => {})
                    }

                    case "prolonger": {
                        const key = interaction.options.getString("clé-premium");
                        const duration = interaction.options.getString("durée");

                        const premium = await client.db.searchPremiums("premium_key", key).then(premiums => premiums[0]);
                        if(!premium) return errorEmbed(`${inlineCode(key)} premium key does not exist`);
                        if(!duration.match(/^(-?[0-9]+)([jma])$/i)) return errorEmbed(`The duration ${inlineCode(duration)} is invalid.\nExamples of valid durations: 15j (for 15 days), 1m (for 1 month), 1a (for 1 year)`);

                        switch (premium.status) {
                            case 0:
                                return errorEmbed(`${inlineCode(key)} premium key has not been activated yet`);
                            case 2:
                                return errorEmbed(`${inlineCode(key)} premium key is expired`);
                        };

                        let newEnd, durationInSeconds, remaining_time, old_end_date, new_end_date;

                        switch (premium.status) {
                            // active premium
                            case 1:
                                newEnd = client.functions.other.addTime(duration, premium.end_date);
                                await client.db.setPremiumEnd(key, newEnd);

                                old_end_date = premium.end_date;
                                new_end_date = newEnd;
                                break;

                            // paused premium
                            case 3:
                                // duration to add in seconds
                                durationInSeconds = client.dayjs(client.functions.other.addTime(duration)).diff(client.dayjs(), "seconds");
                                remaining_time = premium.remaining_time_after_pause;
                                // remaining time after prolongation in seconds
                                newEnd = remaining_time + durationInSeconds;
                                await client.db.setRemainingTimeAfterPause(key, newEnd);

                                old_end_date = client.dayjs().add(remaining_time, 'seconds').toDate();
                                new_end_date = client.dayjs().add(newEnd, 'seconds').toDate();
                                break;
                        };

                        const embed = new EmbedBuilder()
                            .setTitle(`${client.constants.emojis.add}  Premium subscription extension`)
                            .addFields([
                                { name: "Owner", value: `<@${premium.user_id}> (${premium.user_id})`, inline: true },
                                { name: "Extended key", value: inlineCode(key), inline: true },
                                { name: "Status", value: await client.functions.other.statusToText(premium) || "*?*" },
                                { name: `Previous ${remaining_time ? "estimated " : ""}end date`, value: time(old_end_date, "d") || "*?*", inline: true },
                                { name: `Current ${remaining_time ? "estimated " : ""}end date`, value: time(new_end_date, "d") || "*?*", inline: true },
                                { name: "Duration added", value: await client.functions.other.durationToText(duration) || "*?*", inline: true },
                            ])
                            .setFooter({ text: "Extended by " + interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

                        if(premium.status === 3) embed.addFields([
                            { name: "Previous remaining time", value: `${Math.ceil(remaining_time / 86400)} day(s)` || "*?*", inline: true }, 
                            { name: "Current remaining time", value: `${Math.ceil(newEnd / 86400)} day(s)` || "*?*", inline: true }
                        ]);

                        premiumLogsProlonged.send({ embeds: [embed] }).catch(() => { });

                        return interaction.reply({ embeds: [embed] }).catch(() => {})
                    }

                    case "expirer": {
                        const key = interaction.options.getString("clé-premium");
                        const reason = interaction.options.getString("raison");

                        const premium = await client.db.searchPremiums("premium_key", key).then(premiums => premiums[0]);
                        if(!premium) return errorEmbed(`${inlineCode(key)} premium key  does not exist`);

                        if(premium.status === 2) return errorEmbed(`${inlineCode(key)} premium key is already expired`);

                        await client.db.setPremiumStatus(key, 2);

                        premium.status = 2;

                        const embed = (await _embed(premium))
                            .setTitle("Premium subscription expiration")
                            .addFields([ { name: 'Reason', value: reason } ])
                            .setFooter({ text: "Expired by " + interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

                        premiumLogsEnded.send({ embeds: [embed] }).catch(() => { });

                        return interaction.reply({ embeds: [embed] }).catch(() => {})
                    }

                    case "commenter": {
                        const key = interaction.options.getString("clé-premium");
                        const comment = interaction.options.getString("commentaire").trim() || null;

                        const premium = await client.db.searchPremiums("premium_key", key).then(premiums => premiums[0]);
                        if(!premium) return errorEmbed(`${inlineCode(key)} premium key  does not exist`);

                        await client.db.setPremiumComment(key, comment);

                        return successEmbed(comment ? `The comment has been successfully changed to:\n>>> ${comment}` : "The comment has been deleted");
                    }

                    case "suspendre": {
                        const key = interaction.options.getString("clé-premium");

                        const premium = await client.db.searchPremiums("premium_key", key).then(premiums => premiums[0]);
                        if(!premium) return errorEmbed(`${inlineCode(key)} premium key  does not exist`);

                        switch (premium.status) {
                            case 1: {
                                const remainingTime = client.dayjs(premium.end_date).diff(client.dayjs(), "seconds");

                                await client.db.setPremiumStatus(key, 3);
                                await client.db.setRemainingTimeAfterPause(key, remainingTime);
                                await client.db.setPremiumEnd(key, null);

                                premium.status = 3;
                                premium.remaining_time_after_pause = remainingTime;
                                premium.end_date = null;

                                const embed = (await _embed(premium))
                                    .setTitle(`${client.constants.emojis.pause} Premium subscription pause`)
                                    .setFooter({ text: "Paused by " + interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

                                premiumLogs.send({ embeds: [embed] }).catch(() => { });

                                return interaction.reply({ embeds: [embed] }).catch(() => {});
                            }

                            case 3: {
                                const end = client.dayjs().add(premium.remaining_time_after_pause, "seconds").toDate();

                                await client.db.setPremiumStatus(key, 1);
                                await client.db.setRemainingTimeAfterPause(key, null);
                                await client.db.setPremiumEnd(key, end);

                                premium.status = 1;
                                premium.remaining_time_after_pause = null;
                                premium.end_date = end;

                                const embed = (await _embed(premium))
                                    .setTitle("Premium key reactivation")
                                    .setFooter({ text: "Reactivated by " + interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

                                premiumLogsActivated.send({ embeds: [embed] }).catch(() => { });

                                return interaction.reply({ embeds: [embed] }).catch(() => {});
                            }

                            case 2:
                                return errorEmbed(`${inlineCode(key)} premium key is already expired`);
                            case 0:
                                return errorEmbed(`${inlineCode(key)} premium key has not been activated yet`);
                        }
                    }
                }
    }
}
