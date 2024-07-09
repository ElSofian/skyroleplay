const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    name: "restart-shard",
    category: { "en": "admindev", "fr": "admindev" },
    nameLocalizations:  {
        "fr": "restart-shard",
        "en-GB": "restart-shard",
        "en-US": "restart-shard"
    },
    description: "Redémarre une shard",
    descriptionLocalizations: {
        "fr": "Redémarre une shard",
        "en-GB": "Restart a shard",
        "en-US": "Restart a shard"
    },
    options: [
        {
            name: "shard",
            nameLocalizations: {
                "fr": "shard",
                "en-GB": "shard",
                "en-US": "shard"
            },
            description: "Choisissez la shard à redémarrer.",
            descriptionLocalizations: {
                "fr": "Choisissez la shard à redémarrer.",
                "en-GB": "Choose the shard to restart.",
                "en-US": "Choose the shard to restart."
            },
            type: ApplicationCommandOptionType.Number,
            required: true,
        }
    ],
    staff_level: 3,
    run: async(client, interaction) => {

        client.cluster.broadcastEval(`this.cluster.respawn()`, { shard: interaction.options.getNumber("shard") });
        
    }

};
