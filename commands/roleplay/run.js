const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, ApplicationCommandOptionType, PermissionsBitField, spoiler, time } = require("discord.js");

var suspended = new Set();
function _cooldownRuns(id) {
    suspended.add(id)
    setTimeout(() => { suspended.delete(id) }, 2000);
};

const code = Math.floor(Math.random() * 9000000000) + 1000000000
module.exports = {
    category: { "en": "roleplay", "fr": "roleplay" },
    name: "run",
    description: "Permet de faire des runs de métier.",
    descriptionLocalizations: {
        "fr": "Permet de faire des runs de métier.",
        "en-GB": "Allows you to do runs of work.",
        "en-US": "Allows you to do runs of work."
    },
    options: [
        {
            name: "entreprise",
            nameLocalizations: {
                "fr": "entreprise",
                "en-GB": "company",
                "en-US": "company"
            },
            description: "L'entreprise dans laquelle vous voulez faire un run.",
            descriptionLocalizations: {
                "fr": "L'entreprise dans laquelle vous voulez faire un run.",
                "en-GB": "The company you want to do a run in.",
                "en-US": "The company you want to do a run in."
            },
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true
        }
    ],
    premium: true,
    run: async(client, interaction, { t, errorEmbed, successEmbed, economySymbol, lang }) => {

        try {

        return errorEmbed("<:nidev_bell:1053997599125929994> La commande sera disponible une fois que le système sera disponible sur le dashboard. Pour voir l'avancée, vous pouvez venir sur le [serveur support](https://discord.gg/nidev).")

        let link = client.functions.run.getRunLink(interaction.guildId, interaction.member.id);
        if (link) return errorEmbed(t("already_doing", { link: link }, "errors"));

        if (!(interaction.options.getString("entreprise") ?? `${code}`).startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == 'fr' ? "entreprise" : "company" }, "errors"));

        const run = await client.db.getRun(interaction.options.getString("entreprise").split("&#46;")[1]);

        const memberInventory = await client.db.getMemberItems(interaction.guildId, interaction.member.id);
        const inventoryWeight = memberInventory.reduce((a, b) => a + (b.weight * b.quantity), 0) + (await client.db.getMemberDrugs(interaction.guildId, interaction.member.id)).reduce((a, b) => a + ((b?.untreated ?? 0) + (b?.treated ?? 0)), 0);
        const maxWeight = await client.db.getOption(interaction.guildId, "inventory.max_weight");

        const embed = new EmbedBuilder()
        .setColor("Default")
        .setTitle(run.name)
        .setThumbnail("http://www.iseekush.com/420/wp-content/uploads/2017/08/tumblr_nbsrilzOzn1qjczh3o2_500.gif")
        .setDescription(t("main_embed.description", { user: interaction.user.toString() }));
        
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("⛏️").setLabel(t("buttons.harvesting")).setEmoji("⛏️").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("⚗️").setLabel(t("buttons.treatment")).setEmoji("⚗️").setStyle(ButtonStyle.Secondary).setDisabled(memberInventory.find(i => i.id === run.harvest_itemId) ? false : true),
            new ButtonBuilder().setCustomId("💰").setLabel(t("buttons.selling")).setEmoji("💰").setStyle(ButtonStyle.Secondary).setDisabled(memberInventory.find(i => i.id === run.treatment_itemId) ? false : true)
        );
            
        const message = await interaction.reply({ embeds: [embed], components: [row], ephemeral: true, fetchReply: true }).catch(() => {});
        if (!message) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        
        // Ask method
        const collector = await client.functions.other.createCollector(message, interaction, 60000, lang);
        if (!collector) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        if (collector === "end") return;
        
        link = client.functions.run.getRunLink(interaction.guildId, interaction.member.id);
        if (link) return collector.update({ embeds: [errorEmbed(t("already_doing", { link: link }, "errors"), true)] }).catch(() => {});
        
        // Validate channel permissions
        const channel = interaction.guild.channels.cache.get(run.channel_id) ?? interaction.channel;
        if (!channel.permissionsFor(client.user.id).has(["ViewChannel", "SendMessages", "EmbedLinks"])) return collector.update({ embeds: [errorEmbed(t("perms_send", { channels: interaction.channel.toString() }, "errors"), true)], content: null, components: [] }).catch(() => {});
        
        switch (collector.customId) {
            
            // ! RECOLTE

            case "⛏️": {
                
                if (suspended.has(interaction.member.id)) return collector.update({ embeds: [errorEmbed(t("already_doing_without_link", false, "errors"), true)], components: [] }).catch(() => {});

                _cooldownRuns(interaction.member.id);

                const item = memberInventory.find(i => i.id === run.harvest_itemId)
                if (item && item.quantity >= 2147483647) return collector.update({ embeds: [errorEmbed(t("int_passing", { name: item.name }, "errors"), true)], content: null, components: [] }).catch(() => {});

                const embed = new EmbedBuilder()
                    .setColor("Default")
                    .setTitle(t("harvesting_embed.title"))
                    .setDescription(t("harvesting_embed.description", { user: interaction.user.toString(), time: time(new Date(Date.now() + run.harvest_time), "R") }))
                    .setTimestamp();

                const sendEmbed = await channel.send({ content: spoiler(interaction.user.toString()), embeds: [embed] }).catch(() => {});
                if (!sendEmbed) return collector.update({ embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], content: null, components: [] }).catch(() => {});

                await collector.update({ embeds: [successEmbed(t("harvest_started", { link: sendEmbed.url }), true)], components: [] }).catch(() => {});

                client.functions.run.setRun(interaction.guildId, interaction.member.id, sendEmbed.url, run.harvest_time);
                await client.functions.other.wait(run.harvest_time);

                // End of timeout
                client.functions.run.deleteRun(interaction.guildId, interaction.member.id);

                let result = client.functions.other.randomBetween(run.quantity_min, run.quantity_max);
                if (maxWeight && item && inventoryWeight + item.weight > maxWeight) return collector.update({ embeds: [errorEmbed(t("inventory_full", false, "errors"), true)], content: null, components: [] }).catch(() => {});
                if (item && (item.quantity + result) >= 2147483647) result = 2147483647 - (item ? item.quantity : 0);
                if (item && ((item.quantity + item.hidden_quantity) <= item.max_items)) await client.db.addMemberItem(interaction.guildId, interaction.member.id, run.harvest_itemId, result)

                const finalEmbed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle(t("end_harvesting_embed.title" ))
                    .setDescription(t("end_harvesting_embed.description", { user: interaction.user.toString(), result: result.toLocaleString(lang), item: (await client.db.getShopItem(interaction.guildId, run.harvest_itemId)).name }))
                    .setTimestamp();

                return sendEmbed.edit({ embeds: [finalEmbed] }).catch(() => {});

            }

            //! TRAITEMENT

            case "⚗️": {

                if (suspended.has(interaction.member.id)) return collector.update({ embeds: [errorEmbed(t("already_doing_without_link", false, "errors"), true)], components: [] }).catch(() => {});

                _cooldownRuns(interaction.member.id)

                const item = memberInventory.find(i => i.id === run.harvest_itemId)
                if (item.quantity >= 2147483647) return collector.update({ embeds: [errorEmbed(t("int_passing", { name: item.name }, "errors"), true)], content: null, components: [] }).catch(() => {});

                const code = Math.floor(Math.random() * 9000000000) + 1000000000
                const modal = new ModalBuilder()
                .setCustomId(`modal_run_${code}`)
                .setTitle(run.name)
                .setComponents(new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("quantity").setStyle(TextInputStyle.Short).setLabel(t("modal.textinput")).setPlaceholder(t("modal.placeholder")).setRequired(true)
                ))

                await collector.showModal(modal).catch(() => {})

                const modalCollector = await collector.awaitModalSubmit({ filter: i => i.user.id === interaction.user.id && i.customId == `modal_run_${code}`, time: 60000 })
                const modalQuantity = ["tout", "all"].includes((modalCollector.fields.getTextInputValue("quantity")).toLowerCase()) ? item.quantity : parseInt(modalCollector.fields.getTextInputValue("quantity"))
                if (!modalQuantity || parseInt(modalQuantity) <= 0) return modalCollector.reply({ embeds: [errorEmbed(t("not_number", { number: modalQuantity }, "errors"), true)], components: [] }).catch(() => {})
                if (modalQuantity > item.quantity) return modalCollector.reply({ embeds: [errorEmbed(t("not_enough", { modalQuantity: modalQuantity.toLocaleString(lang), item: item.name, quantity: (item.quantity).toLocaleString(lang) }), true)], components: [] }).catch(() => {})

                const embed = new EmbedBuilder()
                    .setColor("Default")
                    .setTitle(t("treatment_embed.title" ))
                    .setDescription(t("treatment_embed.description", { user: interaction.user.toString(), time: time(new Date(Date.now() + run.treatment_time),"R") }))
                    .setTimestamp();

                const sendEmbed = await channel.send({ content: spoiler(interaction.user.toString()), embeds: [embed] }).catch(() => {});
                if (!sendEmbed) return modalCollector.reply({ embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], content: null, components: [] }).catch(() => {});

                await modalCollector.update({ embeds: [successEmbed(t("treatment_started", { link: sendEmbed.url }), true)], components: [] }).catch(() => {});

                client.functions.run.setRun(interaction.guildId, interaction.member.id, sendEmbed.url, run.treatment_time);
                await client.functions.other.wait(run.treatment_time);

                // End of timeout
                client.functions.run.deleteRun(interaction.guildId, interaction.member.id);

                let result = modalQuantity;
                const _item = (await client.db.getMemberItems(interaction.guildId, interaction.member.id)).find(i => i.id === run.harvest_itemId)
                if (!_item) return collector.update({ embeds: [errorEmbed(t("dont_have_item", { name: item.name }, "errors"), true)], content: null, components: [] }).catch(() => {})
                if (maxWeight && inventoryWeight + item.weight > maxWeight) return collector.update({ embeds: [errorEmbed(t("inventory_full", false, "errors"), true)], content: null, components: [] }).catch(() => {});
                if (item.role_required && !interaction.member.roles.cache.has(item.role_required)) return collector.update({ embeds: [errorEmbed(t("role_required", { role: item.role_required }, "errors"), true)], content: null, components: [] }).catch(() => {})
                if (_item.quantity + result >= 2147483647) result = 2147483647 - item.quantity;

                await client.db.removeMemberItem(interaction.guildId, interaction.member.id, run.harvest_itemId, result, _item.quantity <= 0 || result == modalQuantity);
                await client.db.addMemberItem(interaction.guildId, interaction.member.id, run.treatment_itemId, result);

                const finalEmbed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle(t("end_treatment_embed.title" ))
                    .setDescription(t("end_treatment_embed.description", { user: interaction.user.toString(), result: result.toLocaleString(lang), item: (await client.db.getShopItem(interaction.guildId, run.treatment_itemId)).name }))
                    .setTimestamp();

                return sendEmbed.edit({ embeds: [finalEmbed] }).catch(() => {});
                
            }

            //! VENTE

            case "💰": {

                if (suspended.has(interaction.member.id)) return collector.update({ embeds: [errorEmbed(t("already_doing_without_link", false, "errors"), true)], components: [] }).catch(() => {});

                _cooldownRuns(interaction.member.id);

                const item = memberInventory.find(i => i.id === run.treatment_itemId);
                if (item.quantity >= 2147483647) return collector.update({ embeds: [errorEmbed(t("int_passing", { name: item.name }, "errors"), true)], content: null, components: [] }).catch(() => {});

                const code = Math.floor(Math.random() * 9000000000) + 1000000000
                const modal = new ModalBuilder()
                .setCustomId(`modal_run_${code}`)
                .setTitle(run.name)
                .setComponents(new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("quantity").setStyle(TextInputStyle.Short).setLabel(t("modal.textinput")).setPlaceholder(t("modal.placeholder")).setRequired(true)
                ))

                await collector.showModal(modal).catch(() => {})

                const modalCollector = await collector.awaitModalSubmit({ filter: i => i.user.id === interaction.user.id && i.customId == `modal_run_${code}`, time: 60000 });
                if (!modalCollector) return collector.update({ embeds: [errorEmbed(t("error_occurred", false, "errors"), true)], components: [] });

                const getQuantity = modalCollector.fields.getTextInputValue("quantity");
                
                const modalQuantity = ["tout", "all"].includes(getQuantity.toLowerCase()) ? item.quantity : parseInt(getQuantity);
                if (!modalQuantity || isNaN(modalQuantity) || parseInt(modalQuantity) <= 0) return modalCollector.reply({ embeds: [errorEmbed(t("not_number", { number: modalQuantity }, "errors"), true)], components: [] }).catch(() => {});
                if (modalQuantity > item.quantity) return modalCollector.reply({ embeds: [errorEmbed(t("not_enough_treated", { modalQuantity: modalQuantity.toLocaleString(lang), quantity: (item.quantity).toLocaleString(lang) }), true)], components: [] }).catch(() => {});

                const embed = new EmbedBuilder()
                    .setColor("Default")
                    .setTitle(t("selling_embed.title"))
                    .setDescription(t("selling_embed.description", { user: interaction.member.toString(), time: time(new Date(Date.now() + run.sale_time),"R") }))
                    .setTimestamp();

                const sendEmbed = await channel.send({ content: spoiler(interaction.member.toString()), embeds: [embed] }).catch(() => {});
                if (!sendEmbed) return modalCollector.reply({ embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], content: null, components: [] }).catch(() => {});

                await modalCollector.update({ embeds: [successEmbed(t("selling_started", { link: sendEmbed.url }), true)], components: []}).catch(() => {});

                client.functions.run.setRun(interaction.guildId, interaction.member.id, sendEmbed.url, run.sale_time);
                await client.functions.other.wait(run.sale_time);

                client.functions.run.deleteRun(interaction.guildId, interaction.member.id);

                const _item = (await client.db.getMemberItems(interaction.guildId, interaction.member.id)).find(i => i.id === run.treatment_itemId)
                if (!_item || !parseInt(_item.quantity) || isNaN(_item.quantity)) return sendEmbed.edit({ embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], content: null, components: [] }).catch(() => {});
                if (_item.quantity <= 0) return sendEmbed.edit({ content: null, embeds: [errorEmbed(t("no_drug_to_sell", { member: i.user.toString(), item: item.name }), true)], components: [] }).catch(() => {});

                await client.db.removeMemberItem(interaction.guildId, interaction.member.id, run.treatment_itemId, modalQuantity, _item.quantity <= 0 || modalQuantity == _item.quantity);

                let moneyWon = run.price_per_unit * modalQuantity;

                const memberAccount = await client.db.getCashMoney(interaction.guildId, interaction.member.id);
                if ((memberAccount?.cash_money ?? 0) + moneyWon >= 2147483647) moneyWon = 2147483647 - memberAccount?.cash_money;

                await client.db.addMoney(interaction.guildId, interaction.member.id, "cash_money", moneyWon);

                const finalEmbed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle(t("end_selling_embed.title" ))
                    .setDescription(t("end_selling_embed.description", { user: interaction.user.toString(), result: _item.quantity.toLocaleString(lang), item: _item.name, money: `${separate(moneyWon)}${economySymbol}` }))
                    .setTimestamp();

                return sendEmbed.edit({ embeds: [finalEmbed], components: [] }).catch(() => {});

            }

            default: break;
        }

        } catch (err) {
            console.error(err);
            
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
    },

    runAutocomplete: async(client, interaction) => {

        const focusedOption = interaction.options.getFocused(true)
        const response = await client.db.getRuns(interaction.guildId);

        const filtered = [];
        if (focusedOption.value !== "") {
            const filtredArray = [];
            filtredArray.push(...response.filter(r => r.name.toLowerCase() == focusedOption.value.toLowerCase()));
            filtredArray.push(...response.filter(r => r.name.toLowerCase().startsWith(focusedOption.value.toLowerCase())));
            filtredArray.push(...response.filter(r => r.name.toLowerCase().includes(focusedOption.value.toLowerCase())));

            const unique = [...new Set(filtredArray)];
            filtered.push(...unique);
        } else {
            filtered.push(...response);
        }

        await interaction.respond(filtered.slice(0, 25).map(r => ({ name: r.name, value: `${code}&#46;${r.id}` }) ));

    }
}