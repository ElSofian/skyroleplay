const { EmbedBuilder, ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle } = require("discord.js");

const code = Math.floor(Math.random() * 9000000000) + 1000000000
module.exports = {
    category: { "en": "roleplay", "fr": "roleplay" },
    name: "agence-immobilière",
    nameLocalizations: {
        "fr": "agence-immobilière",
        "en-GB": "real-estate-agency",
        "en-US": "real-estate-agency"
    },
    description: "Acheter un bien immobilier.",
    descriptionLocalizations: {
        "fr": "Acheter un bien immobilier.",
        "en-GB": "Buy a real estate.",
        "en-US": "Buy a real estate."
    },
    options: [{
        name: "nom",
        nameLocalizations: {
            "fr": "nom",
            "en-GB": "name",
            "en-US": "name"
        },
        description: "Choisissez le nom de l'agence immobilère à qui vous souhaitez acheter votre bien.",
        descriptionLocalizations: {
            "fr": "Choisissez le nom de l'agence immobilère à qui vous souhaitez acheter votre bien.",
            "en-GB": "Choose the name of the real estate agency to whom you want to buy your property.",
            "en-US": "Choose the name of the real estate agency to whom you want to buy your property."
        },
        type: ApplicationCommandOptionType.String,
        required: false,
        autocomplete: true
    },
    {
        name: "propriété",
        nameLocalizations: {
            "fr": "propriété",
            "en-GB": "property",
            "en-US": "property"
        },
        description: "Choisissez le bien immobilier que vous souhaitez acheter.",
        descriptionLocalizations: {
            "fr": "Choisissez le bien immobilier que vous souhaitez acheter.",
            "en-GB": "Choose the real estate you want to buy.",
            "en-US": "Choose the real estate you want to buy."
        },
        type: ApplicationCommandOptionType.String,
        required: false,
        autocomplete: true
    }],
    run: async(client, interaction, { t, isPremium, errorEmbed, successEmbed, economySymbol, lang, separate }) => {

        try {

        const realEstateId = (interaction.options.getString("nom"))?.split("&#46;")?.[2]
        if (interaction.options.getString("nom") && !interaction.options.getString("nom").startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == "fr" ? "agence-immobilière" : "real-estate-agency" }, "errors"));

        const properties = await client.db.getProperties(interaction.guildId, realEstateId ?? null)
        if (properties.filter(p => p.owner_id == null).length == 0) return errorEmbed(t("no_property"));
        
        properties.filter(p => p.owner_id !== null).forEach(p => properties.splice(properties.indexOf(p), 1));
        if (!isPremium) properties.splice(15, properties.length - 15);

        const memberMoney = await client.db.getMoney(interaction.guildId, interaction.member.id);
        function render(index) {

            const property = properties[index];
            const propertyEmbed = new EmbedBuilder()
            .setColor("White")
            .setTitle(t("embed.title", { emoji: client.constants.emojis.realestate }))
            .setThumbnail("https://imgur.com/WGFo4PH.png")
            .addFields([
                { name: t("embed_property.name"), value: (`${property?.name}`.length > 0 ? property.name : null) ?? t("none"), inline: true },
                { name: t("embed_property.localisation"), value: (`${property?.localisation}`.length > 0 ? property.localisation : null) ?? t("none"), inline: true },
                { name: t("embed_property.price"), value: `${(property?.price ?? 0) > 0 ? `${separate(property.price)}${economySymbol}` : t("free")}`, inline: true },
            ])
            .setImage(property?.image)

            const rows = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                .setCustomId("buy")
                .setLabel(t("button.buy"))
                .setStyle(ButtonStyle.Primary)
                .setDisabled((memberMoney?.bank_money ?? 0) < (property?.price ?? 0))
            )

            if (properties.length > 1) {
            
                rows.addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(`previous`)
                        .setEmoji("◀")
                        .setDisabled(index === 0),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(`next`)
                        .setEmoji("▶")
                        .setDisabled(index + 1 === properties.length)
                );

            }

            return { embeds: [propertyEmbed], components: [rows] };

        }

        const property = await client.db.getProperty(interaction.guildId, (interaction.options.getString("propriété") ?? "").split("&#46;")?.[2])
        const index = properties.findIndex(({ id }) => id == property?.id);
        let current = index !== -1 ? index : 0;

        const message = await interaction.reply(render(current))
        if (!message) return;

        const collector = await message.createMessageComponentCollector({ filter: (i) => i.user.id == interaction.member.id, time: 240000 });
        if (!collector) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");

        collector.on("collect", async (i) => {

            switch(i.customId) {

                case "previous": 
                case "next": {
                    i.customId == "next" ? current++ : current--
                    await i.update(render(current))
                    break;
                }

                case "buy": {

                    const property = await client.db.getProperty(interaction.guildId, properties[current]?.id);
                    if (!property) return i.reply({ embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], components: [] }).catch(() => {});
                    
                    const freezeAccount = await client.db.isFreezeAccount(interaction.guildId, i.user.id);
                    if (freezeAccount) return i.reply({ embeds: [errorEmbed(t("freezed_account"), true)], components: [] }).catch(() => {})
                    
                    const bankAccount = await client.db.getBankAccount(interaction.guildId, i.user.id);
                    if (!bankAccount || bankAccount.bank_money == null || isNaN(bankAccount.bank_money)) return i.reply({ embeds: [errorEmbed(t("no_bank_account", false, "errors"), true)], components: []}).catch(() => {});
                    if (bankAccount.frozen_date || bankAccount.frozen_reason) return i.reply({ embeds: [errorEmbed(t("frozen", false, "errors"), true)], components: []}).catch(() => {});
                    if (bankAccount.bank_money < property.price) return i.reply({ embeds: [errorEmbed(t("not_enough_money", { amount: separate(property.price - bankAccount.bank_money), symbol: economySymbol }), true)], components: [] }).catch(() => {})
                    
                    const realestate = await client.db.getSpecifyCompany(interaction.guildId, "realestate", realEstateId ?? null, true);
                    await client.db.buyProperty(interaction.guildId, property.id, i.user.id, property.price, realestate?.id ?? null);
                    await client.db.addTransactionLog(interaction.guildId, i.user.id, -property.price, `${lang == "fr" ? `Achat de` : `Purchase`} ${property.name}`)
                    
                    if (realestate.length) {
                        const idCard = await client.db.getIDCard(interaction.guildId, i.user.id);
                        await client.db.addTransactionLog(interaction.guildId, realestate.id, -property.price, `${lang == "fr" ? `Achat de` : `Purchase`} ${property.name} ${lang == "fr" ? "par" : "by"} ${idCard ? `${idCard.first_name} ${idCard.last_name}` : i.member.displayName}`)
                    }
                    
                    return i.update({ embeds: [successEmbed(t("success", { name: property.name }), true)], components: [] }).catch(() => {})

                }

            }

        })

        collector.on("end", (collected) => {
            return interaction.editReply({ components: [] }).catch(() => {})
        });

        } catch (err) {
            console.error(err);
            
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    },

    runAutocomplete: async(client, interaction, { isPremium, lang }) => {

        const focusedOption = interaction.options.getFocused(true);
        const response = focusedOption.name == "nom" ? await client.db.getSpecifyCompany(interaction.guildId, "realestate") : (await client.db.getProperties(interaction.guildId)).filter(p => !p.owner_id)

        const filtered = [];
        if (focusedOption.value !== "") {
            const filtredArray = [];
            filtredArray.push(...response.filter(r => r.name.toLowerCase() == focusedOption.value.toLowerCase()),);
            filtredArray.push(...response.filter(r => r.name.toLowerCase().startsWith(focusedOption.value.toLowerCase())));
            filtredArray.push(...response.filter(r => r.name.toLowerCase().includes(focusedOption.value.toLowerCase())));

            const unique = [...new Set(filtredArray)]
            filtered.push(...unique);
        } else {
            filtered.push(...response);
        }

        return interaction.respond(filtered.slice(0, 25).map(c => ({ name: c.name, value: `${code}&#46;${focusedOption.name}&#46;${c.id}` }))).catch(() => {});

    }
};
