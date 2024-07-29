const { EmbedBuilder, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, time } = require("discord.js");

const code = Math.floor(Math.random() * 9000000000) + 1000000000;
module.exports = {
    category: { "en": "player", "fr": "joueur" },
    name: "factures",
    nameLocalizations: {
        "fr": "factures",
        "en-US": "bills",
        "en-GB": "bills"
    },
    description: "Affiche la liste des factures.",
    descriptionLocalizations: {
        "fr": "Affiche la liste des factures.",
        "en-US": "Displays the list of bills.",
        "en-GB": "Displays the list of bills."
    },
    options: [{
        name: "facture",
        nameLocalizations: {
            "fr": "facture",
            "en-US": "bill",
            "en-GB": "bill"
        },
        description: "Affiche les informations d'une facture.",
        descriptionLocalizations: {
            "fr": "Affiche les informations d'une facture.",
            "en-US": "Displays the information of a bill.",
            "en-GB": "Displays the information of a bill."
        },
        type: ApplicationCommandOptionType.String,
        required: false,
        autocomplete: true
    }],
    premium: true,
    run: async(client, interaction, { t, errorEmbed, successEmbed, economySymbol, overdraftLimit, lang }) => {

        try {

        const bills = await client.db.getMemberBills(interaction.guildId, interaction.member.id);
        const embed = new EmbedBuilder()
        .setColor("Green")
        .setThumbnail(interaction.member.displayAvatarURL())
        .setTitle(t("embed.title"))
        
        if (!bills.length) return interaction.reply({ embeds: [embed.setDescription(t("no_bills"))] })

        const memberAccount = await client.db.getBankAccount(interaction.guildId, interaction.member.id);
        if (isNaN(memberAccount?.bank_money)) return errorEmbed(t("no_bank_account", false, "errors"));

        async function render(bill, index, total) {

            const company = await client.db.getCompany(interaction.guildId, bill.company_id);

            embed.setFields([
                { name: t("embed.fields.company"), value: company ? company?.name ?? "Police" : t("words.fnone", false, "global") },
                { name: t("embed.fields.amount"), value: `${bill.amount}${economySymbol}` },
                { name: "Date", value: time(bill.date, "d") },
                { name: t("embed.fields.reason"), value: bill.reason }
            ])

            if (bill.fine == 1) embed.addFields([{ name: t("embed.fields.fine_id"), value: `👮 \`\`${bill.id}\`\`` }])

            const rows = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                .setCustomId("pay")
                .setLabel(t("buttons.pay"))
                .setStyle(ButtonStyle.Primary)
                .setDisabled(memberAccount.bank_money < bill.amount && memberAccount.cash_money < bill.amount)
            )

            if (total > 1) {

                embed.setFooter({ text: `${index + 1}/${total}` });
                rows.addComponents(
                    new ButtonBuilder()
                    .setCustomId("previous")
                    .setEmoji("◀")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(index === 0),
                    new ButtonBuilder()
                    .setCustomId("next")
                    .setEmoji("▶")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(index + 1 === total)
                )

            }

            return {
                embeds: [embed],
                components: [rows]
            }

        }

        const bill = bills.find(({ id }) => id == parseInt(interaction.options.getString("facture", false)?.split("&#46;")?.[1]) ?? "")
        const index = bills.findIndex(({ id }) => id == bill?.id);
        let current = index !== -1 ? index : 0;

        const total = bills.length;
        const _render = await render(bills[current], current, total);

        const message = await interaction.reply({ embeds: _render.embeds, components: _render.components }).catch(() => {});
        if (!message) return;

        const collector = message.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.member.id, time: 120000 });
        if (!collector) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply")

        collector.on("collect", async(i) => {

            switch (i.customId) {
                case `previous`: {
                    current--;
                    await i.update(await render(bills[current], current, total)).catch(() => {});
                    break;
                }

                case `next`: {
                    current++;
                    await i.update(await render(bills[current], current, total)).catch(() => {});
                    break;
                }

                case "pay": {

                    const bill = bills[current];
                    if (!bill) return i.update({ embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], components: [] }).catch(() => {});

                    const newMemberAccount = await client.db.getMoney(interaction.guildId, interaction.member.id);
                    const isBan = await client.db.isFreezeAccount(interaction.guildId, interaction.member.id); 
                    if (isBan) return errorEmbed(t("freeze_account", false, "errors"));
            

                    let method = "bank_money", reply = i;
                    if (newMemberAccount.bank_money - overdraftLimit < bill.amount) {

                        if (newMemberAccount.cash_money >= bill.amount) {
                            var askPayementMethod = await client.functions.userinput.askPayementMethod(i, "bank", true, "update")
                            if (!askPayementMethod) return;

                            method = "cash_money", reply = askPayementMethod;

                        } else {
                            return i.update({ embeds: [errorEmbed(t("not_enough_money"), true)], components: [] }).catch(() => {});
                        }

                    }

                    const idCard = await client.db.getIDCard(interaction.guildId, interaction.member.id);

                    await client.db.payBill(bill, method)
                    await client.db.addTransactionLog(interaction.guildId, interaction.member.id, -bill.amount, `${bill.fine == 1 ? t("fine", { name: idCard ? `${idCard.first_name} ${idCard.last_name}` : "" }) : t("bill")} : ${bill.reason}`)
                    
                    if (bill.company_id) await client.db.addTransactionLog(interaction.guildId, bill.company_id, bill.amount,  `${bill.fine == 1 ? lang == 'fr' ? "Amende" : "Fine" : lang == "fr" ? "Facture" : "Bill"} ${idCard ? `${lang == 'fr' ? "de " : "from "}${idCard.first_name} ${idCard.last_name}` : ""} ${bill.reason}`)
                    const company = await client.db.getCompany(interaction.guildId, bill.company_id);
                    
                    return reply?.update({ embeds: [successEmbed(t("bill_payed", { amount: bill.amount, symbol: economySymbol, company: company ? ` ${t("words.at", false, "global")} ${company.name ?? "Police"}` : "" }), true)], components: [] }).catch(() => {});

                }
            }

        })

        collector.on("end", (collected) => {
            return interaction.editReply({ components: [] }).catch(() => {});
        })


        } catch (err) {
            console.error(err);
            
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
        
    },

    runAutocomplete: async(client, interaction, { economySymbol }) => {

        const focusedOption = interaction.options.getFocused(true);
        const bills = await client.db.getMemberBills(interaction.guildId, interaction.member.id);
        if (!bills.length) return;

        const filtered = [];
        if (focusedOption.value !== "") {
            const filtredArray = [];
            filtredArray.push(...bills.filter(r => r.reason.toLowerCase() == focusedOption.value.toLowerCase()));
            filtredArray.push(...bills.filter(r => r.reason.toLowerCase().startsWith(focusedOption.value.toLowerCase())));
            filtredArray.push(...bills.filter(r => r.reason.toLowerCase().includes(focusedOption.value.toLowerCase())));

            const unique = [...new Set(filtredArray)];
            filtered.push(...unique);
        } else {
            filtered.push(...bills);
        }

        return interaction.respond(filtered.slice(0, 25).map(i => ({ name: `${i.fine == 1 ? "👮 " : ""}${i.reason} (${i.amount}${economySymbol})`, value: `${code}&#46;${i.id}` }))).catch(() => {});


    }
};