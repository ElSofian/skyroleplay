const { EmbedBuilder, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const Pagination = require('customizable-discordjs-pagination');

module.exports = {
    category: { "en": "companies", "fr": "entreprises" },
    name: "liste-entreprises",
    nameLocalizations: {
        "fr": "liste-entreprises",
        "en-US": "companies-list",
        "en-GB": "companies-list"
    },
    description: "Affiche la liste des entreprises du serveur.",
    descriptionLocalizations: {
        "fr": "Affiche la liste des entreprises du serveur.",
        "en-US": "Displays the list of companies on the server.",
        "en-GB": "Displays the list of companies on the server."
    },
    options: [{
        name: "type",
        description: "Choisis le type d'entreprises à afficher.",
        descriptionLocalizations: {
            "fr": "Choisis le type d'entreprises à afficher.",
            "en-US": "Choose the type of companies to display.",
            "en-GB": "Choose the type of companies to display."
        },
        type: ApplicationCommandOptionType.String,
        choices: [
            { name: "Toutes", nameLocalizations: { "fr": "Toutes", "en-US": "All", "en-GB": "All" }, value: "all" },
            { name: "Uniquement les entreprises publiques", nameLocalizations:  { "fr": "Uniquement les entreprises publiques", "en-US": "Only public companies", "en-GB": "Only public companies" }, value: "1" },
            { name: "Uniquement les entreprises privées", nameLocalizations: { "fr": "Uniquement les entreprises privées", "en-US": "Only private companies", "en-GB": "Only private companies" }, value: "2" },
            { name: "Uniquement les organisations", nameLocalizations: { "fr": "Uniquement les organisations", "en-US": "Only organisations", "en-GB": "Only organisations" }, value: "3" },
            { name: "Uniquement les gangs", nameLocalizations: { "fr": "Uniquement les gangs", "en-US": "Only gangs", "en-GB": "Only gangs" }, value: "4" },
            { name: "Uniquement les associations", nameLocalizations: { "fr": "Uniquement les associations", "en-US": "Only associations", "en-GB": "Only associations" }, value: "5" }
        ],
        required: false,
    }],
    premium: true,
    run: async(client, interaction, { t, errorEmbed }) => {

        try {
        
        const type = interaction.options.getString("type");
        const companies = (await client.db.getCompaniesWithOwner(interaction.guildId)).filter(c => c.type == (!type || type == "all" ? c.type : type)).sort((a, b) => a.name.localeCompare(b.name))
        if(!companies.length) return errorEmbed(t("no_companies", false, "errors"));

        const companieType = (id) => {
            switch(id) {
                case 1: return t("company_type.public");
                case 2: return t("company_type.private");
                case 3: return t("company_type.organization");
                case 4: return t("company_type.gang");
                case 5: return t("company_type.association");
            }
        }

        const chunks = client.functions.other.chunkArray(companies, 5);
        const getCompaniesEmbed = (current) => {
            const embed = new EmbedBuilder()
            .setColor("Green")
            .setAuthor({ name: t("embed_companies_list.title", { guild: interaction.guild.name }), iconURL: client.user.displayAvatarURL() })
            .addFields(chunks[current].map(c => ({ name: `${c.name} (${companieType(c.type)})`, value: c.user_id.length > 0 ? c.user_id.map(e => `<:roleplay:986673642731614248> <@${e}>`).join("\n") : `<:roleplay:986673642731614248> ${t("no_boss")}` }) ))
            .setFooter({ text: `${interaction.member.displayName} • Page ${current+1}/${chunks.length}`, iconURL: interaction.member.displayAvatarURL() })

            const rows = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("previous").setLabel(t("previous")).setStyle(ButtonStyle.Success).setDisabled(current == 0),
                new ButtonBuilder().setCustomId("next").setLabel(t("next")).setStyle(ButtonStyle.Success).setDisabled(current+1 == chunks.length)
            )
       
            return { embeds: [embed], components: chunks.length > 1 ? [rows] : [] }
        }

        const message = await interaction.reply(getCompaniesEmbed(0)).catch(() => {});
        if(!message) return

        const collector = await message.createMessageComponentCollector({ filter: i => i.user.id == interaction.member.id, time: 120000 });
        if(!collector) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, false, "editReply");

        let current = 0;
        collector.on("collect", async i => {

            switch(i.customId) {
                case "previous": current--; break;
                case "next": current++; break;
            }

            return i.update(getCompaniesEmbed(current))

        })

        collector.on("end", () => {
            interaction.editReply({ components: [] }).catch(() => {})
        })
        
        } catch (err) {
            console.error(err);
client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    }
};
