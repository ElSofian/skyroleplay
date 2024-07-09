const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, UserSelectMenuBuilder, ApplicationCommandOptionType, User } = require("discord.js");
const { Canvas, loadImage, loadFont } = require("canvas-constructor/napi-rs");
const { resolve, join } = require("node:path");
loadFont(resolve(join(__dirname, "../../assets/fonts/Poppins-Regular.ttf")), "Poppins-R");
loadFont(resolve(join(__dirname, "../../assets/fonts/Poppins-SemiBold.ttf")), "Poppins-B");

const code = Math.floor(Math.random() * 9000000000) + 1000000000
module.exports = {
    category: { "en": "player", "fr": "joueur" },
    name: "item",
    description: "Affiche un item de l'inventaire.",
    descriptionLocalizations: {
        "fr": "Affiche un item de l'inventaire.",
        "en-GB": "Displays an item from the inventory.",
        "en-US": "Displays an item from the inventory."
    },
    options: [{
        name: "nom",
        nameLocalizations: {
            "fr": "nom",
            "en-GB": "name",
            "en-US": "name"
        },
        description: "Choisissez l'item à afficher.",
        descriptionLocalizations: {
            "fr": "Choisissez l'item à afficher.",
            "en-GB": "Choose the item to display.",
            "en-US": "Choose the item to display."  
        },
        type: ApplicationCommandOptionType.String,
        required: true,
        autocomplete: true,
    }],
    run: async(client, interaction, { t, successEmbed, errorEmbed, lang, economySymbol, isPremium, isBeta, separate }) => {

        try {

        await interaction.deferReply().catch(() => {});

        if(!interaction.options.getString("nom").startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == 'fr' ? "nom" : "name" }, "errors"), false, true, "editReply");

        const embed = new EmbedBuilder()
        .setColor(interaction.member.displayColor ?? "White")
        .setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() })
        .setImage("attachment://item.png")

        const item = interaction.options.getString("nom").split("&#46;");
        const itemType = item[1]

        let name, quantity, hidden_quantity, type, otherType, otherQuantity, drugId, drugType, image;
        switch(itemType) {

            // Clés

            case "property-key":
            case "vehicle-key": {

                name = item[4];
                quantity = 1;
                hidden_quantity = 0;
                image = `assets/inventory/items_icones/key.png`;

                break;

            }

            // Money
            case "dirty_money":
            case "cash_money": {

                const money = await client.db.getMoney(interaction.guildId, interaction.member.id);

                name = t(itemType);
                quantity = money[itemType] ?? 0,
                hidden_quantity = money[`hidden_${itemType}`] ?? 0,
                image = `assets/inventory/items_icones/cash${itemType == "dirty_money" ? "-roll" : ""}.png`;

                break;
            }


            // Drug or Item
            case "items": {

                const findItem = await client.db.getMemberItem(interaction.guildId, interaction.member.id, parseInt(item[3]));
                if(!findItem) return errorEmbed(t("item_not_found", { name: item[4] }), false, true, "editReply");

                name = findItem.name,
                type = findItem.type,
                quantity = findItem.quantity,
                hidden_quantity = findItem.hidden_quantity,
                image = findItem.image ? `assets/inventory/items_icones/${findItem.image}.png` : "assets/inventory/items_icones/empty.png",
                role_required = findItem.role_required,
                role_add = findItem.role_add,
                role_remove = findItem.role_remove,
                weight = findItem.weight,
                maxWeight = await client.db.getOption(interaction.guildId, "inventory.max_weight");
            
                break;
            }


            case "drugs": {

                drugId = item[3];
                const drug = await client.db.getMemberDrugs(interaction.guildId, interaction.member.id, drugId);
                if(!drug) return errorEmbed(t("drug_not_found", { name: item[5] }), false, true, "editReply");
                
                type = "consume"
                drugType = item[4];
                otherType = drugType == "untreated" ? "treated" : "untreated";
                name = t(`drugs.${drugType}`, { drugName: drug.name }, "global"),
                quantity = drug[drugType],
                otherQuantity = drug[otherType],
                hidden_quantity = drug[`hidden_${drugType}`],
                image = `assets/inventory/items_icones/${drug.image ?? "empty"}.png`;

                break;
            }
            
        }
        
        
        const canvas = new Canvas(950, 500)
        .printImage(await loadImage("assets/inventory/items_bg.png"), 0, 0, 950, 500)
        .printImage(await loadImage(image), 710, 77.5, 145, 145)
        .setColor("white").setTextFont("55px Poppins-B")
        .printText((name ?? "").length > 17 ? `${name.substring(0, 17)}...` : name, 80, 130)
        .setTextFont("34px Poppins-R")
        .printText(t("canvas_quantity", { quantity: separate(quantity), items: itemType.endsWith("_money") ? economySymbol : itemType == "drugs" ? "g" : ` item${quantity > 1 ? "s" : ""}` }), 80, 210)
        if(hidden_quantity > 0) {
            canvas.setTextFont("30px Poppins-R").setColor("#929399")
            .printImage(await loadImage("assets/inventory/eyeslash.png"), 80, 230, 35, 30)
            .printText(t("canvas_hidden_quantity", { quantity: separate(hidden_quantity), items: itemType.endsWith("_money") ? economySymbol : itemType == "drugs" ? "g" : ` item${hidden_quantity > 1 ? "s" : ""}`, s: hidden_quantity > 1 ? "s" : "" }), 130, 255)
        }
        
        const attachment = new AttachmentBuilder(await canvas.pngAsync(), { name: "item.png" })
        const options = [
            { name: type ?? "use", style: ButtonStyle.Primary, min: itemType == "drugs" ? drugType == "treated" && quantity > 0 ? quantity : 0 : itemType.endsWith("key") ? 0 : quantity },
            { name: "give", style: ButtonStyle.Primary, min: itemType.endsWith("key") ? 1 : quantity },
            { name: "rename", style: ButtonStyle.Secondary, min: itemType == "items" ? 1 : 0 },
            { name: "hide", style: ButtonStyle.Secondary, min: itemType.endsWith("key") ? 0 : quantity },
            { name: "retrieve", style: ButtonStyle.Secondary, min: itemType.endsWith("key") ? 0 : hidden_quantity },
            { name: "drop", style: ButtonStyle.Danger, min: itemType.endsWith("key") ? 1 : quantity },
        ];

        let rows = [new ActionRowBuilder()]
        for (const option of options) if((option?.min ?? 0) > 0) rows[0].addComponents(new ButtonBuilder().setCustomId(option.name).setLabel(t(`buttons.${option.name}`)).setStyle(option.style))
        if(rows[0].components.length == 6) {
            const firstArray = rows[0].components.slice(0, 5);
            const secondArray = rows[0].components[5];
            rows = [new ActionRowBuilder().addComponents(firstArray), new ActionRowBuilder().addComponents(secondArray)]
        }
        
        const message = await interaction.editReply({ embeds: [embed], components: rows, files: [attachment] })
        if(!message) return

        const collector = await message.createMessageComponentCollector({ filter: i => i.user.id == interaction.user.id, time: 90000 });
        if (!collector) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");

        collector.on("collect", async (i) => {

            if(i.customId !== "give") {

                var modalCollector = i, memberQuantity = i.customId == "retrieve" ? hidden_quantity : quantity
                if(quantity > 1) {

                    const code = Math.floor(Math.random() * 9000000000) + 1000000000
                    const modal = new ModalBuilder()
                    .setCustomId(`modal_item_${code}`)
                    .setTitle(t("modal.title"))
                    .setComponents(new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId(i.customId == "rename" ? "name" : "quantity")
                        .setLabel(t(i.customId == "rename" ? "name" : "quantity"))
                        .setPlaceholder(t(`placeholder_${i.customId == "rename" ? "name" : "quantity"}`, { item: name }).substring(0, 150))
                        .setStyle(TextInputStyle.Short)
                        .setRequired(i.customId == "rename")
                        .setMinLength(1)
                        .setMaxLength(i.customId == "rename" ? 255 : 11),
                    ))

                    await i.showModal(modal).catch(() => {});

                    modalCollector = await i.awaitModalSubmit({ filter: i => i.user.id === interaction.user.id && i.customId == `modal_item_${code}`, time: 60000 })
                    memberQuantity = i.customId == "retrieve" ? hidden_quantity : quantity

                }
                
                if(i.customId !== "rename") {

                    const collectedValue = modalCollector?.fields?.getTextInputValue("quantity") ?? memberQuantity;
                    var modalQuantity = ["tout", "all"].includes(`${collectedValue}`.toLowerCase()) || collectedValue == "" ? memberQuantity : collectedValue;
                    modalQuantity = itemType.includes("money") ? parseFloat(modalQuantity) : parseInt(modalQuantity);

                    if(!modalQuantity || modalQuantity <= 0) return modalCollector.reply({ embeds: [errorEmbed(t("not_number", { number: modalQuantity }, "errors"), true)], components: [], files: [] })
                    if(modalQuantity > memberQuantity) return modalCollector.reply({ embeds: [errorEmbed(t("not_enough", { place: i.customId == "retrieve" ? t("words.hide", false, "global") : t("words.inventory", false, "global"), modalQuantity: `${separate(modalQuantity)}${itemType.endsWith("_money") ? economySymbol : itemType == "drugs" ? "g" : ""}`, name: name, quantity: `${separate(memberQuantity)}${itemType.endsWith("_money") ? economySymbol : itemType == "drugs" ? "g" : ""}` }), true)], components: [], files: [] })
                    if(modalQuantity >= 2147483647) return modalCollector.reply({ embeds: [errorEmbed(t("int_passing", { name: name }, "errors"), true)], components: [], files: [] })
                
                }

            }

            switch (i.customId) {

                case "rename": {

                    let newName = modalCollector.fields.getTextInputValue("name");

                    const searchItem = await client.db.getShopItem(interaction.guildId, parseInt(item[3]));
                    if(searchItem.name == newName) newName = null;
                    else {
                        const quantityItemWithNewName = await client.db.getQuantityMemberItemWithSameNickname(interaction.guildId, interaction.member.id, newName);
                        if(quantityItemWithNewName && quantityItemWithNewName > 0) newName = `${newName} (${quantityItemWithNewName+1})`
                    }

                    await client.db.setNicknameItem(interaction.guildId, interaction.member.id, item[3], newName);
                    return modalCollector.update({ embeds: [EmbedBuilder.from(successEmbed(t(newName == null ? "reset" : "rename", { name: name, newName: newName ?? searchItem.name }), true)).setThumbnail(null/*image*/)], components: [], files: [] }).catch(() => {});
                }


                case "give": {
                    const sm = new ActionRowBuilder().addComponents(new UserSelectMenuBuilder().setCustomId("sm").setPlaceholder(t("sm_placeholder", { item: name })).setMinValues(1).setMaxValues(1))
                    return i.update({ embeds: [embed], components: [sm], files: [attachment] })
                }

                case "sm": {

                    const memberId = i.values[0];
                    switch(itemType) {

                        case "cash_money":
                        case "dirty_money": {
                            const newMemberAccount = await client.db.getMoney(interaction.guildId, interaction.member.id);
                            if(newMemberAccount[itemType] < modalQuantity) return modalCollector.reply({ embeds: [errorEmbed(t(`not_enough_${itemType}`, { amount: `${separate(newMemberAccount[itemType])}${economySymbol}`, symbol: economySymbol }, "errors"), true)], components: [], files: [] })
                            
                            await client.db.addMoney(interaction.guildId, interaction.member.id, itemType, -modalQuantity);
                            await client.db.addMoney(interaction.guildId, memberId, itemType, modalQuantity);

                            break;
                        }

                        case "property-key":
                        case "vehicle-key": {

                            const isProperty = itemType == "property-key";
                            const place = await client.db[`getMember${isProperty ? "Property" : "CG"}`](interaction.guildId, interaction.member.id, item[3]);
                            if(!place) return modalCollector.reply({ embeds: [errorEmbed(t("no_place", { place: t(isProperty ? "properties" : "cg", false, "global") }, "errors"), true)], components: [], files: [] })

                            if(place[isProperty ? "owner_id" : "user_id"] == interaction.member.id) await client.db[`set${isProperty ? "Property" : "CG"}Owner`](interaction.guildId, place.id, memberId);
                            else await client.db.setDoubleKeys(interaction.guildId, place.id, isProperty ? "estates" : "member_cg", place.authorized_members.replace(interaction.member.id, memberId));

                            break;

                        }

                        case "items": {
                            const newMemberItems = await client.db.getMemberItems(interaction.guildId, interaction.member.id);
                            const findItem = newMemberItems.find(i => i.id == item[3]);
                            if(!findItem || (findItem?.quantity ?? 0) < modalQuantity) return modalCollector.reply({ embeds: [errorEmbed(t(`not_enough`, { place: t("words.inventory", false, "global"), modalQuantity: `${modalQuantity.toLocaleString(lang)} item${modalQuantity > 1 ? "s" : ""}`, name: name, quantity: findItem?.quantity?.toLocaleString(lang) ?? 0 }), true)], components: [], files: [] })
                            
                            const memberItems = await client.db.getMemberItems(interaction.guildId, memberId);
                            const findMemberItem = memberItems.find(i => i.id == item[3]);

                            if(findItem?.max_items && (findItem?.quantity + findItem?.hidden_quantity) > findItem?.max_items) return modalCollector.reply({ embeds: [errorEmbed(t("max_item", { max: findMemberItem?.max_items, name: findMemberItem?.name }, "errors"), true)], components: [], files: [] })
                            if(findMemberItem?.max_items && ((findMemberItem?.quantity ?? 0) + (findMemberItem?.hidden_quantity ?? 0) > findMemberItem?.max_items)) return modalCollector.reply({ embeds: [errorEmbed(t("max_item_member", { member: `<@${memberId}>`, max: findMemberItem?.max_items, name: findMemberItem?.name }, "errors"), true)], components: [], files: [] })

                            await client.db.removeMemberItem(interaction.guildId, interaction.member.id, item[3], modalQuantity, modalQuantity >= findItem.quantity && findItem.hidden_quantity <= 0);
                            await client.db.addMemberItem(interaction.guildId, memberId, item[3], modalQuantity, findItem.name);
                            
                            await interaction.guild.members.fetch();
                            const member = interaction.guild.members.cache.get(memberId);

                            if(findItem?.role_add && modalQuantity == findItem?.quantity && findItem?.hidden_quantity == 0 && isPremium) await interaction.member.roles.remove(findItem?.role_add)
                            if(findItem?.role_add && member && isPremium) await member.roles.add(findItem?.role_add)
                            if(findItem?.role_remove && member && isPremium) await member.roles.remove(findItem?.role_remove)

                            break;
                        }

                        case "drugs": {
                            const newMemberDrugs = await client.db.getMemberDrugs(interaction.guildId, interaction.member.id);
                            const findDrug = newMemberDrugs.find(d => d.drug_id == drugId);
                            if(!findDrug || (findDrug?.[drugType] ?? 0) < modalQuantity) return modalCollector.reply({ embeds: [errorEmbed(t(`not_enough`, { place: t("words.inventory", false, "global"), modalQuantity: `${modalQuantity.toLocaleString(lang)}g`, name: name, quantity: findDrug?.quantity?.toLocaleString(lang) ?? 0 }), true)], components: [], files: [] })
                        
                            await client.db.removeMemberDrug(interaction.guildId, interaction.member.id, drugId, drugType, modalQuantity, modalQuantity >= findDrug[drugType] && findDrug[otherType] <= 0 && findDrug[`hidden_${drugType}`] <= 0 && findDrug[`hidden_${otherType}`] <= 0);
                            await client.db.addMemberDrug(interaction.guildId, memberId, drugId, drugType, modalQuantity);
                            
                            break;
                        }
                    }

                    break;
                }
                
                case "food":
                case "drink":
                case "consume":
                case "drop": 
                case "use": {

                    switch(itemType) {

                        case "property-key":
                        case "vehicle-key": {

                            const isProperty = itemType == "property-key";
                            const place = await client.db[`getMember${isProperty ? "Property" : "CG"}`](interaction.guildId, interaction.member.id, item[3]);
                            if(!place) return modalCollector.reply({ embeds: [errorEmbed(t("no_place", { place: t(isProperty ? "properties" : "cg", false, "global") }, "errors"), true)], components: [], files: [] })

                            if(place[isProperty ? "owner_id" : "user_id"] == interaction.member.id) await client.db[`delete${isProperty ? "Property" : "CG"}`](interaction.guildId, place[isProperty ? "id" : "license_plate"]);
                            else await client.db.setDoubleKeys(interaction.guildId, place.id, isProperty ? "estates" : "member_cg", place.authorized_members.replace(`${interaction.member.id},`, "").replace(`,${interaction.member.id}`, "").replace(interaction.member.id, ""));

                            break;

                        }
                        
                        case "cash_money":
                        case "dirty_money": {

                            const newMemberAccount = await client.db.getMoney(interaction.guildId, interaction.member.id);
                            if(newMemberAccount[itemType] < modalQuantity) return modalCollector.reply({ embeds: [errorEmbed(t(`not_enough_${itemType}`, { amount: `${separate(newMemberAccount[itemType])}${economySymbol}`, symbol: economySymbol }, "errors"), true)], components: [], files: [] })

                            await client.db.addMoney(interaction.guildId, interaction.member.id, itemType, -modalQuantity);
                            break;
                        }
                        
                        case "items": {

                            const newMemberItems = await client.db.getMemberItems(interaction.guildId, interaction.member.id);
                            const findItem = newMemberItems.find(i => i.id == item[3]);
                            if(!findItem || (findItem?.quantity ?? 0) < modalQuantity) return modalCollector.reply({ embeds: [errorEmbed(t(`not_enough`, { place: i.customId == "retrieve" ? t("words.hide", false, "global") : t("words.inventory", false, "global"), modalQuantity: `${modalQuantity.toLocaleString(lang)} item${modalQuantity > 1 ? "s" : ""}`, name: name, quantity: findItem?.quantity?.toLocaleString(lang) ?? 0 }), true)], components: [], files: [] })

                            await client.db.removeMemberItem(interaction.guildId, interaction.member.id, item[3], modalQuantity, modalQuantity == quantity && hidden_quantity == 0);
                            if(role_add && modalQuantity == quantity && hidden_quantity == 0 && isPremium) (await interaction.member.roles.remove(role_add))
                            
                            const state = await client.db.getMemberState(interaction.guildId, interaction.member.id);
                            if(["food", "drink"].includes(i.customId) && state[`${i.customId == "food" ? "hunger" : "thirst"}`] < 100) {
                                
                                let hungerQuantity = state.hunger + ((findItem[`hunger_add`] ?? 0) * modalQuantity)
                                let thirstQuantity = state.thirst + ((findItem[`thirst_add`] ?? 0) * modalQuantity)

                                if(hungerQuantity > 100) hungerQuantity = 100
                                if(thirstQuantity > 100) thirstQuantity = 100

                                await client.db.setState(interaction.guildId, interaction.member.id, hungerQuantity, thirstQuantity);
                                
                                const newState = await client.db.getMemberState(interaction.guildId, interaction.member.id);
                                if(newState[i.customId == "food" ? "hunger" : "drink"] > 25) {
                                   if(newState[i.customId == "food" ? "hunger" : "drink"] > 50) await client.db.updateMemberStateAlert(interaction.guildId, interaction.member.id, `${i.customId == "food" ? `hunger` : "thirst"}.very.alert`, 0);
                                   await client.db.updateMemberStateAlert(interaction.guildId, interaction.member.id, `${i.customId == "food" ? `hunger` : "thirst"}.alert`, 0);
                                }
                            }
                            
                            break;
                        }

                        case "drugs": {

                            const newMemberDrugs = await client.db.getMemberDrugs(interaction.guildId, interaction.member.id);
                            const drug = newMemberDrugs.find(i => i.drug_id == drugId);
                            if(!drug || (drug?.[drugType] ?? 0) < modalQuantity) return modalCollector.reply({ embeds: [errorEmbed(t(`not_enough`, { place: i.customId == "retrieve" ? t("words.hide", false, "global") : t("words.inventory", false, "global"), modalQuantity: `${modalQuantity.toLocaleString(lang)}g`, name: name, quantity: `${drug?.quantity?.toLocaleString(lang) ?? 0}g` }), true)], components: [], files: [] })

                            const deleteDrug = modalQuantity == quantity && otherQuantity == 0 && drug[`hidden_${drugType}`] == 0 && drug[`hidden_${otherType}`] == 0;
                            await client.db.removeMemberDrug(interaction.guildId, interaction.member.id, drugId, drugType, modalQuantity, deleteDrug)

                            if(i.customId == "consume") {

                                const effectTime = await client.db.getDrugEffectTime(interaction.guildId, drugId) ?? 2400000; // 2400000 milliseconds = 40 min
                                const endDate = client.dayjs().add(effectTime, "milliseconds").toDate();

                                await client.db.addDrugConsumptions(interaction.guildId, interaction.member.id, name.replaceAll(t("drugs.untreated", { drugName: "" }, "global"), "").replaceAll(t("drugs.treated", { drugName: "" }, "global"), ""), modalQuantity, endDate);

                            }

                            break;
                        }
                    }
                    
                    break;
                }
                
                case `hide`: 
                case "retrieve": {
                    
                    switch(itemType) {

                        case "dirty_money":
                        case "cash_money": {

                            const memberAccount = await client.db.getMoney(interaction.guildId, interaction.member.id);
                            if(memberAccount[`${i.customId == "retrieve" ? "hidden_" : ""}${itemType}`] < modalQuantity) return modalCollector.reply({ embeds: [errorEmbed(t(`not_enough_${itemType}`, { amount: separate(memberAccount[`${collector.customId == "retrieve" ? "hidden_" : ""}${itemType}`]), symbol: economySymbol }, "errors"), true)], components: [], files: [] })
                            if(memberAccount[`${i.customId == "retrieve" ? "hidden_" : ""}${itemType}`] + modalQuantity >= 2147483647) return modalCollector.reply({ embeds: [errorEmbed(t("int_passing", { name: name }, "errors"), true)], components: [], files: [] })
                            
                            await client.db.addMoney(interaction.guildId, interaction.member.id, itemType, i.customId == "hide" ? -modalQuantity : modalQuantity)
                            await client.db.addMoney(interaction.guildId, interaction.member.id, `hidden_${itemType}`, i.customId == "hide" ? modalQuantity : -modalQuantity)
                            
                            break;
                        }

                        case "items": {

                            const newMemberItems = await client.db.getMemberItems(interaction.guildId, interaction.member.id);
                            const findItem = newMemberItems.find(i => i.id == item[3]);
                            if(!findItem || (findItem?.[i.customId == "retrieve" ? "hidden_quantity" : "quantity"] ?? 0) < modalQuantity) return modalCollector.reply({ embeds: [errorEmbed(t(`not_enough`, { place: i.customId == "retrieve" ? t("words.hide", false, "global") : t("words.inventory", false, "global"), modalQuantity: `${modalQuantity.toLocaleString(lang)} item${modalQuantity > 1 ? "s" : ""}`, name: name, quantity: findItem?.quantity?.toLocaleString(lang) ?? 0 }), true)], components: [], files: [] })

                            let inventoryWeight = newMemberItems.reduce((a, b) => a + (b.weight * b.quantity), 0) + (await client.db.getMemberDrugs(interaction.guildId, interaction.member.id)).reduce((a, b) => a + ((b?.untreated ?? 0) + (b?.treated ?? 0)), 0);
                            if(i.customId == "retrieve" && maxWeight && weight + inventoryWeight > maxWeight) return modalCollector.reply({ embeds: [errorEmbed(t("inventory_full", { item: name }, "errors"), true)], components: [], files: [] })
                            
                            await client.db[`${i.customId}MemberItem`](interaction.guildId, interaction.member.id, parseInt(item[3]), modalQuantity);
                            
                            break;
                        }

                        case "drugs": {
                            
                            const newMemberDrugs = await client.db.getMemberDrugs(interaction.guildId, interaction.member.id);
                            const drug = newMemberDrugs.find(i => i.drug_id == drugId);
                            if(!drug || (drug[`${i.customId == "retrieve" ? "hidden_" : ""}${drugType}`] ?? 0) < modalQuantity) return modalCollector.reply({ embeds: [errorEmbed(t(`not_enough`, { place: i.customId == "retrieve" ? t("words.hide", false, "global") : t("words.inventory", false, "global"), modalQuantity: `${modalQuantity.toLocaleString(lang)}g`, name: name, quantity: `${drug?.[drugType]?.toLocaleString(lang) ?? 0}g` }), true)], components: [], files: [] })

                            await client.db[`${i.customId}MemberDrug`](interaction.guildId, interaction.member.id, drugId, drugType, modalQuantity);
                            break;

                        }

                    }
                    
                    break;

                }
                
            }

            return modalCollector.update({ embeds: [successEmbed(t(i.customId, { quantity: `${separate(modalQuantity ?? 0)}${itemType.endsWith("_money") ? `${economySymbol} ${lang == "fr" ? "**d'**" : "**of **"}` : itemType == "drugs" ? lang == "fr" ? "g** de**" : "g** of**" : ""}`, name: `${itemType.endsWith("_money") ? `${name.replace("A", "a")}` : ` ${name}`}`, member: i.customId == "sm" ? `<@${i.values[0]}>` : "" }), true)], components: [], files: [] }).catch(() => {});
        
        });

        collector.on("end", async() => {
            return interaction.editReply({ components: [] }).catch(() => {})
        })

        } catch (err) {
            console.error(err);
            client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
    },

    runAutocomplete: async(client, interaction, { t, economySymbol }) => {

        const focusedOption = interaction.options.getFocused(true);
        let response = [];
        
        const { hidden_cash_money, cash_money, hidden_dirty_money, dirty_money } = await client.db.getMoney(interaction.guildId, interaction.member.id);
        if (hidden_cash_money > 0 || cash_money > 0) response.push({ name: t("cash_money"), value: `${code}&#46;cash_money&#46;${cash_money}&#46;${hidden_cash_money}`, quantity: cash_money + hidden_cash_money });
        if (hidden_dirty_money > 0 || dirty_money > 0) response.push({ name: t("dirty_money"), value: `${code}&#46;dirty_money&#46;${dirty_money}&#46;${hidden_dirty_money}`, quantity: dirty_money + hidden_dirty_money });
        
        const drugs = (await client.db.getMemberDrugs(interaction.guildId, interaction.member.id)).sort((a, b) => a.name.localeCompare(b.name))
        for (let drug of drugs) {
            if(drug?.treated > 0 || drug?.hidden_treated > 0) response.push(({ name: t("drugs.treated", { drugName: drug.name }, "global"), value: `${code}&#46;drugs&#46;${drug.treated}&#46;${drug.drug_id}&#46;treated&#46;${drug.name}`, quantity: (drug?.treated ?? 0) + (drug?.hidden_treated ?? 0) }) )
            if(drug?.untreated > 0 || drug?.hidden_untreated > 0) response.push(({ name: t("drugs.untreated", { drugName: drug.name }, "global"), value: `${code}&#46;drugs&#46;${drug.untreated}&#46;${drug.drug_id}&#46;untreated&#46;${drug.name}`, quantity: (drug?.untreated ?? 0) + (drug?.hidden_untreated ?? 0) }) )
        }

        const properties = await client.db.getMemberProperties(interaction.guildId, interaction.member.id)
        const vehicles = await client.db.getMemberCG(interaction.guildId, interaction.member.id)

        for(const property of properties) response.push(({ name: `${t("words.key", false, "global")} ${property.name}`, value: `${code}&#46;property-key&#46;1&#46;${property.id}&#46;${t("words.key", false, "global")} ${property.name}`, quantity: 1 }))
        for(const vehicle of vehicles) response.push(({ name: `${t("words.key", false, "global")} ${vehicle.vehicule_name}`, value: `${code}&#46;vehicle-key&#46;1&#46;${vehicle.id}&#46;${t("words.key", false, "global")} ${vehicle.vehicule_name}`, quantity: 1 }))

        response.push(...((await client.db.getMemberItems(interaction.guildId, interaction.member.id)).sort((a, b) => a.name.localeCompare(b.name)).map(i => ({ name: i.name, value: `${code}&#46;items&#46;${i.quantity}&#46;${i.id}&#46;${i.name}`, quantity: (i?.quantity ?? 0) + (i?.hidden_quantity ?? 0) }))))

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

        await interaction.respond(filtered.slice(0, 25).map(i => {
            const value = i.value.split("&#46;");
            const type = value[1];
            return { name: `[${i.quantity}${type == "drugs" ? "g" : type.endsWith("_money") ? economySymbol : ""}] ・ ${i.name}`, value: i.value }
        } )).catch(() => {});

    }
}
