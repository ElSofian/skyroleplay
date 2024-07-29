const { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ApplicationCommandOptionType } = require("discord.js");
const { Canvas, loadImage, loadFont } = require("canvas-constructor/napi-rs");
const { resolve, join } = require("node:path");

module.exports = {
    category: { "en": "player", "fr": "joueur" },
    name: "inventaire",
    nameLocalizations: {
        "fr": "inventaire",
        "en-GB": "inventory",
        "en-US": "inventory"
    },
    description: "Affiche l'inventaire d'un joueur.",
    descriptionLocalizations: {
        "fr": "Affiche l'inventaire d'un joueur.",
        "en-GB": "Displays a player's inventory.",
        "en-US": "Displays a player's inventory."
    },
    options: [{
        name: "joueur",
        nameLocalizations: {
            "fr": "joueur",
            "en-GB": "player",
            "en-US": "player"
        },
        description: "Mentionnez le joueur à qui afficher l'inventaire.",
        descriptionLocalizations: {
            "fr": "Mentionnez le joueur à qui afficher l'inventaire.",
            "en-GB": "Mention the player whose inventory you want to display.",
            "en-US": "Mention the player whose inventory you want to display."
        },
        type: ApplicationCommandOptionType.User,
        required: false
    }],
    run: async(client, interaction, { t, errorEmbed, verify, lang, separate, economySymbol }) => {

        try {

        await interaction?.deferReply().catch(() => {});

        const member = interaction.options.getMember("joueur") || interaction.member;
        if (verify("member", { cantBotInclued: true })) return;
        const own = member.id === interaction.user.id;
        
        const [inventory, getID, getFakeID, driverLicence, weaponLicence, licensePlate, cash_money, memberDM, drugs, properties, vehicles, max_weight] = await Promise.all([
            client.db.getMemberItems(interaction.guildId, member.user.id),
            client.db.getIDCard(interaction.guildId, member.user.id),
            client.db.getIDCard(interaction.guildId, member.user.id, true),
            client.db.getDriverLicense(interaction.guildId, member.user.id),
            client.db.getWeaponLicense(interaction.guildId, member.user.id),
            client.db.getMemberCG(interaction.guildId, member.user.id),
            client.db.getCashMoney(interaction.guildId, member.user.id),
            client.db.getDirtyMoney(interaction.guildId, member.user.id),
            client.db.getMemberDrugs(interaction.guildId, member.user.id),
            client.db.getMemberProperties(interaction.guildId, member.user.id),
            client.db.getMemberCG(interaction.guildId, member.user.id),
            client.db.getOption(interaction.guildId, "inventory.max_weight")
        ]);

        const items = [];
        const ids = [getID, getFakeID].filter((id) => id && id.hidden == 0).length;
        if (ids) items.push({ name: t("identity_card", { s: ids > 1 ? "s" : "" }), quantity: `x${ids}`, image: "citizen-card" });

        const validDriverLicence = driverLicence.filter((lic) => lic.status === 1);
        const validWeaponLicence = weaponLicence.filter((lic) => lic.status === 1);
        const validLicensePlate = licensePlate.filter((lic) => lic.status === 0);

        if (validDriverLicence.length) items.push({ name: t("driver_licence", { s: validDriverLicence.length > 1 ? "s" : "" }), quantity: `x${validDriverLicence.length}`, image: "bank-card", weight: 0 });
        if (validWeaponLicence.length) items.push({ name: t("weapon_licence", { s: validWeaponLicence.length > 1 ? "s" : "" }), quantity: `x${validWeaponLicence.length}`, image: "certificate", weight: 0 });
        if (validLicensePlate.length) items.push({ name: t("license_plate", { s: validLicensePlate.length > 1 ? "s" : "" }), quantity: `x${validLicensePlate.length}`, image: "license-plate", weight: 0 });
        
        for (const drug of drugs) ["untreated", "treated"].forEach(type => { if (drug[type] > 0) items.push({ name: t(type, { drugName: drug.name }), quantity: drug[type] >= 1000 ? `${(drug[type] / 1000).toLocaleString(lang)}kg` : `${(drug[type]).toLocaleString(lang)}g`, image: drug.image, weight: 0 }) })
        
        for(const property of properties) items.push({ name: `${t("words.key", false, "global")} ${property.name}`, quantity: `x1`, image: "key", weight: 0 });
        for(const vehicle of vehicles) items.push({ name: `${t("words.key", false, "global")} ${vehicle.vehicule_name}`, quantity: `x1`, image: "key", weight: 0 })

        for (let { name, quantity, weight, image } of inventory.sort((a, b) => a.name.localeCompare(b.name))) if (quantity > 0) items.push({ name: name, quantity: `x${quantity.toLocaleString(lang)}`, image: image, weight: weight });
        const weight = inventory.reduce((acc, val) => acc + (val.weight * val.quantity), 0) + drugs.reduce((acc, val) => acc + ((val?.untreated ?? 0) + (val?.treated ?? 0)), 0);

        const embed = new EmbedBuilder()
        .setColor(member.displayColor ?? "#ffffff")
        
        if (!own) embed.setAuthor({ name: t("main_embed.title", { name: getID ? `${getID.first_name} ${getID.last_name}` : member.displayName }), iconURL: member.displayAvatarURL({ dynamic: true }) })

        let pages = items.reduce((acc, val, i) => {
            if (i % 16 === 0) acc.push([val]);
            else acc[acc.length - 1].push(val);
            return acc;
        }, []);

        pages = pages.map((page) => page.map((val, j) => {
            let x = (j % 4) * 238;
            let y = Math.floor(j / 4) * 100 + 100;
            return { x, y, val };
        }));

        loadFont(resolve(join(__dirname, "../../assets/fonts/Poppins-Regular.ttf")), "Poppins-R");
        loadFont(resolve(join(__dirname, "../../assets/fonts/Poppins-SemiBold.ttf")), "Poppins-SB");
        
        // Function used to render a chunk (embed, select menu, and pages buttons)
        async function render(chunkItems, index, total) {

            const canvas = new Canvas(950, 500)
            .printImage(await loadImage(`assets/inventory/bg_${lang}.png`), 0, 0, 950, 500)
            .setColor("#ffffff").setTextFont("25px Poppins-SB").setTextAlign("center")
            .printText(`${separate(cash_money?.cash_money ?? 0)}${economySymbol}`, 110, 75)
            .printText(`${separate(memberDM?.dirty_money ?? 0)}${economySymbol}`, 355, 75)
            .setTextAlign(isNaN(max_weight) ? "center" : "right")
            .printText(`${weight / 1000 >= 1 ? `${Math.ceil(weight / 1000)}kg` : `${Math.ceil(weight)}g`}`, isNaN(max_weight) ? 590 : 577.5, 75)
            .setTextAlign("right")
            .printText(`${items.length}`, 805, 75)
            .setTextAlign("left")
            .setColor("#929399")
            .printText(!isNaN(max_weight) ? `/ ${max_weight / 1000 >= 1 ? `${max_weight / 1000}kg` : `${max_weight}g`}` : "", 587.5, 75)
            .printText(`item${chunkItems?.length > 1 ? "s" : ""}`, `${chunkItems?.length ?? 0}`.length > 2 ? 835 : 815, 75)

            if (chunkItems?.length > 0) {
            
                for(let itemData of chunkItems) {
                    let { x, y, val: item } = itemData;
                    canvas.setTextFont("18px Poppins-R")
                    .setColor("#929399")
                    .printWrappedText(item.name, x+5, y+25, 240)
                    .setColor("#ffffff")
                    .printText(item.quantity, x+5, y+95)
                    if (item.weight > 0) canvas.setColor("#929399").printText(`${item.weight / 1000 >= 1 ? `${item.weight / 1000}kg` : `${item.weight}g`}`, x+5, y+70)
                    if (item?.image && item?.image !== "empty") canvas.printImage(await loadImage(`assets/inventory/items_icones/${item.image}.png`), x+145, y+22.5, 80, 80)
                }

            }
            
            const attachment = new AttachmentBuilder(await canvas.pngAsync(), { name: "inventory.png" })
            embed.setImage("attachment://inventory.png")

            if (total > 1) {
                
                embed.setFooter({ text: `${index + 1}/${total}` });
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
                        .setDisabled(index + 1 === total)
                );

            }

            return {
                embeds: [embed],
                components: total > 1 ? [changeEmbedRow] : [],
                files: [attachment]
            };
        }
        //end

        const total = pages.length;
        const _render = await render(pages[0], 0, total);

        const message = await interaction.editReply({ embeds: _render.embeds, components: _render.components, files: _render.files, fetchReply: true }).catch(() => {});
        if (!message || total == 1) return; // interaction isn't edited && only one page to display

        const collector = await message.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.member.id, time: 120000 });
        if (!collector) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply")

        let current = 0;
        collector.on("collect", async (i) => {

            switch (i.customId) {
                case `previous`: {
                    current--;
                    await i.update(await render(pages[current], current, total)).catch(() => {});
                    break;
                }

                case `next`: {
                    current++;
                    await i.update(await render(pages[current], current, total)).catch(() => {});
                    break;
                }
            }

        })

        collector.on("end", (collected) => {
            return interaction.editReply({ components: [] }).catch(() => {})
        })
        

        } catch (err) {
            console.error(err);

            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    }
}
