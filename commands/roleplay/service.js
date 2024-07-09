const { EmbedBuilder, ApplicationCommandOptionType, time } = require("discord.js");
const services = new Map();

function getServiceLink(interaction) {
    return services.get(`${interaction.guildId}-${interaction.user.id}`) ?? null;
}

function addServiceLink(interaction, link) {
    services.set(`${interaction.guildId}-${interaction.user.id}`, link);
}

function removeServiceLink(interaction) {
    services.delete(`${interaction.guildId}-${interaction.user.id}`);
}

module.exports = {
    category: { "en": "roleplay", "fr": "roleplay" },
    name: "service",
    description: "Prendre ou finir son service professionnel",
    descriptionLocalizations: {
        "fr": "Prendre ou finir son service professionnel",
        "en-GB": "Take or finish your professional service",
        "en-US": "Take or finish your professional service"
    },
    options: [
        {
            name: "prendre",
            nameLocalizations: {
                "fr": "prendre",
                "en-GB": "take",
                "en-US": "take"
            },
            description: "Prend son service professionnel",
            descriptionLocalizations: {
                "fr": "Prend son service professionnel",
                "en-GB": "Take your professional service",
                "en-US": "Take your professional service"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "métier",
                    nameLocalizations: {
                        "fr": "métier",
                        "en-GB": "job",
                        "en-US": "job"
                    },
                    description: "Le métier auquel prendre le service",
                    descriptionLocalizations: {
                        "fr": "Le métier auquel prendre le service",
                        "en-GB": "The job to take the service",
                        "en-US": "The job to take the service"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: "finir",
            nameLocalizations: {
                "fr": "finir",
                "en-GB": "finish",
                "en-US": "finish"
            },
            description: "Finit son service professionnel",
            descriptionLocalizations: {
                "fr": "Finit son service professionnel",
                "en-GB": "Finish your professional service",
                "en-US": "Finish your professional service"
            },
            type: ApplicationCommandOptionType.Subcommand,
    }],
    run: async(client, interaction, { t, errorEmbed }) => {

        try {
        
        const method = interaction.options.getSubcommand();

        switch (method) {

            //! PRENDRE
            case "prendre": {

                const currentLink = getServiceLink(interaction);
                if(currentLink) return errorEmbed(t("already_in_service", { link: currentLink }));

                const job = interaction.options.getString("métier");

                const embed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle(t("take_service_embed.title"))
                    .setDescription(t("take_service_embed.description", { user: interaction.user.toString(), job: job, time: time(new Date(), "t") }))

                const response = await interaction.reply({ embeds: [embed], fetchReply: true }).catch(() => {})
                if(response) addServiceLink(interaction, response.url);

                break;
            }

            //! FINIR
            case "finir": {

                const currentLink = getServiceLink(interaction);
                if(!currentLink) return errorEmbed(t("not_in_service"));

                const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle(t("leave_service_embed.title"))
                    .setDescription(t("leave_service_embed.description", { user: interaction.user.toString(), time: time(new Date(), "t") }));

                removeServiceLink(interaction);

                await interaction.reply({ embeds: [embed] }).catch(() => {})

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
