const { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Canvas, loadImage, loadFont } = require("canvas-constructor/napi-rs");
const { resolve, join } = require("node:path");

module.exports = {
    category: { "en": "player", "fr": "joueur" },
    name: "cachette",
    nameLocalizations: {
        "fr": "cachette",
        "en-GB": "hideout",
        "en-US": "hideout"  
    },
    description: "Affiche la cachette d'un joueur.",
    descriptionLocalizations: {
        "fr": "Affiche la cachette d'un joueur.",
        "en-GB": "Displays a player's hideout.",
        "en-US": "Displays a player's hideout."
    },
    run: async(client, interaction, { t, errorEmbed, lang, separate, economySymbol }) => {

        try {

        const member = interaction.member;
        const [inventory, getID, getFakeID, bankAccount, memberDM, drugs, properties, vehicles, max_weight] = await Promise.all([
            client.db.getMemberItems(interaction.guildId, member.user.id),
            client.db.getIDCard(interaction.guildId, member.user.id),
            client.db.getIDCard(interaction.guildId, member.user.id, true),
            client.db.getCashMoney(interaction.guildId, member.user.id),
            client.db.getDirtyMoney(interaction.guildId, member.user.id),
            client.db.getMemberDrugs(interaction.guildId, member.user.id),
            client.db.getOption(interaction.guildId, "inventory.max_weight")
        ]);

        const items = [];
        if (getID?.hidden == 1) items.push({ name: `[1] ・ ${t("id_card")}`, quantity: 1, image: "citizen-card", weight: 0 });
        if (getFakeID?.hidden == 1) items.push({ name: `[1] ・ ${t("fake_id")}`, quantity: 1, image: "citizen-card", weight: 0 });
        
        for (const drug of drugs) {
            if (drug?.hidden_treated > 0) items.push(({ name: t("drugs.treated", { drugName: drug.name }, "global"), quantity: drug.hidden_treated >= 1000 ? `${(drug.hidden_treated / 1000).toLocaleString(lang)}kg` : `${(drug.hidden_treated).toLocaleString(lang)}g`, image: drug.image, weight: 0 }) )
            if (drug?.hidden_untreated > 0) items.push(({ name: t("drugs.untreated", { drugName: drug.name }, "global"), quantity: drug.hidden_untreated >= 1000 ? `${(drug.hidden_untreated / 1000).toLocaleString(lang)}kg` : `${(drug.hidden_untreated).toLocaleString(lang)}g`, image: drug.image, weight: 0 }) )
        };

        for (let { name, hidden_quantity, image, weight } of inventory) if (hidden_quantity > 0) items.push({ name: name, quantity: `x${hidden_quantity.toLocaleString(lang)}`, image: image, weight: weight });
        const weight = inventory.reduce((acc, val) => acc + (val.weight * val.hidden_quantity), 0) + drugs.reduce((acc, val) => acc + ((val?.hidden_untreated ?? 0) + (val?.hidden_treated ?? 0)), 0);

        const embed = new EmbedBuilder()
        .setColor(member.displayColor ?? "White")

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

        async function render(chunkItems, index, total) {

            const canvas = new Canvas(950, 500)
            .printImage(await loadImage(`assets/inventory/bg_${lang}.png`), 0, 0, 950, 500)
            .setColor("#ffffff").setTextFont("25px Poppins-SB").setTextAlign("center")
            .printText(`${separate(bankAccount?.hidden_cash_money ?? 0)}${economySymbol}`, 110, 75)
            .printText(`${separate(memberDM?.hidden_dirty_money ?? 0)}${economySymbol}`, 355, 75)
            .setTextAlign(isNaN(max_weight) ? "center" : "right")
            .printText(`${weight / 1000 >= 1 ? `${Math.ceil(weight / 1000)}kg` : `${Math.ceil(weight)}g`}`, isNaN(max_weight) ? 590 : 577.5, 75)
            .setTextAlign("right")
            .printText(`${items.length}`, 805, 75)
            .setTextAlign("left")
            .setColor("#929399")
            .printText(!isNaN(max_weight) ? `/ ${max_weight / 1000 >= 1 ? `${max_weight / 1000}kg` : `${max_weight}g`}` : "", 587.5, 75)
            .printText("items", `${chunkItems?.length ?? 0}`.length > 2 ? 835 : 815, 75)

            if (chunkItems?.length > 0) {
            
                for(let itemData of chunkItems) {
                    let { x, y, val: item } = itemData;
                    canvas
                    .setTextFont("18px Poppins-R")
                    .setColor("#929399")
                    .printWrappedText(item.name, x+5, y+25, 255)
                    .setColor("#ffffff")
                    .printText(item.quantity, x+5, y+95)
                    if (item.weight > 0) canvas.setColor("#929399").printText(`${item.weight / 1000 >= 1 ? `${item.weight / 1000}kg` : `${item.weight}g`}`, x+5, y+70)
                    if (item?.image && item.image !== "empty") canvas.printImage(await loadImage(`assets/inventory/items_icones/${item?.image}.png`), x+145, y+22.5, 80, 80)
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

        const total = pages.length;
        const _render = await render(pages[0], 0, total);

        const message = await interaction.reply({ embeds: _render.embeds, components: _render.components, files: _render.files, fetchReply: true, ephemeral: true }).catch(() => {});
        if (!message || total == 1) return; // interaction isn't edited && only one page to display

        const collector = message.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.user.id, time: 120000 });
        if (!collector) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");

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
        });

        
        } catch (err) {
            console.log(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    }
}
