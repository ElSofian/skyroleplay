const { ApplicationCommandOptionType } = require("discord.js");

const code = Math.floor(Math.random() * 9000000000) + 1000000000
module.exports = {
    category: { "en": "companies", "fr": "entreprises" },
    name: "démissionner",
    nameLocalizations: {
        "fr": "démissionner",
        "en-US": "resign",
        "en-GB": "resign"
    },
    description: "Démissione de l'entreprise dans laquelle vous êtes.",
    descriptionLocalizations: {
        "fr": "Démissione de l'entreprise dans laquelle vous êtes.",
        "en-US": "Resign from the company you are in.",
        "en-GB": "Resign from the company you are in."
    },
    options: [{
        name: "nom-entreprise",
        nameLocalizations: {
            "fr": "nom-entreprise",
            "en-GB": "company-name",
            "en-US": "company-name"
        },
        description: "Le nom de l'entreprise.",
        descriptionLocalizations: {
            "fr": "Le nom de l'entreprise.",
            "en-GB": "The name of the company.",
            "en-US": "The name of the company."
        },
        type: ApplicationCommandOptionType.String,
        required: true,
        autocomplete: true
    }],
    premium: true,
    run: async (client, interaction, { t, errorEmbed, successEmbed, lang }) => {

        try {

            if (!(interaction.options.getString("nom-entreprise") ?? `${code}`).startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == "fr" ? "nom-entreprise" : "company-name" }, "errors"));

            const id = interaction.options.getString("nom-entreprise").split("&#46;")[1]
            const name = (await client.db.getCompany(id)).name;
            await client.db.fireMemberCompany(interaction.member.id, id);

            successEmbed(t("valid_demission", { user: interaction.member, name: name }));

        } catch (err) {
            console.error(err);
            
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    },

    runAutocomplete: async (client, interaction, { isPremium }) => {

        if (!isPremium) return interaction.respond([]).catch(() => { });
        const focusedOption = interaction.options.getFocused(true);
        const response = [];

        const memberCompanies = (await client.db.getMemberCompanies(interaction.guildId, interaction.member.id)).sort((a, b) => a.name.localeCompare(b.name))
        for (const company of memberCompanies) {
            const owner = await client.db.getCompanyOwner(company.id);
            if (owner?.user_id !== interaction.member.id) response.push(company);
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

        await interaction.respond(filtered.slice(0, 25).map(c => ({ name: c.name, value: `${code}&#46;${c.id}` }))).catch(() => { })

    }
};
