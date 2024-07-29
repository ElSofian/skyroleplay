const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ApplicationCommandOptionType, PermissionsBitField, spoiler } = require("discord.js");

module.exports = {
    category: { "en": "illegal", "fr": "illégal" },
    name: "braquage",
    nameLocalizations: {
        "fr": "braquage",
        "en-US": "robbery",
        "en-GB": "robbery"
    },
    description: "Commence un braquage.",
    descriptionLocalizations: {
        "fr": "Commence un braquage.",
        "en-US": "Start a robbery.",
        "en-GB": "Start a robbery."
    },
    options: [{
        name: "lieu",
        nameLocalizations: {
            "fr": "lieu",
            "en-GB": "place",   
            "en-US": "place"
        },
        description: "Spécifiez le lieu du braquage.",
        descriptionLocalizations: {
            "fr": "Spécifiez le lieu du braquage.",
            "en-GB": "Specify the place of the robbery.",
            "en-US": "Specify the place of the robbery."
        },
        type: ApplicationCommandOptionType.String,
        required: true,
    }],
    cooldown: 10,
    run: async(client, interaction, { t, errorEmbed, successEmbed, lang, isPremium }) => {

        try {

        let link = client.functions.illegal.getIllegalLink(client, interaction.guildId, interaction.user.id);
        if (link) return errorEmbed(t("already_doing", { link: link }, "errors"));

        const location = interaction.options.getString("lieu");
        const embed = new EmbedBuilder()
            .setTitle(t("main_embed.title"))
            .setColor("Default")
            .setThumbnail("https://media1.tenor.com/images/ad18757e58c0ecbe0a424cb7e54e1258/tenor.gif?itemid=7640872")
            .setDescription(t("main_embed.description", { user: interaction.user.toString() }));

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("atm").setLabel(t("main_buttons.atm")).setEmoji("🏧").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("minimarket").setLabel(t("main_buttons.minimarket")).setEmoji("🏪").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("jewelery").setLabel(t("main_buttons.jewelery")).setEmoji("🏬").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("bank").setLabel(t("main_buttons.bank")).setEmoji("🏦").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("burglary").setLabel(t("main_buttons.burglary")).setEmoji("🏠").setStyle(ButtonStyle.Secondary).setDisabled(!isPremium)
        );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true }).catch(() => { })

        // Ask method
        const button = await interaction.channel.awaitMessageComponent({ max: 1,
                filter: (i) => i.isButton() && i.user.id === interaction.user.id && ["atm", "burglary", "minimarket", "jewelery", "bank"].includes(i.customId),
                time: 60000,
            })
            .catch(() => {
                row.components.forEach((component) => component.setDisabled(true));
                interaction.editReply({ embeds: [embed], components: [row] }).catch(() => {});
            });

        if (!button) return;
        const buttonCustomId = button.customId;

        link = client.functions.illegal.getIllegalLink(client, interaction.guildId, interaction.user.id);
        if (link) button.reply(errorEmbed(t("already_doing", { link: link }, "errors"), true));

        const options = await client.db.getOptions(interaction.guildId, [
            `illegal.robbery.${buttonCustomId}.min`,
            `illegal.robbery.${buttonCustomId}.max`,
            `illegal.robbery.${buttonCustomId}.time`,
            `illegal.robbery.${buttonCustomId}.maxclaim`,
            "illegal.robbery.channel",
            "illegal.robbery.claimtime",
            "economy.symbol",
            "roles.police",
        ]);


        const min = options[`illegal.robbery.${buttonCustomId}.min`],
              max = options[`illegal.robbery.${buttonCustomId}.max`],
              maxclaim = options[`illegal.robbery.${buttonCustomId}.maxclaim`],
              claimtime = options[`illegal.robbery.claimtime`],
              time = options[`illegal.robbery.${buttonCustomId}.time`];

        // Validate channel permissions
        const channel = interaction.guild.channels.cache.get(options["illegal.robbery.channel"]) ?? interaction.channel;

        if (!channel.permissionsFor(client.user.id).has(["ViewChannel", "SendMessages", "EmbedLinks"]))
            return button.update({
                embeds: [errorEmbed(t("perms_send", { channel: interaction.channel.toString() }, "errors"), true)],
                content: null,
                components: [],
            }).catch(() => { });


        let robberyType, thumbnail;
        switch (buttonCustomId) {
            case "atm": thumbnail = "https://cdn.discordapp.com/attachments/778713489144938516/813601262112210964/atm.gif"; break;
            case "burglary": thumbnail = "https://cdn.dribbble.com/users/533798/screenshots/2210893/safe.gif"; break; 
            case "minimarket": thumbnail = "https://cdn.dribbble.com/users/533798/screenshots/2210893/safe.gif"; break;
            case "jewelery": thumbnail = "https://cdn.dribbble.com/users/533798/screenshots/2210893/safe.gif"; break;
            case "bank": thumbnail = "https://cdn.dribbble.com/users/533798/screenshots/2210893/safe.gif"; break;
        }

        if (!["atm", "burglary", "minimarket", "jewelery", "bank"].includes(buttonCustomId)) console.log(`-- ERREUR Commande braquages utilisée --\n>> Id du boutton : ${buttonCustomId} <<`); // à supprimer une fois l'erreur fix : Cannot read property 'fr' of undefined
        robberyType = t(`main_buttons.${buttonCustomId}`)

        const claimed = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("claimed").setEmoji("✅").setDisabled().setLabel(t(`buttons.claim`)).setStyle(ButtonStyle.Secondary))
        const claim = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("claim").setEmoji("✅").setLabel(t(`buttons.claim`)).setStyle(ButtonStyle.Success))
        const failed = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("failed").setEmoji("⛔").setLabel(t(`buttons.failed`)).setStyle(ButtonStyle.Danger).setDisabled())

        function getEmbed(money = 0, itemsList = []){
            return new EmbedBuilder()
            .setTitle(t(buttonCustomId == "burglary" ? "start_embed.title_burglary" : `start_embed.title`, { robbery: robberyType }))
            .setThumbnail(thumbnail)
            .setDescription(t(`start_embed.description`, { user: interaction.user.toString(), location: location, money: `${money}${options["economy.symbol"]}`, items: buttonCustomId == "burglary" ? t("start_embed.burglary_items", { items: itemsList.map(e => e.name).join(", ") }) : "" }))
            .setTimestamp();
        }
       

        await channel.send({
            content: spoiler(`${interaction.guild.roles.cache.has(options["roles.police"]) ? `<@&${options["roles.police"]}>` : ""}`),
            embeds: [getEmbed()],
            components: [claimed]
        }).then(async message => {

            await button.update({
                embeds: [successEmbed(t("start_message", { link: message.url }), true)],
                components: [],
            }).catch(() => { });

            client.functions.illegal.setIllegal(client, interaction.guildId, interaction.user.id, message.url, time);

            let claims = 0;
            let amount = 0;
            let itemsQuantity = 0;
            let itemsList = [];
            let alreadyHave = [];

            async function end(successful = false) {

                // End of timeout
                client.functions.illegal.deleteIllegal(client, interaction.guildId, interaction.user.id);
                itemsList.forEach(i => itemsQuantity += i.quantity);

                if (((await client.db.getDirtyMoney(interaction.guildId, interaction.user.id))?.dirty_money ?? 0) + amount >= 2147483647) amount = 2147483646

                await client.db.addDirtyMoney(interaction.guildId, interaction.user.id, amount);
                const finalEmbed = new EmbedBuilder();
                if (successful){
                    finalEmbed
                    .setColor("Green")
                    .setTitle(t(buttonCustomId == "burglary" ? "end_embed.title_burglary.success" : `end_embed.title.success`, { robbery: robberyType }))
                    .setThumbnail("https://cdn.discordapp.com/attachments/778713489144938516/813587239711670342/voleur.gif")
                    .setDescription(t(`end_embed.description.success`, { user: interaction.user.toString(), money: `${amount.toString()}${options["economy.symbol"]}`, location: location, items: buttonCustomId == "burglary" && itemsQuantity > 0 ? t("end_embed.burglary_items", { amount: itemsQuantity, items: itemsList.map(e => e.name).join(", ") }) : "", s: itemsQuantity > 1 ? "s" : "" }))
                    .setTimestamp();
                } else {
                    finalEmbed
                    .setColor("Red")
                    .setTitle(t(buttonCustomId == "burglary" ? "end_embed.title_burglary.failure" : `end_embed.title.failure`, { robbery: robberyType }))
                    .setThumbnail("https://cdn.discordapp.com/attachments/778713489144938516/813587239711670342/voleur.gif")
                    .setDescription(t(`end_embed.description.${amount > 0 ? "failure" : "nothing"}`, { user: interaction.user.toString(), money: `${amount.toString()}${options["economy.symbol"]}`, location: location, items: buttonCustomId == "burglary" && itemsQuantity > 0 ? t("end_embed.burglary_items", { amount: itemsQuantity, items: itemsList.map(e => e.name).join(", ") }) : "", s: itemsQuantity > 1 ? "s" : "" }))
                    .setTimestamp();
                }

                await message.edit({ embeds: [finalEmbed], components: [] }).catch(() => { });

            }

            async function claim_buttons() {

                if (claims >= maxclaim) return end(true)
    
                setTimeout(async () => {
    
                    await message.edit({ components: [claim] }).catch(() => {})
                    
                    const filter = async (msg) => msg.user.id == interaction.user.id
                    await message.awaitMessageComponent({ filter, max: 1, time: claimtime, errors: ['time'] }).then(async (collected) => {
    
                        var money = client.functions.other.randomBetween(min, max)
                        let itemIsMoney;
                        const items = await client.db.getBurglaryItems(interaction.guildId)

                        if (buttonCustomId == "burglary" && items) {
                            
                            const possibilites = ["money", "items", "money", "items", "money", "items", "money", "items", "money", "items"]
                            const choice = possibilites[Math.floor(Math.random() * possibilites.length)]
                            choice == "items" && items.length !== alreadyHave.length ? itemIsMoney = false : itemIsMoney = true;
                            
                            if (!itemIsMoney && items.length !== alreadyHave.length) {
                                
                                const memberInventory = await client.db.getMemberItems(interaction.guildId, interaction.member.id)
                                const memberInventoryWeight = memberInventory.reduce((a, b) => a + (b.weight * b.quantity), 0) + (await client.db.getMemberDrugs(interaction.guildId, interaction.member.id)).reduce((a, b) => a + ((b?.untreated ?? 0) + (b?.treated ?? 0)), 0);
                                const inventoryMaxWeight = await client.db.getOption(interaction.guildId, "inventory.max_weight");
                                let item = await items[Math.floor(Math.random() * items.length)];

                                while(alreadyHave.includes(item.id) && item.weight + memberInventoryWeight < inventoryMaxWeight) {
                                    item = await items[Math.floor(Math.random() * items.length)];
                                }

                                alreadyHave.push(item.id);
                                const amountItems = client.functions.other.randomBetween(item.min, item.max)

                                if (item.max_items && (amountItems + (((memberInventory.find(i => i.id == item.id))?.quantity ?? 0) + (memberInventory.find(i => i.id == item.id))?.hidden_quantity) < item.max_items)) {
                                    await client.db.addMemberItem(interaction.guildId, interaction.member.id, item.id, amountItems);
                                    itemsList.push({ name: `${amountItems} ${item.name}`, quantity: amountItems });
                                }

                            } else { amount += money; itemIsMoney = true; }
                            
                        } else { amount += money; itemIsMoney = true; }
                        
                        collected.reply(" ").catch(() => {})
                        
                        let newRow = itemIsMoney
                        ? new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("money").setDisabled().setEmoji("💸").setStyle(ButtonStyle.Success).setLabel(`+ ${money}${options["economy.symbol"]}`))
                        : new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("item").setDisabled().setEmoji("📦").setStyle(ButtonStyle.Success).setLabel(`+ ${itemsList[itemsList.length-1].name}`))

                        
                        await message.edit({ embeds: [getEmbed(amount, itemsList)], components: [newRow] }).then(() => {
                            
                            if (claims+1 < maxclaim) setTimeout(async() => await message.edit({ components: [claimed] }).catch(() => {}), 1500)
                            
                        }).catch(() => {})
                        
                        claims++;
                        
                        return await claim_buttons()
                        
                    }).catch(async() => {
    
                        await message.edit({ components: [failed] }).catch(() => { })
                        return await end()
                    })
                }, time)
    
            }
        
            await claim_buttons()

        }).catch(() => { });


        } catch (err) {
            console.error(err);

            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    }
};
