const { EmbedBuilder, ApplicationCommandOptionType, inlineCode } = require("discord.js");

const weaponTypes = [
    {
        name: "Armes légères",
        emoji: "<:ppa_leger:1126186077443596401>",
        nameLocalizations: {
            "fr": "Armes légères",
            "en-GB": "Light weapons",
            "en-US": "Light weapons"
        },
        value: "light",
    },
    {
        name: "Armes lourdes",
        emoji: "<:ppa_lourd:1126186078374731857>",
        nameLocalizations: {
            "fr": "Armes lourdes",
            "en-GB": "Heavy weapons",
            "en-US": "Heavy weapons"
        },
        value: "heavy",
    },
    {
        name: "Armes blanches",
        emoji: "<:ppa_blanc:1126186075199639723>",
        nameLocalizations: {
            "fr": "Armes blanches", 
            "en-GB": "Blunt weapons",
            "en-US": "Blunt weapons"
        },
        value: "cold",
    },
];

module.exports = {
    category: { "en": "moderation", "fr": "modération" },
    name: "permis-port-armes",
    nameLocalizations: {
        "fr": "permis-port-armes",
        "en-GB": "weapon-permit",
        "en-US": "weapon-permit"
    },
    description: "Crée ou supprime un permis de port d'armes",
    descriptionLocalizations: {
        "fr": "Crée ou supprime un permis de port d'armes",
        "en-GB": "Create or delete a weapon permit",
        "en-US": "Create or delete a weapon permit"
    },
    options: [
        {
            name: "créer",
            nameLocalizations: {
                "fr": "créer",
                "en-GB": "create",
                "en-US": "create"
            },
            description: "Crée un permis de port d'armes",
            descriptionLocalizations: {
                "fr": "Crée un permis de port d'armes",
                "en-GB": "Create a weapon permit",
                "en-US": "Create a weapon permit"
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
                    description: "Mentionnez le joueur auquel créer le permis de port d'armes",
                    descriptionLocalizations: {
                        "fr": "Mentionnez le joueur auquel créer le permis de port d'armes",
                        "en-GB": "Mention the player to create the weapon permit",
                        "en-US": "Mention the player to create the weapon permit"
                    },
                    required: true,
                    type: ApplicationCommandOptionType.User,
                }
            ],
        },
        {
            name: "supprimer",
            nameLocalizations: {
                "fr": "supprimer",
                "en-GB": "delete",
                "en-US": "delete"
            },
            description: "Supprime un permis de port d'armes",
            descriptionLocalizations: {
                "fr": "Supprime un permis de port d'armes",
                "en-GB": "Delete a weapon permit",
                "en-US": "Delete a weapon permit"
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
                    description: "Mentionnez le joueur auquel supprimer le permis de port d'armes",
                    descriptionLocalizations: {
                        "fr": "Mentionnez le joueur auquel supprimer le permis de port d'armes",
                        "en-GB": "Mention the player to delete the weapon permit",
                        "en-US": "Mention the player to delete the weapon permit"
                    },
                    required: true,
                    type: ApplicationCommandOptionType.User,
                }
            ],
        },
    ],
    cooldown: 5,
    moderation: true,
    run: async(client, interaction, { t, isPremium, errorEmbed, successEmbed, verify }) => {

        try {

        const method = interaction.options.getSubcommand();
        const member = interaction.options.getMember("joueur") || interaction.member;
        const own = member.id === interaction.member.id;
        if(verify("member", { cantBotInclued: true })) return;
        if(!(await client.db.hasIDCard(interaction.guildId, member.user.id))) return errorEmbed(own ? t("idcard_user", false, "errors") : t("idcard_member", { member: member.toString() }, "errors"));

        const licenses = await client.db.getWeaponLicense(interaction.guildId, member.id);
        if(method === "créer" && ['light', 'heavy', 'cold'].every(type => licenses.some(obj => obj.type === type))) return errorEmbed(own ? t("self_already_all") : t("user_already_all", { member: member.toString() }));
        if(method === "supprimer" && licenses.length === 0) return errorEmbed(own ? t("self_no_licenses") : t("user_no_licenses", { member: member.toString() }));

        const type = await client.functions.userinput.askPPAType(interaction, method === "créer" ? weaponTypes.filter(obj => !licenses.some(obj2 => obj2.type === obj.value)) : weaponTypes.filter(obj => licenses.some(obj2 => obj2.type === obj.value)));
        if(!type) return;

        const weapon = t(`weaponTypes.${type}`);
        
        switch (method) {
            case "créer": {
                await client.db.setWeaponLicense(interaction.guildId, member.user.id, type, 1);
                await successEmbed(own ? t("self_confirm", { name: weapon }) : t("user_confirm", { member: member.toString(), name: weapon }));
                break;
            }
            case "supprimer": {
                await client.db.deleteWeaponLicense(interaction.guildId, member.user.id, type);
                await successEmbed(own ? t("self_no_longer2", { name: weapon }) : t("user_no_longer2", { member: member.toString(), name: weapon }));
                break;
            }
        }

        const logsEmbed = new EmbedBuilder()
            .setTitle(method == "créer" ? t("logs_create") : t("gun_license_deleted"))
            .addFields([
                { name: t("logs.by"), value: `${interaction.user.toString()} (${interaction.user.id})`, inline: true },
                { name: t("logs.for"), value: `${member.toString()} (${member.id})`, inline: true },
                { name: t("logs.type"), value: inlineCode(weapon) }
            ])
            .setThumbnail(interaction.user.displayAvatarURL());

        client.functions.logs.send(interaction, logsEmbed, method == "créer" ? "creation" : "deletion");
        
        } catch (err) {
            console.error(err);
            client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    },
};
