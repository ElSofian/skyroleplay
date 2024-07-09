const { EmbedBuilder, ApplicationCommandOptionType, spoiler, time } = require("discord.js");

const code = Math.floor(Math.random() * 9000000000) + 1000000000
module.exports = {
    category: { "en": "companies", "fr": "entreprises" },
    name: "facture",
    description: "Adresse une facture de votre entreprise à un joueur.",
    descriptionLocalizations: {
        "fr": "Adresse une facture de votre entreprise à un joueur.",   
        "en-US": "Send a bill from your company to a player.",
        "en-GB": "Send a bill from your company to a player."
    },
    options: [
    {
        name: "joueur",
        nameLocalizations: {
            "fr": "joueur",
            "en-GB": "player",
            "en-US": "player"
        },
        description: "Le joueur à qui vous voulez envoyer la facture.",
        descriptionLocalizations: {
            "fr": "Le joueur à qui vous voulez envoyer la facture.",
            "en-GB": "The player to whom you want to send the bill.",
            "en-US": "The player to whom you want to send the bill."
        },
        type: ApplicationCommandOptionType.User,
        required: true
    },
    {
        name: "montant",
        nameLocalizations: {
            "fr": "montant",
            "en-GB": "amount",
            "en-US": "amount"
        },
        description: "Le montant de la facture.",
        descriptionLocalizations: {
            "fr": "Le montant de la facture.",
            "en-GB": "The amount of the bill.",
            "en-US": "The amount of the bill."
        },
        type: ApplicationCommandOptionType.Number,
        required: true,
        minValue: 1,
        maxValue: 999999999
    },
    {
        name: "raison",
        nameLocalizations: {
            "fr": "raison",
            "en-GB": "reason",
            "en-US": "reason"
        },
        description: "La raison de la facture.",
        descriptionLocalizations: {
            "fr": "La raison de la facture.",
            "en-GB": "The reason for the bill.",
            "en-US": "The reason for the bill."
        },
        type: ApplicationCommandOptionType.String,
        required: true
    },
    {
        name: "entreprise",
        nameLocalizations: {
            "fr": "entreprise",
            "en-GB": "company",
            "en-US": "company"
        },
        description: "L'entreprise depuis laquelle vous voulez envoyer la facture.",
        descriptionLocalizations: {
            "fr": "L'entreprise depuis laquelle vous voulez envoyer la facture.",
            "en-GB": "The company from which you want to send the bill.",
            "en-US": "The company from which you want to send the bill."
        },
        type: ApplicationCommandOptionType.String,
        required: false,
        autocomplete: true
    },
    {
        name: "date-limite",
        nameLocalizations: {
            "fr": "date-limite",
            "en-GB": "deadline",
            "en-US": "deadline"
        },
        description: "La date limite de paiement de la facture.",
        descriptionLocalizations: {
            "fr": "La date limite de paiement de la facture.",
            "en-GB": "The deadline for payment of the bill.",
            "en-US": "The deadline for payment of the bill."
        },
        type: ApplicationCommandOptionType.String,
        required: false
    }],
    premium: true,
    run: async(client, interaction, { t, errorEmbed, verify, economySymbol, lang, isPremium }) => {

        try {

        const companyString = interaction.options.getString("entreprise") ?? `${code}`
        if(!companyString.startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == "fr" ? "entreprise" : "company" }, "errors"));
        
        const member = interaction.options.getMember("joueur");
        if(verify(["member", "reason"], { cantBotInclued: true, limit: 255 })) return;

        const company = !isPremium || !interaction.options.getString("entreprise") ? true : await client.db.getCompany(interaction.guildId, companyString.split("&#46;")[1]);
        if(!company) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"));

        const dateLimit = interaction.options.getString("date-limite");
        if(dateLimit && !dateLimit.match(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/)) return errorEmbed(t("invalid_date", { option: lang == "fr" ? "date-limite" : "deadline" }, "errors"));

        const memberAccount = await client.db.getBankAccount(interaction.guildId, member.user.id);
        if(!memberAccount || memberAccount.bank_money == null || isNaN(memberAccount.bank_money)) return errorEmbed(t("no_member_account", false, "errors"));
        
        // Validate amount
        const amount = interaction.options.getNumber("montant");
        if(parseInt(amount) <= 0) return errorEmbed(t("not_amount_null"));
        
        const reason = interaction.options.getString("raison");
        const police = await client.db.getSpecifyCompany(interaction.guildId, "police")
        
        await client.db.addMemberBill(interaction.guildId, member.user.id, interaction.member.id, company?.id, companyString == `${code}.police` ? 1 : police.find(({ id }) => id == company?.id) ? 1 : 0, amount, reason);
        
        const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle(t("embed.title"))
        .setDescription(t("embed.description", {
            member: member.toString(),
            type: police.find(({ id }) => id == company?.id) ? t("fine") : t("bill"),
            amount: amount,
            symbol: economySymbol,
            dateLimit: dateLimit ? t("datelimit", { date: dateLimit }) : "",
            company: company == true ? "" : ` ${t("words.from", false, "global")} *${company.name}*`,
            reason: reason
        }))

        interaction.reply({ content: spoiler(member.toString()), embeds: [embed] }).catch(() => {});


        } catch (err) {
            console.error(err);
            client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
        
    },


    runAutocomplete: async(client, interaction, { isPremium }) => {

        if(!isPremium) {
            const policeRole = await client.db.getOption(interaction.guildId, "roles.police")
            return interaction.respond(policeRole && interaction.member.roles.cache.has(policeRole) ? [{ name: "Police", value: `${code}&#46;police` }] : []).catch(() => {});
        }

        const focusedOption = interaction.options.getFocused(true);
        const response = [];

        const companies = (await client.db.getMemberCompanies(interaction.guildId, interaction.member.id)).sort((a, b) => a.name.localeCompare(b.name))
        response.push(...companies)

        const filtered = [];
        if(focusedOption.value !== "") {
            const filtredArray = [];
            filtredArray.push(...response.filter(r => r.name.toLowerCase() == focusedOption.value.toLowerCase()));
            filtredArray.push(...response.filter(r => r.name.toLowerCase().startsWith(focusedOption.value.toLowerCase())));
            filtredArray.push(...response.filter(r => r.name.toLowerCase().includes(focusedOption.value.toLowerCase())));

            const unique = [...new Set(filtredArray)];
            filtered.push(...unique);
        } else {
            filtered.push(...response);
        }

        await interaction.respond(filtered.slice(0, 25).map(c => ({ name: c.name, value: `${code}&#46;${c.id}` }))).catch(() => {});

    }
};