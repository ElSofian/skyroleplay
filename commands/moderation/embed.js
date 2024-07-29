const { EmbedBuilder, ApplicationCommandOptionType, PermissionsBitField, hyperlink } = require("discord.js");
const { isWebUri } = require("valid-url");

module.exports = {
    category: { "en": "moderation", "fr": "modération" },
    name: "embed",
    description: "Envoie un embed dans le salon",
    descriptionLocalizations: {
        "fr": "Envoie un embed dans le salon",
        "en-GB": "Send an embed in the channel",
        "en-US": "Send an embed in the channel"
    },
    options: [
        {
            name: "description",
            description: "La description de l'embed",
            descriptionLocalizations: {
                "fr": "La description de l'embed",
                "en-GB": "The description of the embed",
                "en-US": "The description of the embed"
            },
            type: ApplicationCommandOptionType.String,
            maxLength: 4096
        },
        {
            name: "titre",
            nameLocalizations: {
                "fr": "titre",
                "en-GB": "title",
                "en-US": "title"
            },  
            description: "Le titre de l'embed",
            descriptionLocalizations: {
                "fr": "Le titre de l'embed",
                "en-GB": "The title of the embed",
                "en-US": "The title of the embed"
            },
            type: ApplicationCommandOptionType.String,
            maxLength: 256
        },
        {
            name: "nom-auteur",
            nameLocalizations: {
                "fr": "nom-auteur",
                "en-GB": "author-name",
                "en-US": "author-name"  
            },
            description: "Le nom de l'auteur",
            descriptionLocalizations: {
                "fr": "Le nom de l'auteur",
                "en-GB": "The name of the author",
                "en-US": "The name of the author"
            },
            type: ApplicationCommandOptionType.String,
            maxLength: 256
        },
        {
            name: "icone-auteur",
            nameLocalizations: {
                "fr": "icone-auteur",
                "en-GB": "author-icon", 
                "en-US": "author-icon"
            },
            description: "L'icône de l'auteur",
            descriptionLocalizations: {
                "fr": "L'icône de l'auteur",
                "en-GB": "The icon of the author",
                "en-US": "The icon of the author"
            },
            type: ApplicationCommandOptionType.String,
        },
        {
            name: "couleur",
            nameLocalizations: {
                "fr": "couleur",
                "en-GB": "color",
                "en-US": "color"
            },
            description: "La couleur de l'embed",
            descriptionLocalizations: {
                "fr": "La couleur de l'embed",
                "en-GB": "The color of the embed",
                "en-US": "The color of the embed"
            },
            type: ApplicationCommandOptionType.String,
            maxLength: 16
        },
        {
            name: "vignette",
            nameLocalizations: {
                "fr": "vignette",
                "en-GB": "thumbnail",
                "en-US": "thumbnail"
            },
            description: "La petite image en haut à droite de l'embed (lien)",
            descriptionLocalizations: {
                "fr": "La petite image en haut à droite de l'embed (lien)",
                "en-GB": "The small image in the top right of the embed (link)",
                "en-US": "The small image in the top right of the embed (link)"
            },
            type: ApplicationCommandOptionType.String,
        },
        {
            name: "image",
            nameLocalizations: {    
                "fr": "image",
                "en-GB": "image",
                "en-US": "image"
            },
            description: "La grande image en dessous de la description (lien)",
            descriptionLocalizations: {
                "fr": "La grande image en dessous de la description (lien)",
                "en-GB": "The large image below the description (link)",
                "en-US": "The large image below the description (link)"
            },
            type: ApplicationCommandOptionType.String,
        },
        {
            name: "texte-bas-de-page",
            nameLocalizations: {
                "fr": "texte-bas-de-page",
                "en-GB": "footer-text",
                "en-US": "footer-text"
            },
            description: "Le texte en bas de l'embed",
            descriptionLocalizations: {
                "fr": "Le texte en bas de l'embed",
                "en-GB": "The text at the bottom of the embed",
                "en-US": "The text at the bottom of the embed"
            },
            type: ApplicationCommandOptionType.String,
            maxLength: 512
        },
        {
            name: "icone-bas-de-page",
            nameLocalizations: {
                "fr": "icone-bas-de-page",
                "en-GB": "footer-icon",
                "en-US": "footer-icon"  
            },
            description: "La petite image en bas à gauche de l'embed (lien)",
            descriptionLocalizations: {
                "fr": "La petite image en bas à gauche de l'embed (lien)",
                "en-GB": "The small image in the bottom left of the embed (link)",
                "en-US": "The small image in the bottom left of the embed (link)"
            },  
            type: ApplicationCommandOptionType.String,
        },
        {
            name: "heure",
            nameLocalizations: {
                "fr": "heure",
                "en-GB": "time",
                "en-US": "time"
            },
            description: "Afficher ou non l'heure en bas de l'embed",
            descriptionLocalizations: {
                "fr": "Afficher ou non l'heure en bas de l'embed",
                "en-GB": "Display or not the time at the bottom of the embed",
                "en-US": "Display or not the time at the bottom of the embed"
            },
            type: ApplicationCommandOptionType.Boolean,
        }
    ],
    moderation: true,
    run: async(client, interaction, { t, errorEmbed, successEmbed }) => {

        try {

        // Check whether the bot has permissions
        const hasSendPermissions = interaction.channel.permissionsFor(client.user.id).has(["ViewChannel", "SendMessages", "EmbedLinks"]);
        if (!hasSendPermissions) return errorEmbed(t("perms_send", { channel: interaction.channel.toString() }, "errors"));

        // Image
        const image = interaction.options.getString("image", false);
        const embed = new EmbedBuilder()
            .setDescription((interaction.options.getString("description", false) || null))
            .setTitle((interaction.options.getString("titre", false) || null));
        
        if (isWebUri(image)) embed.setImage(image);
        if (!embed.data.description && !embed.data.title && !embed.data.image) return errorEmbed(t("title_description_image"));

        // Author
        const authorName = interaction.options.getString("nom-auteur", false);
        const authorIcon = interaction.options.getString("icone-auteur", false);
        if (authorName) embed.setAuthor({ name: authorName, iconURL: isWebUri(authorIcon) ? authorIcon : null });

        // Footer
        const footerText = interaction.options.getString("texte-bas-de-page", false);
        const footerIcon = interaction.options.getString("icone-bas-de-page", false);
        if (footerText) embed.setFooter({ text: footerText, iconURL: isWebUri(footerIcon) ? footerIcon : null });

        // Color
        const color = interaction.options.getString("couleur", false);
        const resolvedColor = client.functions.other.isHexColor(color ? color.toLowerCase() : "");
        if (color && !resolvedColor) return errorEmbed(t("color_undefined", { color: color, link: client.constants.links.colorPicker }, "errors"));
        embed.setColor(resolvedColor ?? "#2f3136");

        // Thumbnail
        const thumbnail = interaction.options.getString("vignette", false);
        if (isWebUri(thumbnail)) embed.setThumbnail(thumbnail);

        // Timestamp
        if (interaction.options.getBoolean("heure", false)) embed.setTimestamp();

        // Send the embed
        const message = await interaction.channel.send({ embeds: [embed] }).catch(() => { });
        if (!message) return;

        successEmbed(t("confirm", { link: message.url }), false, true)

        // Logs

        const logsEmbed = new EmbedBuilder()
            .setTitle(t("logs_embed.title"))
            .addFields([
                { name: t("logs_embed.by"), value: `${interaction.user.toString()} (${interaction.user.id})`, inline: true },
                { name: t("logs_embed.link"), value: hyperlink(t("logs_embed.click"), message.url), inline: true }
            ])
            .setThumbnail(interaction.user.displayAvatarURL());

        client.functions.logs.send(interaction, logsEmbed, "info", embed);


        } catch (err) {
            console.error(err);

            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
        
    }
};
