const { EmbedBuilder, AttachmentBuilder, ApplicationCommandOptionType } = require("discord.js");
const { Canvas, loadImage, loadFont } = require("canvas-constructor/napi-rs");
const { resolve, join } = require("node:path");
loadFont(resolve(join(__dirname, "../../assets/fonts/Poppins-Regular.ttf")), "Poppins");
loadFont(resolve(join(__dirname, "../../assets/fonts/Poppins-SemiBold.ttf")), "Poppins-B");

module.exports = {
    category: { "en": "player", "fr": "joueur" },
    name: "statut",
    nameLocalizations: {
        "fr": "statut",
        "en-GB": "state",
        "en-US": "state"
    },
    description: "Affiche l'état d'un joueur",
    descriptionLocalizations: {
        "fr": "Affiche l'état d'un joueur",
        "en-GB": "Display the state of a player",
        "en-US": "Display the state of a player"
    },
    options: [{
        name: "joueur",
        nameLocalizations: {
            "fr": "joueur",
            "en-GB": "player",
            "en-US": "player"
        },
        description: "Mentionnez le joueur dont vous voulez afficher l'état",
        descriptionLocalizations: {
            "fr": "Mentionnez le joueur dont vous voulez afficher l'état",
            "en-GB": "Mention the player whose state you want to display",
            "en-US": "Mention the player whose state you want to display"
        },
        type: ApplicationCommandOptionType.User,
        required: false,
    }],
    run: async(client, interaction, { t, errorEmbed, verify }) => {

        try {

            const member = interaction.options.getMember("joueur") || interaction.member;
            if(interaction.options.getMember("joueur") && verify("member", { cantBotInclued: true })) return;

            const state = await client.db.getMemberState(interaction.guildId, member.user.id);
            const inSession = await client.db.isInSession(interaction.guildId, member.user.id);
            
            const idCard = await client.db.getIDCard(interaction.guildId, member.user.id)
            let name = idCard ? `${idCard.first_name} ${idCard.last_name}` : member.displayName;
            name = name.length > 18 ? `${name.substring(0, 18)}...` : name

            const hunger = (state.hunger / 100) * 837;
            const thirst = (state.thirst / 100) * 837;

            const canvas = new Canvas(930, 500)
            .printImage(await loadImage("assets/player/bg.png"), 0, 0, 930, 500)
            .printImage(await loadImage(`assets/player/rectangle.png`), 30, 95, (108 + (name.length * 21)), 108)
            .printCircularImage(await loadImage(member.displayAvatarURL({ extension: "png" })), 90, 155, 35, 35)
            .printImage(await loadImage(`assets/player/${inSession ? "in" : "out"}.png`), 95, 170, 25, 25)
            .printImage(await loadImage(`assets/player/rectangle.png`), 495, 95, 395, 108)
            .printImage(await loadImage(`assets/player/${state.coma == 0 ? "" : "empty_"}heart.png`), 530, 120, 60, 60)
            .setTextFont("32px Poppins").setColor("white")
            .printText(name, 148, 160)
            .printText(t(state.coma == 0 ? "healthy" : "coma"), 610, 160)
            .setTextFont("32px Poppins-B")
            .printText(t("hunger"), 70, 252.5)
            .printText(t("thirst"), 70, 397.5)
            .printImage(await loadImage(`assets/player/bar.png`), 45, 276, hunger, 60)
            .printImage(await loadImage(`assets/player/bar.png`), 45, 421, thirst, 60)

            const attachment = new AttachmentBuilder(await canvas.pngAsync(), { name: "state.png" });
            const embed = new EmbedBuilder()
            .setColor("Green")
            .setImage("attachment://state.png")

            interaction.reply({ embeds: [embed], files: [attachment] }).catch(() => {});


        } catch (err) {
            console.error(err);
client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    }
};
