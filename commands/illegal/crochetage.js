const { EmbedBuilder, time } = require("discord.js");

module.exports = {
    category: { "en": "illegal", "fr": "illégal" },
    name: "crochetage",
    nameLocalizations: {
        "fr": "crochetage",
        "en-US": "lockpicking",
        "en-GB": "lockpicking"
    },
    description: "Crochète un véhicule.",
    descriptionLocalizations: {
        "fr": "Crochète un véhicule.",
        "en-US": "Pick a vehicle.",
        "en-GB": "Pick a vehicle."
    },
    cooldown: 5,
    premium: true,
    run: async(client, interaction, { t, errorEmbed }) => {

        try {
        
        let lock_picking_time = await client.db.getOption(interaction.guildId, "illegal.lock_picking.time") ?? 120000;
        
        const link = client.functions.illegal.getIllegalLink(client, interaction.guildId, interaction.member.id);
        if(link) return errorEmbed(t("already_doing", { link: link }, "errors"));

        const end = new Date(Date.now() + lock_picking_time);
        const embed = new EmbedBuilder()
            .setColor("Default")
            .setTitle(t("start_hook_embed.title"))
            .setThumbnail("https://cdn.discordapp.com/attachments/778713489144938516/813879479474061382/crochetage.jpg")
            .setDescription(t("start_hook_embed.description", { user: interaction.user.toString(), time: time(end, "R") }))
            .setTimestamp();
        
        const message = await interaction.reply({ embeds: [embed], fetchReply: true }).catch(() => {});
        if(!message) return;

        client.functions.illegal.setIllegal(client, interaction.guildId, interaction.user.id, message?.url, lock_picking_time);

        await client.functions.other.wait(lock_picking_time);

        client.functions.illegal.deleteIllegal(client, interaction.guildId, interaction.user.id);

        const endEmbed = new EmbedBuilder()
            .setColor("Green")
            .setTitle(t("end_hook_embed.title"))
            .setThumbnail("https://cdn.discordapp.com/attachments/778713489144938516/813879526257852436/crochetage-termine.jpg")
            .setDescription(t("end_hook_embed.description", { user: interaction.user.toString() }))
            .setTimestamp();

        return interaction.editReply({ embeds: [endEmbed] }).catch(() => {});


        } catch (err) {
            console.error(err);
client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    }
};
