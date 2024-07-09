const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Canvas, loadImage, loadFont } = require("canvas-constructor/napi-rs");
const { resolve, join } = require("node:path");
loadFont(resolve(join(__dirname, "../../assets/fonts/Poppins-Regular.ttf")), "Poppins");
loadFont(resolve(join(__dirname, "../../assets/fonts/Poppins-Bold.ttf")), "PoppinsB");

module.exports = {
    category: { "en": "roleplay", "fr": "roleplay" },
    name: "bourse",
    nameLocalizations: {
        "fr": "bourse",
        "en-GB": "stock-exchange",
        "en-US": "stock-exchange"
    },
    description: "Affiche la bourse et permet d'investir.",
    descriptionLocalizations: {
        "fr": "Affiche la bourse et permet d'investir.",
        "en-GB": "Display the stock exchange and allow you to invest.",
        "en-US": "Display the stock exchange and allow you to invest."
    },
    run: async(client, interaction, { t, errorEmbed, successEmbed, overdraftLimit, economySymbol, lang, separate }) => {

        try {
            
        await interaction.deferReply().catch(() => {});

        const cryptos = client.cryptos;
        if(!cryptos.length) return errorEmbed(t("updating_crpytos"), false, true, "editReply");

        const memberCryptos = await client.db.getMemberCryptos(interaction.guildId, interaction.member.id);
        const memberAccount = await client.db.getBankAccount(interaction.guildId, interaction.member.id);
        if(!memberAccount?.id) return errorEmbed(t("no_bank_account", false, "errors"), false, true, "editReply");

        const render = async(customId) => {
        
            const memberAccount = await client.db.getBankAccount(interaction.guildId, interaction.member.id);
            if(!memberAccount?.id) return errorEmbed(t("no_bank_account", false, "errors"), false, true, "editReply");

            const canvas = new Canvas(customId == "funds" ? 930 : 500, customId == "funds" ? 500 : 980)
            .printImage(await loadImage(`assets/bourse/${customId}.png`), 0, 0, customId == "funds" ? 930 : 500, customId == "funds" ? 500 : 980)
            .printCircularImage(await loadImage(interaction.member.displayAvatarURL({ format: "png", size: 1024 })), customId == "funds" ? 65 : 250, customId == "funds" ? 190 : 32.5, customId == "funds" ? 35 : 25, customId == "funds" ? 35 : 25)

            if(customId == "funds") {

                const getName = async(id) => {
                    const idCards = [await client.db.getIDCard(interaction.guildId, id), await client.db.getIDCard(interaction.guildId, id, true)]
                    if(idCards[0]) return `${idCards[0].first_name} ${idCards[0].last_name}`;
                    else if(idCards[1]) return `${idCards[1].first_name} ${idCards[1].last_name}`;
                    
                    await interaction.guild.members.fetch();
                    const member = interaction.guild.members.cache.get(id);
                    return member ? member?.displayName : t("words.unknown", false, "global");
                }

                canvas.setTextFont("40px Poppins").setColor("#ffffff").printText(t("balance"), 55, 320).setTextFont("50px PoppinsB").printText(`${separate(memberAccount?.crypto_wallet)}${economySymbol}`, 65, 415).setTextFont("35px PoppinsB").printResponsiveText(await getName(interaction.member.id), 125, 200, 300).setTextFont("30px Poppins")
                
                const memberCryptos = await client.db.getMemberCryptos(interaction.guildId, interaction.member.id);
                const highestEvolutions = [...cryptos.filter(c => c.price_change_percentage_24h > 0 && !memberCryptos.find(({ id }) => id == c.id)).sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 3), ...cryptos.filter(c => c.price_change_percentage_24h < 0 && !memberCryptos.find(({ id }) => id == c.id)).sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 3)].slice(0, 3);
                const top3 = (memberCryptos.length < 1 ? cryptos : memberCryptos.length < 2 ? [...memberCryptos, ...(highestEvolutions.slice(0, 3 - memberCryptos.length))] : memberCryptos).sort((a, b) => (!b?.quantity || b?.quantity == 0 ? b?.price_change_percentage_24h : b?.quantity) - (!a?.quantity || a?.quantity == 0 ? a?.price_change_percentage_24h : a?.quantity)).slice(0, 3);
                
                for (let i = 0; i < top3.length; i++) {
                    
                    const crypto = cryptos.find(c => c.id.toLowerCase() == (top3[i]?.crypto_name ?? top3[i]?.id).toLowerCase());
                    canvas.printImage(await loadImage(`assets/bourse/${crypto?.symbol.toUpperCase()}.png`), 500, 135 + (i * 128.5), 40, 40).printImage(await loadImage(`assets/bourse/${crypto.price_change_percentage_24h == 0 ? "zero" : crypto.price_change_percentage_24h > 0 ? "increasing" : "decreasing"}.png`), 470, 100 + (i * 128.5), 400, 105)
                    .printText(client.functions.other.cfl(crypto.id == "b.coin" ? "B.Coin" : crypto.id), 565, 165 + (i * 128.5)).setTextAlign("right").printText(`${crypto.price_change_percentage_24h > 0 ? "+" : ""}${separate(crypto.price_change_percentage_24h)}%`, 825, 165 + (i * 128.5)).setTextAlign("left")
                    
                }
                
            } else {

                for (let i = 0; i < cryptos.length; i++) {

                    const crypto = cryptos[i];
                    
                    canvas.printImage(await loadImage(`assets/bourse/${crypto.symbol.toUpperCase()}.png`), 55, 105 + (i * 89.75), 40, 40)
                    .setTextFont("30px Poppins")
                    .setColor("#ffffff")
                    .setTextAlign("left")
                    .printText(client.functions.other.cfl(crypto.id == "b.coin" ? "B.Coin" : crypto.id), 115, 135 + (i * 89.5))
                    .setTextFont("25px Poppins")

                    if(customId == "wallet") {
                        
                        const memberCrypto = memberCryptos.find((m) => m.crypto_name.toLowerCase() == crypto.id.toLowerCase())
                        const quantity = memberCrypto ? `${(memberCrypto?.quantity).toFixed(4)}` : `${(0).toFixed(4)}`;
                        const value = memberCrypto ? `${Math.floor(memberCrypto?.quantity * crypto.current_price).toFixed(2)}${economySymbol}` : `0${economySymbol}`;
                                            
                        canvas
                        .setTextAlign("right")
                        .printText(quantity, 435, 122.5 + (i * 89.5))
                        .setColor("#929399")
                        .printText(value, 435, 147.5 + (i * 89.5))
                        
                    } else {
                        
                        canvas
                        .printImage(await loadImage(`assets/bourse/${crypto.price_change_percentage_24h == 0 ? "nothing" : crypto.price_change_percentage_24h > 0 ? "up" : "down"}.png`), crypto.price_change_percentage_24h !== 0 ? 430 : 435, (crypto.price_change_percentage_24h !== 0 ? 105 : 115) + (i * 89.5), 40, crypto.price_change_percentage_24h == 0 ? 5 : 40)
                        .setTextAlign('right')
                        .printText(`${!`${crypto.price_change_percentage_24h}`.startsWith("-") ? "+" : ""}${crypto.price_change_percentage_24h.toFixed(2)}%`, 370, 122.5 + (i * 89.5))
                        .setColor("#929399")
                        .printText(`${crypto.current_price.toFixed(2)}${economySymbol}`, 370, 147.5 + (i * 89.5))

                    }
                    
                }

            }

            const attachment = new AttachmentBuilder(await canvas.pngAsync(), { name: "bourse.png" })
            const embed = new EmbedBuilder()
                .setColor("Green")
                .setImage("attachment://bourse.png")

                const rows = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                    .setCustomId("wallet")
                    .setLabel("Wallet")
                    .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                    .setCustomId("invest")
                    .setLabel(t("buttons.invest"))
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(memberAccount.crypto_wallet <= 0),
                )
        
                const secondRows = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                    .setCustomId("bourse")
                    .setLabel(t("buttons.bourse"))
                    .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                    .setCustomId("sell")
                    .setLabel(t("buttons.sell"))
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(!memberCryptos.length),
                    new ButtonBuilder()
                    .setCustomId("funds")
                    .setLabel(t("buttons.funds"))
                    .setStyle(ButtonStyle.Secondary),
                )

                const thirdRows = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                    .setCustomId("wallet")
                    .setLabel("Wallet")
                    .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                    .setCustomId("fund")
                    .setLabel(t("buttons.fund"))
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(memberAccount.bank_money < overdraftLimit || (memberAccount.frozen_date ? true : false) || (memberAccount.frozen_reason ? true : false)),
                )

            return {
                embeds: [embed],
                components: customId == "funds" ? [thirdRows] : customId == "wallet" ? [secondRows] : [rows],
                files: [attachment]
            }

        }

        const passWarning = await client.db.getMemberFlag(interaction.guildId, interaction.member.id, "hide.bourse.warning");
        const warningEmbed = new EmbedBuilder().setColor("Green").setTitle(t("warning_title")).setDescription(t("warning", { member: interaction.member.toString(), link: client.constants.links.support }))
        const warningRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("bourse").setLabel(t("buttons.accept")).setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("hide").setLabel(t("buttons.hide")).setStyle(ButtonStyle.Secondary)
        )

        const message = await interaction.editReply(passWarning == 1 ? await render("bourse") : { embeds: [warningEmbed], components: [warningRow] }).catch(() => {});
        if(!message) return;

        const collector = message.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.user.id, time: 120000 });
        if(!collector) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");

        let dontRemoveComponents = false;
        collector.on("collect", async(i) => {

            switch(i.customId) {

                case "hide": await client.db.setMemberFlag(interaction.guildId, interaction.member.id, "hide.bourse.warning", 1);
                case "bourse":
                case "funds":
                case "wallet": i.update(await render(i.customId == "hide" ? "bourse" : i.customId)); break;

                case "fund":
                case "invest": {

                    if(!memberAccount?.id) return i.reply({ embeds: [errorEmbed(t("no_bank_account", false, "errors"), true)], ephemeral: true });

                    const code = Math.floor(Math.random() * 9000000000) + 1000000000
                    const modal = new ModalBuilder().setCustomId(`modal_invest_${code}`).setTitle(t("modal.title"))
                        
                    if(i.customId == "invest") modal.addComponents(new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId("name").setStyle(TextInputStyle.Short).setLabel(t("modal.fields.name")).setPlaceholder(t("modal.fields.name_placeholder")).setMinLength(1).setMaxLength(11).setRequired(true)
                    ))

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder().setCustomId("amount").setStyle(TextInputStyle.Short).setLabel(t("modal.fields.amount")).setPlaceholder(t("modal.fields.amount_placeholder")).setMinLength(1).setMaxLength(11).setRequired(false)
                        )
                    );

                    await i.showModal(modal).catch(() => {})
                    const modalCollector = await i.awaitModalSubmit({ filter: (ii) => ii.user.id === i.user.id && ii.customId == `modal_invest_${code}`, time: 60000 });
                    if(!modalCollector) return;

                    const collectedValue = modalCollector?.fields?.getTextInputValue("amount") ? ((modalCollector?.fields?.getTextInputValue("amount") ?? "")).toLowerCase() : null
                    const amount = ["tout", "all"].includes(collectedValue?.toString()?.toLowerCase()) || !collectedValue ? memberAccount[i.customId == "fund" ? "bank_money" : "crypto_wallet"] : parseFloat(collectedValue.replaceAll(",", "."));
                    if(isNaN(amount) || amount <= 0) return modalCollector.reply({ embeds: [errorEmbed(t("invalid_amount", { amount: amount.toFixed(2) }), true)], components: [], files: [] }).catch(() => {});
                    
                    const newMemberAccount = await client.db.getBankAccount(interaction.guildId, i.user.id);
                    if(!newMemberAccount?.id) return i.reply({ embeds: [errorEmbed(t("no_bank_account", false, "errors"), true)], ephemeral: true });
                    if((newMemberAccount?.[i.customId == "fund" ? "bank_money" : "crypto_wallet"] ?? 0) - amount.toFixed(2) < (i.customId == "fund" ? overdraftLimit : 0)) return modalCollector.reply({ embeds: [errorEmbed(t(i.customId == "fund" ? "overdraft" : "not_enough_funds", { limit: overdraftLimit, symbol: economySymbol, amount: separate(memberAccount?.bank_money) }, "errors"), true)], components: [], files: [] });
                    
                    if(i.customId == "invest") {

                        const name = modalCollector.fields.getTextInputValue("name");
                        var crypto = client.cryptos.find(c => c.id.toLowerCase() == name.toLowerCase() || c.symbol.toLowerCase() == name.toLowerCase());
    
                        if(!crypto) return modalCollector.reply({ embeds: [errorEmbed(t("invalid_crypto", { name: name }), true)], components: [], files: [] }).catch(() => {});
                        await client.db.addMoney(interaction.guildId, interaction.member.id, "crypto_wallet", -amount.toFixed(2));
                        await client.db.addMemberCrypto(interaction.guildId, interaction.member.id, crypto.id, (amount / crypto.current_price).toFixed(4));

                    } else {
                        await client.db.addMoney(interaction.guildId, interaction.member.id, "bank_money", -amount.toFixed(2));
                        await client.db.addMoney(interaction.guildId, interaction.member.id, "crypto_wallet", amount.toFixed(2));
                        await client.db.addTransactionLog(interaction.guildId, interaction.member.id, -amount.toFixed(2), lang == "fr" ? `Transfert vers wallet` : `Transfer to wallet`)
                    }
                    
                    return modalCollector.update({ embeds: [successEmbed(t(i.customId == "fund" ? "funded" : "invested", { name: crypto?.id, amount: separate(amount), symbol: economySymbol }), true)], components: [], files: [] }).catch(() => {})

                }


                case "sell": {

                    if(!memberAccount?.id) return i.reply({ embeds: [errorEmbed(t("no_bank_account", false, "errors"), true)], ephemeral: true });

                    const code = Math.floor(Math.random() * 9000000000) + 1000000000
                    const modal = new ModalBuilder()
                        .setCustomId(`modal_sell_${code}`)
                        .setTitle(t("modal.title"))
                        .setComponents(
                            new ActionRowBuilder().addComponents(
                                new TextInputBuilder().setCustomId("name").setStyle(TextInputStyle.Short).setLabel(t("modal.fields.name")).setPlaceholder(t("modal.fields.name_placeholder")).setMinLength(1).setRequired(true)
                            ),
                            new ActionRowBuilder().addComponents(
                                new TextInputBuilder().setCustomId("quantity").setStyle(TextInputStyle.Short).setLabel(t("modal.fields.quantity")).setPlaceholder(t("modal.fields.quantity_placeholder")).setMinLength(1).setRequired(false)
                            )
                        );

                    await i.showModal(modal).catch(() => {})
                    const modalCollector = await i.awaitModalSubmit({ filter: (ii) => ii.user.id === i.user.id && ii.customId == `modal_sell_${code}`, time: 60000 });
                    if(!modalCollector) return;

                    const name = modalCollector.fields.getTextInputValue("name");
                    const crypto = client.cryptos.find(c => c.id.toLowerCase() == name.toLowerCase() || c.symbol.toLowerCase() == name.toLowerCase());
                    if(!crypto) return modalCollector.reply({ embeds: [errorEmbed(t("invalid_crypto", { name: name }), true)], components: [], files: [] }).catch(() => {});
                    
                    const memberCrypto = memberCryptos.find(c => c.crypto_name.toLowerCase() == crypto.id.toLowerCase());
                    if(!memberCrypto) return modalCollector.reply({ embeds: [errorEmbed(t("no_crypto", { name: client.functions.other.cfl(crypto.id) }), true)], components: [], files: [] }).catch(() => {});

                    const quantity = ["tout", "all"].includes((modalCollector.fields.getTextInputValue("quantity")).toLowerCase()) || !modalCollector.fields.getTextInputValue("quantity") ? memberCrypto.quantity : parseFloat(modalCollector.fields.getTextInputValue("quantity").replaceAll(",", "."));
                    if(isNaN(quantity) || quantity <= 0) return modalCollector.reply({ embeds: [errorEmbed(t("invalid_amount", { amount: amount.toFixed(2) }), true)], components: [], files: [] }).catch(() => {});

                    if((memberAccount.bank_money + (memberCrypto.current_price * quantity).toFixed(2)) >= 2147483647) return modalCollector.reply({ embeds: [errorEmbed(t("int_passing", { name: lang == "fr" ? "votre compte bancaire" : "your bank account" }, "errors"), true)], components: [], files: [] });

                    const rows = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId("accept-crypto-sell").setLabel(t("buttons.accept")).setStyle(ButtonStyle.Success),
                        new ButtonBuilder().setCustomId("cancel-crypto-sell").setLabel(t("buttons.refuse")).setStyle(ButtonStyle.Danger)
                    )

                    dontRemoveComponents = true;
                    return modalCollector.update({ embeds: [successEmbed(t("ask_sell", { member: interaction.member.toString(), name: client.functions.other.cfl(crypto.id), quantity: quantity.toFixed(4), amount: separate(crypto.current_price * quantity), symbol: economySymbol }), true)], components: [rows], files: [] }).catch(() => {})
                    
                }

            }

        })

        collector.on("end", async (collected) => {
            if(dontRemoveComponents) return;
            return interaction?.editReply({ components: [] }).catch(() => {});
        });

        } catch (err) {
            console.error(err);
            client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    }
};
