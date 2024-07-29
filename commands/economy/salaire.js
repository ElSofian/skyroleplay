const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ApplicationCommandOptionType } = require("discord.js");

const code = Math.floor(Math.random() * 9000000000) + 1000000000
module.exports = {
    category: { "en": "economy", "fr": "économie" },
    name: "salaire",
    nameLocalizations: {
        "fr": "salaire",
        "en-US": "salary",
        "en-GB": "salary"
    },
    description: "Demande votre salaire.", 
    descriptionLocalizations: {
        "fr": "Demande votre salaire.",
        "en-US": "Ask for your salary.",
        "en-GB": "Ask for your salary."      
    },
    options: [
        {
            name: "montant",
            nameLocalizations: {
                "fr": "montant",    
                "en-US": "amount",
                "en-GB": "amount"
            },
            description: "Le montant de votre salaire.",
            descriptionLocalizations: {
                "fr": "Le montant de votre salaire.",   
                "en-US": "The amount of your salary.",
                "en-GB": "The amount of your salary."
            },
            type: ApplicationCommandOptionType.Number, 
            minValue: 1,
            maxValue: 999999999,
            required: true
        },
        {
            name: "entreprise",
            nameLocalizations: {
                "fr": "entreprise",
                "en-US": "company",
                "en-GB": "company"
            },
            description: "L'entreprise qui vous paye.",
            descriptionLocalizations: {
                "fr": "L'entreprise qui vous paye.",
                "en-US": "The company that pays you.",
                "en-GB": "The company that pays you."
            },
            type: ApplicationCommandOptionType.String,
            required: false,
            autocomplete: true
        }],
    premium: true,
    run: async(client, interaction, { t, errorEmbed, lang, economySymbol, separate }) => {

        try {

        const options = await client.db.getOptions(interaction.guildId, [
            "roles.moderator",
            "economy.salaries_open",
        ]);

        if (!options["economy.salaries_open"]) return errorEmbed(t("close_salary"));
        const moderatorRole = await interaction.guild.roles.fetch(options["roles.moderator"] ?? "");
        if (!moderatorRole) return errorEmbed(t("no_modo_role", { id: options["roles.moderator"] }, "errors"))

        // Get account
        const account = await client.db.getBankAccount(interaction.guildId, interaction.member.id);
        if (isNaN(parseInt(account?.bank_money))) return errorEmbed(t("no_bank_account", false, "errors"));

        const isBan = await client.db.isFreezeAccount(interaction.guildId, interaction.member.id);
        if (isBan) return errorEmbed(t("freeze_account", false, "errors"));
        
        // Validate amount
        const amount = interaction.options.getNumber("montant") || 0;
        if (account.bank_money + amount >= 2147483647) return errorEmbed(t("int_passing", { name: lang == "fr" ? "votre compte bancaire" : "your bank account" }, "errors"));

        if (!(interaction.options.getString("entreprise")?.split("&#46;")?.[0] ?? `${code}`).startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == "fr" ? "entreprise" : "company" }, "errors"));
        const company = await client.db.getCompany(interaction.guildId, interaction.options.getString("entreprise")?.split("&#46;")?.[1])
        
        // Send confirmation embed
        const embed = new EmbedBuilder()
            .setColor("Gold")
            .setTitle(t("embed_dmd.title"))
            .setDescription(t("embed_dmd.description", { member: interaction.member, amount: separate(amount), symbol: economySymbol, company: company ? t("company", { name: company.name }) : "" }))
            .addFields([{ name: t("embed_dmd.field.than_can_accept"), value: options["roles.moderator"] && moderatorRole ? t("embed_dmd.field.modo", { id: options["roles.moderator"] }) : t("embed_dmd.field.admin") }])
            .setFooter({ text: interaction.member.displayName, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`accept-salary-${amount}`).setStyle(ButtonStyle.Success).setLabel(t("button_choice.accept")),
            new ButtonBuilder().setCustomId(`cancel-salary-${amount}`).setStyle(ButtonStyle.Danger).setLabel(t("button_choice.refuse"))
        );

        interaction.reply({ embeds: [embed], components: [row] }).catch(() => {});


        } catch (err) {
            console.error(err);
            
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
        
    },

    runAutocomplete: async(client, interaction) => {

        const focusedOption = interaction.options.getFocused(true);
        const memberCompanies = await client.db.getMemberCompanies(interaction.guildId, interaction.member.id);

        const filtered = [];
        if (focusedOption.value !== "") {
            const filtredArray = [];
            filtredArray.push(...memberCompanies.filter(r => r.name.toLowerCase() == focusedOption.value.toLowerCase()));
            filtredArray.push(...memberCompanies.filter(r => r.name.toLowerCase().startsWith(focusedOption.value.toLowerCase())));
            filtredArray.push(...memberCompanies.filter(r => r.name.toLowerCase().includes(focusedOption.value.toLowerCase())));

            const unique = [...new Set(filtredArray)];
            filtered.push(...unique);
        } else {
            filtered.push(...memberCompanies);
        }

        await interaction.respond(filtered.slice(0, 25).map(i => ({ name: i.name, value: `${code}&#46;${i.id}` }) ))

    }
};
