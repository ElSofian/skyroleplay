const { EmbedBuilder, ApplicationCommandOptionType, PermissionsBitField, inlineCode, hyperlink } = require("discord.js");

const publicationTypes = [
    {
        name: "Action",
        nameLocalizations: {
            "fr": "Action",
            "en-GB": "Action",
            "en-US": "Action"
        },
        value: "action",
    },
    {
        name: "Anonyme",
        nameLocalizations: {
            "fr": "Anonyme",
            "en-GB": "Anonymous",
            "en-US": "Anonymous"
        },
        value: "anonyme",
        color: "#2f3136"
    },
    {
        name: "Journal",
        nameLocalizations: {
            "fr": "Journal",
            "en-GB": "Newspaper",
            "en-US": "Newspaper"
        },
        value: "journal",
        color: "#030303",
    },
    {
        name: "Facebook",
        nameLocalizations: {
            "fr": "Facebook",
            "en-GB": "Facebook",
            "en-US": "Facebook"
        },
        value: "facebook",
        title: "<:facebook:1008412275662659654> ・ Facebook",
        color: "#0165E1",
    },
    {
        name: "Instagram",
        nameLocalizations: {
            "fr": "Instagram",
            "en-GB": "Instagram",
            "en-US": "Instagram"
        },
        value: "instagram",
        title: "<:instagram:1008071470150336644> ・ Instagram",
        color: "#d45187",
    },
    {
        name: "Twitter",
        nameLocalizations: {
            "fr": "Twitter",
            "en-GB": "Twitter",
            "en-US": "Twitter"
        },
        value: "twitter",
        title: "<:twitter:1008071472004218991> ・ Twitter",
        color: "#1da1f2",
    },
    {
        name: "WhatsApp",
        nameLocalizations: {
            "fr": "WhatsApp",
            "en-GB": "WhatsApp",
            "en-US": "WhatsApp"
        },
        value: "whatsapp",
        title: "<:whatsapp:975339766541340692> ・ WhatsApp",
        color: "#25d366",
    }
];

module.exports = {
    category: { "en": "roleplay", "fr": "roleplay" },
    name: "publication",
    description: "Poste un message ou une publication de réseau social.",
    descriptionLocalizations: {
        "fr": "Poste un message ou une publication de réseau social.",
        "en-GB": "Posts a message or social media post.",
        "en-US": "Posts a message or social media post."
    },
    options: [
        {
            name: "contenu",
            nameLocalizations: {
                "fr": "contenu",
                "en-GB": "contents",
                "en-US": "contents"
            },
            description: "Contenu de la publication.",
            descriptionLocalizations: {
                "fr": "Contenu de la publication.",
                "en-GB": "Content of the post.",
                "en-US": "Content of the post."
            },
            type: ApplicationCommandOptionType.String,
            required: true,
            minLength: 1,
            maxLength: 4096
        },
        {
            name: "type",
            nameLocalizations: {
                "fr": "type",
                "en-GB": "type",
                "en-US": "type"
            },
            description: "Type de publication.",
            descriptionLocalizations: {
                "fr": "Type de publication.",
                "en-GB": "Publication type.",
                "en-US": "Publication type."
            },
            type: ApplicationCommandOptionType.String,
            choices: publicationTypes.map(type => ({ name: type.name, nameLocalizations: type.nameLocalizations, value: type.value })),
        },
        {
            name: "image",
            description: "Image de la publication.",
            descriptionLocalizations: {
                "fr": "Image de la publication.",
                "en-GB": "Picture from the publication.",
                "en-US": "Picture from the publication."
            },
            type: ApplicationCommandOptionType.Attachment,
    }],
    run: async(client, interaction, { t, errorEmbed, successEmbed }) => {

        try {

            // Check whether the bot has permissions
            const hasSendPermissions = interaction.channel.permissionsFor(client.user.id).has(["ViewChannel", "SendMessages", "EmbedLinks"]);
            if (!hasSendPermissions) return errorEmbed(t("interactionCreate.perms_send", { channel: interaction.channel.toString() }, "events"));

            const content = interaction.options.getString("contenu");
            const type = interaction.options.getString("type");
            const image = interaction.options.getAttachment("image");
            let message;

            const staffRole = await client.db.getOption(interaction.guildId, "roles.moderator");
            if (/(https?:\/\/[^\s]+)/gi.test(content) && (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) && !interaction.member.roles.cache.has(staffRole))) return errorEmbed(t("no_link", { role: staffRole ? t("role", { staffRole: `<@&${staffRole}>` }) : "" }))

            // Style type
            if (type) {

                const embed = new EmbedBuilder().setDescription(content);
                const typeData = publicationTypes.find(t => t.value == type);
                
                embed.setColor(typeData?.color ?? null)
                    .setTitle(typeData?.title ?? null)
                    .setImage(image?.url ?? null)
                    .setFooter({ text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() })

                // set of embed's style
                switch (type) {
                    case "action":
                        embed.setColor(interaction.member.displayColor || 0xfff).setTitle(t("action", { name: interaction.member.displayName }))
                        break;
                    case "anonyme":
                        embed.setFooter({ text: t("anonyme.footer") }).setTitle(`<:anonyme:788870589636149268> ${t("anonyme.title")}`)
                        break;
                    case "journal":
                        const cityName = (await client.db.getOption(interaction.guildId, "global.city_name")) || interaction.guild.name;
                        embed.setTitle(t("journal", { city: cityName })).setTimestamp().setFooter({ text: interaction.member.displayName })
                        break;
                }

                await interaction.channel.send({ embeds: [embed], fetchReply: true }).then(msg => {
                    message = msg;
                    if (type == "twitter" && interaction.channel.permissionsFor(client.user.id).has("AddReactions")) ["❤️", "🔁"].forEach((emoji) => msg.react(emoji).catch(() => {}));
                    successEmbed(t("confirm", { url: msg?.url }), false, true);
                })

            } else {
                // Message without embed
                await interaction.channel.send({ content: content.substring(0, 2000), allowedMentions: { parse: ["users"] }, files: image?.url ? [image.url] : [] }).then(msg => {
                    successEmbed(t("confirm", { url: msg?.url }), false, true).catch(() => { });
                    message = msg;
                }).catch(() => { });
            }

            if (!message) return;

            // Logs
            client.db.addPublicationLog(interaction.guildId, {
                name: interaction.user.username,
                id: interaction.user.id,
            }, type ?? "message", {
                content: content,
                image: image?.url ?? null,
                message: message.url
            });

            let logs_text = t("message");
            if (type) logs_text = t("publication");


            const logsEmbed = new EmbedBuilder()
                .setTitle(logs_text === "message" ? t( "logs_embed.titles.message") : t("logs_embed.titles.publication"))
                .addFields([
                    { name: t("logs_embed.by"), value: `${interaction.user.toString()} (${interaction.user.id})`, inline: true },
                    { name: t("logs_embed.type", { text: logs_text }), value: type ? inlineCode(type) : t("logs_embed.normal"), inline: true },
                    { name: t(`logs_embed.link_${type ? "publication" : "message"}`), value: hyperlink(t("logs_embed.clickhere"), message.url), inline: true },
                    { name: t( "logs_embed.content"), value: content.substr(0, 1024) || t("logs_embed.invalid") }
                ])
                .setThumbnail(interaction.user.displayAvatarURL());

            client.functions.logs.send(interaction, logsEmbed, "info");


        } catch (err) {
            console.error(err);
            
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
    }
};
