const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    category: { "en": "moderation", "fr": "modération" },
    name: "gel",
    nameLocalizations: {
        "fr": "gel",
        "en-GB": "freeze",
        "en-US": "freeze"
    },
    description: "Gèle un compte bancaire.",
    descriptionLocalizations: {
        "fr": "Gèle un compte bancaire.",
        "en-GB": "Freezes a bank account.",
        "en-US": "Freezes a bank account."
    },
    options: [{
        name: "joueur",
        nameLocalizations: {
            "fr": "joueur",
            "en-GB": "player",
            "en-US": "player"
        },
        description: "Mentionnez le joueur à qui geler le compte.",
        descriptionLocalizations: {
            "fr": "Mentionnez le joueur à qui geler le compte.",
            "en-GB": "Mention the player whose account you want to freeze.",
            "en-US": "Mention the player whose account you want to freeze."
        },
        type: ApplicationCommandOptionType.User,
        required: true
        },
        {
        name: "raison",
        nameLocalizations: {
            "fr": "raison",
            "en-GB": "reason",
            "en-US": "reason"
        },
        description: "Raison du gel.",
        descriptionLocalizations: {
            "fr": "Raison du gel.",
            "en-GB": "Freeze reason.",
            "en-US": "Freeze reason."
        },
        type: ApplicationCommandOptionType.String,
        required: true
        }
    ],
    moderation: true,
    run: async(client, interaction, { t, errorEmbed, verify }) => {

        try {
            
        const member = interaction.options.getMember("joueur");
        const reason = interaction.options.getString("raison");
        if(verify(["member", "reason"], { cantBotInclued: true, limit: 255 })) return;
        
        const isBan = await client.db.isFreezeAccount(interaction.guildId, member.user.id)
        if(isBan) return errorEmbed(t("already_freeze", { member: member.toString() }));
        
        await client.db.freezeAccount(interaction.guildId, member.user.id, reason);
        
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
