const { ApplicationCommandOptionType } = require("discord.js");

const code = Math.floor(Math.random() * 9000000000) + 1000000000
module.exports = {
    category: { "en": "player", "fr": "joueur" },
    name: "coffre",
    nameLocalizations: {
        "fr": "coffre",
        "en-GB": "safe",
        "en-US": "safe"  
    },
    description: "Dépose ou retire un objet/de l'argent sale d'un de vos coffres.",
    descriptionLocalizations: {
        "fr": "Dépose ou retire un objet/de l'argent sale d'un de vos coffres.",
        "en-GB": "Deposits or withdraws an item/dirty money from one of your safes.",
        "en-US": "Deposits or withdraws an item/dirty money from one of your safes."
    },
    options: [
        {
            name: "déposer",
            nameLocalizations: {
                "fr": "déposer",
                "en-GB": "deposit",
                "en-US": "deposit"
            },
            description: "Dépose un objet/de l'argent sale dans un de vos coffres.",
            descriptionLocalizations: {
                "fr": "Dépose un objet/de l'argent sale dans un de vos coffres.",
                "en-GB": "Deposits an item/dirty money into one of your safes.",
                "en-US": "Deposits an item/dirty money into one of your safes."
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "coffre",
                    nameLocalizations: {
                        "fr": "coffre",
                        "en-GB": "safe",
                        "en-US": "safe"
                    },
                    description: "Le coffre dans lequel déposer l'objet/de l'argent sale.",
                    descriptionLocalizations: {
                        "fr": "Le coffre dans lequel déposer l'objet/de l'argent sale.",
                        "en-GB": "The safe in which to deposit the item/dirty money.",
                        "en-US": "The safe in which to deposit the item/dirty money."
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                },
                {
                    name: "item",
                    description: "L'item à déposer dans le coffre.",
                    descriptionLocalizations: {
                        "fr": "L'item à déposer dans le coffre.",
                        "en-GB": "The item to deposit into the safe.",
                        "en-US": "The item to deposit into the safe."
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
                        "en-US": "quantity"
                    },
                    description: "La quantité de l'item à déposer dans le coffre.",
                    descriptionLocalizations: {
                        "fr": "La quantité de l'item à déposer dans le coffre.",
                        "en-GB": "The quantity of the item to deposit into the safe.",
                        "en-US": "The quantity of the item to deposit into the safe."
                    },
                    type: ApplicationCommandOptionType.Number,
                    required: false,
                    minValue: 1
                }
            ]
        },
        {
            name: "retirer",
            nameLocalizations: {
                "fr": "retirer",
                "en-GB": "withdraw",
                "en-US": "withdraw"
            },
            description: "Retire un objet/de l'argent sale d'un de vos coffres.",
            descriptionLocalizations: {
                "fr": "Retire un objet/de l'argent sale d'un de vos coffres.",
                "en-GB": "Withdraws an item/dirty money from one of your safes.",
                "en-US": "Withdraws an item/dirty money from one of your safes."
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "coffre",
                    nameLocalizations: {
                        "fr": "coffre",
                        "en-GB": "safe",
                        "en-US": "safe"
                    },
                    description: "Le coffre dans lequel retirer l'objet/de l'argent sale.",
                    descriptionLocalizations: {
                        "fr": "Le coffre dans lequel retirer l'objet/de l'argent sale.",
                        "en-GB": "The safe in which to withdraw the item/dirty money.",
                        "en-US": "The safe in which to withdraw the item/dirty money."
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                },
                {
                    name: "item",
                    description: "L'item à retirer du coffre.",
                    descriptionLocalizations: {
                        "fr": "L'item à retirer du coffre.",
                        "en-GB": "The item to withdraw from the safe.",
                        "en-US": "The item to withdraw from the safe."
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
                        "en-US": "quantity"
                    },
                    description: "La quantité de l'item à retirer du coffre.",
                    descriptionLocalizations: {
                        "fr": "La quantité de l'item à retirer du coffre.",
                        "en-GB": "The quantity of the item to withdraw from the safe.",
                        "en-US": "The quantity of the item to withdraw from the safe."
                    },
                    type: ApplicationCommandOptionType.Number,
                    required: false,
                    minValue: 1
                }
            ]
        }
    ],
    run: async(client, interaction, { t, errorEmbed, successEmbed, economySymbol, lang, isPremium, separate }) => {

        try {

            if (!(interaction.options.getString("coffre") ?? `${code}`).startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: t("words.safe", false, "global").toLowerCase() }, "errors"));
            if (!(interaction.options.getString("item") ?? `${code}`).startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: "item" }, "errors"));
            
            const subcommand = interaction.options.getSubcommand();
            const safe = interaction.options.getString("coffre");
            const safeType = safe.split("&#46;")[1];
            const safeId = safe.split("&#46;")[2];
            const item = interaction.options.getString("item").split("&#46;")
            const itemType = item[1];
            const itemId = item[2];
            const itemName = item[itemType == "drugs" ? 5 : 3];
            const itemQuantity = item[itemType.includes("money") ? 2 : 4]
            const optionQuantity = interaction.options.getNumber("quantité");
            
            if (subcommand == "déposer" && safeType == "companies" && !isPremium) return errorEmbed(t("premium", { emoji: client.constants.emojis.premium }, "errors"));

            switch(itemType) {

                case "cash_money":
                case "dirty_money": {

                    const newMemberAccount = await client.db.getMoney(interaction.guildId, interaction.member.id);
                    const place = safeType == "cg" ? await client.db.getMemberCG(interaction.guildId, interaction.member.id, safeId) : safeType == "companies" ? await client.db.getCompany(interaction.guildId, safeId) : await client.db.getProperty(interaction.guildId, safeId);
                    const amount = optionQuantity || itemQuantity;
                    
                    if (!amount || isNaN(amount) || !itemQuantity) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"))
                    if (amount > itemQuantity) return errorEmbed(t("not_enough_money", { quantity: separate(itemQuantity), symbol: economySymbol }));
                    if (amount + (subcommand == "déposer" ? place[itemType == "cash_money" ? safeType == "companies" ? "safe_money" : "money" : "dirty_money"] : newMemberAccount[itemType]) >= 2147483647)
                    return errorEmbed(t("int_passing", { name: t(`words.${itemType}`, false, "global") }, "errors"))

                    switch(safeType) {
                        case "properties": await client.db[`${subcommand == "retirer" ? "remove" : "add"}PlaceMoney`](interaction.guildId, "estates", safeId, itemType.replace("cash_", ""), amount); break;
                        case "cg": await client.db[`${subcommand == "retirer" ? "remove" : "add"}PlaceMoney`](interaction.guildId, "member_cg", safeId, itemType.replace("cash_", ""), amount); break;
                        case "companies": await client.db[`${subcommand == "retirer" ? "remove" : "add"}CompanySafeMoney`](safeId, amount, itemType == "dirty_money"); break;
                    }

                    await client.db.addMoney(interaction.guildId, interaction.member.id, itemType, subcommand == "retirer" ? amount : -amount);
                    
                    return successEmbed(t(`${subcommand == "retirer" ? "withdraw" : "deposit"}ed_${itemType}`, { amount: separate(amount), symbol: economySymbol }))

                }

                case "drugs":
                case "items":
                default: {

                    let amount;
                    if (itemType == "items") {

                        const memberInventory = await client.db.getMemberItems(interaction.guildId, interaction.member.id);
                        const safeInventory = safeType == "cg" ? await client.db.getSafeVehicle(safeId) : safeType == "companies" ? await client.db.getCompanyInventory(safeId) : await client.db.getSafeProperty(safeId);
                        
                        var findItem = subcommand == "retirer" ? safeInventory.find(i => i.item_id == itemId) : memberInventory.find(i => i.id == itemId);
                        if (!findItem) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"));
                        
                        var { name, hidden_quantity, weight, role_add, role_remove } = findItem;

                        const shopItem = await client.db.getShopItem(interaction.guildId, itemId);
                        if (!shopItem) {
                            
                            if (subcommand == "déposer") await client.db.removeItem(interaction.guildId, interaction.member.id, itemId, quantity, true)
                            else await client.db.removeSafeItem(interaction.guildId, safeId, safeType, itemId, quantity, true)

                            return errorEmbed(t("item_no_longer_exists", { item: itemName }));
                        }

                        const maxWeight = await client.db.getOption(interaction.guildId, "inventory.max_weight");
                        const inventoryWeight = memberInventory.reduce((a, b) => a + (b.weight * b.quantity), 0) + (await client.db.getMemberDrugs(interaction.guildId, interaction.member.id)).reduce((a, b) => a + ((b?.untreated ?? 0) + (b?.treated ?? 0)), 0);

                        if (subcommand == "retirer") {
                            if (maxWeight && inventoryWeight + weight > maxWeight) return errorEmbed(t("inventory_full", { item: name }, "errors")).catch(() => {})
                            if (role_add && !interaction.member.roles.cache.has(role_add) && isPremium) await interaction.member.roles.add(role_add).catch(() => errorEmbed(t("cant_give_role", { role: role_add.toString() }, "errors")))
                            if (role_remove) await interaction.member.roles.remove(role_remove).catch(() => errorEmbed(t("cant_remove_role", { role: role_remove.toString() }, "errors")))
                        } else {
                            if (role_add && itemQuantity === amount && isPremium) await interaction.member.roles.remove(role_add).catch(() => errorEmbed(t("cant_remove_role", { role: role_add.toString() }, "errors")))
                        }

                    } else {

                        const memberDrugs = await client.db.getMemberDrugs(interaction.guildId, interaction.member.id);

                        const drugs = subcommand == "retirer" ? safeType == "cg" ? await client.db.getSafeVehicle(safeId, true) : safeType == "companies" ? await client.db.getCompanyInventory(safeId, true) : await client.db.getSafeProperty(safeId, true) : await client.db.getMemberDrugByName(interaction.guildId, interaction.member.id, itemName);
                        var drug = subcommand == "retirer" ? drugs.find(i => i.drug_id == itemId) : drugs;
                        if (!drug) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"));

                        var type = item[3]
                        var otherType = type == "untreated" ? "treated" : "untreated"
                        var drugColumn = subcommand == "retirer" ? drugs.find(i => i.drug_id == drug.drug_id) : memberDrugs.find(i => i.drug_id == drug.drug_id);
                    
                    }

                    amount = optionQuantity || itemQuantity;
                    
                    if (!amount || isNaN(amount) || !itemQuantity) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors")).catch(() => {})
                    if (amount > itemQuantity) return errorEmbed(t("not_enough_item", { quantity: (itemQuantity).toLocaleString(lang), item: itemType == "items" ? name : t(`drugs.${itemId}`, { drugName: drug.name }, "global") })).catch(() => {})
                    if (amount + itemQuantity >= 2147483647) return errorEmbed(t("int_passing", { name: itemType == "items" ? name : t(`drugs.${itemId}`, { drugName: drug.name }, "global") }, "errors")).catch(() => {})

                    switch(safeType) {
                        case "properties": await client.db[`${subcommand == "retirer" ? "withdraw" : "deposit"}Item`](interaction.guildId, interaction.member.id, itemType == "items" ? itemId : drug.drug_id, itemType, type, "estate", safeId, amount, itemType == "drugs" ? subcommand == "retirer" ? drug.hidden_treated == 0 && drug.hidden_untreated == 0 && drug[otherType] == 0 && amount == itemQuantity : drugColumn[otherType] == 0 && amount == itemQuantity : subcommand == "déposer" ? amount == itemQuantity && hidden_quantity == 0 : amount == itemQuantity); break;
                        case "cg": await client.db[`${subcommand == "retirer" ? "withdraw" : "deposit"}Item`](interaction.guildId, interaction.member.id, itemType == "items" ? itemId : drug.drug_id, itemType, type, "vehicle", safeId, amount, itemType == "drugs" ? subcommand == "retirer" ? drug.hidden_treated == 0 && drug.hidden_untreated == 0 && drug[otherType] == 0 && amount == itemQuantity : drugColumn[otherType] == 0 && amount == itemQuantity : subcommand == "déposer" ? amount == itemQuantity && hidden_quantity == 0 : amount == itemQuantity); break;
                        case "companies": await client.db[`${subcommand == "retirer" ? "take" : "put"}CompanyInventory`](interaction.guildId, safeId, itemType, itemType == "items" ? itemId : drug.drug_id, type, amount, itemType == "drugs" ? drugColumn[otherType] == 0 && amount == itemQuantity : amount == itemQuantity); break;
                    }

                    if (safeType == "companies") {
                        if (itemType == "drugs") await client.db[`${subcommand == "retirer" ? "add" : "remove"}MemberDrug`](interaction.guildId, interaction.member.id, drug.drug_id, type, amount, drug[`hidden_${itemId}`] == 0 && drug[`hidden_${otherType}`] && drugColumn[otherType] == 0 && amount == itemQuantity);
                        else await client.db[`${subcommand == "retirer" ? "add" : "remove"}MemberItem`](interaction.guildId, interaction.member.id, itemId, amount, subcommand == "retirer" ? null : hidden_quantity == 0 && amount == itemQuantity);
                    } 

                    return successEmbed(t(`${subcommand == "retirer" ? "withdraw" : "deposit"}ed`, { quantity: `${(amount).toLocaleString(lang)}${itemType == "drugs" ? lang == "fr" ? "g** de**" : "g** of**" : ""}`, item: itemName })).catch(() => {})
            

                }

            }

        
        } catch (err) {
            console.log(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    },

    runAutocomplete: async(client, interaction, { t, economySymbol, lang }) => {

        const emoji = (type) => {
            switch(type) {
                case "car": return "🚙";
                case "motorbike":
                case "motorcycle": return "🏍️";
                case "truck": return "🚚";
                case "helicopter": return "🚁";
                case "companies": return "🏬";
                case "properties": return "🏠";
                default: return "🪪";
            }
        }
        
        const focusedOption = interaction.options.getFocused(true);
        const filtered = [];
        let all = [];

        if (focusedOption.name == "coffre") {

            const properties = (await client.db.getMemberProperties(interaction.guildId, interaction.member.id)).map(p => ({ name: p.name, value: `${code}&#46;properties&#46;${p.id}` }))
            const cg = (await client.db.getMemberCG(interaction.guildId, interaction.member.id)).map(cg => ({ name: cg.vehicule_name, value: `${code}&#46;cg&#46;${cg.id}&#46;${cg.license_plate}&#46;${cg.type}` }))
            const companies = (await client.db.getMemberCompanies(interaction.guildId, interaction.member.id)).map(c => ({ name: c.name, value: `${code}&#46;companies&#46;${c.id}` }))

            all.push(...properties.sort((a, b) => a.name.localeCompare(b.name)), ...cg.sort((a, b) => a.name.localeCompare(b.vehicule_name)), ...companies.sort((a, b) => a.name.localeCompare(b.name)));

        } else {

            if (interaction.options._subcommand == "déposer") {
        
                const { cash_money, dirty_money } = await client.db.getMoney(interaction.guildId, interaction.member.id);
                if (cash_money > 0) all.push({ name: t("cash_money"), value: `${code}&#46;cash_money&#46;${cash_money}&#46;${t("cash_money")}` })
                if (dirty_money > 0) all.push({ name: t("dirty_money"), value: `${code}&#46;dirty_money&#46;${dirty_money}&#46;${t("dirty_money")}` })
                
                const drugs = (await client.db.getMemberDrugs(interaction.guildId, interaction.member.id)).sort((a, b) => a.name.localeCompare(b.name))
                for (let drug of drugs) {
                    if (drug.treated > 0) all.push({ name: t("drugs.treated", { drugName: drug.name }, "global"), value: `${code}&#46;drugs&#46;${drug.drug_id}&#46;treated&#46;${drug.treated}&#46;${drug.name}` })
                    if (drug.untreated > 0) all.push({ name: t("drugs.untreated", { drugName: drug.name }, "global"), value: `${code}&#46;drugs&#46;${drug.drug_id}&#46;untreated&#46;${drug.untreated}&#46;${drug.name}` })
                }
                
                all.push(...(await client.db.getMemberItems(interaction.guildId, interaction.member.id)).sort((a, b) => a.name.localeCompare(b.name)).map(i => ({ name: i.name, value: `${code}&#46;items&#46;${i.id}&#46;${i.name}&#46;${i.quantity}` }) ));

            } else {

                const safeType = interaction.options._hoistedOptions[0].value.split("&#46;")[1];
                const safeId = interaction.options._hoistedOptions[0].value.split("&#46;")[2];

                const safe = (await client.db[safeType == "cg" ? "getMemberCG" : safeType == "companies" ? "getCompany" : "getProperty"](interaction.guildId, safeType == "cg" ? interaction.member.id : safeId, safeId))
                const items = (await client.db[safeType == "cg" ? "getSafeVehicle" : safeType == "companies" ? "getCompanyInventory" : "getSafeProperty"](safeId)).sort((a, b) => a.name.localeCompare(b.name))
                const drugs = (await client.db[safeType == "cg" ? "getSafeVehicle" : safeType == "companies" ? "getCompanyInventory" : "getSafeProperty"](safeId, true)).sort((a, b) => a.name.localeCompare(b.name))

                if (safe?.[safeType == "companies" ? "safe_money" : "money"] > 0) all.push({ name: t("cash_money"), value: `${code}&#46;cash_money&#46;${safe?.[safeType == "companies" ? "safe_money" : "money"]}&#46;${t("cash_money")}` })
                if (safe?.dirty_money > 0) all.push({  name: t("dirty_money"), value: `${code}&#46;dirty_money&#46;${safe.dirty_money}&#46;${t("dirty_money")}`  })
                
                for (const drug of drugs) {
                    ["untreated", "treated"].forEach(type => { if (drug[type] > 0) all.push({ name: t(`drugs.${type}`, { drugName: drug.name }, "global"), value: `${code}&#46;drugs&#46;${drug.drug_id}&#46;${type}&#46;${drug[type]}&#46;${drug.name}` }) })
                }

                all.push(...items.map(i => ({ name: i.name, value: `${code}&#46;items&#46;${safeType == "companies" ? i.item_id : i.id}&#46;${i.name}&#46;${i.quantity}` })));

            }

        }

        if (focusedOption.value !== "") {
            const filteredArray = [];
            filteredArray.push(...all.filter(r => r.name.toLowerCase() == focusedOption.value.toLowerCase()));
            filteredArray.push(...all.filter(r => (r.name.toLowerCase()).startsWith(focusedOption.value.toLowerCase())));
            filteredArray.push(...all.filter(r => (r.name.toLowerCase()).includes(focusedOption.value.toLowerCase())));

            const unique = [...new Set(filteredArray)];
            filtered.push(...unique)
        } else {
            filtered.push(...all)
        }

        return interaction.respond(filtered.slice(0, 25).map(v => {
            const value = v.value.split("&#46;");
            const type = value[1];
            if (["properties", "companies", "cg"].includes(type)) return { name: `${emoji(value[4] ?? type)} ${v.name}${type == "cg" ? ` (${value[3]})` : ""}`, value: v.value }
            else return { name: `[${value[type.includes("money") ? 2 : 4]}${type == "drugs" ? "g" : type.endsWith("_money") ? economySymbol : ""}] ・ ${v.name}`, value: v.value }

        })).catch(() => {});
        
    }
}
