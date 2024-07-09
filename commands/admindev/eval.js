const { ApplicationCommandOptionType } = require("discord.js");
const { inspect } = require("util");

module.exports = {
    category: { "en": "admindev", "fr": "admindev" },
    name: "eval",
    description: "Execute du code à distance.",
    options: [
        {
            name: "code",
            description: "Le code à exécuter.",
            type: ApplicationCommandOptionType.String
        },
        {
            name: "shard",
            description: "Le shard sur lequel exécuter le code.",
            type: ApplicationCommandOptionType.Number
        },
        {
            name: "async",
            description: "Si le code est asynchrone ou non.",
            type: ApplicationCommandOptionType.Boolean
        }
    ],
    staff_level: 1,
    run: async(client, interaction) => {


        await interaction.deferReply();

        const code = interaction.options.getString("code");
        const shard = interaction.options.getNumber("shard");
        const async = interaction.options.getBoolean("async") || false;

        if(shard && shard + 1 > this.client.shard.count) return interaction.editReply({ content: "Le shard spécifié est invalide." });

        const evalString = async ? `(async () => {${code}})()` : code;
        try {
            const evaled = shard ? await this.client.shard.broadcastEval(evalString) : await eval(evalString);
            const inspected = inspect(evaled, { depth: 0 });
            await sendContent(interaction, inspected, "<:reussi:788099426903916574> Code exécuté avec succès");
        } catch (error) {
            await sendContent(interaction, error, "<:echec:788099451351990272> Une erreur est survenue");
        }

    }
};

async function sendContent(interaction, content, title) {
    content = content.toString();
    const split = content.match(/[\s\S]{1,1800}/g);
    if (split.length == 1) {
        await interaction.editReply(`${title}\n\`\`\`js\n${split[0]}\n\`\`\``);
    } else {
        const link = await fetch("https://hastebin.com/documents", {
            method: "POST",
            body: content,
            headers: { "Content-Type": "text/plain" }
        }).then(res => res.json());
        await interaction.editReply(`${title}\nLe contenu est trop long pour être affiché.\nhttps://hastebin.com/${link.key}.js`);
    }
}