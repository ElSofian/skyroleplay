const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    category: { "en": "economy", "fr": "économie" },
    name: "payer",
    nameLocalizations: {
        "fr": "payer",
        "en-US": "pay",
        "en-GB": "pay"
    },
    description: "Payer un joueur.",
    descriptionLocalizations: {
        "fr": "Payer un joueur.",
        "en-US": "Pay a player.",
        "en-GB": "Pay a player."
    },
    options: [{
        name: "joueur",
        nameLocalizations: {
            "fr": "joueur",
            "en-GB": "player",
            "en-US": "player"
        },
        description: "Mentionnez le joueur que vous voulez payer.",
        descriptionLocalizations: {
            "fr": "Mentionnez le joueur que vous voulez payer.",
            "en-GB": "Mention the player you want to pay.",
            "en-US": "Mention the player you want to pay."
        },
        type: ApplicationCommandOptionType.User,
        required: true,
    },
    {
        name: "montant",
        nameLocalizations: {
            "fr": "montant",
            "en-GB": "amount",
            "en-US": "amount"
        },
        description: "Spécifiez le montant que à payer.",
        descriptionLocalizations: {
            "fr": "Spécifiez le montant que à payer.",
            "en-GB": "Specify the amount to pay.",
            "en-US": "Specify the amount to pay."
        },
        type: ApplicationCommandOptionType.Number,
        minValue: 1,
        required: true,
    },
    {   
        name: "méthode",
        nameLocalizations: {
            "fr": "méthode",
            "en-GB": "method",
            "en-US": "method"
        },
        description: "Spécifiez la méthode de paiement.",
        descriptionLocalizations: {
            "fr": "Spécifiez la méthode de paiement.",
            "en-GB": "Specify the payment method.",
            "en-US": "Specify the payment method."
        },
        type: ApplicationCommandOptionType.String,
        required: false,
        choices: [
            {
                name: "💵 Espèce",
                nameLocalizations: {
                    "fr": "💵 Espèce",
                    "en-GB": "💵 Cash",
                    "en-US": "💵 Cash"
                },
                value: "cash_money"
            },
            {
                name: "💳 Virement Bancaire",
                nameLocalizations: {
                    "fr": "💳 Virement bancaire",
                    "en-GB": "💳 Bank transfer",
                    "en-US": "💳 Bank transfer"
                },
                value: "bank_money"
            },
            {
                name: "💰 Argent sale",
                nameLocalizations: {
                    "fr": "💰 Argent sale",
                    "en-GB": "💰 Dirty money",
                    "en-US": "💰 Dirty money"
                },
                value: "dirty_money"
            }],
        },
    {
        name: "options",
        description: "Options du payement.",
        descriptionLocalizations: {
            "fr": "Options du payement.",
            "en-GB": "Payment options.",
            "en-US": "Payment options."
        },
        type: ApplicationCommandOptionType.String,
        choices: [{
            name: '👤 Paiement anonyme',
            nameLocalizations: {
                "fr": "👤 Paiement anonyme",
                "en-US": "👤 Anonymous payment",
                "en-GB": "👤 Anonymous payment"
            },
            value: "anonymous_payment"
        }],
        required: false,
    }],
    run: async(client, interaction, { t, errorEmbed, successEmbed, verify, lang, overdraftLimit, economySymbol, separate }) => {

        try {

        const _logs = async(interaction, member, amount, symbol, type, lang, anonyme = false) => {
            let typeAsText = { bank_money: "💳 " + t("typeAsText.bank_money"), cash_money: "💵 " + t("typeAsText.cash_money"), dirty_money: "💰 " + t("typeAsText.dirty_money") }[type];
            if (!interaction) return;
        
            const logsEmbed = new EmbedBuilder()
                .setTitle(anonyme ? t("embed_logs.title.anonyme") : t("embed_logs.title.classic"))
                .addFields([
                    { name: t("embed_logs.field_sender"), value: `${interaction.user.toString()} (${interaction.user.id})`, inline: true },
                    { name: t("embed_logs.field_benefic"), value: `${member.toString()} (${member.id})`, inline: true },
                    { name: t("embed_logs.field_type"), value: typeAsText, inline: true },
                    { name: t("embed_logs.field_amount"), value: `${separate(amount)}${symbol}`, inline: true }
                ])
                .setThumbnail(interaction.user.displayAvatarURL());
        
            return client.functions.logs.send(interaction, logsEmbed, "creation");
        }
        
        const member = interaction.options.getMember("joueur");
        if (verify("member", { cantSelfInclued: true })) return;

        const method = interaction.options.getString("méthode") || "cash_money";
        const options = interaction.options.getString("options");
        let amount = interaction.options.getNumber("montant");
        let selfAccount, memberAccount;

        const isBan = await client.db.isFreezeAccount(interaction.guildId, interaction.member.id);
        const isMemberBan = await client.db.isFreezeAccount(interaction.guildId, member.user.id);
        if (isBan && method == "bank_money") return errorEmbed(t("freeze_account", false, "errors"));
        if (isMemberBan && method == "bank_money") return errorEmbed(t("freeze_account_member", { member: member.toString() }, "errors"));

        const memberState = await client.db.getMemberState(interaction.guildId, interaction.member.id);
        if (memberState.jail == 1 && method == "bank_money") return errorEmbed(t("jail", { member: member.toString() }));

        if (method === "dirty_money") {
            selfAccount = await client.db.getDirtyMoney(interaction.guildId, interaction.user.id);
            if (!selfAccount || selfAccount[method] <= 0) return errorEmbed(t("no_dirty_money"));
                
            memberAccount = await client.db.getDirtyMoney(interaction.guildId, member.user.id);

        } else {
            // Get accounts
            selfAccount = await client.db.getMoney(interaction.guildId, interaction.user.id);
            if (selfAccount?.blocked == 1) return errorEmbed(t("blocked", false, "errors"));
            if (selfAccount?.frozen_date || selfAccount?.frozen_reason) return errorEmbed(t("frozen", false, "errors"));
            if (!selfAccount || selfAccount.bank_money == null || isNaN(selfAccount.bank_money)) return errorEmbed(t("no_bank_account", false, "errors"));

            memberAccount = await client.db.getMoney(interaction.guildId, member.user.id);
            if (method == "bank_money" && (memberAccount?.frozen_date || memberAccount?.frozen_reason)) return errorEmbed(t("frozen_member", { member: member.toString() }, "errors"));
            if (method == "bank_money" && !memberAccount || memberAccount.bank_money == null || isNaN(memberAccount.bank_money)) return errorEmbed(t("no_member_account", { member: member.toString() }, "errors"));
            if ((method == "cash_money" && selfAccount[method] <= 0) || (method == "bank_money" && selfAccount[method] < overdraftLimit)) return errorEmbed(t(`you_dont_${method.replace("_money", "")}`));
        }
        
        if (!overdraftLimit && amount > selfAccount[method]) {

            const result = await client.functions.userinput.askValidation(
                interaction,
                t("have_only_money", { amount: separate(selfAccount[method]), symbol: economySymbol, member: member.toString() })
            );

            if (!result) return;
            amount = selfAccount[method];
        }

        if (!memberAccount) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"));
        
        if (overdraftLimit && method == "bank_money" && selfAccount[method] - amount < overdraftLimit) return errorEmbed(t("overdraft", { limit: overdraftLimit.replace("-", ""), symbol: economySymbol }, "errors"))
        if (selfAccount[method] + amount >= 2147483647) return errorEmbed(t("int_passing", { name: lang == "fr" ? method == "bank_money" ? "votre compte" : method == "dirty_money" ? "votre argent sale" : "votre argent liquide" : method == "bank_money" ? "your bank account" : method == "dirty_money" ? "your dirty money" : "your cash money" }, "errors"));
        if (memberAccount[method] + amount >= 2147483647) return errorEmbed(t("int_passing_member", { name: lang == "fr" ? method == "bank_money" ? "du compte bancaire" : method == "dirty_money" ? "d'argent sale" : "d'argent liquide" : method == "bank_money" ? "bank account money" : method == "dirty_money" ? "dirty money" : "cash money", member: member.toString() }, "errors"));

        if (method === "dirty_money") {
            await client.db.addDirtyMoney(interaction.guildId, interaction.user.id, -amount);
            await client.db.addDirtyMoney(interaction.guildId, member.user.id, amount);
        } else {
            await client.db.addMoney(interaction.guildId, interaction.member.id, method, -amount);
            await client.db.addMoney(interaction.guildId, member.user.id, method, amount);
        }

        if (method == "bank_money") {
            const idCard = await client.db.getIDCard(interaction.guildId, interaction.member.id);
            const idCardMember = await client.db.getIDCard(interaction.guildId, member.user.id);
            await client.db.addTransactionLog(interaction.guildId, interaction.member.id, -amount, `${lang == "fr" ? "Payement à" : "Payment to"} ${idCardMember ? `${idCardMember.first_name} ${idCardMember.last_name}` : member.displayName}` )
            await client.db.addTransactionLog(interaction.guildId, member.user.id, amount, `${lang == "fr" ? "Payement de" : "Payment from"} ${idCard ? `${idCard.first_name} ${idCard.last_name}` : interaction.member.displayName}` )
        }

        _logs(interaction, member, amount, economySymbol, method, lang, options ? true : false);

        if (options) {

            const embed = new EmbedBuilder()
                .setColor("#030303")
                .setDescription(t("anonyme_payement", { amount: separate(amount), symbol: economySymbol, member: member.toString() }))
            
            const send = await interaction.channel.send({ embeds: [embed] }).catch(() => errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, interaction.replied ? "editReply" : "reply"));

            if (send) return successEmbed(t("you_paid_anonyme", { amount: separate(amount), symbol: economySymbol, member: member.toString() }), false, true, interaction.replied ? "editReply" : "reply")
            else return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, interaction.replied ? "editReply" : "reply");
        
        } else {
            return successEmbed(t("you_paid_member", { amount: separate(amount), symbol: economySymbol, member: member.toString() }), false, false, interaction.replied ? "editReply" : "reply");
        }

        } catch (err) {
            console.error(err);

            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    }
};
