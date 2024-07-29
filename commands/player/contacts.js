const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

module.exports = {
    category: { "en": "player", "fr": "joueur" },
    name: "contacts",
    description: "Affiche, ajoute ou supprime des contacts",
    descriptionLocalizations: {
        "fr": "Affiche, ajoute ou supprime des contacts",
        "en-GB": "Displays, adds or removes contacts",
        "en-US": "Displays, adds or removes contacts"
    },
    run: async(client, interaction, { t, verify, successEmbed, errorEmbed, lang }) => {

        try {

        if (verify("member", { cantBotInclued: true })) return;

        const numbers = await client.db.getMemberContacts(interaction.guildId, interaction.member.id);
        const chunks = client.functions.other.chunkArray(numbers, 10);

        function render(numbers, index) {

            const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("Contacts")
            .setDescription(numbers ? numbers.map(n => `${n.name} : ${n.number}`).join("\n\n") : t("no_contacts"))
            if (index > 1) embed.setFooter({ text: `${index + 1}/${chunks.length}` })

            const rows = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("add").setLabel(t("add")).setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId("remove").setLabel(t("remove")).setStyle(ButtonStyle.Danger).setDisabled(!numbers)
            )

            if (chunks.length > 1) {

                rows.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`previous`)
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("◀")
                        .setDisabled(index === 0),
                    new ButtonBuilder()
                        .setCustomId(`next`)
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("▶")
                        .setDisabled(index + 1 === chunks.length)
                );
            }

            return {
                embeds: [embed],
                components: [rows]
            }

        }

        const message = await interaction.reply(render(chunks[0], 0)).catch(() => {});
        if (!message) return

        const collector = await message.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.member.id, time: 120000 });
        if (!collector) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply")

        let current = 0;
        collector.on("collect", async (i) => {
            
            switch(i.customId) {

                case "previous": current--; i.update(render(chunks[current], current)); break;
                case "next": current++; i.update(render(chunks[current], current)); break;

                case "remove":
                case "add": {

                    const code = Math.floor(Math.random() * 9000000000) + 1000000000
                    const modal = new ModalBuilder()
                    .setCustomId(`modal_contacts_${code}`)
                    .setTitle(t("modal.title"))
                    
                    modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("name").setLabel(t("name")).setPlaceholder(t("modal.placeholder_name")).setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(255).setRequired(true)))
                    if (i.customId == "add") modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("number").setLabel(t("number")).setPlaceholder(t("modal.placeholder_number")).setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(255).setRequired(true)))    

                    await i.showModal(modal).catch(() => {})

                    const modalCollector = await i.awaitModalSubmit({ filter: i => i.user.id === interaction.user.id && i.customId == `modal_contacts_${code}`, time: 60000 })
                    if (!modalCollector) return i.update({ embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], components: [] }).catch(() => {});
                    
                    const modalName = modalCollector.fields.getTextInputValue("name");
                    const modalNumber = i.customId == "add" ? modalCollector.fields.getTextInputValue("number"): null;

                    const hasContact = await client.db.hasContact(interaction.guildId, interaction.member.id, modalName)
                    if (i.customId == "add" ? hasContact : !hasContact) return modalCollector.reply({ embeds: [errorEmbed(t(i.customId == "add" ? "already_have_contact" : "not_in_contacts", { number: modalNumber, name: modalName }), true)], components: [] }).catch(() => {})

                    await client.db[`${i.customId}MemberContact`](interaction.guildId, interaction.member.id, modalName, modalNumber)

                    modalCollector.update({ embeds: [successEmbed(t(`contact_${i.customId}`, { name: i.customId == "add" ? modalName : hasContact.name }), true)], components: [] }).catch(() => {})
                    break;

                }

            }


        })

        collector.on("end", (collected) => {
            return interaction.editReply({ components: [] }).catch(() => {});
        })


        } catch (err) {
            console.error(err);

            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    }
}