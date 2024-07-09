const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    name: "update-commande",
    nameLocalizations: {
        "fr": "update-commande",
        "en-GB": "update-command",
        "en-US": "update-command"
    },
    category: { "en": "admindev", "fr": "admindev" },
    description: "Mets à jour une commande slash.",
    descriptionLocalizations: {
        "fr": "Mets à jour une commande slash.",
        "en-GB": "Update a slash command.",
        "en-US": "Update a slash command."
    },
    options: [{
        name: "commande",
        required: true,
        nameLocalizations: {
            "fr": "commande",
            "en-GB": "command",
            "en-US": "command"
        },
        description: "La commande à modifier",
        descriptionLocalizations: {
            "fr": "La commande à modifier",
            "en-GB": "The command to update.",
            "en-US": "The command to update."
        },
        type: ApplicationCommandOptionType.String,
    }],
    staff_level: 3,
    run: async(client, interaction) => {

        if(client.config.team_server !== interaction.guildId) return interaction.reply(`${client.constants.emojis.redEchec} Cette commande est désactivée sur ce serveur !`).catch(() => {});
        if(!client.config.admin_users.includes(interaction.user.id)) return interaction.reply(`${client.constants.emojis.redEchec} Vous n'êtes pas autorisé à utiliser cette commande !`).catch(() => {});
        
        const commandName = interaction.options.getString("commande");
        const command = client.commands.get(commandName);

        const fetchCommand = (await client.application.commands.fetch()).filter(c => c.name === command.name);
        if(!fetchCommand.size || !command) return interaction.reply(`${client.constants.emojis.redEchec} Cette commande n'existe pas !`).catch(() => {});

        await interaction.reply(client.constants.emojis.load + " Loading...").catch(() => {});

        client.application.commands.update(fetchCommand.first().id, command).then(() => {
            return interaction.editReply(`${client.constants.emojis.add} La commande ${commandName} a bien été mise à jour !`).catch(() => {});
        }).catch(e => {
            console.log(e);
            return interaction.editReply(`${client.constants.emojis.redEchec} Une erreur est survenue lors de la mise à jour de la commande !`).catch(() => {});
        });
        
    }
};