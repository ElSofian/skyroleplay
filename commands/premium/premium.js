const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, WebhookClient, ShardClientUtil, ApplicationCommandOptionType, inlineCode, time, } = require("discord.js");
const { premiumLogsActivatedURL, premiumLogsTransferredURL, premiumLogsProlongedURL } = require("../../config");

//const premiumLogs = new WebhookClient({ url: premiumLogsURL });
const premiumLogsActivated = new WebhookClient({ url: premiumLogsActivatedURL });
const premiumLogsProlonged = new WebhookClient({ url: premiumLogsProlongedURL }); // Prolongation
const premiumLogsTransferred = new WebhookClient({ url: premiumLogsTransferredURL });

module.exports = {
    category: { "en": "premium", "fr": "premium" },
    name: "premium",
    description: "Gère l'abonnement Premium sur ce serveur.",
    descriptionLocalizations: {
        "fr": "Gère l'abonnement Premium sur ce serveur.",
        "en-GB": "Manage the Premium subscription on this server.",
        "en-US": "Manage the Premium subscription on this server."
    },
    cooldown: 30,
    run: async(client, interaction, { t, errorEmbed, successEmbed, verify, lang }) => {
        successEmbed(t("message", { link: client.constants.links.dashboard }), false, true);
    }
};
