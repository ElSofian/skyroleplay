const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    category: { "en": "moderation", "fr": "modération" },
    name: "dégel",
    nameLocalizations: {
        "fr": "dégel",
        "en-GB": "unfreeze",
        "en-US": "unfreeze"
    },
    description: "Dégèle un compte bancaire.",
    descriptionLocalizations: {
        "fr": "Dégèle un compte bancaire.",
        "en-GB": "Unfreezes a bank account.",
        "en-US": "Unfreezes a bank account."
    },
    options: [{
        name: "joueur",
        nameLocalizations: {
            "fr": "joueur",
            "en-GB": "player",
            "en-US": "player"
        },
        description: "Mentionnez le joueur à qui dégeler le compte.",
        descriptionLocalizations: {
            "fr": "Mentionnez le joueur à qui dégeler le compte.",
            "en-GB": "Mention the player whose account you want to unfreeze.",
            "en-US": "Mention the player whose account you want to unfreeze."
        },
        type: ApplicationCommandOptionType.User,
        required: true
    }],
    moderation: true,
    run: async(client, interaction, { t, errorEmbed, verify }) => {
        
        try {
            
        const member = interaction.options.getMember("joueur");
        const reason = interaction.options.getString("raison");
        if(verify("member", { cantBotInclued: true })) return;
        
        const isBan = await client.db.isFreezeAccount(interaction.guildId, member.user.id)
        if(!isBan) return errorEmbed(t("not_freeze", { member: member.toString() }));
        
        await client.db.freezeAccount(interaction.guildId, member.user.id, reason, true);
        
        const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle(t("title"))
        .setDescription(t("description", { member: member.toString(), author: interaction.member.toString(), reason: reason }))
        .setTimestamp()
        
        interaction.reply({ embeds: [embed] });


        } catch (err) {
            console.error(err);
client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    }
};
