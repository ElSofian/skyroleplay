const { EmbedBuilder } = require("discord.js");

module.exports = {
    category: { "en": "informations", "fr": "informations" },
    name: "invitation",
    description: "Affiche le lien d'invitation du bot ainsi que d'autres liens utiles.",  
    descriptionLocalizations: {
        "fr": "Affiche le lien d'invitation du bot ainsi que d'autres liens utiles.",
        "en-US": "Displays the bot's invitation link as well as other useful links.",
        "en-GB": "Displays the bot's invitation link as well as other useful links."
    },
    run: async(client, interaction, { t, errorEmbed }) => {

        try {
        
        const embed = new EmbedBuilder()
            .setColor("Green")
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            .addFields([{
                    name: t("utils_links"),
                    value: t("links", { invitation: client.constants.links.invite, dashboard: client.constants.links.dashboard, documentation: client.constants.links.docs, support_srv: client.constants.links.support, premium: client.constants.links.premium })
            }]);

        interaction.reply({ embeds: [embed] }).catch(() => {})


        } catch (err) {
            console.error(err);

            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
    }
};