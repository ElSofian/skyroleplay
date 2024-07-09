const { EmbedBuilder, ApplicationCommandOptionType, time } = require("discord.js");

module.exports = {
        name: "blacklist",
        category: { "en": "admindev", "fr": "admindev" },
        description: "Gère un joueur en liste noire.",
        descriptionLocalizations: {
            "fr": "Gère un joueur en liste noire.",
            "en-GB": "Manages a blacklisted player.",
            "en-US": "Manages a blacklisted player."
        },
        options: [
            {
                name: "ajouter",
                nameLocalizations: {
                    "fr": "ajouter",
                    "en-GB": "add",
                    "en-US": "add"
                },
                description: "Ajoute un joueur à la liste noire.",
                descriptionLocalizations: {
                    "fr": "Ajoute un joueur à la liste noire.",
                    "en-GB": "Adds a player to the blacklist.",
                    "en-US": "Adds a player to the blacklist."
                },
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "joueur",
                        nameLocalizations: {
                            "fr": "joueur",
                            "en-GB": "player",
                            "en-US": "player"
                        },
                        description: "joueur (ID) à blacklist.",
                        descriptionLocalizations: {
                            "fr": "Joueur (ID) à blacklist.",
                            "en-GB": "Player (ID) to blacklist.",
                            "en-US": "Player (ID) to blacklist."
                        },
                        type: ApplicationCommandOptionType.String,
                        required: true,
                    },
                    {
                        name: "raison",
                        nameLocalizations: {
                            "fr": "raison",
                            "en-GB": "reason",
                            "en-US": "reason"
                        },
                        description: "Raison de l'ajout en liste noire.",
                        descriptionLocalizations: {
                            "fr": "Raison de l'ajout en liste noire.",
                            "en-GB": "Reason for blacklisting.",
                            "en-US": "Reason for blacklisting."
                        },
                        type: ApplicationCommandOptionType.String,
                        required: true,
                    },
                ]
            },
            {
                name: "retirer",
                nameLocalizations: {
                    "fr": "retirer",
                    "en-GB": "remove",
                    "en-US": "remove"
                },
                description: "Retire un joueur de la liste noire.",
                descriptionLocalizations: {
                    "fr": "Retire un joueur de la liste noire.",
                    "en-GB": "Removes a player from the blacklist.",
                    "en-US": "Removes a player from the blacklist."
                },
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "joueur",
                        nameLocalizations: {
                            "fr": "joueur",
                            "en-GB": "player",
                            "en-US": "player"
                        },
                        description: "Joueur (ID) à blacklist.",
                        descriptionLocalizations: {
                            "fr": "Joueur (ID) à blacklist.",
                            "en-GB": "Player (ID) to blacklist.",
                            "en-US": "Player (ID) to blacklist."
                        },
                        type: ApplicationCommandOptionType.String,
                        required: true,
                    },
                ]
            },
            {
                name: "vérifier",
                nameLocalizations: {
                    "fr": "vérifier",
                    "en-GB": "check",
                    "en-US": "check"
                },
                description: "Vérifie si un joueur est en liste noire.",
                descriptionLocalizations: {
                    "fr": "Vérifie si un joueur est en liste noire.",
                    "en-GB": "Checks if a player is blacklisted.",
                    "en-US": "Checks if a player is blacklisted."
                },
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "joueur",
                        nameLocalizations: {
                            "fr": "joueur",
                            "en-US": "player",
                            "en-GB": "player"
                        },
                        description: "Joueur (ID) à vérifier.",
                        descriptionLocalizations: {
                            "fr": "Joueur (ID) à vérifier.",
                            "en-GB": "Player (ID) to verify.",
                            "en-US": "Player (ID) to verify."
                        },
                        type: ApplicationCommandOptionType.String,
                        required: true,
                    },
                ]
            },
        ],
    staff_level: 3,
    run: async(client, interaction, { errorEmbed }) => {

        // Blacklist channel on the NiTeam guild
        if(interaction.channelId != '926100677720166461') return errorEmbed("You must use this command in the <#926100677720166461> channel!");

        const method = interaction.options.getSubcommand();
        const user = interaction.options.getString("joueur");
        const reason = interaction.options.getString("raison");

        if(!user.match(/^[0-9]{17,19}$/gm)) return errorEmbed("Please provide a valid user ID...");
        
        if(await client.db.getStaff(user)) return errorEmbed("It is impossible to sanction a member of the NiTeam...");

        var blacklist = await client.db.getBlacklist(user);

        switch (method) {
            case 'ajouter':
                if(blacklist) return errorEmbed(`<@${user}> is already blacklisted!`);

                await client.db.addBlacklist(user, reason, interaction.user.id);

                const embedAdd = new EmbedBuilder()
                .setTitle(`${client.constants.emojis.add}  Adding a player to blacklist`)
                .setColor("#41AE7C")
                .addFields([
                    { name: 'User', value: `<@${user}> *(${user})*` },
                    { name: 'Reason', value: reason || "*?*" },
                    { name: 'Moderator', value: `${interaction.user} *(${interaction.user.id})*` }
                ])
                .setTimestamp()

                return interaction.reply({ embeds: [embedAdd] }).catch(() => {});

            case 'retirer':
                if(!blacklist) return errorEmbed(`<@${user}> is not blacklisted!`);

                await client.db.removeBlacklist(user);

                const embedRemove = new EmbedBuilder()
                    .setTitle(`${client.constants.emojis.remove}  Remove a blacklisted user`)
                    .setColor("Red")
                    .addFields([
                        { name: 'User', value: `<@${user}> *(${user})*` },
                        { name: 'Reason', value: blacklist.reason || "*?*" },
                        { name: 'Moderator who added to blacklist', value: `<@${blacklist.moderator_id}> *(${blacklist.moderator_id})*` },
                        { name: 'Moderator who removed from the blacklist', value: `${interaction.user} *(${interaction.user.id})*` },
                        { name: 'Blacklisted date', value: time(blacklist.date, "d") }
                    ])
                    .setTimestamp()

                return interaction.reply({ embeds: [embedRemove] }).catch(() => {});

            case 'vérifier':
                if(!blacklist) return errorEmbed(`<@${user}> is not blacklisted!`);

                const embed = new EmbedBuilder()
                    .setTitle(`${client.constants.emojis.reussi}  Verifying a blacklisted user`)
                    .setColor("#3CB371")
                    .addFields([
                        { name: 'User', value: `<@${user}> *(${user})*` },
                        { name: 'Reason', value: blacklist.reason || "*?*" },
                        { name: 'Moderator', value: `<@${blacklist.moderator_id}> *(${blacklist.moderator_id})*` },
                        { name: 'Blacklisted date', value: time(blacklist.date, "d") }
                    ])
                    .setTimestamp()

                return interaction.reply({ embeds: [embed] }).catch(() => {});
        }

    }

}