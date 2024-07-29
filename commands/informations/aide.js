const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ApplicationCommandOptionType, inlineCode } = require("discord.js");
const { readdirSync } = require("node:fs");

module.exports = {
    category: { "en": "informations", "fr": "informations" },
    name: "aide",
    nameLocalizations: {
        "fr": "aide",
        "en-GB": "help",
        "en-US": "help"
    },
    description: "Affiche la liste des commandes disponibles",
    descriptionLocalizations: {
        "fr": "Affiche la liste des commandes disponibles",
        "en-GB": "Display the list of available commands",
        "en-US": "Display the list of available commands"   
    },
    options: [{
        name: "commande",
        nameLocalizations: {
            "fr": "commande",
            "en-GB": "command",
            "en-US": "command"
        },
        description: "Affiche les informations sur une commande",
        descriptionLocalizations: {
            "fr": "Affiche les informations sur une commande",
            "en-GB": "Display information about a command",
            "en-US": "Display information about a command"
        },
        type: ApplicationCommandOptionType.String,
        required: false
    }],
    run: async(client, interaction, { t, errorEmbed, lang }) => {

        try {

        const commandName = interaction.options.getString("commande");
        const subCommands = new Map();

        for (let command of client.commands) {
            let type = "";
            if (command[1].options) {
                for (let i = 0; i < command[1].options.length; i++) {
                    const sOp = command[1].options[i];
                    type = sOp.type;
                }

                if (type == "SUB_COMMAND" || type == "SUB_COMMAND_GROUP") {
                    let lth = 0;
                    command[1].options.forEach(() => lth++);

                    let subCmd = []
                    if (lth)
                        for (let i = 0; i < lth; i++) {
                            const subsOptions = command[1].options[i];
                            if (subsOptions.type == "SUB_COMMAND_GROUP") {
                                for (let index = 0; index < subsOptions.options.length; index++) {
                                    subCmd.push(`${subsOptions.nameLocalizations !== undefined ? subsOptions.nameLocalizations[lang !== "fr" ? "en-US" : "fr"] : subsOptions.name} ` + (subsOptions.options[index].nameLocalizations !== undefined ? subsOptions.options[index].nameLocalizations[lang !== "fr" ? "en-US" : "fr"] : subsOptions.options[index].name))
                                }
                            } else {
                            subCmd.push(subsOptions.nameLocalizations !== undefined ? subsOptions.nameLocalizations[lang !== "fr" ? "en-US" : "fr"] : subsOptions.name)
                            }
                        }
                    subCommands.set(command[1].nameLocalizations !== undefined ? command[1].nameLocalizations[lang !== "fr" ? "en-US" : "fr"] : command[1].name, subCmd)
                }
            }
        }

        if (commandName) {

            const command = client.commands.get(commandName);
            if (!command) return errorEmbed(t("unkown_command", { command: inlineCode(commandName) }, "errors"));

            let subCmds = subCommands.get(commandName);
            const embed = new EmbedBuilder()
                .setColor("Green")
                .setAuthor({ name: t("help_embed.author", { category: commandName }), iconURL: client.user.displayAvatarURL(), url: client.constants.links.docs })
                .setDescription(`${client.constants.emojis[command.category.en]} **${commandName}**\n\n**»** *${command.description}*\n\n${subCmds ? t("help_embed.subcmd") + subCmds.map((s) => `${s}\n`).toString().replaceAll(",", "") : ""}`)
                .setFooter({ text: interaction.member.displayName, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            if (command.options?.cooldown) embed.addFields([{ name: (t("time_recuperation")), value: command.options.cooldown > 0 ? t("time_sec", { time: command.options.cooldown }) : t("instant") }]);
            if (command.options?.premium) embed.addFields([{ name: (t("cmd_premium.key", { prememoji: client.constants.emojis.premium })), value: (t("cmd_premium.value", { linkpremium: client.constants.links.premium })) }]);

            interaction.reply({ embeds: [embed] }).catch(() => {})

        } else {

            const categories = [];
            categories.push({
                label: t("menu"),
                value: "home",
                emoji: "<:menu:986673745135534100>"
            })

            const categoriesFolders = readdirSync("./commands/")
            for (let category of categoriesFolders) {
                if (category === "admindev") continue;
                let str = "";

                for (let a of client.commands) a[1].category.en == category ? str += `${a[1].nameLocalizations !== undefined ? a[1].nameLocalizations[lang !== "fr" ? "en-US" : "fr"] : a[0]}, ` : "";
                if (str.endsWith(", ")) str = str.slice(0, -2)

                let categoryInFr;
                switch (category) {
                    case "companies": categoryInFr = "Entreprises"; break;
                    case "economy": categoryInFr = "Économie"; break;
                    case "player":  categoryInFr = "Joueur"; break;
                    case "illegal": categoryInFr = "Illégal"; break;
                    case "informations": categoryInFr = "Informations"; break;
                    case "moderation": categoryInFr = "Modération"; break;
                    case "premium": categoryInFr = "Premium"; break;
                    case "roleplay": categoryInFr = "Roleplay"; break;
                }

                categories.push({
                    label: client.functions.other.cfl(lang !== "fr" ? category : categoryInFr),
                    emoji: client.constants.emojis[category],
                    description: (str.length >= 100 ? str.substring(0, 96) + "..." : str.substring(0, 100)),
                    value: category,
                })

            }

            var row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                .setCustomId(`help-select`)
                .setPlaceholder(t("menu"))
                .setOptions(categories)
            );

            const embed = new EmbedBuilder()
                .setColor("Green")
                .setAuthor({ name: t("help_embed.author", { category: t("menu") }), iconURL: client.user.displayAvatarURL(), url: client.constants.links.docs })
                .setDescription(t("help_embed.description", {
                    mentionbot: `<@${client.user.id}>`,
                    linkdashboard: client.constants.links.dashboard,
                    linksupport:  client.constants.links.support,
                    linkpremium: client.constants.links.premium,
                }))
                .setFooter({ text: interaction.member.displayName, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true }).catch(() => {});
            if (!message) return; // interaction isn't edited

            const collector = message.createMessageComponentCollector({
                filter: (i) => i.user.id === interaction.user.id,
                time: 120000,
            });


            if (!collector) return;
            collector.on("collect", async (collected) => {
                
                const category = collected.values[0];
                let editEmbed;

                if (category == "home") editEmbed = embed
                else {

                    const commandsCategory = client.commands.filter((c) => c.category.en == category)
                    let fields = [];

                    for (let c of commandsCategory) {
                        fields.push({
                            name: `${c[1].nameLocalizations !== undefined ? c[1].nameLocalizations[lang !== "fr" ? "en-US" : "fr"] : c[1].name} :`,
                            value: `**»**  *${c[1].descriptionLocalizations !== undefined ? c[1].descriptionLocalizations[lang !== "fr" ? "en-US" : "fr"] : c[1].description}*`, //<:reply:931352143955394620>
                            inline: commandsCategory.size >= 10 ? true : false
                        });

                    }

                    editEmbed = new EmbedBuilder()
                        .setColor("Green")
                        .setTitle(t("help_embed.title", { emoji: client.constants.emojis[category], cmdSize: commandsCategory.size }))
                        .setAuthor({
                            name: t("help_embed.author",  { category: category }),
                            iconURL: `https://cdn.discordapp.com/emojis/${client.constants.emojis[category].slice(-19, -1)}.png`,
                            url: client.constants.links.docs
                        })
                        .addFields(fields)
                        .setFooter({ text: interaction.member.displayName, iconURL: interaction.user.displayAvatarURL() })
                        .setTimestamp();

                }

                row = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                    .setCustomId(`help-select`)
                    .setPlaceholder(categories.find((c) => c.value == category).label)
                    .setOptions(categories)
                )

                await interaction.editReply({ embeds: [editEmbed], components: [row] }).catch(() => {});
                collected.update().catch(() => {});

            });

            collector.on("end", (collected) => {
                return interaction.editReply({ components: [] }).catch(() => {})
            });
        }


        } catch (err) {
            console.error(err);

            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    }
};