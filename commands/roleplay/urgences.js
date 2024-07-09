const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ApplicationCommandOptionType, PermissionsBitField, spoiler } = require("discord.js");

function getEmbed(description, title, color, thumbnail) {
    return new EmbedBuilder()
        .setThumbnail(thumbnail)
        .setColor(color)
        .setTitle(title)
        .setDescription(description);
}

const services = [
    {
        name: "🚓 Police",
        value: "police"
    },
    {
        name: "🚑 EMS",
        value: "ems"
    },
    {
        name: "🚒 Pompiers",
        nameLocalizations: {
            "fr": "🚒 Pompiers",
            "en-GB": "🚒 Firefighters",
            "en-US": "🚒 Firefighters"
        },
        value: "firefighters"
    }
]

module.exports = {
    category: { "en": "roleplay", "fr": "roleplay" },
    name: "urgences",
    nameLocalizations: {
        "fr": "urgences",
        "en-GB": "emergency",
        "en-US": "emergency"
    },
    description: "Envoie un appel d'urgence.",
    descriptionLocalizations: {
        "fr": "Envoie un appel d'urgence.",
        "en-GB": "Send an emergency call.",
        "en-US": "Send an emergency call."
    },
    options: [
        {
            name: "service",
            description: "Spécifiez le service d'urgence.",
            descriptionLocalizations: {
                "fr": "Spécifiez le service d'urgence.",
                "en-GB": "Specify the emergency service.",
                "en-US": "Specify the emergency service."
            },
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: services
        },
        {
            name: "localisation",
            description: "Spécifiez votre localisation actuelle.",
            descriptionLocalizations: {
                "fr": "Spécifiez votre localisation actuelle.",
                "en-GB": "Specify your current location.",
                "en-US": "Specify your current location."
            },
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "raison",
            nameLocalizations: {
                "fr": "raison",
                "en-GB": "reason",
                "en-US": "reason"
            },
            description: "Spécifiez la raison de l'appel d'urgence.",
            descriptionLocalizations: {
                "fr": "Spécifiez la raison de l'appel d'urgence.",
                "en-GB": "Specify the reason for the emergency call.",
                "en-US": "Specify the reason for the emergency call."
            },
            type: ApplicationCommandOptionType.String,
            required: true
    }],
    cooldown: 10,
    run: async(client, interaction, { t, errorEmbed, successEmbed, lang }) => {

        try {

        const service = interaction.options.getString("service");
        const location = interaction.options.getString("localisation");
        const reason = interaction.options.getString("raison");

        const options = await client.db.getOptions(interaction.guildId, [
            "roles.police",
            "roles.ems",
            "roles.firefighters",
            "channel.police",
            "channel.ems",
            "channel.firefighters",
            "global.city_name",
        ]);


        options["global.city_name"] ||= interaction.guild.name;

        const role = interaction.guild.roles.cache.get(options[`roles.${service}`]);
        const channel = interaction.guild.channels.cache.get(options[`channel.${service}`]) ?? interaction.channel;

        if(!role) return errorEmbed(t("no_role", { service: services.find(s => s.value == service).name, link: client.constants.links.dashboard }))

        // Check whether the bot has permissions
        const hasSendPermissions = channel.permissionsFor(client.user.id).has(["ViewChannel", "SendMessages", "EmbedLinks"]);
        if (!hasSendPermissions) return i.update({ content: null, embeds: [errorEmbed(t("perm_send", { channel: channel }), true)], components: [] }).catch(() => {});

        // prettier-ignore
        let embed;
        switch (service) {
            case "ems":
                embed = getEmbed(t("call_embed.description.ems", { user: interaction.user.toString() }), `🚑${t("call_embed.title")}`, "White", "https://cdn.discordapp.com/attachments/795065270921592862/795105331386253342/samu.gif");
                break;
            case "police":
                embed = getEmbed(t("call_embed.description.police", { user: interaction.user.toString() }), `🚓${t("call_embed.title")}`, "Blue", "https://cdn.discordapp.com/attachments/778713489144938516/795098641094017024/police2.gif");
                break;
            case "firefighters":
                embed = getEmbed(t("call_embed.description.firefighters", { user: interaction.user.toString() }), `🚒${t("call_embed.title")}`, "Red", "https://cdn.discordapp.com/attachments/778713489144938516/795098406607257630/pomp.gif");
                break;
        }

        embed.addFields([
            { name: t("call_embed.fields.reason"), value: `> ${reason}` },
            { name: t("call_embed.fields.location"), value: `> ${location}` }
        ])

        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("take").setLabel(t("take")).setStyle(service == "firefighters" ? ButtonStyle.Danger : ButtonStyle.Primary))

        const message = await channel.send({ content: role ? spoiler(role.toString()) : null, embeds: [embed], components: [row], fetchReply: true }).catch(() => {});
        if(!message) return; // interaction isn't edited

        successEmbed(t(`confirmation.${service.toLowerCase()}`, { link: message.url }), false, true);

        const collector = message.createMessageComponentCollector({ time: 60000 });
        if(!collector) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");

        collector.on("collect", async (i) => {

            if(!i.member.roles.cache.has(role.id)) return i.reply({ embeds: [errorEmbed(t("dont_have_role", { role: role?.id }, "errors"), true)], ephemeral: true }).catch(() => {});
            
            switch (service) {
                case "ems":
                    embed = getEmbed(t("call_embed.description_take", { user: i.user.toString() }), `🚑${t("call_embed.title")}`, "White", "https://cdn.discordapp.com/attachments/795065270921592862/795105331386253342/samu.gif");
                    break;
                case "police":
                    embed = getEmbed(t("call_embed.description_take", { user: i.user.toString() }), `🚓${t("call_embed.title")}`, "Blue", "https://cdn.discordapp.com/attachments/778713489144938516/795098641094017024/police2.gif");
                    break;
                case "firefighters":
                    embed = getEmbed(t("call_embed.description_take", { user: i.user.toString() }), `🚒${t("call_embed.title")}`, "Red", "https://cdn.discordapp.com/attachments/778713489144938516/795098406607257630/pomp.gif");
                    break;
            }

            await i.update({ content: null, embeds: [embed], components: [] }).catch(() => {});

        });

        // Disable buttons on timeout
        collector.on("end", (collected) => {
            return interaction.editReply({ components: [] }).catch(() => {});
        });


        } catch (err) {
            console.error(err);
            client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    }
};
