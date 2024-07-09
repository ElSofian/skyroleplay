const { EmbedBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, UserSelectMenuBuilder, ApplicationCommandOptionType, time } = require("discord.js");

const code = Math.floor(Math.random() * 9000000000) + 1000000000
module.exports = {
    category: { "en": "player", "fr": "joueur" },
    name: "propriété",
    nameLocalizations: {
        "fr": "propriété",
        "en-GB": "property",
        "en-US": "property"
    },
    description: "Affiche les informations d'une propriété.",
    descriptionLocalizations: {
        "fr": "Affiche les informations d'une propriété.",
        "en-GB": "Display the information of a property.",
        "en-US": "Display the information of a property."
    },
    options: [{
        name: "nom",
        nameLocalizations: {
            "fr": "nom",
            "en-GB": "name",
            "en-US": "name"
        },
        description: "Le nom de la propriété.",
        descriptionLocalizations: {
            "fr": "Le nom de la propriété.",
            "en-GB": "The name of the property.",
            "en-US": "The name of the property."
        },
        type: ApplicationCommandOptionType.String,
        required: true,
        autocomplete: true,
    }],
    run: async(client, interaction, { t, successEmbed, errorEmbed, lang, economySymbol, isPremium, separate }) => {

        try {

        if(!(interaction.options.getString("nom") ?? `${code}`).startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == 'fr' ? "nom" : "name" }, "errors"));
        
        await interaction.deferReply().catch(() => {});
        
        const property = await client.db.getProperty(interaction.guildId, interaction.options.getString("nom").split("&#46;")[1]);
        if(!property) return errorEmbed(t("error_occurred", { links: client.constants.links.support }, "errors"), false, true, "editReply");

        const idCards = [await client.db.getIDCard(interaction.guildId, interaction.member.id), await client.db.getIDCard(interaction.guildId, interaction.member.id, true)]
        const idCard = (idCards[0] ?? idCards[1]) ?? null;

        const embed = new EmbedBuilder()
        .setColor(3092790)
        .setTitle(property.name)
        .setThumbnail(interaction.member.displayAvatarURL())
        .setDescription(
            property.owner_id == interaction.member.id ?
            t("embed.description_owner", { pronouns: t(`pronouns.${idCard ? idCard.gender == 1 ? "men" : "women" : "default"}`, false, "global"), name: idCard ? ` ${idCard.last_name}` : "", localisation: property.localisation ? t("embed.localisation", { localisation: property.localisation }) : "", sell_date: time(property.sell_date, "d") })
            : t("embed.description", { pronouns: t(`pronouns.${idCard ? idCard.gender == 1 ? "men" : "women" : "default"}`, false, "global"), name: idCard ? ` ${idCard.last_name}` : "", localisation: property.localisation ? t("embed.localisation", { localisation: property.localisation }) : "", sell_date: time(property.sell_date, "d") })
        )
        .setImage(property.image)

        const rows = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
            .setCustomId("out")
            .setLabel(t("buttons.out"))
            .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
            .setCustomId("safe")
            .setLabel(t("buttons.safe"))
            .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
            .setCustomId("double_keys")
            .setLabel(t("buttons.double_keys"))
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(property.owner_id !== interaction.member.id),
            new ButtonBuilder()
            .setCustomId("sell")
            .setLabel(t("buttons.sell"))
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(property.owner_id !== interaction.member.id)
        )

        const secondRows = (type = "safe", value = []) => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                .setCustomId("home")
                .setLabel(t("buttons.home"))
                .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                .setCustomId(type == "double_keys" ? "add" : "deposit")
                .setLabel(t(type == "double_keys" ? "buttons.add" : "buttons.deposit"))
                .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                .setCustomId(type == "double_keys" ? "remove" : "withdraw")
                .setLabel(t(type == "double_keys" ? "buttons.remove" : "buttons.withdraw"))
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(type == "double_keys" ? !value : !value.length),
            )
        }

        const safeEmbed = async(customId, index, indexSM, displaySM = false) => {
                        
            const display = [{ name: `${code}&#46;${t("modal.safe")}&#46;safe`, quantity: 0, type: "safe" }];

            // Member Inventory
            const memberInventory = (await client.db.getMemberItems(interaction.guildId, interaction.member.id)).map(i => ({ name: i.name, type: "items", quantity: i.quantity, id: i.id }) )
            const memberDrugs = []
            for (const drug of (await client.db.getMemberDrugs(interaction.guildId, interaction.member.id))) {
                ["untreated", "treated"].forEach(type => { if(drug[type] > 0) memberDrugs.push({ name: t(`drugs.${type}`, { drugName: drug.name }, "global"), type: `drugs&#46;${type}`, quantity: drug[type], id: drug.drug_id })  })
            }
            const { bank_money, hidden_cash_money, hidden_dirty_money, ...memberMoney } = await client.db.getMoney(interaction.guildId, interaction.member.id);
            const memberAll = [...Object.keys(memberMoney).filter(k => memberMoney[k] > 0).map(k => ({ name: t(k), type: k, quantity: memberMoney[k], id: k })), ...memberDrugs, ...memberInventory]

            // Property Inventory
            const propertyInventory = (await client.db.getSafeProperty(property.id)).filter(i => i.id);

            const safe = []
            const { money, dirty_money } = await client.db.getProperty(interaction.guildId, property.id);
            if(money > 0) safe.push({ name: lang == "fr" ? "Argent liquide" : "Cash", type: "cash_money", quantity: money, id: "cash_money" })
            if(dirty_money > 0) safe.push({ name: lang == "fr" ? "Argent sale" : "Dirty money", type: "dirty_money", quantity: dirty_money, id: "dirty_money" })
            
            const safeDrugs = await client.db.getSafeProperty(property.id, true)
            for (const drug of safeDrugs) ["untreated", "treated"].forEach(type => { if(drug[type] > 0) safe.push({ name: t(`drugs.${type}`, { drugName: drug.name }, "global"), type: `drugs&#46;${type}`, quantity: drug[type], id: drug.drug_id })  })

            if(propertyInventory.length > 0) safe.push(...(propertyInventory.map(i => ({ name: i.name, type: "items", quantity: i.quantity, id: i.id }) )))

            const safeChunks = client.functions.other.chunkArray(safe, 7)
            const chunks = client.functions.other.chunkArray(customId.includes("deposit") ? memberAll : safe, customId.includes("deposit") ? 22 : 7)
            
            if(safeChunks[index]?.length == 7 && customId.includes("deposit")) index++;
            
            if(!chunks || !chunks[0] || !chunks.length) display.splice(0, (customId.includes("deposit") ? memberAll.length : safe.length) + display.length)
            else display.push(...chunks[(customId.includes("deposit") ? indexSM : index)])

            if(chunks.length > 1) {
                if((customId.includes("deposit") ? indexSM : index) !== 0) display.push({ name: `${code}&#46;${t("words.previous", false, "global")}&#46;previous`, quantity: 0, type: "larrow" })
                if((customId.includes("deposit") ? indexSM : index) + 1 !== chunks.length) display.push({ name: `${code}&#46;${t("words.next", false, "global")}&#46;next`, quantity: 0, type: "rarrow" })
            }

            const embed = new EmbedBuilder()
            .setColor(3092790)
            .setThumbnail(interaction.member.displayAvatarURL())
            .setTitle(t("modal.safe"))
            .setDescription(!safeChunks[index] ? t("no_items") : safeChunks[index].map(i => `[${separate(i.quantity)}${i.type.endsWith("_money") ? economySymbol : i.type.startsWith("drugs") ? "g" : ""}] ・ ${i.name}`).join("\n"))
            
            if(displaySM) {

                if(display.length > 0) {

                    var sm = new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                        .setCustomId(customId.includes("sm_") ? customId : `sm_${customId}`)
                        .setPlaceholder(t("modal.select_placeholder"))
                        .addOptions(
                            display.map(item => ({ emoji: client.constants.emojis[item.type.startsWith("drugs") ? "drugs" : item.type], label: `${item.name.startsWith(`${code}`) ? item.name.split("&#46;")[1] : item.name}${item.name.startsWith(`${code}`) ? "" : ` (${item.type == "items" ? "x" : ""}${separate(item.quantity)}${item.type.endsWith("_money") ? economySymbol : item.type.startsWith("drugs") ? "g" : ""})`}`, value: item.type.endsWith("_money") ? `${item.type}&#46;${item.name}&#46;${item.quantity}` : `${item.type}&#46;${item.id}&#46;${item.name}&#46;${item.quantity}` }))
                        )
                    )

                } else displaySM = false;

            } else if(safeChunks.length > 1) {
                
                embed.setFooter({ text: `${index + 1}/${safeChunks.length}` });
                var changeEmbedRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId(`previous`)
                    .setEmoji("◀")
                    .setDisabled(index === 0),
                    new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId(`next`)
                    .setEmoji("▶")
                    .setDisabled(index + 1 === safeChunks.length)
                );
                    
            }
        
            return {
                embeds: [embed],
                components: displaySM ? [sm] : safeChunks.length > 1 ? [secondRows("safe", safe), changeEmbedRow] : [secondRows("safe", safe)],
                files: []
            }
        }
        
        const message = await interaction.editReply({ embeds: [embed], components: [rows] }).catch(() => {})
        if(!message) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");

        const collector = message.createMessageComponentCollector({ time: 180000 });
        if(!collector) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");

        let current = 0, currentSM = 0, currentKeys = 0, price;
        collector.on("collect", async i => {

            if(![`confirm-sell`, `cancel-sell`, "selled"].includes(i.customId) && i.user.id !== interaction.member.id) return i.reply({ embeds: [errorEmbed(t("not_your_interaction", { member: i.member.toString() }, "errors"), true)], ephemeral: true });

            switch(i.customId) {

                // GO OUT
                case "out": return collector.stop("end");

                // HOME
                case "home": i.update({ embeds: [embed], components: [rows] }); break;


                // SAFE
                case "previous":
                case "next": 
                case "safe": {
             
                    switch(i.customId) {

                        case "safe": i.update(await safeEmbed(i.customId, 0, 0)); break;

                        case `previous`: {
                            current--;
                            await i.update(await safeEmbed(i.customId, current, currentSM)).catch(() => {});
                            break;
                        }

                        case `next`: {
                            current++;
                            await i.update(await safeEmbed(i.customId, current, currentSM)).catch(() => {});
                            break;
                        }

                    }

                    break;

                }



                // DEPOST & WITHDRAW (SAFE)
                case "deposit":
                case "withdraw": {
                    await i.update(await safeEmbed(i.customId, current, currentSM, true));
                    break;
                }

                case "sm_deposit":
                case "sm_withdraw": {   

                    const item = i.values[0].split("&#46;")
                    if(!item) return i.update({ embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], components: [] });

                    if(item[2].startsWith(`${code}`)) {
                        if(item[4].endsWith("safe")) return i.update(await safeEmbed(i.customId, current, currentSM));
                        if(item[4].endsWith("next")) i.customId == "sm_deposit" ? currentSM++ : current++;
                        else if(item[4].endsWith("previous")) i.customId == "sm_deposit" ? currentSM-- : current--;
                        
                        await i.update(await safeEmbed(i.customId, current, currentSM, true))
                        break;
                    }

                    const itemType = item[0];
                    const itemId = item[itemType.startsWith("drugs") ? 2 : 1];
                    const itemName = item[itemType.startsWith("drugs") ? 3 : 2];
                    const itemQuantity = item[itemType.endsWith("_money") ? 2 : itemType.startsWith("drugs") ? 4 : 3];

                    let modalCollector = { fields: { getTextInputValue: () => itemQuantity }, update: (...args) => i.update(...args) };
                    if(itemQuantity > 1) {

                        const code = Math.floor(Math.random() * 9000000000) + 1000000000
                        const modal = new ModalBuilder()
                        .setCustomId(`modal_property_dw_${code}`)
                        .setTitle(t("modal.safe"))
                        .setComponents(
                            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("quantity").setLabel(t("modal.quantity")).setPlaceholder(t("modal.quantity_placeholder")).setMinLength(1).setStyle(TextInputStyle.Short).setRequired(false))
                        )
                        
                        await i.showModal(modal).catch(() => {});
                        modalCollector = await i.awaitModalSubmit({ filter: ii => ii.user.id === i.user.id && ii.customId == `modal_property_dw_${code}`, time: 60000 })
                        if(!modalCollector) return;

                    }

                    switch(itemType) {


                        case "dirty_money":
                        case "cash_money": {

                            const amount = ["tout", "all"].includes((modalCollector.fields.getTextInputValue("quantity")).toLowerCase()) || !modalCollector.fields.getTextInputValue("quantity") ? itemQuantity : parseInt(modalCollector.fields.getTextInputValue("quantity"));

                            const newPropertySafeMoney = await client.db.getProperty(interaction.guildId, interaction.options.getString("nom").split("&#46;")[1]);
                            const newMemberAccount = await client.db.getMoney(interaction.guildId, i.user.id);
                            const newQuantity = (i.customId == "sm_deposit" ? newMemberAccount : newPropertySafeMoney)[i.customId == "sm_deposit" ? itemType : itemType.replace("cash_", "")]
                           
                            if(!amount || isNaN(amount) || !newQuantity) return modalCollector.reply({ embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], components: [] }).catch(() => {})
                            if(amount > newQuantity) return modalCollector.reply({ embeds: [errorEmbed(t("not_enough_money2", { quantity: separate(itemQuantity), symbol: economySymbol }), true)], components: []}).catch(() => {});
                            if(amount + newQuantity >= 2147483647) return modalCollector.reply({ embeds: [errorEmbed(t("int_passing", { name: item[1] }, "errors"), true)], components: [] }).catch(() => {})

                            await client.db[`${i.customId == "sm_withdraw" ? "remove" : "add"}PlaceMoney`](interaction.guildId, "estates", property.id, itemType == "cash_money" ? "money" : itemType, amount);
                            
                            if(itemType == "cash_money") await client.db.addMoney(interaction.guildId, i.user.id, `cash_money`, i.customId == "sm_withdraw" ? amount : -amount);
                            else await client.db.addDirtyMoney(interaction.guildId, i.user.id, i.customId == "sm_withdraw" ? amount : -amount);

                            return modalCollector.update(await safeEmbed(i.customId, current, currentSM, true))

                        }

                        case "drugs": 
                        case "items":
                        default: {

                            const newMemberDrugs = await client.db.getMemberDrugs(interaction.guildId, i.user.id);
                            let amount = null;

                            let quantity, type = null;
                            if(itemType == "items") {
                                
                                const newMemberInventory = await client.db.getMemberItems(interaction.guildId, i.user.id);
                                const newPropertyInventory = await client.db.getSafeProperty(property.id);

                                var findItem = i.customId == "sm_withdraw" ? newPropertyInventory.find(i => i.name.toLowerCase() == itemName.toLowerCase()) : newMemberInventory.find(i => i.name.toLowerCase() == itemName.toLowerCase());
                                if(!findItem) return modalCollector.reply({ embeds: [errorEmbed(t("item_not_found", { item: itemName }), true)], components: [] })
                                
                                var { name, hidden_quantity, weight, role_add, role_remove, role_required } = findItem;
                                quantity = findItem.quantity
                                amount = ["tout", "all"].includes((modalCollector.fields.getTextInputValue("quantity")).toLowerCase()) || !modalCollector.fields.getTextInputValue("quantity") ? quantity : parseInt(modalCollector.fields.getTextInputValue("quantity"));

                                const maxWeight = await client.db.getOption(interaction.guildId, "inventory.max_weight");
                                const inventoryWeight = newMemberInventory.reduce((a, b) => a + (b.weight * b.quantity), 0) + newMemberDrugs.reduce((a, b) => a + ((b?.untreated ?? 0) + (b?.treated ?? 0)), 0);
            
                                if(i.customId == "sm_withdraw" && maxWeight && inventoryWeight + weight > maxWeight) return modalCollector.reply({ embeds: [errorEmbed(t("inventory_full", { item: name }, "errors"), true)], components: [] }).catch(() => {})
                                if(i.customId == "sm_withdraw" && role_add && isPremium) await interaction.member.roles.add(role_add).catch(() => errorEmbed(t("cant_give_role", { role: role_add.toString() }, "errors"), false, false, "update", modalCollector))
                                if(i.customId == "sm_deposit" && role_add && quantity === amount && isPremium) await interaction.member.roles.remove(role_add).catch(() => errorEmbed(t("cant_remove_role", { role: role_add.toString() }, "errors"), false, false, "update", modalCollector))
                                if(i.customId == "sm_deposit" && role_remove && isPremium) await interaction.member.roles.remove(role_remove).catch(() => errorEmbed(t("cant_remove_role", { role: role_remove.toString() }, "errors"), false, false, "update", modalCollector))
        
                            } else {

                                const newSafeDrugs = await client.db.getSafeProperty(property.id, true);

                                var drug = i.customId == "sm_withdraw" ? newSafeDrugs.find(d => d.drug_id == itemId) : newMemberDrugs.find(d => d.drug_id == itemId);
                                if(!drug) return modalCollector.reply({ embeds: [errorEmbed(t("drug_not_found", { drug: itemName }), true)], components: [], files: [] })

                                type = item[1];
                                var otherType = type == "untreated" ? "treated" : "untreated"
                                quantity = drug[type];
                                amount = ["tout", "all"].includes((modalCollector.fields.getTextInputValue("quantity")).toLowerCase()) || !modalCollector.fields.getTextInputValue("quantity") ? quantity : parseInt(modalCollector.fields.getTextInputValue("quantity"));
                            
                            }


                            if(!amount || isNaN(amount) || !quantity) return modalCollector.reply({ embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], components: [] }).catch(() => {})
                            if(amount > quantity) return modalCollector.reply({ embeds: [errorEmbed(t("not_enough_item", { quantity: (quantity).toLocaleString(lang), item: itemType == "items" ? name : drug.name }), true)], components: [] }).catch(() => {})
                            if(amount + quantity >= 2147483647) return modalCollector.reply({ embeds: [errorEmbed(t("int_passing", { name: itemType == "items" ? name : drug.name }, "errors"), true)], components: [] }).catch(() => {})

                            await client.db[`${i.customId.replace("sm_", "")}Item`](
                                interaction.guildId,
                                i.user.id,
                                itemId,
                                itemType,
                                type,
                                "estate",
                                property.id,
                                amount,
                                itemType == "drugs" ?
                                    i.customId == "sm_deposit" ?
                                        drug.hidden_treated == 0 && drug.hidden_untreated == 0 && drug[otherType] == 0 && amount == quantity
                                        : drug[otherType] == 0 && amount == quantity
                                    : i.customId == "sm_deposit"
                                        ? amount == quantity && hidden_quantity == 0
                                        : amount == quantity
                            )
                            
                            return modalCollector.update(await safeEmbed(i.customId, current, currentSM, true))

                        }

                    } 
                }



                // MAKE AND SEE DOUBLE KEYS
                case "dk-previous":
                case "dk-next": 
                case "add":
                case "remove":
                case "sm_add":
                case "sm_remove":
                case "double_keys": {

                    await interaction.guild.members.fetch();

                    async function dkEmbed(customId, current, embed = false) {
                        
                        const { authorized_members } = await client.db.getProperty(interaction.guildId, property.id);
                        const display = [{ label: t("keys"), value: `${code}&#46;keys`, emoji: client.constants.emojis.keys }];
                        const chunks = client.functions.other.chunkArray(authorized_members?.split(",") ?? [], 10);

                        const rows = new ActionRowBuilder()
                        if(chunks?.length > 1) {
                            if(current !== 0) display.push({ label: t("words.previous", false, "global"), value: `${code}&#46;previous`, emoji: client.constants.emojis.larrow })
                            if(current + 1 !== chunks.length) display.push({ label: t("words.next", false, "global"), value: `${code}&#46;next`, emoji: client.constants.emojis.rarrow })

                            rows.addComponents(
                                new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`dk-previous`).setEmoji("◀").setDisabled(current === 0),
                                new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`dk-next`).setEmoji("▶").setDisabled(current + 1 === chunks.length)
                            )
                        }

                        const members = (await Promise.all((chunks[current] ?? []).map(async (memberId) => {
                            const id = [await client.db.getIDCard(interaction.guildId, memberId), await client.db.getIDCard(interaction.guildId, memberId, true)];
                            if(id[0]) return { label: `- ${id[0].first_name} ${id[0].last_name} (<@${memberId}>)`, value: memberId }
                            if(id[1]) return { label: `- ${id[1].first_name} ${id[1].last_name} (<@${memberId}>)`, value: memberId }
                            else return { label: `- <@${memberId}>`, value: memberId }
                        })))
                        display.push(...members)

                        const dkEmbed = new EmbedBuilder()
                        .setColor(3092790)
                        .setTitle(t("embed.double_keys"))
                        .setDescription(!members.length ? t("no_authorized_members") : members.map(m => m.label).join("\n\n"))
                        if(chunks?.length > 1) dkEmbed.setFooter({ text: `${current + 1}/${chunks.length}` })

                        const sm = new ActionRowBuilder()
                        if(["add", "remove", "sm_add", "sm_remove"].includes(customId)) {
                            if(customId.includes("add")) sm.addComponents(new UserSelectMenuBuilder().setCustomId(customId.includes("sm_") ? customId : `sm_${customId}`).setPlaceholder(t("modal.add")))
                            else sm.addComponents(new StringSelectMenuBuilder().setCustomId(customId.includes("sm_") ? customId : `sm_${customId}`).setPlaceholder(t("modal.remove")).setOptions(display.map(m => {
                                if(m.value.startsWith(`${code}`)) return { label: m.label, value: m.value, emoji: m.emoji ?? client.constants.emojis[m.value.split("&#46;")[1]] }
                                else return { label: m.label.match(/- (.+?) \(.+?\)/)?.[1] ?? interaction.guild.members.cache.get(m.value)?.displayName ?? t("unkown"), value: m.value, emoji: "👤" }
                            })))
                        }

                        return { embeds: [dkEmbed], components: embed ? chunks?.length > 1 ? [secondRows("double_keys", authorized_members), rows] : [secondRows("double_keys", authorized_members)] : [sm], files: [] }
    
                    }

                    if(i.customId.startsWith("dk")) {
                        if(i.customId == "dk-next") currentKeys++
                        if(i.customId == "dk-previous") currentKeys--
                        return i.update(await dkEmbed(i.customId, currentKeys, true))
                    }
                    if(!i.customId.startsWith("sm_")) return i.update(await dkEmbed(i.customId, currentKeys, i.customId == "double_keys"))
                    
                    const value = i.values[0].split("&#46;")
                    if(value[0].startsWith(`${code}`)) {
                        if(value[1].includes("next")) currentKeys++
                        else if(value[1].includes("previous")) currentKeys--
                        else if(value[1].includes("keys")) return i.update(await dkEmbed(i.customId, currentKeys, true))

                        return i.update(await dkEmbed(i.customId, currentKeys))
                    }
                    
                    const memberId = value[0];
                    let name = `<@${memberId}>`

                    const idCard = [await client.db.getIDCard(interaction.guildId, memberId), await client.db.getIDCard(interaction.guildId, memberId, true)];
                    if(idCard[1]) name = `${idCard[1].first_name} ${idCard[1].last_name} (<@${memberId}>)`
                    if(idCard[0]) name = `${idCard[0].first_name} ${idCard[0].last_name} (<@${memberId}>)`
                    
                    const { authorized_members } = await client.db.getProperty(interaction.guildId, property.id);
                    if(memberId == i.user.id) return i.update({ embeds: [errorEmbed(t("cant_double_keys_yourself"), true)], components: [] }).catch(() => {})
                    if(i.customId.includes("add") && authorized_members?.split(",").includes(memberId)) return i.update({ embeds: [errorEmbed(t("already_authorized", { memberName: name }), true)], components: [] }).catch(() => {})

                    await client.db.setDoubleKeys(interaction.guildId, property.id, "estates", i.customId.includes("add") ? `${authorized_members ? `${authorized_members},` : ""}${memberId}` : authorized_members.replace(`,${memberId}`, "").replace(`${memberId},`, "").replace(`${memberId}`, ""));
                    return i.update({ embeds: [successEmbed(t(`double_keys_${i.customId.replace("sm_", "")}ed`, { name: property.name, memberName: name }), true)], components: [] }).catch(() => {})

                }

                // SELL
                case `confirm-sell`:
                case `cancel-sell`:
                case `selled`:
                case "sell":
                case "cancel": {

                    const realEstateAgentRole = await client.db.getOption(interaction.guildId, "roles.real_estate")
                    const realEstateCompany = await client.db.getSpecifyCompany(interaction.guildId, "realestate", property?.realesate_id ?? null, true)
                    
                    const realEstateAgentsLength = ((await interaction.guild.roles.fetch(realEstateAgentRole))?.members)?.size
                    const realEstateAgents = await client.db.getCompanyEmployees(realEstateCompany?.id);
                    if(realEstateAgentsLength + realEstateAgents.length <= 0) return i.update({ embeds: [errorEmbed(t("no_real_estate_agent", { link: client.constants.links.dashboard }), true)], components: []}).catch(() => {})

                    if(i.customId !== 'selled' && property.owner_id !== i.user.id) return i.reply({ embeds: [errorEmbed(t("not_your_property"), true)], components: [], ephemeral: true }).catch(() => {});
                
                    switch(i.customId) {

                        case "sell": {

                            const code = Math.floor(Math.random() * 9000000000) + 1000000000
                            const modal = new ModalBuilder()
                            .setCustomId(`modal_property_sell_${code}`)
                            .setTitle(t("modal.sale"))
                            .setComponents(
                                new ActionRowBuilder().addComponents(
                                    new TextInputBuilder()
                                    .setCustomId("price")
                                    .setStyle(TextInputStyle.Short)
                                    .setLabel(t("modal.price"))
                                    .setPlaceholder(t("modal.price_placeholder"))
                                    .setMinLength(1)
                                    .setRequired(true)
                                )
                            )
    
                            await i.showModal(modal).catch(() => {})
                            const modalCollector = await i.awaitModalSubmit({ filter: ii => ii.user.id === i.user.id && ii.customId == `modal_property_sell_${code}`, time: 60000 })
    
                            price = parseInt(modalCollector.fields.getTextInputValue("price"));
                            if(!price || isNaN(price)) return modalCollector.reply({ embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], components: [] }).catch(() => {})
                            if(price >= 2147483647) return modalCollector.reply({ embeds: [errorEmbed(t("int_passing", { name: property.name }, "errors"), true)], components: [] }).catch(() => {})
    
                            const embed = new EmbedBuilder().setColor("Green").setDescription(`${client.constants.emojis.reussi} ${t("confirm_sell", { name: property.name, price: separate(price), symbol: economySymbol })}`);
                            const rows = new ActionRowBuilder().addComponents(
                                new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel(t("interactionCreate.validation.buttons.validate", false, "events")).setCustomId(`confirm-sell`),
                                new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel(t("interactionCreate.validation.buttons.cancel", false, "events")).setCustomId(`cancel`)
                            );
    
                            modalCollector.update({ embeds: [embed], components: [rows] });
                            break;

                        }


                        case `confirm-sell`: {

                            const embed = new EmbedBuilder()
                            .setColor(realEstateCompany?.color && isPremium ? realEstateCompany?.color : "#5865F2")
                            .setThumbnail(property.image ?? i.member.displayAvatarURL())
                            .setTitle(t("confirm_buy_embed.title"))
                            .setDescription(`${t("confirm_buy_embed.description", { member: interaction.member.id, name: property.name, price: separate(price), symbol: economySymbol })}`);
                            
                            const rows = new ActionRowBuilder().addComponents(
                                new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel(t("buttons.buy")).setCustomId(`selled`),
                                new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel(t("buttons.refuse")).setCustomId(`cancel-sell`)
                            );
                                
                            i.update({ embeds: [embed], components: [rows] });
                            break;

                        }

                        case `selled`: {

                            if(realEstateCompany && isPremium) {
                                if(realEstateCompany.money + price >= 2147483647) return i.update({ embeds: [errorEmbed(t("int_passing", { name: property.name }, "errors"), true)], components: [] }).catch(() => {})
                                if(realEstateCompany.money < price) return i.update({ embeds: [errorEmbed(t("not_enough_money", { money: separate(realEstateCompany.money), symbol: economySymbol }), true)], components: [] }).catch(() => {})
                            }
                            
                            const employees = await client.db.getCompanyEmployees(realEstateCompany?.id);
                            if(!employees.find(({ user_id }) => user_id == i.user.id) && !i.member.roles.cache.has(realEstateAgentRole)) return i.reply({ embeds: [errorEmbed(t("eastes_missing_permission", { member: i.member.toString() }, "errors"), true)], ephemeral: true });
                            
                            await client.db.sellProperty(interaction.guildId, property.id, i.user.id, price, realEstateCompany && isPremium ? realEstateCompany.id : null, lang == "fr" ? `Achat de ${property.name}` : `Buy of ${property.name}`, lang == "fr" ? `Vente de ${property.name}` : `Sale of ${property.name}`);
                            return i.update({ embeds: [successEmbed(t("selled", { name: property.name, price: separate(price), symbol: economySymbol }), true)], components: [] }).catch(() => {})

                        }

                        case `cancel`:
                        default: return i.update({ embeds: [errorEmbed(t("cancelled"), true)], components: []}).catch(() => {});

                    }

                }

            }

        })

        collector.on("end", () => {
            return interaction.editReply({ components: [] }).catch(() => {})
        })


        } catch (err) {
            console.error(err);
            client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    },

    runAutocomplete: async(client, interaction) => {

        const focusedOption = interaction.options.getFocused(true);
        const response = (await client.db.getMemberProperties(interaction.guildId, interaction.member.id)).sort((a, b) => a.name.localeCompare(b.name))
        
        const filtered = [];
        if(focusedOption.value !== "") {
            const filtredArray = [];
            filtredArray.push(...response.filter(r => r.name.toLowerCase() == focusedOption.value.toLowerCase()));
            filtredArray.push(...response.filter(r => r.name.toLowerCase().startsWith(focusedOption.value.toLowerCase())));
            filtredArray.push(...response.filter(r => r.name.toLowerCase().includes(focusedOption.value.toLowerCase())));

            const unique = [...new Set(filtredArray)];
            filtered.push(...unique);
        } else {
            filtered.push(...response);
        }

        return interaction.respond(filtered.slice(0, 25).map(p => ({ name: p.name, value: `${code}&#46;${p.id}` }))).catch(() => {})

    }
}
