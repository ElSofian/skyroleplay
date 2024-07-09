const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    name: "update-commandes",
    nameLocalizations: {
        "fr": "update-commandes",
        "en-GB": "update-commands",
        "en-US": "update-commands"
    },
    category: { "en": "admindev", "fr": "admindev" },
    description: "Mets à jour les slash commandes.",
    descriptionLocalizations: {
        "fr": "Mets à jour les slash commandes.",
        "en-GB": "Update slash commands.",
        "en-US": "Update slash commands."
    },
    options: [{
        name: "commands-type",
        required: true,
        nameLocalizations: {
            "fr": "type-de-commandes",
            "en-GB": "commands-type",
            "en-US": "commands-type"
        },
        description: "Le type de commandes à mettre à jour",
        descriptionLocalizations: {
            "fr": "Le type de commandes à mettre à jour",
            "en-GB": "The type of commands to update",
            "en-US": "The type of commands to update"
        },
        type: ApplicationCommandOptionType.String,
        choices: [
            {
                name: "commandes publiques",
                value: "public"
            },
            {
                name: "commandes privées",
                value: "admin"
            }
        ]
    }],
    staff_level: 3,
    run: async (client, interaction) => {
        
        // À enlever quand le admin_users sera ajouté au public
        //if (!client.config.admin_users.includes(interaction.user.id)) return interaction.reply(`${client.constants.emojis.redEchec} Vous n'êtes pas autorisé à utiliser cette commande !`).catch(() => { });
        if(!["909074665681612800", "683269450086219777", "320611120484188162", "274999371144364033"].includes(interaction.user.id)) return interaction.reply(`${client.constants.emojis.redEchec} Vous n'êtes pas autorisé à utiliser cette commande !`).catch(() => {})

        await interaction.reply(client.constants.emojis.load + " Loading...").catch(() => {});

        const commandsType = interaction.options.getString("commands-type");

        try {
            
            if(commandsType == 'public') await client.application.commands.set(client.commands.filter(c => c.category.en !== 'admindev'))
            else await client.application.commands.set(client.commands.filter(c => c.category.en === 'admindev'), client.config.team_server);

            return interaction.editReply(`${client.constants.emojis.add} Les commandes ${commandsType == 'public' ? 'publiques' : 'admin'} ont bien été mises à jour !`).catch(() => {});
        } catch (err) {
            console.log(e);
            interaction.editReply(`${client.constants.emojis.redEchec} Une erreur est survenue lors de la mise à jour des commandes privées !`).catch(() => {});
        }

    }
};