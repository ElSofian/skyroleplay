const { EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType, inlineCode, spoiler } = require("discord.js");

const code = Math.floor(Math.random() * 9000000000) + 1000000000
module.exports = {
    category: { "en": "economy", "fr": "économie" },
    name: "prêt",
    nameLocalizations: {
        "fr": "prêt",
        "en-GB": "loan",
        "en-US": "loan"
    },
    description: "Accorde un prêt à un joueur.",
    descriptionLocalizations: {
        "fr": "Accorde un prêt à un joueur.",
        "en-GB": "Grant a loan to a player.",
        "en-US": "Grant a loan to a player."
    },
    options: [{
        name: "joueur",
        nameLocalizations: {
            "fr": "joueur",
            "en-GB": "player",
            "en-US": "player"
        },
        description: "Mentionnez le joueur à qui vous souhaitez accorder un prêt.",
        descriptionLocalizations: {
            "fr": "Mentionnez le joueur à qui vous souhaitez accorder un prêt.",
            "en-GB": "Mention the player to whom you want to grant a loan.",
            "en-US": "Mention the player to whom you want to grant a loan."
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
        description: "Spécifiez le montant du prêt.",
        descriptionLocalizations: {
            "fr": "Spécifiez le montant du prêt.",
            "en-GB": "Specify the amount of the loan.",
            "en-US": "Specify the amount of the loan."
        },  
        type: ApplicationCommandOptionType.Number,
        minValue: 1,
        maxValue: 999999999,
        required: true
    },
    {
        name: "raison",
        nameLocalizations: {
            "fr": "raison",
            "en-GB": "reason",
            "en-US": "reason"
        },
        description: "Spécifiez la raison du prêt.",
        descriptionLocalizations: {
            "fr": "Spécifiez la raison du prêt.",
            "en-GB": "Specify the reason for the loan.",
            "en-US": "Specify the reason for the loan."
        },
        type: ApplicationCommandOptionType.String,
        required: true
    },
    {
        name: "date-limite",
        nameLocalizations: {
            "fr": "date-limite",
            "en-GB": "deadline",
            "en-US": "deadline"
        },
        description: "Spécifiez la date limite du prêt au format : JJ/MM/AAAA.",
        descriptionLocalizations: {
            "fr": "Spécifiez la date limite du prêt au format : JJ/MM/AAAA.",
            "en-GB": "Specify the deadline of the loan in the format: DD/MM/YYYY.",
            "en-US": "Specify the deadline of the loan in the format: DD/MM/YYYY."
        },
        type: ApplicationCommandOptionType.String,
        required: false
    },
    {
        name: "banque",
        nameLocalizations: {
            "fr": "banque",
            "en-GB": "bank",
            "en-US": "bank"
        },
        description: "Spécifiez la banque avec laquelle vous souhaitez accorder un prêt.",
        descriptionLocalizations: {
            "fr": "Spécifiez la banque avec laquelle vous souhaitez accorder un prêt.",
            "en-GB": "Specify the bank with which you want to grant a loan.",
            "en-US": "Specify the bank with which you want to grant a loan."
        },
        type: ApplicationCommandOptionType.String,
        required: false,
        autocomplete: true
    }],
    premium: true,
    run: async(client, interaction, { t, errorEmbed, verify, lang, economySymbol, isPremium, separate }) => {

        try {
        
        if (verify("member", { cantBotInclued: true })) return;

        const member = interaction.options.getMember("joueur");
        const amount = interaction.options.getNumber("montant");
        const reason = interaction.options.getString("raison");
        const dateLimit = interaction.options.getString("date-limite");
        const bank = (interaction.options.getString("banque"))?.split("&#46;")?.[1]
        const options = await client.db.getOptions(interaction.guildId, ["roles.moderator", "roles.banquier"]);

        if (interaction.options.getString("banque") && !interaction.options.getString("banque").startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == "fr" ? "banque" : "bank" }, "errors"))

        var roleModerator = options["roles.moderator"];
        var roleBanquier = options["roles.banquier"];
        
        const bankCompany = bank && bank !== "bank" ? await client.db.getSpecifyCompany(interaction.guildId, "bank", bank ?? null, true) : null
        const employees = await client.db.getCompanyEmployees(bankCompany?.id);
        const isMemberBan = await client.db.isFreezeAccount(interaction.guildId, member.id);
        if (isMemberBan) return errorEmbed(t("freeze_account_member", { member: member.toString() }, "errors"));

        // if member is banker, OK | if member is moderator, OK | else : ERROR
        if ((roleBanquier && interaction.member.roles.cache.has(roleBanquier)) || employees.find(({ user_id }) => user_id == interaction.member.id)) member_state = `<@&${roleBanquier}>`;
        else if (interaction.member.roles.cache.has(roleModerator) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) member_state = roleModerator ? `<@&${roleModerator}>` : `${inlineCode(t("mod"))}`;
        else {
            
            var permissionsText, roles = [];
            if (roleBanquier) roles.push(`<@&${roleBanquier}>`)
            if (roleModerator) roles.push(`<@&${roleModerator}>`)
            if (!roles.length) roles.push(inlineCode(t("admin")))
            permissionsText = roles.join(` ${t("and_the")} `);

            return errorEmbed(t("no_permission", { member: interaction.member.toString(), admin: permissionsText }));
        };

        if (dateLimit) {
            if (!/^(0[1-9]|[1-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/(20\d{2}|[3-9]\d{3})$/.test(dateLimit)) return errorEmbed(t("invalid_date", false, "errors"));
            else {

                // Vérifier si la date n'est pas déjà passée
                const [day, month, year] = dateLimit.split("/");
                const date = new Date(year, month - 1, day);
                const now = new Date();
                if (date < now) return errorEmbed(t("invalid_date", false, "errors"));
            }
        }

        const account = await client.db.getBankAccount(interaction.guildId, interaction.user.id);
        if (!account || account.bank_money == null || isNaN(account.bank_money)) return errorEmbed(t("no_bank_account", false, "errors"));
        if (account.frozen_date || account.frozen_reason) return errorEmbed(t("frozen_member", { member: member.toString() }, "errors"));
        if (account.bank_money + amount >= 2147483647) return errorEmbed(t("int_passing", { name: lang == "fr" ? "votre compte bancaire" : "your bank account" }, "errors"));
        
        if (bankCompany && isPremium) {
            if (bankCompany.money < amount) return errorEmbed(t("bank_not_enough", { name: bankCompany.name, amount: separate(amount), symbol: economySymbol }))
            else await client.db.addMoneyToCompany(bankCompany.id, -amount);

            const idCard = await client.db.getIDCard(interaction.guildId, member.id);
            await client.db.addTransactionLog(interaction.guildId, bankCompany.id, -amount, `${lang == "fr" ? `Prêt pour ` : `Loan for `}${idCard ? `${idCard.first_name} ${idCard.last_name}` : interaction.member.displayName}`)
        }

        await client.db.addLoan(interaction.guildId, member.id, interaction.member.id, bankCompany?.id ?? null, amount, `${lang == "fr" ? "Prêt : " : "Loan : "}${reason}`, dateLimit ? new Date(dateLimit) : null);
        
        const embed = new EmbedBuilder()
            .setColor(bankCompany?.color ? bankCompany.color : "Green")
            .setThumbnail(bankCompany?.thumbnail ?? member.displayAvatarURL())
            .setTitle(t("embed_pret.title"))
            .setDescription(t("embed_pret.description", { member: member.toString(), amount: separate(amount), symbol: economySymbol, banker: interaction.member.toString(), at: bankCompany?.name ? t("embed_pret.at", { name: bankCompany?.name }) : "", datelimit: dateLimit ? t("embed_pret.datelimit", { date: dateLimit }) : "" }))
            
        await interaction.reply({ embeds: [embed] }).catch(() => {})

        const logsEmbed = new EmbedBuilder()
            .setThumbnail(interaction.member.displayAvatarURL())
            .setTitle(t("embed_logs.title"))
            .addFields([
                { name: t("embed_logs.field_banker"), value: `${interaction.member.toString()} (${interaction.member.id})`, inline: true },
                { name: t("embed_logs.field_client"), value: `${member.toString()} (${member.id})`, inline: true },
                { name: t("embed_logs.field_amount"), value: `${separate(amount)}${economySymbol}` },
                { name: t("embed_logs.field_reason"), value: reason },
                { name: t("embed_logs.field_date_limit"), value: dateLimit ? dateLimit : t("embed_logs.no_date_limit") },
            ])

        client.functions.logs.send(interaction, logsEmbed, "info");


        } catch (err) {
            console.error(err);
            
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
        
    },

    runAutocomplete: async(client, interaction, { isPremium, lang }) => {

        if (!isPremium) return interaction.respond([{ name: lang == "fr" ? "💰 Banque" : "💰 Bank", value: `${code}&#46;bank` }])

        const focusedOption = interaction.options.getFocused(true);
        const bankCompanies = await client.db.getSpecifyCompany(interaction.guildId, "bank");

        const response = [];
        for (const company of bankCompanies) {
            const employees = await client.db.getCompanyEmployees(company.id);
            if (employees.find(({ user_id }) => user_id == interaction.user.id)) response.push({ name: company.name, value: `${code}&#46;${company.id}` })
        }
        
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

        return interaction.respond(filtered.slice(0, 25).map(r => ({ name: r.name, value: r.value })))

    }
};
