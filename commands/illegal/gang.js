const { EmbedBuilder, ApplicationCommandOptionType, time } = require("discord.js");

const code = Math.floor(Math.random() * 9000000000) + 1000000000
module.exports = {
    category: { "en": "illegal", "fr": "illégal" },
    name: "gang",
    description: "Gère le statut de votre gang",
    descriptionLocalizations: {
        "fr": "Gère le statut de votre gang",
        "en-GB": "Manage the status of your gang",
        "en-US": "Manage the status of your gang"
    },
    options: [
        {
            name: "guerre",
            nameLocalizations: {
                "fr": "guerre",
                "en-GB": "war",
                "en-US": "war"
            },
            description: "Rentre en guerre avec un autre gang.",
            descriptionLocalizations: {
                "fr": "Rentre en guerre avec un autre gang.",
                "en-GB": "Enter in a war with another gang.",
                "en-US": "Enter in a war with another gang."
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: "gang",
                nameLocalizations: {
                    "fr": "gang",
                    "en-GB": "gang",
                    "en-US": "gang"
                },
                description: "Spécifiez le gang",
                descriptionLocalizations: {
                    "fr": "Spécifiez le gang",
                    "en-GB": "Specify the gang",
                    "en-US": "Specify the gang"
                },
                type: ApplicationCommandOptionType.String,
                required: true,
                autocomplete: true
            },
            {
                name: "ennemis",
                nameLocalizations: {
                    "fr": "ennemis",
                    "en-GB": "ennemies",
                    "en-US": "ennemies"
                },
                description: "Choisissez l'ennemi avec qui faire la guerre.",
                descriptionLocalizations: {
                    "fr": "Choisissez l'ennemi avec qui faire la guerre.",
                    "en-GB": "Choose the ennemy with which to make war.",
                    "en-US": "Choose the ennemy with which to make war."
                },
                type: ApplicationCommandOptionType.String,
                required: true,
                autocomplete: true
            }],
        },
        {
            name: "paix",
            nameLocalizations: {
                "fr": "paix",
                "en-GB": "peace",
                "en-US": "peace"
            },
            description: "Faites la paix avec un autre gang.",
            descriptionLocalizations: {
                "fr": "Faites la paix avec un autre gang.",
                "en-GB": "Make peace with another gang.",
                "en-US": "Make peace with another gang."
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: "gang",
                nameLocalizations: {
                    "fr": "gang",
                    "en-GB": "gang",
                    "en-US": "gang"
                },
                description: "Spécifiez le gang",
                descriptionLocalizations: {
                    "fr": "Spécifiez le gang",
                    "en-GB": "Specify the gang",
                    "en-US": "Specify the gang"
                },
                type: ApplicationCommandOptionType.String,
                required: true,
                autocomplete: true
            },
            {
                name: "ennemis",
                nameLocalizations: {
                    "fr": "ennemis",
                    "en-GB": "ennemies",
                    "en-US": "ennemies"
                },
                description: "Choisissez l'ennemi avec qui faire la paix.",
                descriptionLocalizations: {
                    "fr": "Choisissez l'ennemi avec qui faire la paix.",
                    "en-GB": "Choose the ennemy with which to make peace.",
                    "en-US": "Choose the ennemy with which to make peace."
                },
                type: ApplicationCommandOptionType.String,
                required: true,
                autocomplete: true
            }
        ],
    }],
    run: async(client, interaction, { t, errorEmbed, verify, lang }) => {

        try {
        
        const method = interaction.options.getSubcommand();

        if(!(interaction.options.getString("gang") ?? `${code}`).startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: "gang" }, "errors"));
        if(!(interaction.options.getString("ennemis") ?? `${code}`).startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == 'fr' ? "ennemis" : "ennemies" }, "errors"));

        const gangId = interaction.options.getString("gang").split("&#46;")[1];
        const ennemiesId = interaction.options.getString("ennemis").split("&#46;")[1];

        if(verify("member", { cantBotInclued: true, cantSelfInclued: true })) return;

        const gang = await client.db.getCompany(interaction.guildId, gangId);
        const ennemies = await client.db.getCompany(interaction.guildId, ennemiesId);
        
        await client.db[method == "guerre" ? "addWar" : "deleteWar"](interaction.guildId, gangId, ennemiesId);

        const embed = new EmbedBuilder()
            .setColor("#030303")
            .setThumbnail("https://imgur.com/W7Lw6pP.png")
            .setAuthor({ name: "Dark Chat", iconURL: "https://imgur.com/EgcZngN.png" })
            .setDescription(t(method == "guerre" ? "war" : "peace", { member: interaction.member.toString(), gang: gang.name, ennemies: ennemies.name, date: time(new Date(), "D") }))

        interaction.reply({ embeds: [embed] }).catch(() => {})

        
        } catch (err) {
            console.error(err);
client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
    },

    runAutocomplete: async(client, interaction) => {

        const focusedOption = interaction.options.getFocused(true);
        const response = [];
        const method = interaction.options._subcommand;
        const optionGang = focusedOption.name == "gang" ? true : false;

        const gangs = (await client.db.getCompaniesWithOwner(interaction.guildId)).filter(c => c.type == 4 && (optionGang ? c.user_id.find(e => e == interaction.member.id) == interaction.member.id : c.user_id.find(e => e == interaction.member.id) !== interaction.member.id)).sort((a, b) => a.name.localeCompare(b.name))
        if(!optionGang) {
            for (const gang of gangs) {
                const war = await client.db.getWar(interaction.guildId, interaction.options._hoistedOptions[0].value.replace(`${code}`, ""), gang.id);
                if(method == "guerre" ? !war : war) response.push(gang);
            } 
        } else response.push(...gangs)

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
