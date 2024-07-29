const { ShardClientUtil, ApplicationCommandOptionType, EmbedBuilder, inlineCode, time } = require("discord.js");

module.exports = {
        name: "informations",
        category: { "en": "admindev", "fr": "admindev" },
        nameLocalizations: {
            "fr": "informations",
            "en-GB": "informations",
            "en-US": "informations"
        },
        description: "Affiche les informations de l'option choisie.",
        descriptionLocalizations: {
            "fr": "Affiche les informations de l'option choisie.",
            "en-GB": "Displays information for the selected option.",
            "en-US": "Displays information for the selected option."
        },
        options: [
            {
                name: "serveur",
                nameLocalizations: {
                    "fr": "serveur",
                    "en-GB": "guild",
                    "en-US": "guild"
                },
                description: "Donne les informations sur un serveur.",
                descriptionLocalizations: {
                    "fr": "Donne les informations sur un serveur.",
                    "en-GB": "Gives information about a guild.",
                    "en-US": "Gives information about a guild."
                },
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "id-serveur",
                        nameLocalizations: {
                            "fr": "id-serveur",
                            "en-GB": "guild-id",
                            "en-US": "guild-id"
                        },
                        description: "Identifiant du serveur.",
                        descriptionLocalizations: {
                            "fr": "Identifiant du serveur.",
                            "en-GB": "Guild ID.",
                            "en-US": "Guild ID."
                        },
                        type: ApplicationCommandOptionType.String,
                        minLength: 17,
                        maxLength: 19,
                        required: true,
                    }
                ]
            },
            {
                name: "permissions",
                nameLocalizations: {
                    "fr": "permissions",
                    "en-GB": "permissions",
                    "en-US": "permissions"
                },
                description: "Affiche les permissions de l'option choisie.",
                descriptionLocalizations: {
                    "fr": "Affiche les permissions de l'option choisie.",
                    "en-GB": "Displays the permissions of the chosen option.",
                    "en-US": "Displays the permissions of the chosen option."
                },
                type: ApplicationCommandOptionType.SubcommandGroup,
                options: [
                    {
                        name: "bot-salon",
                        nameLocalizations: {
                            "fr": "salon",
                            "en-GB": "channel",
                            "en-US": "channel"
                        },
                        description: "Vérifier les permissions du bot dans un salon.",
                        descriptionLocalizations: {
                            "fr": "Vérifier les permissions du bot dans un salon.",
                            "en-GB": "Check bot permissions in a channel.",
                            "en-US": "Check bot permissions in a channel."
                        },
                        type: ApplicationCommandOptionType.Subcommand,
                        options: [
                            {
                                name: "id-serveur",
                                nameLocalizations: {
                                    "fr": "id-serveur",
                                    "en-GB": "guild-id",
                                    "en-US": "guild-id"
                                },
                                description: "Identifiant du serveur.",
                                descriptionLocalizations: {
                                    "fr": "Identifiant du serveur.",
                                    "en-GB": "Guild ID.",
                                    "en-US": "Guild ID."
                                },
                                type: ApplicationCommandOptionType.String,
                                minLength: 17,
                                maxLength: 19,
                                required: true,
                            },
                            {
                                name: "id-salon",
                                nameLocalizations: {
                                    "fr": "id-salon",
                                    "en-GB": "channel-id",
                                    "en-US": "channel-id"
                                },
                                description: "Identifiant du salon.",
                                descriptionLocalizations: {
                                    "fr": "Identifiant du salon.",
                                    "en-GB": "Channel ID.",
                                    "en-US": "Channel ID."
                                },
                                type: ApplicationCommandOptionType.String,
                                minLength: 17,
                                maxLength: 19,
                                required: true,
                            },
                        ]
                    },
                    {
                        name: "bot-serveur",
                        nameLocalizations: {
                            "fr": "serveur",
                            "en-GB": "guild",
                            "en-US": "guild"
                        },
                        description: "Vérifier les permissions du bot dans un serveur.",
                        descriptionLocalizations: {
                            "fr": "Vérifier les permissions du bot dans un serveur.",
                            "en-GB": "Check bot permissions in a guild.",
                            "en-US": "Check bot permissions in a guild."
                        },
                        type: ApplicationCommandOptionType.Subcommand,
                        options: [
                            {
                                name: "id-serveur",
                                nameLocalizations: {
                                    "fr": "id-serveur",
                                    "en-GB": "guild-id",
                                    "en-US": "guild-id"
                                },
                                description: "Identifiant du serveur.",
                                descriptionLocalizations: {
                                    "fr": "Identifiant du serveur.",
                                    "en-GB": "Guild ID.",
                                    "en-US": "Guild ID."
                                },
                                type: ApplicationCommandOptionType.String,
                                minLength: 17,
                                maxLength: 19,
                                required: true,
                            }
                        ]
                    },
                    {
                        name: "rôle",
                        nameLocalizations: {
                            "fr": "rôle",
                            "en-GB": "role",
                            "en-US": "role"
                        },
                        description: "Vérifier les permissions d'un rôle dans un serveur.",
                        descriptionLocalizations: {
                            "fr": "Vérifier les permissions d'un rôle dans un serveur.",
                            "en-GB": "Check the permissions of a role in a guild.",
                            "en-US": "Check the permissions of a role in a guild."
                        },
                        type: ApplicationCommandOptionType.Subcommand,
                        options: [
                            {
                                name: "id-serveur",
                                nameLocalizations: {
                                    "fr": "id-serveur",
                                    "en-GB": "guild-id",
                                    "en-US": "guild-id"
                                },
                                description: "Identifiant du serveur.",
                                descriptionLocalizations: {
                                    "fr": "Identifiant du serveur.",
                                    "en-GB": "Guild ID.",
                                    "en-US": "Guild ID."
                                },
                                type: ApplicationCommandOptionType.String,
                                minLength: 17,
                                maxLength: 19,
                                required: true,
                            },
                            {
                                name: "id-rôle",
                                nameLocalizations: {
                                    "fr": "id-rôle",
                                    "en-GB": "role-id",
                                    "en-US": "role-id"
                                },
                                description: "Identifiant du rôle.",
                                descriptionLocalizations: {
                                    "fr": "Identifiant du rôle.",
                                    "en-GB": "Role ID.",
                                    "en-US": "Role ID."
                                },
                                type: ApplicationCommandOptionType.String,
                                minLength: 17,
                                maxLength: 19,
                                required: true,
                            }
                        ]
                    }
                ]
            },
            {
                name: "liste-rôles-bot",
                nameLocalizations: {
                    "fr": "liste-rôles-bot",
                    "en-GB": "bot-roles-list",
                    "en-US": "bot-roles-list"
                },
                description: "Affiche les rôles que le bot possède sur un serveur.",
                descriptionLocalizations: {
                    "fr": "Affiche les rôles que le bot possède sur un serveur.",
                    "en-GB": "Shows the roles the bot has on a guild.",
                    "en-US": "Shows the roles the bot has on a guild."
                },
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "id-serveur",
                        nameLocalizations: {
                            "fr": "id-serveur",
                            "en-GB": "guild-id",
                            "en-US": "guild-id"
                        },
                        description: "Identifiant du serveur.",
                        descriptionLocalizations: {
                            "fr": "Identifiant du serveur.",
                            "en-GB": "Guild ID.",
                            "en-US": "Guild ID."
                        },
                        type: ApplicationCommandOptionType.String,
                        minLength: 17,
                        maxLength: 19,
                        required: true,
                    }
                ]
            }
        ],
    staff_level: 1,
    run: async(client, interaction, { errorEmbed, successEmbed }) => {

        const method = interaction.options.getSubcommand();
        const guildId = interaction.options.getString("id-serveur");
        const shardId = ShardClientUtil.shardIdForGuildId(guildId, interaction.client.cluster.count);

        switch (method) {

            case "serveur": {

                const guildCheck = (await client.cluster.broadcastEval(
                    async (client, { guildId }) => {
                        try {
                            let fetchGuild = await client.guilds.fetch(guildId).catch(e => null)
                            if (!fetchGuild) return null;

                            return {
                                name: fetchGuild.name,
                                id: fetchGuild.id,
                                description: fetchGuild.description,
                                owner: fetchGuild.ownerId,
                                memberCount: fetchGuild.memberCount,
                                rolesSize: fetchGuild.roles.cache.size,
                                channelsSize: fetchGuild.channels.cache.size,
                                createdTimestamp: fetchGuild.createdTimestamp,
                                shard: fetchGuild.shard.id,
                                available: fetchGuild.available,
                                vanityURLCode: fetchGuild.vanityURLCode,
                                icon: fetchGuild.iconURL({ dynamic: true }),
                                banner: fetchGuild.bannerURL()
                            }
                        } catch (e) { return null }
                    },
                    {
                        guildId,
                        context: { guildId },
                    }
                ))[0];
    
                if (!guildCheck) return interaction.reply(errorEmbed(`I did not find a guild corresponding to the ${inlineCode(guildId)} ID !`)).catch(() => {});

                const guildEmbed = new EmbedBuilder().setTitle(`${guildCheck.name} *(${guildCheck.id})*`)
                    .setURL(guildCheck.vanityURLCode ? `https://discord.gg/${guildCheck.vanityURLCode}` : null).setColor('White').setThumbnail(guildCheck.icon ?? null)
                    .setDescription(guildCheck.available ? guildCheck.description ? `**Description**\n${guildCheck.description}` : `${client.constants.emojis.reussi} Available` : `${client.constants.emojis.echec} Unavailable`);
                
                if (guildCheck.banner) guildEmbed.setImage(guildCheck.banner ?? null);
                if (guildCheck.owner) guildEmbed.addFields([{ name: "Owner", value: `<@${guildCheck.owner}> *(${guildCheck.owner})*` }]);
                if (guildCheck.shard) guildEmbed.addFields([{ name: "Shard", value: `#${guildCheck.shard}/${client.cluster.count-1}`, inline: true }]);
                if (guildCheck.memberCount) guildEmbed.addFields([{ name: "Member count", value: guildCheck.memberCount.toLocaleString("en"), inline: true }]);
                if (guildCheck.rolesSize) guildEmbed.addFields([{ name: "Number of roles", value: guildCheck.rolesSize.toLocaleString("en"), inline: true }]);
                if (guildCheck.channelsSize) guildEmbed.addFields([{ name: "Number of channels", value: guildCheck.channelsSize.toLocaleString("en"), inline: true }]);
                if (guildCheck.createdTimestamp) guildEmbed.addFields([{ name: "Server creation", value: `${time(new Date(guildCheck.createdTimestamp), "F")} (${time(new Date(guildCheck.createdTimestamp), "R")})` }])
                
                return interaction.reply({
                    embeds: [guildEmbed]
                });
            }

            case "bot-salon": {

                const channelId = interaction.options.getString("id-salon");

                const guildChannel = (await client.cluster.broadcastEval(
                    async (client, { guildId, channelId }) => {

                        var fetchGuild, fetchChannel;
                        try {
                            await client.guilds.fetch(guildId).then(
                                guild =>
                                    fetchGuild = guild
                            );

                            if (!fetchGuild) return null;
                        } catch (e) { return null };

                        try {
                            await fetchGuild.channels.fetch(channelId).then(
                                channel =>
                                    fetchChannel = channel
                            );

                            if (!fetchChannel) return 0;

                            return {
                                permissions: fetchGuild.members.me.permissionsIn(channelId).toArray(),
                                guildName: fetchGuild.name
                            }
                        } catch (e) { return 0 };
                    },
                    {
                        shardId,
                        context: { guildId, channelId },
                    }
                ))[shardId];

                if (guildChannel == null) return interaction.reply(errorEmbed(`I did not find a guild corresponding to the ${inlineCode(guildId)} ID !`)).catch(() => {});

                if (guildChannel == 0) return interaction.reply(errorEmbed(`I did not find a channel corresponding to the ${inlineCode(channelId)} ID !`)).catch(() => {});

                return successEmbed(`Here is the list of permissions for <@${interaction.client.user.id}> in the <#${channelId}> channel of the **${guildChannel.guildName}** *(${guildId})* guild :\n${guildChannel.permissions.map(r => `\n${inlineCode(r)}`)}`).catch(() => {});
            }

            case "bot-serveur": {
            
                const guildServer = (await client.cluster.broadcastEval(
                    async (client, { guildId }) => {

                        var fetchGuild;
                        try {
                            await client.guilds.fetch(guildId).then(
                                guild =>
                                    fetchGuild = guild
                            );

                            if (!fetchGuild) return null;
                        
                            return {
                                permissions: fetchGuild.members.me.permissions.toArray(),
                                guildName: fetchGuild.name
                            }
                        } catch (e) { return null };
                    },
                    {
                        shardId,
                        context: { guildId },
                    }
                ))[shardId];
    
                if (guildServer == null) return errorEmbed(`I did not find a guild corresponding to the ${inlineCode(guildId)} ID !`).catch(() => {});

                return successEmbed(`Here is the list of permissions of <@${interaction.client.user.id}> in **${guildServer.guildName}** *(${guildId})* guild :\n${guildServer.permissions.map(r => `\n${inlineCode(r)}`)}`).catch(() => {});
            }

            case "rôle": {

                const roleId = interaction.options.getString("id-rôle");

                const guildRole = (await client.cluster.broadcastEval(
                    async (client, { guildId, roleId }) => {

                        var fetchGuild, fetchRole;
                        try {
                            await client.guilds.fetch(guildId).then(
                                guild =>
                                    fetchGuild = guild
                            );

                            if (!fetchGuild) return null;
                        } catch (e) { return null };

                        try {
                            await fetchGuild.roles.fetch(roleId).then(
                                role =>
                                    fetchRole = role
                            );

                            if (!fetchRole) return 0;
    
                            return {
                                roleName: fetchRole.name,
                                permissions: fetchRole.permissions.toArray(),
                                guildName: fetchGuild.name
                            }
                        } catch (e) { return 0 };
                    },
                    {
                        shardId,
                        context: { guildId, roleId },
                    }
                ))[shardId];

                if (guildRole == null) return interaction.reply(errorEmbed(`I did not find a guild corresponding to the ${inlineCode(guildId)} ID !`)).catch(() => {});

                if (guildRole == 0) return interaction.reply(errorEmbed(`I did not find a role corresponding to the ${inlineCode(roleId)} ID !`)).catch(() => {});

                return successEmbed(`Here is the list of **${guildRole.roleName}** role permissions in the **${guildRole.guildName}** *(${guildId})* guild :\n${guildRole.permissions.map(r => `\n${inlineCode(r)}`)}`).catch(() => {});
            }

            case "liste-rôles-bot": {
                
                const guildRoles = (await client.cluster.broadcastEval(
                    async (client, { guildId }) => {

                        var fetchGuild;
                        try {
                            await client.guilds.fetch(guildId).then(
                                guild =>
                                    fetchGuild = guild
                            );

                            if (!fetchGuild) return null;
                        
                            return {
                                roles: fetchGuild.members.me.roles.cache,
                                guildName: fetchGuild.name
                            }
                        } catch (e) { return null };
                    },
                    {
                        shardId,
                        context: { guildId },
                    }
                ))[shardId];

                if (guildRoles == null) return errorEmbed(`I did not find a guild corresponding to the ${inlineCode(guildId)} ID !`).catch(() => {});

                return successEmbed(`Here is the list of <@${interaction.client.user.id}> roles in the **${guildRoles.guildName}** *(${guildId})* guild :\n${guildRoles.roles.filter((r) => r.id != guildId).map(r => `\n${r.name} - ${inlineCode(r.id)}`)}`).catch(() => {});
            }
        }
    }
}
