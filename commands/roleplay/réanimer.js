const { EmbedBuilder, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    category: { "en": "roleplay", "fr": "roleplay" },
    name: "réanimer",
    nameLocalizations: {
        "fr": "réanimer",
        "en-GB": "revive",
        "en-US": "revive"
    },
    description: "Réanime un joueur",
    descriptionLocalizations: {
        "fr": "Réanime un joueur",
        "en-GB": "Revive a player",
        "en-US": "Revive a player"
    },
    options: [{
        name: "joueur",
        nameLocalizations: {
            "fr": "joueur",
            "en-GB": "player",
            "en-US": "player"
        },
        description: "Mentionnez le joueur à contacter",
        descriptionLocalizations: {
            "fr": "Mentionnez le joueur à contacter",
            "en-GB": "Mention the player to contact",
            "en-US": "Mention the player to contact"
        },
        type: ApplicationCommandOptionType.User,
        required: true
    }],
    run: async(client, interaction, { t, errorEmbed, successEmbed, verify }) =>{

        try {
        
        const member = interaction.options.getMember("joueur");

        if(verify("member", { cantBotInclued: true })) return;

        const state = await client.db.getMemberState(interaction.guildId, member.user.id);
        if(state.coma !== 1) return errorEmbed(t("not_in_coma", { member: member.toString() }));

        await client.db.removeComa(interaction.guildId, member.user.id);
        successEmbed(t("revived", { member: member.toString(), author: interaction.member.toString() }))

        const time = await client.db.getOption(interaction.guildId, "hunger_thirst.time");
        let interval;
        interval = setInterval(async() => {
            
            const session = await client.db.getSession(interaction.guildId, member.id);
            if (!session) return clearInterval(interval);
            
            const hungerQuantity = await client.db.getOption(interaction.guildId, "hunger.quantity");
            const thirstQuantity = await client.db.getOption(interaction.guildId, "thirst.quantity");
            await client.db.removeState(interaction.guildId, member.id, hungerQuantity, thirstQuantity);
            
            const memberState = await client.db.getMemberState(interaction.guildId, member.id);
            
            await interaction.guild.channels.fetch();
            const channelId = await client.db.getOption(interaction.guildId, "hunger_thirst.channel");
            let channel = interaction.guild.channels.cache.get(channelId)
            let dmMember = false;
            if(!channel) {
                channel = member
                dmMember = true;
            }

            let isHunger = (25 < memberState.hunger && memberState.hunger <= 50)
            let isVeryHunger = (0 < memberState.hunger && memberState.hunger <= 25)
            if(isHunger || isVeryHunger) {
                const embed = new EmbedBuilder()
                .setColor(isVeryHunger ? "Red" : "Yellow")
                .setDescription(t(`interactionCreate.${isVeryHunger ? "very_" : ""}hungry`, { hunger: memberState.hunger }))
                
                const memberFlag = await client.db.getMemberFlag(interaction.guildId, member.id, isVeryHunger ? "hunger.very.alert" : "hunger.alert");
                if(memberFlag == 0) {
                    await client.db.updateMemberStateAlert(interaction.guildId, member.id, isVeryHunger ? "hunger.very.alert" : "hunger.alert", 1)
                    channel?.send({ content: dmMember ? null : `||${member.toString()}||`, embeds: [embed] }).catch(() => {
                        interaction.channel.send({ content: `||${member.toString()}||`, embeds: [embed] })
                    })
                }
            }
            
            let isThirst = (25 < memberState.thirst && memberState.thirst <= 50)
            let isVeryThirst = (0 < memberState.thirst && memberState.thirst <= 25)
            if(isThirst || isVeryThirst) {
                const embed = new EmbedBuilder()
                .setColor(isVeryThirst ? "Red" : "Yellow")
                .setDescription(t(`interactionCreate.${isVeryThirst ? "very_" : ""}thirsty`, { hunger: memberState.thirst }))
                
                const memberFlag = await client.db.getMemberFlag(interaction.guildId, member.id, isVeryThirst ? "thirst.very.alert" : "thirst.alert");
                if(memberFlag == 0) {
                    await client.db.updateMemberStateAlert(interaction.guildId, member.id, isVeryThirst ? "thirst.very.alert" : "thirst.alert", 1)   
                    channel?.send({ content: dmMember ? null : `||${member.toString()}||`, embeds: [embed] }).catch(() => {
                        interaction.channel.send({ content: `||${member.toString()}||`, embeds: [embed] })
                    })
                }
            }

            if(memberState.hunger <= 0 || memberState.thirst <= 0) {
                
                clearInterval(interval)
                await client.db.putComa(interaction.guildId, member.id)
                
                const embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`🚑 ${t("interactionCreate.coma", { member: member.toString(), state: memberState.hunger <= 0 && memberState.thirst <= 0 ? t("interactionCreate.both") : memberState.hunger <= 0 ? t("interactionCreate.hunger") : t("interactionCreate.thirst")})}`)
                
                const rows = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("revive").setStyle(ButtonStyle.Danger).setEmoji("🚑").setLabel(t("interactionCreate.revive")))

                return channel?.send({ embeds: [embed], components: [rows] })
                
            }
            
        }, time)

        } catch (err) {
            console.error(err);
            client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
        
    }
};
