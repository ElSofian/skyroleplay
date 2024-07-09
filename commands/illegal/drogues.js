const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, ApplicationCommandOptionType, PermissionsBitField, spoiler, time } = require("discord.js");

var suspended = new Set();
function _cooldownDrugs(id) {
    suspended.add(id)
    setTimeout(() => { suspended.delete(id) }, 2000);
};

const code = Math.floor(Math.random() * 9000000000) + 1000000000
module.exports = {
    category: { "en": "illegal", "fr": "illégal" },
    name: "drogues",
    nameLocalizations: {
        "fr": "drogues",
        "en-GB": "drugs",
        "en-US": "drugs",
    },
    description: "Gère les différentes drogues.",
    descriptionLocalizations: {
        "fr": "Gère les différentes drogues.",
        "en-GB": "Manages the different drugs.",
        "en-US": "Manages the different drugs."
    },
    options: [
        {
            name: "afficher",
            nameLocalizations: {
                "fr": "afficher",
                "en-GB": "display",
                "en-US": "display",
            },
            description: "Affiche le panneau de gestion d'une drogue.",
            descriptionLocalizations: {
                "fr": "Affiche le panneau de gestion d'une drogue.",
                "en-GB": "Displays the drug management panel.",
                "en-US": "Displays the drug management panel."
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: "drogue",
                nameLocalizations: {
                    "fr": "drogue",
                    "en-GB": "drug",    
                    "en-US": "drug",
                },
                description: "Choisissez la drogue à afficher.",
                descriptionLocalizations: {
                    "fr": "Choisissez la drogue à afficher.",
                    "en-GB": "Choose the drug to display.",
                    "en-US": "Choose the drug to display."
                },
                type: ApplicationCommandOptionType.String,
                required: true,    
                autocomplete: true
            }]
        },
        {
            name: "ajouter",
            nameLocalizations: {
                "fr": "ajouter",
                "en-GB": "add",
                "en-US": "add",
            },
            description: "Ajoute de la drogue à un joueur.",
            descriptionLocalizations: {
                "fr": "Ajoute de la drogue à un joueur.",
                "en-GB": "Adds drugs to a player.",
                "en-US": "Adds drugs to a player."
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "joueur",
                    nameLocalizations: {
                        "fr": "joueur",
                        "en-GB": "player",
                        "en-US": "player",
                    },
                    description: "Mentionnez le joueur à qui ajouter de la drogue.",
                    descriptionLocalizations: {
                        "fr": "Mentionnez le joueur à qui ajouter de la drogue.",
                        "en-GB": "Mention the player to whom to add drugs.",
                        "en-US": "Mention the player to whom to add drugs."
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: "drogue",
                    nameLocalizations: {
                        "fr": "drogue",
                        "en-GB": "drug",
                        "en-US": "drug",
                    },
                    description: "Choisissez la drogue à ajouter.",
                    descriptionLocalizations: {
                        "fr": "Choisissez la drogue à ajouter.",    
                        "en-GB": "Choose the drug to add.",
                        "en-US": "Choose the drug to add."
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                },
                {
                    name: "type",
                    nameLocalizations: {
                        "fr": "type",
                        "en-GB": "type",
                        "en-US": "type",
                    },
                    description: "Spécifiez le type de drogue à ajouter.",
                    descriptionLocalizations: {
                        "fr": "Spécifiez le type de drogue à ajouter.",
                        "en-GB": "Specify the type of drug to add.",
                        "en-US": "Specify the type of drug to add."
                    },
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        {
                            name: "Drogue non traitée",
                            nameLocalizations: {
                                "fr": "Drogue non traitée",
                                "en-GB": "Untreated drug",
                                "en-US": "Untreated drug",
                            },
                            value: "untreated",
                        },
                        {
                            name: "Drogue traitée",
                            nameLocalizations: {
                                "fr": "Drogue traitée",
                                "en-GB": "Treated drug",
                                "en-US": "Treated drug",
                            },
                            value: "treated",
                        },
                    ],
                },
                {
                    name: "quantité",
                    nameLocalizations: {
                        "fr": "quantité",
                        "en-GB": "quantity",
                        "en-US": "quantity",
                    },
                    description: "Spécifiez la quantité (en grammes) de drogue à ajouter.",
                    descriptionLocalizations: {
                        "fr": "Spécifiez la quantité (en grammes) de drogue à ajouter.",
                        "en-GB": "Specify the quantity (in grams) of drugs to add.",
                        "en-US": "Specify the quantity (in grams) of drugs to add."
                    },
                    required: false,
                    type: ApplicationCommandOptionType.Number,
                    minValue: 1,
                    maxValue: 2147483647
                },
            ],
        },
        {
            name: "dépister",
            nameLocalizations: {
                "fr": "dépister",
                "en-GB": "detect",
                "en-US": "detect",
            },
            description: "Fais un test de dépistage de drogue à un joueur.",
            descriptionLocalizations: {
                "fr": "Fais un test de dépistage de drogue à un joueur.",
                "en-GB": "Do a drug test on a player.",
                "en-US": "Do a drug test on a player."
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "joueur",
                    nameLocalizations: {
                        "fr": "joueur",
                        "en-GB": "player",
                        "en-US": "player",
                    },
                    description: "Mentionnez le joueur à dépister.",
                    descriptionLocalizations: {
                        "fr": "Mentionnez le joueur à dépister.",
                        "en-GB": "Mention the player to be tested.",
                        "en-US": "Mention the player to be tested."
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true,
                }
            ],
        },
        {
            name: "retirer",
            nameLocalizations: {
                "fr": "retirer",
                "en-GB": "remove",
                "en-US": "remove",
            },
            description: "Retire de la drogue à un joueur.",
            descriptionLocalizations: {
                "fr": "Retire de la drogue à un joueur.",
                "en-GB": "Removes drugs to a player.",
                "en-US": "Removes drugs to a player."
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "joueur",
                    nameLocalizations: {
                        "fr": "joueur",
                        "en-GB": "player",
                        "en-US": "player",
                    },
                    description: "Mentionnez le joueur à qui retirer de la drogue.",
                    descriptionLocalizations: {
                        "fr": "Mentionnez le joueur à qui retirer de la drogue.",   
                        "en-GB": "Mention the player to whom to remove drugs.",
                        "en-US": "Mention the player to whom to remove drugs."
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: "drogue",
                    nameLocalizations: {
                        "fr": "drogue",
                        "en-GB": "drug",
                        "en-US": "drug",
                    },
                    description: "Choisissez la drogue à ajouter.",
                    descriptionLocalizations: {
                        "fr": "Choisissez la drogue à ajouter.",    
                        "en-GB": "Choose the drug to add.",
                        "en-US": "Choose the drug to add."
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                },
                {
                    name: "quantité",
                    nameLocalizations: {
                        "fr": "quantité",
                        "en-GB": "quantity",
                        "en-US": "quantity",
                    },
                    description: "Spécifiez la quantité (en grammes) de drogue à retirer.",
                    descriptionLocalizations: {
                        "fr": "Spécifiez la quantité (en grammes) de drogue à retirer.",
                        "en-GB": "Specify the quantity (in grams) of drug to remove.",
                        "en-US": "Specify the quantity (in grams) of drug to remove."
                    },
                    required: false,
                    type: ApplicationCommandOptionType.Number,
                    minValue: 1
                },
            ],
        },
    ],
    run: async(client, interaction, { t, errorEmbed, successEmbed, verify, lang, separate }) => {

        try {

        let link = client.functions.illegal.getIllegalLink(interaction.guildId, interaction.member.id);
        if (link) return errorEmbed(t("already_doing", { link: link }, "errors"));

        await interaction.deferReply().catch(() => {});

        const symbol = await client.db.getOption(interaction.guildId, "economy.symbol");
        const method = interaction.options.getSubcommand();

        if(!(interaction.options.getString("drogue") ?? `${code}`).startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == "fr" ? "drogue" : "drug" }, "errors"), false, true, "editReply");
        const drugId = interaction.options.getString("drogue")?.split("&#46;")[1];

        const chosenDrug = await client.db.getDrugById(interaction.guildId, drugId);
        if(method !== "dépister" && !chosenDrug?.id) return errorEmbed(t("wrong_drug", { drug: drugId }), false, true, "editReply");
        
        const memberData = method === "dépister" ? null : await client.db.getMemberDrugs(interaction.guildId, interaction.member.id, chosenDrug.id);

        switch (method) {

            // --- START OF "AFFICHER" ---

            case "afficher": {

                const embed = new EmbedBuilder()
                    .setColor("Green")
                    .setThumbnail(chosenDrug.image !== "empty" ? chosenDrug.image : "https://imgur.com/CZbqzOr.png")
                    .setTitle(t("main_embed.title", { drugName: chosenDrug.name }))
                    .setDescription(t("main_embed.description", { user: interaction.user.toString() }));
                
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("🌿").setLabel(t("buttons.harvesting")).setEmoji("🌿").setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("⚗️").setLabel(t("buttons.treatment")).setEmoji("⚗️").setStyle(ButtonStyle.Secondary).setDisabled(!memberData || memberData.untreated <= 0),
                    new ButtonBuilder().setCustomId("💰").setLabel(t("buttons.selling")).setEmoji("💰").setStyle(ButtonStyle.Secondary).setDisabled(!memberData || memberData.treated <= 0)
                );
                
                const message = await interaction.editReply({ embeds: [embed], components: [row], ephemeral: true, fetchReply: true }).catch(() => {});
                if(!message) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
                
                // Ask method
                const collector = await client.functions.other.createCollector(message, interaction, 60000, lang);
                if (!collector) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
                if (collector === "end") return;
                
                link = client.functions.illegal.getIllegalLink(interaction.guildId, interaction.member.id);
                if(link) return collector.update({ embeds: [errorEmbed(t("already_doing", { link: link }, "errors"), true)] }).catch(() => {});
                
                // Validate channel permissions
                const channel = interaction.guild.channels.cache.get(chosenDrug.channel_id) ?? interaction.channel;
                if(!channel.permissionsFor(client.user.id).has(["ViewChannel", "SendMessages", "EmbedLinks"])) return collector.update({ embeds: [errorEmbed(t("perms_send", { channels: interaction.channel.toString() }, "errors"), true)], content: null, components: [] }).catch(() => {});
                
                switch (collector.customId) {
                    
                // ! RECOLTE

                case "🌿": {
                    
                    if(suspended.has(interaction.member.id)) return collector.update({ embeds: [errorEmbed(t("already_doing_without_link", false, "errors"), true)] }).catch(() => {});

                    _cooldownDrugs(interaction.member.id);

                    if((memberData?.untreated ?? 0) >= 2147483647) return collector.update({ embeds: [errorEmbed(t("too_much_int", { name: t("drugs.untreated", { drugName: chosenDrug.name }, "global") }, "errors"), true)], content: null, components: [] }).catch(() => {});

                    const embed = new EmbedBuilder()
                        .setColor("Default")
                        .setTitle(t("harvesting_embed.title", { drugName: chosenDrug.name }))
                        .setDescription(t("harvesting_embed.description", { user: interaction.user.toString(), drugName: chosenDrug.name, time: time(new Date(Date.now() + chosenDrug.harvest_time), "R") }))
                        .setTimestamp();

                    const sendEmbed = await channel.send({ content: spoiler(interaction.user.toString()), embeds: [embed] }).catch(() => {});
                    if(!sendEmbed) return collector.update({ embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], content: null, components: [] }).catch(() => {});

                    await collector.update({ embeds: [successEmbed(t("harvest_started", { drugName: chosenDrug.name, link: sendEmbed.url }), true)], components: [] }).catch(() => {});

                    client.functions.illegal.setIllegal(interaction.guildId, interaction.member.id, sendEmbed.url, chosenDrug.harvest_time);
                    await client.functions.other.wait(chosenDrug.harvest_time);
    
                    // End of timeout
                    client.functions.illegal.deleteIllegal(interaction.guildId, interaction.member.id);
    
                    let result = client.functions.other.randomBetween(chosenDrug.quantity_min, chosenDrug.quantity_max);
                    if(memberData && (memberData.untreated + result) >= 2147483647) result = 2147483647 - memberData.untreated;

                    await client.db.addMemberDrug(interaction.guildId, interaction.member.id, chosenDrug.id, "untreated", result);
    
                    const finalEmbed = new EmbedBuilder()
                        .setColor("Green")
                        .setTitle(t("end_harvesting_embed.title", { drugName: chosenDrug.name } ))
                        .setDescription(t("end_harvesting_embed.description", { user: interaction.user.toString(), drugName: chosenDrug.name, result: result.toLocaleString(lang) }))
                        .setTimestamp();
    
                    return sendEmbed.edit({ embeds: [finalEmbed] }).catch(() => {});

                }

                //! TRAITEMENT

                case "⚗️": {

                    if(suspended.has(interaction.member.id))
                        return collector.update(new EmbedBuilder().setColor("Red").setDescription(t("already_doing_without_link", false, "errors"))).catch(() => {});

                    _cooldownDrugs(interaction.member.id)

                    if(!memberData || memberData.untreated <= 0) return collector.update({  embeds: [errorEmbed(t("no_drug_to_treat", { member: interaction.member.toString(), drugName: chosenDrug.name }), true)], components: [], }).catch(() => {});
                    if(!memberData || memberData.untreated >= 2147483647) return collector.update({ embeds: [errorEmbed(t("too_much_int", { name: t("drugs.untreated", { drugName: chosenDrug.name }, "global") }, "errors"), true)], content: null, components: [] }).catch(() => {});

                    const code = Math.floor(Math.random() * 9000000000) + 1000000000
                    const modal = new ModalBuilder()
                        .setCustomId(`modal_drug_${code}`)
                        .setTitle(t("modal.title"))
                        .setComponents(new ActionRowBuilder().addComponents(
                            new TextInputBuilder().setCustomId("quantity").setLabel(t("modal.textinput")).setPlaceholder(t("modal.placeholder", { drugName: chosenDrug.name })).setRequired(true).setStyle(TextInputStyle.Short)
                    ));

                    await collector.showModal(modal).catch(() => {})

                    const modalCollector = await collector.awaitModalSubmit({ filter: i => i.user.id === interaction.user.id && i.customId == `modal_drug_${code}`, time: 60000 });
                    if (!modalCollector) return collector.update({ embeds: [errorEmbed(t("error_occurred", false, "errors"), true)], components: [] });

                    const getQuantity = modalCollector.fields.getTextInputValue("quantity")
                    
                    const modalQuantity = ["tout", "all"].includes(getQuantity.toLowerCase()) ? memberData.untreated : parseInt(getQuantity);
                    if (!modalQuantity || isNaN(modalQuantity) || parseInt(modalQuantity) <= 0) return modalCollector.reply({ embeds: [errorEmbed(t("not_number", { number: modalQuantity }, "errors"), true)], components: [] }).catch(() => {});
                    if (modalQuantity > memberData.untreated) return modalCollector.reply({ embeds: [errorEmbed(t("not_enough_untreated", { modalQuantity: modalQuantity.toLocaleString(lang), drugName: chosenDrug.name, quantity: (memberData.untreated).toLocaleString(lang) }), true)], components: [] }).catch(() => {});

                    const embed = new EmbedBuilder()
                        .setColor("Default")
                        .setTitle(t("treatment_embed.title", { drugName: chosenDrug.name } ))
                        .setDescription(t("treatment_embed.description", { user: interaction.user.toString(), drugName: chosenDrug.name, time: time(new Date(Date.now() + chosenDrug.treatment_time),"R") }))
                        .setTimestamp();

                    const sendEmbed = await channel.send({ content: spoiler(interaction.user.toString()), embeds: [embed] }).catch(() => {});
                    if(!sendEmbed) return modalCollector.reply({ embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], content: null, components: [] }).catch(() => {});

                    await modalCollector.update({ embeds: [successEmbed(t("treatment_started", { drugName: chosenDrug.name, link: sendEmbed.url }), true)], components: [] }).catch(() => {});

                    client.functions.illegal.setIllegal(interaction.guildId, interaction.member.id, sendEmbed.url, chosenDrug.treatment_time);
                    await client.functions.other.wait(chosenDrug.treatment_time);

                    // End of timeout
                    client.functions.illegal.deleteIllegal(interaction.guildId, interaction.member.id);

                    // new check to avoid duplicate drug data
                    const _memberData = await client.db.getMemberDrugs(interaction.guildId, interaction.member.id, chosenDrug.id);

                    if(!_memberData || !_memberData.untreated) return sendEmbed.edit({ embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], content: null, components: [] }).catch(() => {});
                    if(_memberData.untreated <= 0) return sendEmbed.edit({ content: null, embeds: [errorEmbed(t("no_drug_to_treat", { member: interaction.member.toString(), drugName: chosenDrug.name }), true)] }).catch(() => {});
                    
                    let result = modalQuantity;
                    if(_memberData.untreated + _memberData.treated >= 2147483647) result = 2147483647 - memberData.treated;

                    await client.db.addMemberDrug(interaction.guildId, interaction.member.id, chosenDrug.id, "untreated", -result);
                    await client.db.addMemberDrug(interaction.guildId, interaction.member.id, chosenDrug.id, "treated", result);

                    const finalEmbed = new EmbedBuilder()
                        .setColor("Green")
                        .setTitle(t("end_treatment_embed.title", { drugName: chosenDrug.name } ))
                        .setDescription(t("end_treatment_embed.description", { user: interaction.user.toString(), drugName: chosenDrug.name, result: result.toLocaleString(lang) }))
                        .setTimestamp();

                    return sendEmbed.edit({ embeds: [finalEmbed] }).catch(() => {});
                    
                }

                //! VENTE

                case "💰": {

                    if(suspended.has(interaction.member.id)) return collector.update({ embeds: [errorEmbed(t("already_doing_without_link", false, "errors"), true)] }).catch(() => {});

                    _cooldownDrugs(interaction.member.id);

                    if(!memberData || memberData.treated <= 0) return collector.update({ embeds: [errorEmbed(t("no_drug_to_sell", { member: interaction.member.toString(), drugName: chosenDrug.name }), true)], components: [] }).catch(() => {});

                    const code = Math.floor(Math.random() * 9000000000) + 1000000000
                    const modal = new ModalBuilder()
                        .setCustomId(`modal_drug_${code}`)
                        .setTitle(t("modal.title"))
                        .setComponents(new ActionRowBuilder().addComponents(
                            new TextInputBuilder().setCustomId("quantity").setLabel(t("modal.textinput")).setPlaceholder(t("modal.placeholder", { drugName: chosenDrug.name })).setRequired(true).setStyle(TextInputStyle.Short)
                    ));

                    await collector.showModal(modal).catch(() => {})

                    const modalCollector = await collector.awaitModalSubmit({ filter: i => i.user.id === interaction.user.id && i.customId == `modal_drug_${code}`, time: 60000 });
                    if (!modalCollector) return collector.update({ embeds: [errorEmbed(t("error_occurred", false, "errors"), true)], components: [] });

                    const getQuantity = modalCollector.fields.getTextInputValue("quantity")
                    
                    const modalQuantity = ["tout", "all"].includes(getQuantity.toLowerCase()) ? memberData.treated : parseInt(getQuantity);
                    if (!modalQuantity || isNaN(modalQuantity) || parseInt(modalQuantity) <= 0) return modalCollector.reply({ embeds: [errorEmbed(t("not_number", { number: modalQuantity }, "errors"), true)], components: [] }).catch(() => {});
                    if (modalQuantity > memberData.treated) return modalCollector.reply({ embeds: [errorEmbed(t("not_enough_treated", { modalQuantity: modalQuantity.toLocaleString(lang), drugName: chosenDrug.name, quantity: (memberData.treated).toLocaleString(lang) }), true)], components: [] }).catch(() => {});

                    const embed = new EmbedBuilder()
                        .setColor("Default")
                        .setTitle(t("selling_embed.title", { drugName: chosenDrug.name } ))
                        .setDescription(t("selling_embed.description", { user: interaction.member.toString(), drugName: chosenDrug.name, time: time(new Date(Date.now() + chosenDrug.sale_time),"R") }))
                        .setTimestamp();

                    const sendEmbed = await channel.send({ content: spoiler(interaction.member.toString()), embeds: [embed] }).catch(() => {});
                    if (!sendEmbed) return modalCollector.reply({ embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], content: null, components: [] }).catch(() => {});

                    await modalCollector.update({ embeds: [successEmbed(t("selling_started", { drugName: chosenDrug.name, link: sendEmbed.url }), true)], components: []}).catch(() => {});

                    client.functions.illegal.setIllegal(interaction.guildId, interaction.member.id, sendEmbed.url, chosenDrug.sale_time);
                    await client.functions.other.wait(chosenDrug.sale_time);

                    // End of timeout
                    client.functions.illegal.deleteIllegal(interaction.guildId, interaction.member.id);

                    // new check to avoid duplicate drug data
                    const _memberData = await client.db.getMemberDrugs(interaction.guildId, interaction.member.id, chosenDrug.id);
                    if(!_memberData || !parseInt(_memberData.treated) || isNaN(_memberData.treated)) return sendEmbed.edit({ embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], content: null, components: [] }).catch(() => {});
                    if(_memberData.treated <= 0) return sendEmbed.edit({ content: null, embeds: [errorEmbed(t("no_drug_to_sell", { member: interaction.member.toString(), drugName: chosenDrug.name }), true)] }).catch(() => {});

                    await client.db.removeMemberDrug(interaction.guildId, interaction.member.id, chosenDrug.id, "treated", modalQuantity, _memberData.untreated <= 0 && modalQuantity == memberData.treated);

                    let moneyWon = chosenDrug.price_per_gram * modalQuantity;

                    const currentDirtyMoney = await client.db.getDirtyMoney(interaction.guildId, interaction.user.id) ?? 0;
                    if ((currentDirtyMoney?.dirty_money ?? 0) + moneyWon >= 2147483647) moneyWon = 2147483647 - currentDirtyMoney?.dirty_money;
                    await client.db.addDirtyMoney(interaction.guildId, interaction.member.id, moneyWon);

                    const finalEmbed = new EmbedBuilder()
                        .setColor("Green")
                        .setTitle(t("end_selling_embed.title", { drugName: chosenDrug.name } ))
                        .setDescription(t("end_selling_embed.description", { user: interaction.user.toString(), drugName: chosenDrug.name, result: modalQuantity.toLocaleString(lang), money: `${separate(moneyWon)}${symbol}` }))
                        .setTimestamp();

                    return sendEmbed.edit({ embeds: [finalEmbed] }).catch(() => {});

                }

                default: break;

                }

                break;
            }

            // --- START OF "AJOUTER" & "RETIRER" ---

            case "ajouter": if(!(await client.functions.permissions.configModerator(interaction, "drogues ajouter"))) return;
            case "retirer": {

                if (method === "retirer" && !(await client.functions.permissions.configModerator(interaction, "drogues retirer"))) return;

                if(verify("member", { cantBotInclued: true })) return;

                const member = interaction.options.getMember("joueur");
                const own = member.user.id === interaction.user.id;

                const type = method == "retirer" ? interaction.options.getString("drogue").split("&#46;")[2] : interaction.options.getString("type");
                const otherType = type === "untreated" ? "treated" : "untreated";

                const memberDrug = await client.db.getMemberDrugs(interaction.guildId, member.user.id, chosenDrug.id);
                const fullDrugName = t(`drugs.${type}`, { drugName: chosenDrug.name }, "global");

                // security (complement of autocomplete system to avoid any data error)
                if (method === "retirer" && (!memberDrug || !memberDrug[type])) return errorEmbed(t(`${own ? "self" : "member"}_no_drug_to_remove`, { member: member.toString(), drug: fullDrugName }), false, false, "editReply");
                let quantity = interaction.options.getNumber("quantité") ?? (method == "retirer" ? memberDrug[type] : 1);

                if (method === "retirer") {
                    if (quantity >= memberDrug[type]) quantity = memberDrug[type]; 
                    await client.db.removeMemberDrug(interaction.guildId, member.user.id, chosenDrug.id, type, quantity, memberDrug[otherType] == 0 && quantity == memberDrug);
                } else {
                    if (memberDrug && memberDrug[type] + quantity >= 2147483647) return errorEmbed(t("int_passing", { name: fullDrugName }, "errors"), false, false, "editReply");
                    await client.db.addMemberDrug(interaction.guildId, member.user.id, chosenDrug.id, type, quantity);
                }

                return successEmbed(t(method === "retirer" ? "removed" : "added", { quantity: quantity, fullname: fullDrugName, member: member.toString() }), false, false, "editReply");
            }

            // --- START OF "DEPISTER" ---

            case "dépister": {

                const member = interaction.options.getMember("joueur");
                if(verify("member", { cantBotInclued: true })) return;
                
                const memberDrugConsumption = await client.db.getMemberDrugsConsumption(interaction.guildId, member.user.id);
                if (!memberDrugConsumption.length) return errorEmbed(t(`consumption_${member.id === interaction.member.id ? "self" : "other"}_negative`, { member: member.toString() }), false, true, "editReply");

                // else
                return successEmbed(t(`consumption_${member.id === interaction.member.id ? "self" : "other"}_positive`, { member: member.toString(), fullname: memberDrugConsumption.map(c => `**${c.item_name}** *(${c.quantity}g ${t("consumed", { s: c.quantity > 1 ? "s" : "" })})*`).join(", ") }), false, false, "editReply");
            }

        }


        } catch (err) {
            console.error(err);
            client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
    },

    runAutocomplete: async(client, interaction, { t, isPremium }) => {

        const focusedOption = interaction.options.getFocused(true);
        let drugs = [];

        if (["ajouter", "afficher"].includes(interaction.options._subcommand)) {
            drugs = (await client.db.getDrugs(interaction.guildId)).map(d => ({ name: d.name, value: `${code}&#46;${d.id}` }));
            if (!isPremium && drugs.length >= 2) drugs = drugs.slice(0, 2);
        } else {
            const memberDrugs = (await client.db.getMemberDrugs(interaction.guildId, interaction.options._hoistedOptions[0].value ?? '0')).sort((a, b) => a.name.localeCompare(b.name))
            for (let drug of memberDrugs) {
                if (drug.treated > 0) drugs.push({ name: `[${drug.treated}g]・${t("drugs.treated", { drugName: drug.name }, "global")}`, value: `${code}&#46;${drug.drug_id}&#46;treated` });
                if (drug.untreated > 0) drugs.push({ name: `[${drug.untreated}g]・${t("drugs.untreated", { drugName: drug.name }, "global")}`, value: `${code}&#46;${drug.drug_id}&#46;untreated` });
            }
        }
        
        const filtered = [];
        if(focusedOption.value !== "") {
            const filtredArray = [];
            filtredArray.push(...drugs.sort((a, b) => a.name.localeCompare(b.name)).filter(r => r.name.toLowerCase() == focusedOption.value.toLowerCase()));
            filtredArray.push(...drugs.sort((a, b) => a.name.localeCompare(b.name)).filter(r => r.name.toLowerCase().startsWith(focusedOption.value.toLowerCase())));
            filtredArray.push(...drugs.sort((a, b) => a.name.localeCompare(b.name)).filter(r => r.name.toLowerCase().includes(focusedOption.value.toLowerCase())));

            const unique = [...new Set(filtredArray)];
            filtered.push(...unique);
        } else {
            filtered.push(...drugs.sort((a, b) => a.name.localeCompare(b.name)));
        }

        await interaction.respond(filtered.slice(0, 25)).catch(() => {});

    }
}