const { EmbedBuilder, ShardClientUtil, WebhookClient, ActionRowBuilder, ButtonBuilder, ButtonStyle, inlineCode, time, spoiler } = require("discord.js");

module.exports.run = async(client) => {
    
    client.logger.success(`Cluster ${client.cluster.id+1}/${client.cluster.count} is ready and logged in as ${client.user.tag}!`);

    // if (client.cluster.ids.has(0)) client.apiServer = (new (require("../../structures/APIServer"))(client))

    if (client.cluster.id == client.cluster.count-1) {
        // if (premiumCheck ?? true) {
        //     checkPremiumEnd(client);
        //     setInterval(() => checkPremiumEnd(client), 900000); // Every 15 min
        // }

        // Send the restart embed on #reloads
        // const restart_embed = new EmbedBuilder()
        //     .setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL() })
        //     .setDescription(`${client.constants.emojis.reussi} Restart successfully completed for ${client.cluster.count} shard(s)!`)
        //     .setColor("Green");
        // restart.send({ embeds: [restart_embed] });

        // Update blacklist cache
        updateBlacklistCache(client);
        setInterval(async () => await updateBlacklistCache(client), 900000); // Every 15 min

        // Check consumptions end
        checkConsumptionsEnd(client);
        setInterval(() => checkConsumptionsEnd(client), 180000); // Every 3 min
        
        // Update commands on team server for non beta-testor bot
        try {
            if (client.config.team_server) {
                let { category, staff_level, run, ...updateCommades } = require("../../commands/admindev/update-commandes");
                let { category: c, staff_level: s, run: r, ...updateCommande } = require("../../commands/admindev/update-commande");
                
                let teamServerCommands = await client.application.commands.fetch({ guildId: client.config.team_server });
                if (teamServerCommands.find(c => c.name === "update-cmds")) client.application.commands.delete(teamServerCommands.find(c => c.name === "update-cmds").id, client.config.team_server);
                if (!teamServerCommands.find(c => c.name === "update-commandes")) {
                    console.log("Creating /update-commandes");
                    await client.application.commands.create(updateCommades, client.config.team_server);
                } else if (!teamServerCommands.find(c => c.name === "update-commande")) {
                    console.log("Creating /update-commande");
                    await client.application.commands.create(updateCommande, client.config.team_server);
                }
            } else console.log("No team server, no update-commands command");
        } catch (err) {
            console.log("Failed to add update-commands :", err)
        }


        // restart count of hunger / thirst for all members
        const sessions = await client.db.getAllSessions();
        if (sessions.length > 0) client.logger.perso("cyan", `[SESSIONS] Start checking ${sessions.length} session(s)`);
        for (const session of sessions) {

            const time = await client.db.getOption(session.guild_id, "hunger_thirst.time");
            const lang = await client.db.getOption(session.guild_id, "guild.lang");

            let interval;
            interval = setInterval(async() => {
                
                const hungerQuantity = await client.db.getOption(session.guildId, "hunger.quantity");
                const thirstQuantity = await client.db.getOption(session.guild_id, "thirst.quantity");
                await client.db.removeState(session.guild_id, session.user_id, hungerQuantity, thirstQuantity);
                
                const memberState = await client.db.getMemberState(session.guild_id, session.user_id);

                await client.guilds.fetch()
                const guild = client.guilds.cache.get(session.guild_id)
                if (!guild) return clearInterval(interval)

                await guild.channels.fetch()
                const channelId = await client.db.getOption(session.guild_id, "hunger_thirst.channel");
                let channel = guild.channels.cache.get(channelId)
                
                let dmMember = false
                if (!channel) {

                    await guild.members.fetch()
                    const member = guild.members.cache.get(session.user_id)
                    if (!member) return clearInterval(interval)
                    else channel = member
                    dmMember = true

                }
                
                let isHunger = (25 < memberState.hunger && memberState.hunger <= 50)
                let isVeryHunger = (0 < memberState.hunger && memberState.hunger <= 25)
                if (isHunger || isVeryHunger) {
                    const embed = new EmbedBuilder()
                    .setColor(isVeryHunger ? "Red" : "Yellow")
                    .setDescription(client.translate.t(lang, `interactionCreate.${isVeryHunger ? "very_" : ""}hungry`, { hunger: memberState.hunger }, "events"))
                    
                    const memberFlag = await client.db.getMemberFlag(session.guild_id, session.user_id, isVeryHunger ? "hunger.very.alert" : "hunger.alert")
                    if (memberFlag == 0) {
                        await client.db.updateMemberStateAlert(session.guild_id, session.user_id, isVeryHunger ? "hunger.very.alert" : "hunger.alert", 1)
                        channel.send({ content: dmMember ? null : `||<@${session.user_id}>||`, embeds: [embed] }).catch(() => {})
                    }
                }
                
                let isThirst = (25 < memberState.thirst && memberState.thirst <= 50)
                let isVeryThirst = (0 < memberState.thirst && memberState.thirst <= 25)
                if (isThirst || isVeryThirst) {
                    const embed = new EmbedBuilder()
                    .setColor(isVeryThirst ? "Red" : "Yellow")
                    .setDescription(client.translate.t(lang, `interactionCreate.${isVeryThirst ? "very_" : ""}thirsty`, { hunger: memberState.thirst }, "events"))
                    
                    const memberFlag = await client.db.getMemberFlag(session.guild_id, session.user_id, isVeryThirst ? "thirst.very.alert" : "thirst.alert")
                    if (memberFlag == 0) {
                        await client.db.updateMemberStateAlert(session.guild_id, session.user_id, isVeryThirst ? "thirst.very.alert" : "thirst.alert", 1)   
                        channel.send({ content: dmMember ? null : `||<@${session.user_id}>||`, embeds: [embed] }).catch(() => {})
                    }
                }

                if (memberState.hunger <= 0 || memberState.thirst <= 0) {
                    
                    clearInterval(interval)
                    await client.db.putComa(session.guild_id, session.user_id)
                    
                    const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(`🚑 ${client.translate.t(lang, "interactionCreate.coma", {
                        member: `<@${session.user_id}>`,
                        state: memberState.hunger <= 0 && memberState.thirst <= 0
                            ? client.translate.t(lang, "interactionCreate.both", false, "events")
                            : memberState.hunger <= 0
                            ? client.translate.t(lang, "interactionCreate.hunger", false, "events")
                            : client.translate.t(lang, "interactionCreate.thirst", false, "events")},
                        "events")}`)
                    
                    const rows = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("revive").setStyle(ButtonStyle.Danger).setEmoji("🚑").setLabel(client.translate.t(lang, "interactionCreate.revive", false, "events")))

                    return channel.send({ embeds: [embed], components: dmMember ? [] : [rows] })
                    
                }
                
            }, time)

        }


    }

};

