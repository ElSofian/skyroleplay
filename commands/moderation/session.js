const { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle, ApplicationCommandOptionType, PermissionsBitField, time } = require("discord.js");

module.exports = {
    category: { "en": "moderation", "fr": "modération" },
    name: "session",
    description: "Annonce une session",
    descriptionLocalizations: { 
        "fr": "Annonce une session",
        "en-GB": "Announce a session",
        "en-US": "Announce a session"
    },
    options: [
        {
            name: "vocale",
            description: "Le salon vocal de la session",    
            descriptionLocalizations: {
                "fr": "Le salon vocal de la session",
                "en-GB": "The voice channel of the session",
                "en-US": "The voice channel of the session"
            },
            description: "Annonce l'ouverture d'un salon vocal",
            descriptionLocalizations: {
                "fr": "Annonce l'ouverture d'un salon vocal",
                "en-GB": "Announce the opening of a voice channel",
                "en-US": "Announce the opening of a voice channel"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "heure",
                    description: "L'heure de la session",
                    descriptionLocalizations: {
                        "fr": "L'heure de la session",
                        "en-GB": "The time of the session",
                        "en-US": "The time of the session"
                    },
                    description: "L'heure de début de la session (Exemple : 18:30)",
                    descriptionLocalizations: { 
                        "fr": "L'heure de début de la session (Exemple : 18:30)",
                        "en-GB": "The start time of the session (Example: 8:30pm)",
                        "en-US": "The start time of the session (Example: 8:30pm)"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "lanceur",
                    nameLocalizations: {
                        "fr": "lanceur",
                        "en-GB": "launcher",
                        "en-US": "launcher"  
                    },
                    description: "Le pseudonyme du lanceur de la session",
                    descriptionLocalizations: {
                        "fr": "Le pseudonyme du lanceur de la session", 
                        "en-GB": "The nickname of the session starter",
                        "en-US": "The nickname of the session starter"
                    },  
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: "début",
            nameLocalizations: {
                "fr": "début",
                "en-GB": "start",
                "en-US": "start"
            },
            description: "Annonce le début d'une session",
            descriptionLocalizations: {
                "fr": "Annonce le début d'une session",
                "en-GB": "Announce the start of a session",
                "en-US": "Announce the start of a session"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "lanceur",
                    nameLocalizations: {
                        "fr": "lanceur",    
                        "en-GB": "launcher",
                        "en-US": "launcher"
                    },
                    description: "Le pseudonyme du lanceur de la session",
                    descriptionLocalizations: {
                        "fr": "Le pseudonyme du lanceur de la session",
                        "en-GB": "The nickname of the session launcher",
                        "en-US": "The nickname of the session launcher"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: "annonce",
            nameLocalizations: {
                "fr": "annonce",
                "en-GB": "announce",
                "en-US": "announce"
            },
            description: "Annonce une nouvelle session",
            descriptionLocalizations: {
                "fr": "Annonce une nouvelle session",   
                "en-GB": "Announce a new session",
                "en-US": "Announce a new session"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "heure",
                    nameLocalizations: {
                        "fr": "heure",  
                        "en-GB": "time",
                        "en-US": "time" 
                    },
                    description: "L'heure de début de la session (Exemple : 18:30)",
                    descriptionLocalizations: {
                        "fr": "L'heure de début de la session (Exemple : 18:30)",
                        "en-GB": "The start time of the session (Example: 8:30pm)",
                        "en-US": "The start time of the session (Example: 8:30pm)"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "lanceur",
                    nameLocalizations: {
                        "fr": "lanceur",
                        "en-GB": "launcher",
                        "en-US": "launcher"
                    },
                    description: "Le pseudonyme du lanceur de la session",
                    descriptionLocalizations: {
                        "fr": "Le pseudonyme du lanceur de la session",
                        "en-GB": "The nickname of the session launcher",
                        "en-US": "The nickname of the session launcher"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "date",
                    description: "La date à laquelle la session débutera (Exemple : 31/01/2022)",
                    descriptionLocalizations: {
                        "fr": "La date à laquelle la session débutera (Exemple : 31/01/2022)",
                        "en-GB": "The date on which the session will start (Example: 01/31/2022)",
                        "en-US": "The date on which the session will start (Example: 01/31/2022)"
                    },
                    type: ApplicationCommandOptionType.String,
                },
            ],
        },
        {
            name: "force-fin",
            nameLocalizations: {
                "fr": "force-fin",
                "en-GB": "force-end",
                "en-US": "force-end"
            },
            description: "Force la fin d'une session",
            descriptionLocalizations: {
                "fr": "Force la fin d'une session",
                "en-GB": "Force the end of a session",
                "en-US": "Force the end of a session"
            },
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    moderation: true,
    run: async(client, interaction, { t, errorEmbed, successEmbed }) => {

        try {
        
        const method = interaction.options.getSubcommand();

        if(method === "force-fin") {
            
            const embed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setAuthor({ name: t("force-end.title"), iconURL: interaction.guild.iconURL() })
                .setDescription(t("force-end.description"))
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("force-end").setLabel(t("force-end.button")).setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId("cancel").setLabel(t("force-end.cancel")).setStyle(ButtonStyle.Secondary),
            )

            let msg = await interaction.reply({ embeds: [embed], components: [row] })
            msg.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: 5000 }).then(async i => {
                if(i.customId === "force-end") {
                    await client.db.forceEndSession(interaction.guild.id);
                    return successEmbed(t("force-end.success"), false, false, "editReply");
                } else if(i.customId === "cancel") {
                    await i.deferUpdate();
                    await msg.delete();
                }
            }).catch(async () => {
                interaction.editReply({ embeds: [embed], components: [] });
            })

        }

        let pseudo = interaction.options.getString("lanceur");

        if(["annonce", "vocale"].includes(method)) {
            let dateString = interaction.options.getString("date");
            let timeString = interaction.options.getString("heure").replace("h", ":");
            let [hourString, minuteString] = timeString.split(":");

            var date = dateString ? client.dayjs(dateString, "DD/MM/YYYY") : client.dayjs();

            if(!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) return errorEmbed(t("time"));
            if(!date.isValid()) return errorEmbed(t("format"));

            date = date.hour(hourString).minute(minuteString);
            if(!dateString && date.isBefore(new Date())) date = date.add(1, "day");
            
            if(date.isBefore(new Date())) return errorEmbed(t("past"));
        }

        // Send embeds
        switch (method) {

            case "début": {
                const rows = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("session_enter").setLabel(t("session.enter", false, "global")).setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId("session_quit").setLabel(t("session.quit", false, "global")).setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId("session_end").setLabel(t("session.end", false, "global")).setStyle(ButtonStyle.Secondary),
                );

                const embed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle(t("start.title"))
                    .setThumbnail("https://i.pinimg.com/originals/04/8c/8e/048c8e251c1a6a1a9f8b35f68dcd8b52.gif")
                    .setDescription(t("start.description", { time: time(new Date(), "D"), name: pseudo, passengers: "" }));

                return interaction.reply({ embeds: [embed], components: [rows] }).catch(() => {});
            }

            case "annonce": {

                const embed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle(t("new.title"))
                    .setThumbnail("https://i.pinimg.com/originals/04/8c/8e/048c8e251c1a6a1a9f8b35f68dcd8b52.gif")
                    .setDescription(t("new.description", { date: time(date.unix(), "D"), time: time(date.unix(), "t"), name: pseudo }))
                    .setFooter({ text: t("new.footer") });

                const message = await interaction.reply({ embeds: [embed], fetchReply: true }).catch(() => {});
                if(message && interaction.channel.permissionsFor(client.user.id).has("AddReactions")) ["✅", "❌", "🕑", "🤷‍♂️"].forEach(r => message.react(r).catch(() => {}));
                break;
            }

            case "vocale": {
                const embed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle(t("vocal.title"))
                    .setThumbnail("https://thumbs.gfycat.com/ScalyAngelicAfricanrockpython-small.gif")
                    .setDescription(t("vocal.description", { date: time(date.unix()), name: pseudo }));

                return interaction.reply({ embeds: [embed] }).catch(() => {})

            }
        }


        } catch (err) {
            console.error(err);
            client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
        
    }
};
