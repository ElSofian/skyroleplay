const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

const code = Math.floor(Math.random() * 9000000000) + 1000000000
module.exports = {
    category: { "en": "roleplay", "fr": "roleplay" },
    name: "saisir",
    nameLocalizations: {
        "fr": "saisir",
        "en-GB": "seize",
        "en-US": "seize"
    },
    description: "Saisis les drogues et l'argent sale d'un inventaire.",
    descriptionLocalizations: {
        "fr": "Saisis les drogues et l'argent sale d'un inventaire.",
        "en-GB": "Seize drugs and dirty money from an inventory.",
        "en-US": "Seize drugs and dirty money from an inventory."
    },
    options: [
        {
            name: "joueur",
            nameLocalizations: {
                "fr": "joueur",
                "en-GB": "player",
                "en-US": "player"
            },
            description: "Mentionnez le joueur dont vous voulez saisir les drogues et l'argent sale.",
            descriptionLocalizations: {
                "fr": "Mentionnez le joueur dont vous voulez saisir les drogues et l'argent sale.",
                "en-GB": "Mention the player whose drugs and dirty money you want to seize.",
                "en-US": "Mention the player whose drugs and dirty money you want to seize."
            },
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "saisie",
            nameLocalizations: {
                "fr": "saisie",
                "en-GB": "seizure",
                "en-US": "seizure"
            },
            description: "Choisissez la saisie.",
            descriptionLocalizations: {
                "fr": "Choisissez la saisie.",
                "en-GB": "Choose the seizure.",
                "en-US": "Choose the seizure."
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
            description: "Spécifiez la quantité de la saisie que vous voulez saisir.",
            descriptionLocalizations: {
                "fr": "Spécifiez la quantité de la saisie que vous voulez saisir.",
                "en-GB": "Specify the quantity of the seizure you want to seize.",
                "en-US": "Specify the quantity of the seizure you want to seize."
            },
            type: ApplicationCommandOptionType.Number,
            required: false
        }
    ],
    run: async(client, interaction, { t, errorEmbed, verify, lang, economySymbol, isPremium }) => {

        try {

        if (verify("member", { cantBotInclued: true })) return;

        if (!(interaction.options.getString("saisie") ?? `${code}`).startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == 'fr' ? "saisie" : "seizure" }, "errors"));

        const member = interaction.options.getMember("joueur");
        const item = interaction.options.getString("saisie").split("&#46;")
        const itemType = item[1]
        const itemId = item[itemType == "drugs" ? 3 : 2]
        const itemName = item[itemType == "drugs" ? 4 : 3]
        let quantity = interaction.options.getNumber("quantité")
        
        let type;
        switch(itemType) {

            case "drugs": {

                const drug = await client.db.getMemberDrugs(interaction.guildId, member.user.id, itemId);
                type = item[2]
                const otherType = type == "untreated" ? "treated" : "untreated";
    
                if (!quantity || quantity > drug[type]) quantity = drug[type];
                if (drug[type] >= 2147483647) return errorEmbed(t("int_passing", { name: itemName }, "errors"));
    
                await client.db.removeMemberDrug(interaction.guildId, member.user.id, drug.drug_id, type, quantity, drug[otherType] == 0 && quantity == drug[type]);
                await client.db.addMemberDrug(interaction.guildId, interaction.member.id, itemId, type, quantity);
                break;

            }


            case "cash_money":
            case "dirty_money": {

                const { cash_money, dirty_money } = await client.db.getMoney(interaction.guildId, member.id)
                const money = itemType == "cash_money" ? cash_money : dirty_money;
                if (!quantity || quantity > money) quantity = money;

                if (money + quantity >= 2147483647) return errorEmbed(t("int_passing", { name: itemName }, "errors"));
                
                await client.db.addMoney(interaction.guildId, member.user.id, itemType, -quantity);
                await client.db.addMoney(interaction.guildId, interaction.member.id, itemType, quantity);
                break;

            }


            case "id_card":
            case "fake_id_card": {

                const fake = itemType.startsWith("fake") ? true : false;
                quantity = 1;
                
                await client.db.takeIDCard(interaction.guildId, member.user.id, fake);
                break;

            }


            default:
            case "items": {

                var findItem = await client.db.getShopItem(interaction.guildId, itemId, true);
                if (!findItem) return errorEmbed(t("item_not_found", { name: itemName }));
                
                const memberItem = await client.db.getMemberItem(interaction.guildId, member.id, findItem.id);
                if (!memberItem) return errorEmbed(t("member_no_item", { member: member.toString(), item: findItem.name }));
                if (quantity >= 2147483647) return errorEmbed(t("int_passing", { name: findItem.name }, "errors"))

                if (!quantity || quantity > memberItem.quantity) quantity = memberItem.quantity
                if (findItem.role_add && findItem.quantity == quantity && isPremium) await member.roles.remove(findItem.role_add);
                if (findItem.role_add && !interaction.member.roles.cache.has(findItem.role_required)) return errorEmbed(t("role_required", { role: findItem.role_required, item: findItem.name }, "errors"))
                if (findItem.role_add && isPremium) await interaction.member.roles.add(findItem.role_add).catch(() => errorEmbed(t("cant_give_role", { role: findItem.role_add.toString() }, "errors")))
                if (findItem.role_remove && isPremium) await interaction.member.roles.remove(findItem.role_remove).catch(() => errorEmbed(t("cant_remove_role", { role: findItem.role_remove.toString() }, "errors")))


                await client.db.addMemberItem(interaction.guildId, interaction.member.id, itemId, quantity, findItem?.name);
                await client.db.removeMemberItem(interaction.guildId, member.id, findItem.id, quantity, memberItem.quantity == quantity);
                break;

            }


        }

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle(t("frisk_embed.title"))
            .setDescription(t("frisk_embed.description", { member: member.toString(), quantity: `${quantity}${itemType.includes("money") ? `${economySymbol} ${lang == 'fr' ? "**d'**" : "**of **"}` : ""}${itemType == "drugs" ? "g" : ""}`, name: `${itemType.includes("money") ? "" : " "}${itemName}` }))
            .setTimestamp();


        await interaction.reply({ embeds: [embed] }).catch(() => {})



        // Logs
        const logsEmbed = new EmbedBuilder()
            .setTitle(t("logs_embed.title"))
            .addFields([
                { name: "Agent :", value: t("logs_embed.fields.field1.value", { user: interaction.user.toString(), id: interaction.user.id }), inline: true },
                { name: t("logs_embed.fields.field2.name"), value: t("logs_embed.fields.field2.value", { member: member.toString(), id: member.id }), inline: true },
                { name: t("logs_embed.fields.field3.name"), value: itemType == "dirty_money" ? `${quantity}${economySymbol} ${t("dirty_money")}` : `${quantity}${itemType == "drugs" ? "g" : ""} ${itemName}` }
            ])
            .setThumbnail(interaction.user.displayAvatarURL());
            
        client.functions.logs.send(interaction, logsEmbed, "info");


        } catch (err) {
            console.error(err);

            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
    },

    runAutocomplete: async(client, interaction, { t, economySymbol }) => {

        const focusedOption = interaction.options.getFocused(true)
        const response = [];

        const memberId = interaction.options._hoistedOptions[0].value;
        const { cash_money, dirty_money } = await client.db.getMoney(interaction.guildId, memberId);
        if (cash_money > 0) response.push({ id: null, name: t("cash_money"), quantity: cash_money, type: "cash_money" })
        if (dirty_money > 0) response.push({ id: null, name: t("dirty_money"), quantity: dirty_money, type: "dirty_money" })

        const drugs = (await client.db.getMemberDrugs(interaction.guildId, memberId)).sort((a, b) => a.name.localeCompare(b.name))
        for (const drug of drugs) {
            if (drug.untreated > 0) response.push({ id: drug.drug_id, name: t("drugs.untreated", { drugName: drug.name }, "global"), quantity: drug.untreated, type: "drugs&#46;untreated" })
            if (drug.treated > 0) response.push({ id: drug.drug_id, name: t("drugs.treated", { drugName: drug.name }, "global"), quantity: drug.treated, type: "drugs&#46;treated" })
        }

        const idCards = [await client.db.getIDCard(interaction.guildId, memberId), await client.db.getIDCard(interaction.guildId, memberId, true)]
        if (idCards[0] && idCards[0].taken !== 1) response.push({ id: null, name: t("id_card"), quantity: `${idCards[0].first_name} ${idCards[0].last_name}`, type: "id_card" })
        if (idCards[1] && idCards[1].taken !== 1) response.push({ id: null, name: t("id_card"), quantity: `${idCards[1].first_name} ${idCards[1].last_name}`, type: "fake_id_card" })

        response.push(...(await client.db.getMemberItems(interaction.guildId, memberId)).sort((a, b) => a.name.localeCompare(b.name)).map(item => ({ id: item.id, name: item.name, quantity: item.quantity, type: "items" })));

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

        return interaction.respond(filtered.filter(i => typeof i.quantity == "string" ? i.quantity : i.quantity > 0).slice(0, 25).map(i => ({ name: `${i.type !== "safes" ? `[${i.quantity}${i.type.includes("money") ? economySymbol : i.type.includes("drugs") ? "g" : ""}]・ ` : ""}${i.name.split("&#46;")[0]}`, value: `${code}&#46;${i.type}&#46;${i.id}&#46;${i.name}` }) ))

    }
};
