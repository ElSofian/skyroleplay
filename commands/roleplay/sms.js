const { EmbedBuilder, ApplicationCommandOptionType, spoiler } = require("discord.js");

module.exports = {
    category: { "en": "roleplay", "fr": "roleplay" },
    name: "sms",
    description: "Envoie un SMS à un joueur",
    descriptionLocalizations: {
        "fr": "Envoie un SMS à un joueur",
        "en-GB": "Send a SMS to a player",
        "en-US": "Send a SMS to a player"
    },
    options: [
        {
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
        },
        {
            name: "contenu",
            nameLocalizations: {
                "fr": "contenu",
                "en-GB": "content",
                "en-US": "content"
            },
            description: "Contenu du SMS à envoyer",
            descriptionLocalizations: {
                "fr": "Contenu du SMS à envoyer",
                "en-GB": "Content of the SMS to send",
                "en-US": "Content of the SMS to send"
            },
            type: ApplicationCommandOptionType.String,
            required: true
    }],
    run: async(client, interaction, { t, errorEmbed, successEmbed, verify }) =>{

        try {
        
        const content = interaction.options.getString("contenu");
        const member = interaction.options.getMember("joueur");

        if(verify("member", { cantBotInclued: true, cantSelfInclued: true })) return;

        await interaction.deferReply({ ephemeral: true }).catch(() => {});

        const cityName = (await client.db.getOption(interaction.guildId, "global.city_name")) || interaction.guild.name;

        const embed = new EmbedBuilder()
            .setColor(0xe7513a)
            .setTitle(t("sms_embed.title"))
            .setThumbnail("https://cdn.discordapp.com/attachments/850491658339352577/915187384587542608/notification.gif")
            .setDescription(content)
            .setFooter({ text: t("sms_embed.footer", { name: interaction.member.displayName, city: cityName }) });

        try {

            await member.send({ content: spoiler(t("sms_content", { user: interaction.user.toString() })), embeds: [embed] })

            const logsEmbed = new EmbedBuilder()
            .setTitle(t("logs_embed.title"))
            .addFields([
                { name: t("logs_embed.fields.field1.name"), value: t("logs_embed.fields.field1.value", { user: interaction.user.toString(), id: interaction.user.id }), inline: true },
                { name: t("logs_embed.fields.field2.name"), value: t("logs_embed.fields.field2.value", { member: member.toString(), id: member.id }), inline: true },
                { name: t("logs_embed.fields.field3.name"), value: t("logs_embed.fields.field3.value", { content: content.substring(0, 1024) }) }
            ])
            .setThumbnail(interaction.user.displayAvatarURL());
            
            client.functions.logs.send(interaction, logsEmbed, "info");

            return successEmbed(t("validation_embed", { member: member.toString() }), false, true, "editReply");
        } catch (e) {
            return errorEmbed(t("error_embed", { member: member.toString() }), false, true, "editReply");
        }
        

        } catch (err) {
            console.error(err);
client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
    }
};
