const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    category: { "en": "illegal", "fr": "illégal" },
    name: "blanchiment",
    nameLocalizations: {
        "fr": "blanchiment",
        "en-US": "laundering",
        "en-GB": "laundering"
    },
    description: "Blanchit une somme d'argent sale à un joueur.",
    descriptionLocalizations: {
        "fr": "Blanchit une somme d'argent sale à un joueur.",
        "en-US": "Launder a sum of dirty money to a player.",
        "en-GB": "Launder a sum of dirty money to a player."
    },
    options: [{
        name: "joueur",
        nameLocalizations: {
            "fr": "joueur",
            "en-GB": "player",
            "en-US": "player"
        },
        description: "Mentionnez le joueur à qui vous voulez blanchir de l'argent sale.",
        descriptionLocalizations: {
            "fr": "Mentionnez le joueur à qui vous voulez blanchir de l'argent sale.",
            "en-GB": "Mention the player to whom you want to launder dirty money.",
            "en-US": "Mention the player to whom you want to launder dirty money."
        },
        type: ApplicationCommandOptionType.User,
        required: true
    },
    {
        name: "votre-pourcentage",
        nameLocalizations: {
            "fr": "votre-pourcentage",
            "en-GB": "your-percentage",
            "en-US": "your-percentage"
        },
        description: "Spécifiez le pourcentage que vous voulez prendre sur le blanchissement.",
        descriptionLocalizations: {
            "fr": "Spécifiez le pourcentage que vous voulez prendre sur le blanchissement.",
            "en-GB": "Specify the percentage you want to take on the laundering.",
            "en-US": "Specify the percentage you want to take on the laundering."
        },
        type: ApplicationCommandOptionType.Number,
        minValue: 1,
        maxValue: 99,
        required: true
    },
    {
        name: "montant",
        nameLocalizations: {
            "fr": "montant",
            "en-GB": "amount",
            "en-US": "amount"
        },
        description: "Spécifiez le montant que vous voulez blanchir.",
        descriptionLocalizations: {
            "fr": "Spécifiez le montant que vous voulez blanchir.",
            "en-GB": "Specify the amount you want to launder.", 
            "en-US": "Specify the amount you want to launder."
        },
        type: ApplicationCommandOptionType.Number,
        minValue: 1,
        required: true
    }],
    run: async(client, interaction, { t, errorEmbed, successEmbed, economySymbol, verify, lang, separate }) => {

        try {

        const member = interaction.options.getMember("joueur");
        const own = member.id === interaction.member.id;

        const link = client.functions.illegal.getIllegalLink(client, interaction.guildId, interaction.member.id);
        if (link) return errorEmbed(t("already_doing", { link: link }, "errors"));

        if (verify("member", { cantBotInclued: true })) return;
        
        // Validate bank accounts
        const memberAccount = await client.db.getCashMoney(interaction.guildId, interaction.user.id);
        const userAccount = await client.db.getCashMoney(interaction.guildId, member.user.id);

        if (!memberAccount || memberAccount.cash_money == null || isNaN(memberAccount.cash_money)) return errorEmbed(t("no_cash_money", false, "errors"));
        if (!userAccount || userAccount.cash_money == null || isNaN(userAccount.cash_money)) return errorEmbed(t("member_no_cash_money", { member: member.toString() }, "errors"));

        // Validate amount
        const amount = interaction.options.getNumber("montant");
        const dirty_money = (await client.db.getDirtyMoney(interaction.guildId, member.user.id))?.dirty_money ?? 0

        if ((memberAccount?.cash_money ?? 0) + amount >= 2147483647) return errorEmbed(t("int_passing", { name: lang == "fr" ? "votre argent liquide" : "your cash money" }, "errors"));
        if ((userAccount?.cash_money ?? 0) + amount >= 2147483647) return errorEmbed(t("int_passing_member", { name: lang == "fr" ? "d'argent liquide" : "cash money", member: member.toString() }, "errors"));

        if (amount > dirty_money)
        return errorEmbed(own ? t("dirty_money.user", { money: `  ${separate(amount - dirty_money)}${economySymbol}` }) : t("dirty_money.member", { member: member.toString(), money: `${separate(amount - dirty_money)}${economySymbol}` }));

        const laundererPercentage = interaction.options.getNumber("votre-pourcentage");
        const laundererPart = Math.floor(amount * (laundererPercentage / 100));
        const clientPart = own ? Math.floor(amount * 0.9) : amount - laundererPart;

        if (own) {
            await client.db.addDirtyMoney(interaction.guildId, member.user.id, -amount);
            await client.db.addMoney(interaction.guildId, member.user.id, "cash_money", clientPart);

            return successEmbed(t("laundering_success.user", { money: `${separate(amount)}${economySymbol}`, money2: `${separate(clientPart)}${economySymbol}` }))
        } else {
            await client.db.addDirtyMoney(interaction.guildId, member.user.id, -amount);
            await client.db.addMoney(interaction.guildId, member.id, "cash_money", clientPart);
            await client.db.addMoney(interaction.guildId, interaction.user.id, "cash_money", laundererPart);

            return successEmbed(t("laundering_success.member", {
                member: member.toString(),
                money: `${separate(amount)}${economySymbol}`,
                money2: `${separate(laundererPart)}${economySymbol}`,
                money3: `${separate(clientPart)}${economySymbol}`,
                percent: `${separate(Math.floor(laundererPercentage))}`,
                percent2: `${separate(Math.ceil(100 - laundererPercentage))}`,
            }));

        }


    } catch (err) {
        console.error(err);

        return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
    }
    
    }
};
