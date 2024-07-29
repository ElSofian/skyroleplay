const { EmbedBuilder, ApplicationCommandOptionType, AttachmentBuilder } = require("discord.js");;

module.exports = {
    category: { "en": "moderation", "fr": "modération" },
    name: "mort-rp",
    nameLocalizations: {
        "fr": "mort-rp",
        "en-US": "rp-death",
        "en-GB": "rp-death"
    },
    description: "Réinitialise le joueur qui est mort.",
    descriptionLocalizations: {
        "fr": "Réinitialise le joueur qui est mort.",
        "en-US": "Resets the player who is dead.",
        "en-GB": "Resets the player who is dead."
    },
    options: [{
        name: "joueur",
        nameLocalizations: {
            "fr": "joueur",
            "en-US": "player",
            "en-GB": "player"
        },
        description: "Mentionnez le joueur qui est mort.",
        descriptionLocalizations: {
            "fr": "Mentionnez le joueur qui est mort.",
            "en-US": "Mention the player who is dead.",
            "en-GB": "Mention the player who is dead."
        },
        type: ApplicationCommandOptionType.User,
        required: true,
    }],
    moderation: true,
    run: async(client, interaction, { t, errorEmbed, verify, lang }) => {

        try {

            const member = interaction.options.getMember("joueur"); 
            if (verify("member", { cantBotInclued: true })) return;
            
            let [rolesToAdd, rolesToRemove, idCard] = [
                (await client.db.getOption(interaction.guildId, "roles.dead_add_roles") ?? "").split(","),
                (await client.db.getOption(interaction.guildId, "roles.dead_remove_roles") ?? "").split(","),
                await client.db.getIDCard(interaction.guildId, member.id)
            ];

            let name = idCard ? `${idCard.first_name} ${idCard.last_name}` : member.user.username;

            await client.db.resetMember(interaction.guildId, member.id);

            for(const roleID of [...rolesToAdd, ...rolesToRemove].filter(r => interaction.guild.roles.cache.has(r))) {
                member.roles[rolesToAdd.includes(roleID) ? "add" : "remove"](role).catch(() => errorEmbed(t(`cant_${rolesToAdd.includes(roleID) ? "give" : "remove"}_role`, { role: role.toString() }, "errors")));
            }

            const canvas = await client.functions.canvas.get("/obituary_notice", { locale: lang, name, ...(idCard && { birth_date: idCard.birthdate }) }).catch(() => errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true, false, "editReply"));
            const attachment = new AttachmentBuilder(canvas, { name: "obituary_notice.png" })
            const embed = new EmbedBuilder().setColor("White").setImage('attachment://obituary_notice.png')

            return interaction.reply({ embeds: [embed], components: [], files: [attachment] });

        } catch (err) {
            console.error(err);
            
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    }
};
