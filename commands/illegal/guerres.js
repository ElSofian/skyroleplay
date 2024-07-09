const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, time } = require("discord.js");

module.exports = {
    category: { "en": "illegal", "fr": "illégal" },
    name: "guerres",
    nameLocalizations: {
        "fr": "guerres",
        "en-GB": "wars",
        "en-US": "wars"
    },
    description: "Affiche les guerres entre gangs",
    descriptionLocalizations: {
        "fr": "Affiche les guerres entre gangs",
        "en-GB": "Display the wars between gangs",
        "en-US": "Display the wars between gangs"
    },
    run: async(client, interaction, { t, errorEmbed, lang }) => {

        try {

        const wars = await client.db.getWars(interaction.guildId);
        
        async function render(chunkWars, index, total) {

            const embed = new EmbedBuilder()
            .setColor("#030303")
            .setThumbnail("https://imgur.com/W7Lw6pP.png")
            .setAuthor({ name: "Dark Chat", iconURL: "https://imgur.com/EgcZngN.png" })
            .setDescription(!chunkWars || !chunkWars.length ? t("no_wars") : (await Promise.all(chunkWars.map(async w => {
                const gang = await client.db.getCompany(interaction.guildId, w.gang_id);
                const ennemies = await client.db.getCompany(interaction.guildId, w.ennemies_id);
                if(!gang || !ennemies) return "";
                return `${t("war", { gang: gang.name, ennemies: ennemies.name, date: time(w.date, "d") })}`;
            }))).join("\n\n"))

            if(total > 1) {
                
                embed.setFooter({ text: `${index + 1}/${total}` });
                var rows = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(`previous`)
                        .setEmoji("◀")
                        .setDisabled(index === 0),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(`next`)
                        .setEmoji("▶")
                        .setDisabled(index + 1 === total)
                );

            }

            return {
                embeds: [embed],
                components: total > 1 ? [rows] : []
            }

        }

        const chunks = client.functions.other.chunkArray(wars, 10);
        let _render = await render(chunks[0], 0, wars.length);

        const message = await interaction.reply({ embeds: _render.embeds, components: _render.components, fetchReply: true }).catch(() => {});
        if(!message || wars.length == 1) return; // interaction isn't edited && only one page to display

        const collector = await message.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.member.id, time: 120000 });
        if(!collector) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply")

        let current = 0;
        collector.on("collect", async (i) => {

            switch (i.customId) {
                case `previous`: {
                    current--;
                    await i.update(await render(chunks[current], current, wars.length)).catch(() => {});
                    break;
                }

                case `next`: {
                    current++;
                    await i.update(await render(chunks[current], current, wars.length)).catch(() => {});
                    break;
                }
            }

        })

        collector.on("end", (collected) => {
            return interaction.editReply({ components: [] }).catch(() => {})
        })

        
        } catch (err) {
            console.error(err);
client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
    },
};