const checkConsumptionsEnd = async(client) => {
    const ended_consumptions = await client.db.getEndedConsumptions();

    if (ended_consumptions?.length > 0) {
        client.logger.info(`${ended_consumptions.length} deleted consumption(s)`);
        client.db.deleteEndedConsumptions(ended_consumptions);
    }
};

const updateBlacklistCache = async(client) => {
    try {
        const users = await client.db.getBlacklistedUsers();
        client._blacklistedUsers = new Set(users);
    } catch (e) {
        client.logger.error("Error while updating the blacklist cache", e);
    }
}

const checkPremiumEnd = async(client) => {
    const premiums = await client.db.getPremiums();
    if (premiums.length > 0) client.logger.perso("yellow", `[PREMIUM] Start checking ${premiums.length} premium subscription(s)`);

    for (const premium of premiums) {
        try {
            if (premium.end_date <= Date.now() && premium.status === 'active') {
                await client.db.setPremiumStatus(premium.id, 'expired');
                await client.cluster.broadcastEval(async (client, { userId, hasActivePremium }) => {
                    let fetchGuild = await client.guilds.fetch('712311871536889937');
                    if (fetchGuild) {
                        let fetchMember = await fetchGuild.members.fetch(userId);
                        if (!fetchMember) return client.logger.perso("red", `[PREMIUM] - Error while fetching guild for ${userId}`);
                        if (fetchMember.roles.cache.get('714911089363517530') && !hasActivePremium) {
                            fetchMember.roles.remove('714911089363517530', `[PREMIUM] - L'utilisateur n'a plus d'abonnement Premium actif.`);
                        } else if (hasActivePremium && !fetchMember.roles.cache.get('714911089363517530')) {
                            fetchMember.roles.add('714911089363517530', `[PREMIUM] - L'utilisateur a un abonnement Premium actif.`);
                        }
                    } else client.logger.perso("red", `[PREMIUM] - Error while fetching support guild`);
                }, { guildId: '712311871536889937', context: { userId: premium.user_id, hasActivePremium: premiums.filter((c) => c.user_id === premium.user_id && ['active', 'paused'].includes(c.status)).length } })
            };
        } catch (e) { client.logger.perso("red", `[PREMIUM] - Failed to review premium subscription for ${premium.user_id}`, e); }
    };
}
