const { EmbedBuilder, ApplicationCommandOptionType, time, } = require("discord.js");

module.exports = {
    category: { "en": "roleplay", "fr": "roleplay" },
    name: "visite-medicale",
    nameLocalizations: {
        "fr": "visite-medicale",
        "en-GB": "medical-visit",
        "en-US": "medical-visit"
    },
    description: "Gère la visite médicale.",
    descriptionLocalizations: {
        "fr": "Gère la visite médicale.",
        "en-GB": "Manage the medical visit.",
        "en-US": "Manage the medical visit."
    },
    options: [
        {
            name: "afficher",
            nameLocalizations: {
                "fr": "afficher",
                "en-GB": "display",
                "en-US": "display"
            },
            description: "Affiche la dernière visite médicale d'un joueur.",
            descriptionLocalizations: {
                "fr": "Affiche la dernière visite médicale d'un joueur.",
                "en-GB": "Display the last medical visit of a player.",
                "en-US": "Display the last medical visit of a player."
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "joueur",
                    nameLocalizations: {
                        "fr": "joueur",
                        "en-GB": "player",
                        "en-US": "player"
                    },
                    description: "Mentionnez le joueur auquel afficher la visite médicale.",
                    descriptionLocalizations: {
                        "fr": "Mentionnez le joueur auquel afficher la visite médicale.",
                        "en-GB": "Mention the player to display the medical visit.",
                        "en-US": "Mention the player to display the medical visit."
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
            ],
        },
        {
            name: "passer",
            nameLocalizations: {
                "fr": "passer",
                "en-GB": "do",
                "en-US": "do"
            },
            description: "Fait passer la visite médicale à un joueur.",
            descriptionLocalizations: {
                "fr": "Fait passer la visite médicale à un joueur.",
                "en-GB": "Make the medical visit to a player.",
                "en-US": "Make the medical visit to a player."
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "joueur",
                    nameLocalizations: {
                        "fr": "joueur",
                        "en-GB": "player",
                        "en-US": "player"
                    },
                    description: "Mentionnez le joueur auquel faire passer la visite médicale.",
                    descriptionLocalizations: {
                        "fr": "Mentionnez le joueur auquel faire passer la visite médicale.",
                        "en-GB": "Mention the player to make the medical visit.",
                        "en-US": "Mention the player to make the medical visit."
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
            ],
    }],
    run: async(client, interaction, { t, errorEmbed, verify }) => {

        try {

        const method = interaction.options.getSubcommand();
        const member = interaction.options.getMember("joueur");

        if(verify("member", { cantBotInclued: true })) return;

        const cityName = (await client.db.getOption(interaction.guildId, "global.city_name")) || interaction.guild.name;

        switch (method) {

            case "afficher": {

                const memberData = await client.db.getMember(interaction.guildId, member.user.id);
                const embed = new EmbedBuilder()
                    .setColor("DarkAqua")
                    .setTitle(t("view_embed.title"))
                    .setDescription(t("view_embed.description.intro", { city: cityName }) + `${memberData.last_medical_checkup ? t("view_embed.description.already", { member: member.toString(), time: time(memberData.last_medical_checkup,"D") }) : t("view_embed.description.never", { member: member.toString() })}`);

                await interaction.reply({ embeds: [embed] }).catch(() => {})

                break;
            }
       

            case "passer": {

                if(!(await client.functions.permissions.configModerator(interaction, "visite-medicale passer"))) return;

                const memberData = await client.db.getMember(interaction.guildId, member.user.id);
                if(memberData.last_medical_checkup && client.dayjs().isSame(client.dayjs(memberData.last_medical_checkup), "day"))
                    return errorEmbed(t("same_day", { member: member.toString(), time: time(memberData.last_medical_checkup,"D") }));

                await client.db.setLastMedicalCheckup(interaction.guildId, member.user.id);

                const embed = new EmbedBuilder()
                    .setColor("DarkAqua")
                    .setTitle(t("valid_embed.title"))
                    .setThumbnail("https://cdn.dribbble.com/users/570218/screenshots/1857710/pharma_2d_rigged_character.gif")
                    .setDescription(t("valid_embed.description", { city: cityName, member: member.toString(), time: time(new Date(),"D") }))
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] }).catch(() => {})

                const logsEmbed = new EmbedBuilder()
                    .setTitle(t("logs_embed.title"))
                    .addFields([
                        { name: t("logs_embed.fields.field1.name"), value: t("logs_embed.fields.field1.value", { user: interaction.user.toString(), id: interaction.user.id }), inline: true },
                        { name: t("logs_embed.fields.field2.name"), value: t("logs_embed.fields.field2.value", { member: member.toString(), id: member.id }), inline: true },
                        { name: t("logs_embed.fields.field3.name"), value: t("logs_embed.fields.field3.value", { time: time(new Date(), "D") }) }
                    ])
                    .setThumbnail(interaction.user.displayAvatarURL());

                client.functions.logs.send(interaction, logsEmbed, "info");

                break;
            }
        }


        } catch (err) {
            console.error(err);
client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
    }
};
