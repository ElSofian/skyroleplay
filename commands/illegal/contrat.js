const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    category: { "en": "illegal", "fr": "illégal" },
    name: "contrat",
    nameLocalizations: {
        "fr": "contrat",
        "en-US": "contract",
        "en-GB": "contract"
    },
    description: "Permet de mettre un contrat sur la tête d'un joueur.",
    descriptionLocalizations: {
        "fr": "Permet de mettre un contrat sur la tête d'un joueur.",   
        "en-US": "Allows you to put a contract on a player's head.",
        "en-GB": "Allows you to put a contract on a player's head."
    },  
    options: [{
        name: "joueur",
        nameLocalizations: {
            "fr": "joueur",
            "en-GB": "player",
            "en-US": "player"
        },
        description: "Mentionnez le joueur à qui vous voulez mettre un contrat.",
        descriptionLocalizations: {
            "fr": "Mentionnez le joueur à qui vous voulez mettre un contrat.",
            "en-GB": "Mention the player you want to put a contract on.",
            "en-US": "Mention the player you want to put a contract on."
        },
        type: ApplicationCommandOptionType.User,
        required: true,
    },
    {
        name: "prix",
        nameLocalizations: {
            "fr": "prix",
            "en-GB": "price",
            "en-US": "price"
        },
        description: "Spécifiez la récompense donnée pour l'éxecution du contrat.",
        descriptionLocalizations: {
            "fr": "Spécifiez la récompense donnée pour l'éxecution du contrat.",
            "en-GB": "Specify the reward given for the execution of the contract.",
            "en-US": "Specify the reward given for the execution of the contract."
        },
        type: ApplicationCommandOptionType.Number,
        minValue: 1,
        maxValue: 999999999,
        required: true
    },
    {
        name: "motif",
        nameLocalizations: {
            "fr": "motif",
            "en-GB": "motive",
            "en-US": "motive"      
        },
        description: "Spécifiez le motif du contrat.",
        descriptionLocalizations: {
            "fr": "Spécifiez le motif du contrat.",
            "en-GB": "Specify the motive of the contract.",
            "en-US": "Specify the motive of the contract."
        },
        type: ApplicationCommandOptionType.String,
        required: false
    }],
    run: async(client, interaction, { t, successEmbed, errorEmbed, verify }) => {

        try {
        
        const member = interaction.options.getMember("joueur");
        const price = interaction.options.getNumber("prix");
        const motif = interaction.options.getString("motif", false);
        const options = await client.db.getOptions(interaction.guildId, ["economy.symbol", "illegal.contract.channel"]);

        if (verify("member", { cantBotInclued: true, cantSelfInclued: true }, t("self"))) return;

        const embed = new EmbedBuilder()
            .setColor("#BD9047")
            .setTitle(`📜 ・ ${t("embed.title")}`)
            .setThumbnail("https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/51d49077763617.5c913503b003e.gif")
            .setDescription(t("embed.description", { member: member.toString(), price: `${price}${options["economy.symbol"]}`, user: interaction.user.toString(), motif: motif ? `**Motif :** *${motif}*` : "" }).substring(0, 4000))
            .setFooter({ text: member.displayName, iconURL: member.user.displayAvatarURL()})
            .setTimestamp()

        const channel = interaction.guild.channels.cache.get(options["illegal.contract.channel"]) ?? interaction.channel;

        try {
            const sendEmbed = await channel.send({ content: `||${member.toString()}||`, embeds: [embed] });
            if (sendEmbed) successEmbed(t("sended", { link: sendEmbed.url }), false, true);
        } catch {
            return errorEmbed(t("perms_send", { channel: channel.toString() }, "errors"));
        }


        } catch (err) {
            console.error(err);

            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
        
    }
};
