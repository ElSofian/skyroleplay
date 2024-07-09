module.exports = {
    category: { "en": "admindev", "fr": "admindev" },
    name: "quit",
    nameLocalizations: {
        "fr": "quit",
        "en-US": "quit",        
        "en-GB": "quit"
    },
    description: "Eteindre le bot en cas de danger.",
    descriptionLocalizations: {
        "fr": "Eteindre le bot en cas de danger.",
        "en-US": "Turn off the bot in case of danger.",
        "en-GB": "Turn off the bot in case of danger."
    },
    staff_level: 1,
    run: async(client, interaction, { successEmbed }) => {

        successEmbed("Mise hors tension du bot...")
        return process.exit(0);
    }
};
