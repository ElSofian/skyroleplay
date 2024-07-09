const { EmbedBuilder, ShardClientUtil, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    category: { "en": "informations", "fr": "informations" },
    name: "check-staff",
    description: "Vérifie si un membre est de l'équipe de NiDev.",
    descriptionLocalizations: {
        "fr": "Vérifie si un membre est de l'équipe de NiDev.",
        "en-GB": "Check if a member is part of the NiDev team.",
        "en-US": "Check if a member is part of the NiDev team."
    },
    options: [{
        name: "membre",
        nameLocalizations: {
            "fr": "membre",
            "en-GB": "member",
            "en-US": "member"   
        },
        description: "Mentionnez le membre à vérifier.",
        descriptionLocalizations: { 
            "fr": "Mentionnez le membre à vérifier.",
            "en-GB": "Mention the member to check.",
            "en-US": "Mention the member to check."
        },
        type: ApplicationCommandOptionType.User,
        required: true,
    }],
    run: async(client, interaction, { t, errorEmbed, verify }) =>{

        try {

        const member = interaction.options.getMember("membre");
        if(verify("member", { cantBotInclued: true })) return;

        const shard = ShardClientUtil.shardIdForGuildId('712409878949527673', client.cluster.count);
        var role = await client.cluster.broadcastEval(
            async (client, { IDMember }) => {

                let fetchGuild, fetchMember;
                try {

                    await client.guilds.fetch('712409878949527673').then(guild => fetchGuild = guild);
                    if(!fetchGuild) return 2;

                    await fetchGuild.members.fetch(IDMember).then(member => fetchMember = member);
                    if(!fetchMember) return false;
                        
                    if(!fetchMember.roles.cache.get('824998785691287562')) return false; //NiTeam
                    else return fetchMember.roles.cache.sort((r1, r2) => r2.rawPosition - r1.rawPosition).first();  

                } catch (e) {};

            },
            {
                shard,
                context: { IDMember: member.user.id },
            }
        );

        if (role.length < 1 || role[0] === 2) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"));

        let embed = new EmbedBuilder()
            .setAuthor({ name: t("embed_verification.author"), iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        if (role[0]) {
            embed.setColor("Green");
            embed.setDescription(t("embed_verification.verification.yes", { emoji: client.constants.emojis.reussi, member: member.toString(), role: role[0].name }));
        } else {
            embed.setColor("Red");
            embed.setDescription(t("embed_verification.verification.no", { emoji: client.constants.emojis.echec, member: member.toString() }));
        }

        interaction.reply({ embeds: [embed] }).catch(() => {});


        } catch (err) {
            console.error(err);
client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
    }
};
