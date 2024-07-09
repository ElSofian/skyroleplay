const { EmbedBuilder, AttachmentBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, UserSelectMenuBuilder, ApplicationCommandOptionType, time } = require("discord.js");
const { Canvas, loadImage } = require("canvas-constructor/napi-rs");

const code = Math.floor(Math.random() * 9000000000) + 1000000000
module.exports = {
    category: { "en": "player", "fr": "joueur" },
    name: "véhicule",
    nameLocalizations: {
        "fr": "véhicule",
        "en-GB": "vehicle",
        "en-US": "vehicle"
    },
    description: "Affiche un de vos véhicule.",
    descriptionLocalizations: {
        "fr": "Affiche un de vos véhicule.",
        "en-GB": "Displays one of your vehicles.",
        "en-US": "Displays one of your vehicles."
    },
    options: [{
        name: "nom",
        nameLocalizations: {
            "fr": "nom",
            "en-GB": "name",
            "en-US": "name"
        },
        description: "Le nom du véhicule.",
        descriptionLocalizations: {
            "fr": "Le nom du véhicule.",
            "en-GB": "The name of the vehicle.",
            "en-US": "The name of the vehicle."
        },
        type: ApplicationCommandOptionType.String,
        required: true,
        autocomplete: true,
    }],
    premium: true,
    run: async(client, interaction, { t, successEmbed, errorEmbed, lang, isPremium, economySymbol, separate }) => {

        try {

        if(!(interaction.options.getString("nom") ?? `${code}`).startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == 'fr' ? "nom" : "name" }, "errors"));
        
        await interaction.deferReply().catch(() => {});

        const vehicle = await client.db.getPlateCG(interaction.guildId, interaction.options.getString("nom").split("&#46;")[1]);
        if(!vehicle?.id_card && interaction.options.getString("nom").split("&#46;")[1]) {

            const idCards = [(await client.db.getIDCard(interaction.guildId, interaction.member.id)), (await client.db.getIDCard(interaction.guildId, interaction.member.id, true))].filter(i => i);
            
            if(!idCards[0] && !idCards[1]) return errorEmbed("Les cartes grises sont maintenant reliées à une carte d'identité. Créez en une pour pouvoir la relier à votre carte grise.", false, true, "editReply");

            else {

                const embed = new EmbedBuilder()
                .setColor("Green")
                .setAuthor({ name: "Nouveauté", iconURL: `${`https://cdn.discordapp.com/emojis/${`<:fete_nidev:806297831177584680>`.slice(-19, -1)}.png`}` })
                .setDescription("Maintenant les cartes grises seront reliées à une carte d'identité (pour que vous puissiez avoir une carte grise reliée à une fausse carte si vous le souhaitez).\n\nChoisissez donc ci-dessous avec quelle carte d'identité vous souhaitez relier cette carte grise.")

                const row = new ActionRowBuilder()
                if(idCards[0]) row.addComponents(new ButtonBuilder().setCustomId("real_idcard").setStyle(ButtonStyle.Secondary).setLabel(`${idCards[0].first_name} ${idCards[0].last_name}`))
                if(idCards[1]) row.addComponents(new ButtonBuilder().setCustomId("fake_idcard").setStyle(ButtonStyle.Secondary).setLabel(`${idCards[1].first_name} ${idCards[1].last_name}`))

                const message = await interaction.reply({ embeds: [embed], components: [row], ephemeral: true, fetchReply: true }).catch(() => {});
                if(!message) return

                const collector = await client.functions.other.createCollector(message, interaction, 60000, lang);
                if(!collector) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
                if(collector == "end") return;

                const isReal = collector.customId == "real_idcard";
                await client.db.setIDCardtoCG(interaction.guildId, idCards[isReal ? 0 : 1].id, interaction.options.getString("nom").split("&#46;")[1]);
                
                return collector.update({ embeds: [successEmbed(t("idcard_set", { plate: interaction.options.getString("nom").split("&#46;")[1], first_name: idCards[isReal ? 0 : 1].first_name, last_name: idCards[isReal ? 0 : 1].last_name }), true)], components: [] })
            
            }

        }

        const idCard = await client.db.getIDCardByName(interaction.guildId, vehicle?.first_name, vehicle?.last_name);
        const embed = new EmbedBuilder()
        .setColor(3092790)

        if(!vehicle.image) {

            const canvas = new Canvas(930, 500)
            .printImage(await loadImage(`./assets/member_cg/${vehicle.type}.png`), 0, 0, 930, 500)
            .setTextFont("37px Poppins")
            .setColor("#dedede")
            .printText(`${vehicle.first_name} ${vehicle.last_name}`, 120, 170)
            .printText(`${vehicle.vehicule_name} ・ ${vehicle.license_plate}`, 120, 335)
            .setTextFont("31.5px Poppins")
            .printText(vehicle.adress ?? t("no_adress"), 65, 215)
            .printText(`${t("buying_date")} : ${client.dayjs(vehicle.date).format('DD/MM/YYYY')}`, 65, 380)
            
            if(vehicle.status == 1) canvas.printImage(await loadImage(`./assets/member_cg/pound.png`), 0, 0, 930, 500)
            if(vehicle.status == 2) canvas.printImage(await loadImage(`./assets/member_cg/theft.png`), 0, 0, 930, 500)

            var attachment = new AttachmentBuilder(await canvas.pngAsync(), { name: "vehicle.png" });
            embed.setImage("attachment://vehicle.png")

        } else {

            embed
            .setTitle(vehicle.vehicule_name)
            .setThumbnail(interaction.member.displayAvatarURL())
            .setDescription(
                vehicle.user_id == interaction.member.id ?
                t("embed.description_owner", { pronouns: t(`pronouns.${idCard ? idCard.gender == 1 ? "men" : "women" : "default"}`, false, "global"), name: idCard ? ` ${idCard.last_name}` : "", localisation: vehicle.adress ? t("embed.localisation", { localisation: vehicle.adress }) : "", date: time(vehicle.date, "d") })
                : t("embed.description", { pronouns: t(`pronouns.${idCard ? idCard.gender == 1 ? "men" : "women" : "default"}`, false, "global"), name: idCard ? ` ${idCard.last_name}` : "", localisation: vehicle.adress ? t("embed.localisation", { localisation: vehicle.adress }) : "", date: time(vehicle.date, "d") })    
            )
            .setImage(vehicle.image)

        }

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
            .setDisabled(vehicle.user_id !== interaction.member.id)
        )

        const secondRows = (type = "safe", value = []) => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                .setCustomId("home")
                .setLabel(t("buttons.vehicle"))
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
            const memberInventory = (await client.db.getMemberItems(interaction.guildId, interaction.member.id)).map(i => ({ name: i.name, type: "items", quantity: i.quantity, hidden_quantity: i.hidden_quantity, id: i.id }) )
            const memberDrugs = []
            for (const drug of (await client.db.getMemberDrugs(interaction.guildId, interaction.member.id))) {
                ["untreated", "treated"].forEach(type => { if(drug[type] > 0) memberDrugs.push({ name: t(`drugs.${type}`, { drugName: drug.name }, "global"), type: `drugs&#46;${type}`, quantity: drug[type], hidden_quantity: drug[`hidden_${type}`], id: drug.drug_id })  })
            }
            const { bank_money, hidden_cash_money, hidden_dirty_money, ...memberMoney } = await client.db.getMoney(interaction.guildId, interaction.member.id);
            const memberAll = [...Object.keys(memberMoney).filter(k => memberMoney[k] > 0).map(k => ({ name: t(k), type: k, quantity: memberMoney[k], id: k })), ...memberDrugs, ...memberInventory]

            // Vehicle Inventory
            const vehicleInventory = (await client.db.getSafeVehicle(vehicle.id)).filter(i => i.id);

            const safe = []
            const { money, dirty_money } = await client.db.getPlateCG(interaction.guildId, vehicle.license_plate);
            if(money > 0) safe.push({ name: lang == "fr" ? "Argent liquide" : "Cash", type: "cash_money", quantity: money, id: "cash_money" })
            if(dirty_money > 0) safe.push({ name: lang == "fr" ? "Argent sale" : "Dirty money", type: "dirty_money", quantity: dirty_money, id: "dirty_money" })

            const safeDrugs = await client.db.getSafeVehicle(vehicle.id, true)
            for (const drug of safeDrugs) ["untreated", "treated"].forEach(type => { if(drug[type] > 0) safe.push({ name: t(`drugs.${type}`, { drugName: drug.name }, "global"), type: `drugs&#46;${type}`, quantity: drug[type], id: drug.drug_id })  })

            if(vehicleInventory.length > 0) safe.push(...(vehicleInventory.map(i => ({ name: i.name, type: "items", quantity: i.quantity, id: i.id }) )))
                       
            const safeChunks = client.functions.other.chunkArray(safe, 7)
            const chunks = client.functions.other.chunkArray(customId.includes("deposit") ? memberAll : safe, customId.includes("deposit") ? 22 : 7)

            if(safeChunks[index]?.length == 7 && customId.includes("deposit")) index++;

            if(chunks.length > 1) {
                if((customId.includes("deposit") ? indexSM : index) !== 0) display.push({ name: `${code}&#46;${lang == "fr" ? "Page précédente" : "Previous page"}&#46;previous`, quantity: 0, type: "larrow" })
                if((customId.includes("deposit") ? indexSM : index) + 1 !== chunks.length) display.push({ name: `${code}&#46;${lang == "fr" ? "Page suivante" : "Next page"}&#46;next`, quantity: 0, type: "rarrow" })
            }
            
            if(!chunks || !chunks[0] || !chunks.length) display.splice(0, (customId.includes("deposit") ? memberAll.length : safe.length) + display.length)
            else display.push(...chunks[(customId.includes("deposit") ? indexSM : index)])

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
                            display.map(item => ({ emoji: client.constants.emojis[item.type.startsWith("drugs") ? "drugs" : item.type], label: `${item.name.startsWith(`${code}`) ? item.name.split("&#46;")[1] : item.name}${item.name.startsWith(`${code}`) ? "" : ` (${item.type == "items" ? "x" : ""}${item.quantity}${item.type.endsWith("_money") ? economySymbol : item.type.startsWith("drugs") ? "g" : ""})`}`, value: item.type.endsWith("_money") ? `${item.type}&#46;${item.name}&#46;${item.quantity}` : `${item.type}&#46;${item.id}&#46;${item.name}&#46;${item.quantity}` }))
                        )
                    )

                } else displaySM = false

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
                components: displaySM ? [sm] : chunks.length > 1 ? [secondRows("safe", safe), changeEmbedRow] : [secondRows("safe", safe)],
                files: []
            }
        }

        const message = await interaction.editReply({ embeds: [embed], components: [rows], files: !vehicle.image ? [attachment] : [] }).catch(() => {});
        if(!message) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");

        const collector = message.createMessageComponentCollector({ time: 180000 });
        if(!collector) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");

        let current = 0, currentSM = 0, currentKeys = 0;
        collector.on("collect", async i => {

            if(i.user.id !== interaction.member.id) return i.reply({ embeds: [errorEmbed(t("not_your_interaction", { member: i.member.toString() }, "errors"), true)], ephemeral: true });

            switch(i.customId) {

                // GO OUT

                case "out": return collector.stop("end");

                // HOME

                case "home": i.update({ embeds: [embed], components: [rows], files: !vehicle.image ? [attachment] : [] }); break;
                

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

                    //return i.update({ embeds: [new EmbedBuilder().setColor("Green").setDescription("<:nidev_warning:1054711113675190352> Le coffre des véhicules est en cours de reproduction pour l'améliorer. Vous verrez vous n'allez pas être déçu !\n\n(PS : Vous pouvez toujours les utiliser avec la commande ``/coffre``.)")], components: [] });
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
                        .setCustomId(`modal_vehicle_dw_${code}`)
                        .setTitle(t("modal.safe"))
                        .setComponents(
                            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("quantity").setLabel(t("modal.quantity")).setPlaceholder(t("modal.quantity_placeholder")).setMinLength(1).setStyle(TextInputStyle.Short).setRequired(false))
                        )
                    
                        await i.showModal(modal).catch(() => {});
                        modalCollector = await i.awaitModalSubmit({ filter: ii => ii.user.id === i.user.id && ii.customId == `modal_vehicle_dw_${code}`, time: 60000 })
                        if(!modalCollector) return;

                    }

                    switch(itemType) {


                        case "dirty_money":
                        case "cash_money": {

                            const amount = ["tout", "all"].includes((modalCollector.fields.getTextInputValue("quantity")).toLowerCase()) || !modalCollector.fields.getTextInputValue("quantity") ? itemQuantity : parseInt(modalCollector.fields.getTextInputValue("quantity"));

                            const newVehicleSafeMoney = await client.db.getPlateCG(interaction.guildId, interaction.options.getString("nom").split("&#46;")[1]);
                            const newMemberAccount = await client.db.getMoney(interaction.guildId, i.user.id);
                            const newQuantity = (i.customId == "sm_deposit" ? newMemberAccount : newVehicleSafeMoney)[i.customId == "sm_deposit" ? itemType : itemType.replace("cash_", "")]
                            
                            if(!amount || isNaN(amount) || !newQuantity) return modalCollector.reply({ embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], components: [] }).catch(() => {})
                            if(newQuantity < amount) return modalCollector.reply({ embeds: [errorEmbed(t(`not_enough_${itemType}${i.customId == "sm_deposit" ? "_safe" : ""}`, { amount: separate(newQuantity), symbol: economySymbol }, "errors"), true)], components: [], files: [] }).catch(() => {});
                            if(amount + newQuantity >= 2147483647) return modalCollector.reply({ embeds: [errorEmbed(t("int_passing", { name: item[1] }, "errors"), true)], components: [] }).catch(() => {})

                            await client.db[`${i.customId == "sm_withdraw" ? "remove" : "add"}PlaceMoney`](interaction.guildId, "member_cg", vehicle.id, itemType == "cash_money" ? "money" : itemType, amount);
                            if(itemType == "cash_money") await client.db.addMoney(interaction.guildId, i.user.id, `cash_money`, i.customId == "sm_withdraw" ? amount : -amount);
                            else await client.db.addDirtyMoney(interaction.guildId, i.user.id, i.customId == "sm_withdraw" ? amount : -amount);

                            return modalCollector.update(await safeEmbed(i.customId, current, currentSM, true)).catch(() => {})

                        }

                        case "drugs": 
                        case "items":
                        default: {

                            const newMemberDrugs = await client.db.getMemberDrugs(interaction.guildId, i.user.id);
                            let quantity, amount, type = null;
                            
                            if(itemType == "items") {

                                const newMemberInventory = await client.db.getMemberItems(interaction.guildId, i.user.id);
                                const newVehicleInventory = await client.db.getSafeVehicle(vehicle.id);

                                var findItem = i.customId == "sm_withdraw" ? newVehicleInventory.find(i => i.name.toLowerCase() == itemName.toLowerCase()) : newMemberInventory.find(i => i.name.toLowerCase() == itemName.toLowerCase());
                                if(!findItem) return modalCollector.reply({ embeds: [errorEmbed(t("item_not_found", { item: itemName }), true)], components: [], files: [] }).catch(() => {});
                                
                                var { name, hidden_quantity, weight, role_add, role_remove, role_required } = findItem;
                                quantity = findItem.quantity
                                amount = ["tout", "all"].includes((modalCollector.fields.getTextInputValue("quantity")).toLowerCase()) || !modalCollector.fields.getTextInputValue("quantity") ? quantity : parseInt(modalCollector.fields.getTextInputValue("quantity"));

                                const maxWeight = await client.db.getOption(interaction.guildId, "inventory.max_weight");
                                const inventoryWeight = newMemberInventory.reduce((a, b) => a + (b.weight * b.quantity), 0) + newMemberDrugs.reduce((a, b) => a + ((b?.untreated ?? 0) + (b?.treated ?? 0)), 0);
            
                                if(i.customId == "sm_withdraw" && maxWeight && inventoryWeight + weight > maxWeight) return modalCollector.reply({ embeds: [errorEmbed(t("inventory_full", { item: name }, "errors"), true)], components: [] }).catch(() => {})
                                if(i.customId == "sm_withdraw" && role_add  && isPremium) await interaction.member.roles.add(role_add).catch(() => errorEmbed(t("cant_give_role", { role: role_add.toString() }, "errors"), false, false, "update", modalCollector))
                                if(i.customId == "sm_withdraw" && role_add && quantity === amount && isPremium) await interaction.member.roles.remove(role_add).catch(() => errorEmbed(t("cant_remove_role", { role: role_add.toString() }, "errors"), false, false, "update", modalCollector))
                                if(i.customId == "sm_deposit" && role_remove && isPremium) await interaction.member.roles.remove(role_remove).catch(() => errorEmbed(t("cant_remove_role", { role: role_remove.toString() }, "errors"), false, false, "update", modalCollector))
        
                            } else {

                                const newSafeDrugs = await client.db.getSafeVehicle(vehicle.id, true);

                                var drug = i.customId == "sm_withdraw" ? newSafeDrugs.find(d => d.drug_id == itemId) : newMemberDrugs.find(d => d.drug_id == itemId);
                                if(!drug) return modalCollector.reply({ embeds: [errorEmbed(t("drug_not_found", { drug: itemName }), true)], components: [], files: [] }).catch(() => {});

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
                                "vehicle",
                                vehicle.id,
                                amount,
                                itemType == "drugs" ?
                                    i.customId == "sm_deposit" ?
                                        drug.hidden_treated == 0 && drug.hidden_untreated == 0 && drug[otherType] == 0 && amount == quantity
                                        : drug[otherType] == 0 && amount == quantity
                                    : i.customId == "sm_deposit"
                                        ? amount == quantity && hidden_quantity == 0
                                        : amount == quantity
                            )
                            
                            return modalCollector.update(await safeEmbed(i.customId, current, currentSM, true)).catch(() => {})

                        }

                    } 

                }



                // MAKE AND SEE DOUBLE KEYS

                case "dk-previous":
                case "dk-next":
                case "sm_remove":
                case "sm_add":
                case "add":
                case "remove":
                case "double_keys": {

                    await interaction.guild.members.fetch();

                    async function dkEmbed(customId, current, embed = false) {
                        
                        const { authorized_members } = await client.db.getPlateCG(interaction.guildId, vehicle.license_plate);
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
              
                    const idCards = [await client.db.getIDCard(interaction.guildId, memberId), await client.db.getIDCard(interaction.guildId, memberId, true)];
                    if(idCards[1]) name = `${idCards[1].first_name} ${idCards[1].last_name} (<@${memberId}>)`
                    if(idCards[0]) name = `${idCards[0].first_name} ${idCards[0].last_name} (<@${memberId}>)`
                    
                    if(!idCards?.length) return i.update({ embeds: [errorEmbed(t("no_id_card", { memberName: `<@${memberId}>` }), true)], components: [] }).catch(() => {})

                    const { authorized_members } = await client.db.getPlateCG(interaction.guildId, vehicle.license_plate);
                    if(memberId == i.user.id) return i.update({ embeds: [errorEmbed(t("cant_double_keys_yourself"), true)], components: [] }).catch(() => {})
                    if(i.customId.includes("add") && authorized_members?.split(",").includes(memberId)) return i.update({ embeds: [errorEmbed(t("already_authorized", { memberName: name }), true)], components: [] }).catch(() => {})

                    await client.db.setDoubleKeys(interaction.guildId, vehicle.id, "member_cg", i.customId.includes("add") ? `${authorized_members ? `${authorized_members},` : ""}${memberId}` : authorized_members.replace(`,${memberId}`, "").replace(`${memberId},`, "").replace(`${memberId}`, ""));
                    return i.update(await dkEmbed(i.customId, currentKeys, true)).catch(() => {})

                }

            }

        })

        collector.on("end", (collected) => {
            return interaction.editReply({ components: [] }).catch(() => {})
        })


        } catch (err) {
            console.error(err);
            client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    },

    runAutocomplete: async(client, interaction) => {

        const emoji = (type) => {
            switch(type) {
                case "car": return "🚙";
                case "motorcycle": return "🏍️";
                case "truck": return "🚚";
                
                case "boat": return "🚤";
                case "helicopter": return "🚁";
                default: return "🪪";
            }
        }

        const focusedOption = interaction.options.getFocused(true)
        const response = (await client.db.getMemberCG(interaction.guildId, interaction.member.id)).filter(v => v && v.status !== 1).sort((a, b) => a.vehicule_name.localeCompare(b.vehicule_name))

        const filtered = [];
        if(focusedOption.value !== "") {
            const filtredArray = [];
            filtredArray.push(...response.filter(r => r.vehicule_name.toLowerCase() == focusedOption.value.toLowerCase()));
            filtredArray.push(...response.filter(r => r.vehicule_name.toLowerCase().startsWith(focusedOption.value.toLowerCase())));
            filtredArray.push(...response.filter(r => r.vehicule_name.toLowerCase().includes(focusedOption.value.toLowerCase())));

            const unique = [...new Set(filtredArray)];
            filtered.push(...unique);
        } else {
            filtered.push(...response);
        }

        await interaction.respond(filtered.slice(0, 25).map(v => ({ name: `${emoji(v.type)} ${v.vehicule_name} (${v.license_plate})`, value: `${code}&#46;${v.license_plate}` }))).catch(() => {});

    }
}
