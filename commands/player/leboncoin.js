const { EmbedBuilder, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const imgurUploader = require("imgur-uploader");

module.exports = {
    category: { "en": "player", "fr": "joueur" },
    name: "leboncoin",
    nameLocalizations: {
        "fr": "leboncoin",
        "en-GB": "ebay",
        "en-US": "ebay"
    },
    description: "Envoie une annonce sur leboncoin pour vendre des objets.",
    descriptionLocalizations: {
        "fr": "Envoie une annonce sur leboncoin pour vendre des objets.",
        "en-GB": "Send an ad on ebay to sell items.",
        "en-US": "Send an ad on ebay to sell items."
    },
    options: [
        {
            name: "vendre",
            nameLocalizations: {
                "fr": "vendre",
                "en-GB": "sell",
                "en-US": "sell"
            },
            description: "Vendez un objet sur leboncoin.",
            descriptionLocalizations: {
                "fr": "Vendez un objet sur leboncoin.",
                "en-GB": "Sell an item on ebay.",
                "en-US": "Sell an item on ebay."
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: "nom",
                nameLocalizations: {
                    "fr": "nom",
                    "en-GB": "name",
                    "en-US": "name"
                },
                description: "Spécifiez le nom de l'objet que vous voulez vendre.",
                descriptionLocalizations: {
                    "fr": "Spécifiez le nom de l'objet que vous voulez vendre.",
                    "en-GB": "Specify the name of the item you want to sell.",
                    "en-US": "Specify the name of the item you want to sell."   
                },
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: "description",
                description: "Spécifiez la description de l'objet que vous voulez vendre.",
                descriptionLocalizations: {
                    "fr": "Spécifiez la description de l'objet que vous voulez vendre.",
                    "en-GB": "Specify the description of the item you want to sell.",
                    "en-US": "Specify the description of the item you want to sell."
                },
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: "prix",
                nameLocalizations: {
                    "fr": "prix",
                    "en-GB": "price",
                    "en-US": "price"
                },  
                description: "Spécifiez le prix de l'objet que vous voulez vendre.",
                descriptionLocalizations: {
                    "fr": "Spécifiez le prix de l'objet que vous voulez vendre.",
                    "en-GB": "Specify the price of the item you want to sell.",
                    "en-US": "Specify the price of the item you want to sell."
                },
                type: ApplicationCommandOptionType.Number,
                minValue: 0,
                maxValue: 999999999,
                required: true
            },
            {
                name: "vignette",
                nameLocalizations: {
                    "fr": "vignette",
                    "en-GB": "thumbnail",
                    "en-US": "thumbnail"
                },
                description: "Envoyez une petite image de l'objet que vous voulez vendre.",
                descriptionLocalizations: {
                    "fr": "Envoyez une petite image de l'objet que vous voulez vendre.",
                    "en-GB": "Send a small image of the item you want to sell.",
                    "en-US": "Send a small image of the item you want to sell."
                },
                type: ApplicationCommandOptionType.Attachment,
                required: false
            },
            {
                name: "image",  
                description: "Envoyez une grande image de l'objet que vous voulez vendre.",
                descriptionLocalizations: {
                    "fr": "Envoyez une grande image de l'objet que vous voulez vendre.",    
                    "en-GB": "Send a large image of the item you want to sell.",
                    "en-US": "Send a large image of the item you want to sell."
                },
                type: ApplicationCommandOptionType.Attachment,
                required: false
            }],
        },
        {
            name: "compte",
            nameLocalizations: {
                "fr": "compte",
                "en-GB": "account",
                "en-US": "account"
            },
            description: "Affiche votre compte leboncoin.",
            descriptionLocalizations: {
                "fr": "Affiche votre compte leboncoin.",
                "en-GB": "Display your ebay account.",
                "en-US": "Display your ebay account."
            },
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "afficher",
            nameLocalizations: {
                "fr": "afficher",
                "en-GB": "display",
                "en-US": "display"
            },
            description: "Affiche les annonces leboncoin.",
            descriptionLocalizations: {
                "fr": "Affiche les annonces leboncoin.",
                "en-GB": "Display the ebay ads.",
                "en-US": "Display the ebay ads."
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: "trier-par",
                nameLocalizations: {
                    "fr": "trier-par",
                    "en-GB": "sort-by",
                    "en-US": "sort-by"
                },
                description: "Triez les annonces.",
                descriptionLocalizations: {
                    "fr": "Triez les annonces.",
                    "en-GB": "Sort the ads.",
                    "en-US": "Sort the ads."
                },
                type: ApplicationCommandOptionType.String,
                required: false,
                choices: [
                    {
                        name: "Prix croissant",
                        nameLocalizations: {
                            "fr": "Prix croissant",
                            "en-GB": "Lowest price",
                            "en-US": "Lowest price"
                        },
                        value: "lowest-price"
                    },
                    {
                        name: "Prix décroissant",
                        nameLocalizations: {
                            "fr": "Prix décroissant",
                            "en-GB": "Highest price",
                            "en-US": "Highest price"
                        },
                        value: "highest-price"
                    },
                    {
                        name: "Plus récent",
                        nameLocalizations: {
                            "fr": "Plus récent",
                            "en-GB": "Most recent",
                            "en-US": "Most recent"
                        },
                        value: "recents"
                    },
                    {
                        name: "Plus ancien",
                        nameLocalizations: {
                            "fr": "Plus ancien",
                            "en-GB": "Oldest",
                            "en-US": "Oldest"
                        },
                        value: "oldest"
                    },
                ]
            }]
        }
    ],
    run: async(client, interaction, { t, errorEmbed, successEmbed, economySymbol, lang, overdraftLimit, separate }) => {

        try {

        switch(interaction.options.getSubcommand()) {

            case "vendre": {

                const selfBankAccount = await client.db.getBankAccount(interaction.guildId, interaction.user.id); 
                if (!selfBankAccount || selfBankAccount.bank_money == null || isNaN(selfBankAccount.bank_money)) return errorEmbed(t("no_bank_account", false, "errors"))
                if (selfBankAccount.frozen_date || selfBankAccount.frozen_reason) return errorEmbed(t("frozen", false, "errors"))

                const name = interaction.options.getString("nom");
                const description = interaction.options.getString("description");
                const price = interaction.options.getNumber("prix");
                const image = interaction.options.getAttachment("image");
                const thumbnail = interaction.options.getAttachment("vignette");

                if (name.length > 255) return errorEmbed(t("name_too_long"))
                if (description.length > 500) return errorEmbed(t("description_too_long"))

                if (image || thumbnail) interaction.reply({ content: t("uploading", { emoji: client.constants.emojis.load }) }).catch(() => {});
                
                let imageUrl, thumbnailUrl;
                if (image) await imgurUploader(image.url, { title: image.name }).then(data => { imageUrl = data.link });
                if (thumbnail) await imgurUploader(thumbnail.url, { title: thumbnail.name }).then(data => { thumbnailUrl = data.link });
                
                await client.db.addSale(interaction.guildId, interaction.member.id, name, description, price, imageUrl, thumbnailUrl)

                const embed = new EmbedBuilder()
                    .setColor("Orange")
                    .setThumbnail(thumbnail?.url ?? "https://cdn.discordapp.com/attachments/850491658339352577/930898831544029274/leboncoin.png")
                    .setTitle(t("sell_embed.title"))
                    .addFields([
                        { name: t("sell_embed.fields.seller"), value: interaction.member.toLocaleString() },
                        { name: t("sell_embed.fields.name"), value: name.substr(0, 1024) },
                        { name: "Description", value: description.substr(0, 1024) },
                        { name: t("sell_embed.fields.price"), value: `${separate(price)}${economySymbol}` }
                    ])
                    .setImage(image?.url ?? null)
                    .setTimestamp();


                return interaction[interaction.replied ? "editReply" : "reply"]({ content: null, embeds: [embed] }).catch(() => {});

            }



            case "compte": {
                
                async function render(type, secondRows, index, total) {

                    const sales = await client.db.getMemberSales(interaction.guildId, interaction.member.id);
                    const likes = await client.db.getMemberLikes(interaction.guildId, interaction.member.id);

                    const sale = type == "sales" ? sales[index] : likes[index];
                    
                    const embed = new EmbedBuilder()
                        .setColor("Orange")
                        .setThumbnail(interaction.member.displayAvatarURL())
                        .setTitle(t("sell_embed.title"))

                    switch(type) {

                        case "default": embed.setDescription(t("account_embed.description")); break;

                        default: {
                            embed.addFields([
                                { name: t("sell_embed.fields.seller"), value: `<@${sale.seller_id}>` },
                                { name: t("sell_embed.fields.name"), value: sale.name },
                                { name: "Description", value: sale.description ? sale.description.length >= 1024 ? `${sale.description.substr(0, 1021)}...` : sale.description : t("no_description") },
                                { name: t("sell_embed.fields.price"), value: `${separate(sale.price)}${economySymbol}` }
                            ]);
                            if (sale.image) embed.setImage(sale.image);
                            if (sale.thumbnail) embed.setThumbnail(sale.thumbnail);
                            break;
                        }

                    }

                    const rows = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                        .setCustomId("close")
                        .setLabel(t("buttons.close"))
                        .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                        .setCustomId("sales")
                        .setLabel(t("buttons.sales"))
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(!sales.length),
                        new ButtonBuilder()
                        .setCustomId("likes")
                        .setLabel(t("buttons.likes"))
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(!likes.length),
                    )

                    const likesRows = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                        .setCustomId("account")
                        .setLabel(t("buttons.account"))
                        .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                        .setCustomId("unlike")
                        .setEmoji(client.constants.emojis.fullheart)
                        .setStyle(ButtonStyle.Secondary)
                    )

                    const salesRows = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                        .setCustomId("account")
                        .setLabel(t("buttons.account"))
                        .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                        .setCustomId("edit")
                        .setLabel(t("buttons.edit"))
                        .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                        .setCustomId("delete")
                        .setLabel(t("buttons.delete"))
                        .setStyle(ButtonStyle.Secondary)
                    )

                    if (total > 1) {

                        const row = secondRows ? type == "sales" ? salesRows : likesRows : rows
                        row.addComponents(
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
                        components: secondRows ? type == "sales" ? [salesRows] : [likesRows] : [rows]
                    };

                }
            
                const message = await interaction.reply(await render("default", false, 0, 0)).catch(() => {});
                if (!message) return;

                const collector = await message.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.member.id, time: 120000 });
                if (!collector) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply")

                let current = 0, length = 0, index = null, _render = null;
                collector.on("collect", async(i) => {

                    const sales = await client.db.getMemberSales(interaction.guildId, interaction.member.id);
                    const likes = await client.db.getMemberLikes(interaction.guildId, interaction.member.id);
                    if (index !== null) index == "sales" ? length = sales.length : length = likes.length
                    const sale = index == "sales" ? sales[current] : likes[current];

                    switch(i.customId) {

                        case "close": {
                            collector.stop()
                            return interaction.deleteReply();
                        }
                        case "account": await i.update(await render("default", false, 0, 0)); break;
                        case "sales": index = "sales"; await i.update(await render("sales", true, 0, sales.length)); break;
                        case "likes": index = "likes"; await i.update(await render("likes", true, 0, likes.length)); break;
                        case "previous": {
                            current--;
                            await i.update(await render(index, true, current, length));
                            break;
                        }
                        case "next": {
                            current++;
                            await i.update(await render(index, true, current, length));
                            break;
                        }

                        case "unlike": {
                            await client.db.unlikeSale(interaction.guildId, i.user.id, sale.id);

                            if (length - 1 >= current + 1) _render = await render("likes", true, current, length-1);
                            else _render = await render("default", false, 0, 0);

                            await i.update(_render);
                            break;
                        }

                        case "edit": {

                            const code = Math.floor(Math.random() * 9000000000) + 1000000000
                            const modal = new ModalBuilder()
                            .setCustomId(`modal.edit_sale_${code}`)
                            .setTitle(t("modal.title"))
                            .setComponents(
                                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("modal_name").setLabel(t("sell_embed.fields.name")).setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(255).setRequired(false)),
                                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("modal_price").setLabel(t("sell_embed.fields.price")).setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(10).setRequired(false)),
                                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("modal_description").setLabel("Description").setStyle(TextInputStyle.Paragraph).setMinLength(1).setMaxLength(500).setRequired(false)),
                            )

                            await i.showModal(modal).catch(() => {})
                            const modalCollector = await i.awaitModalSubmit({ filter: (ii) => ii.user.id === i.user.id && ii.customId == `modal.edit_sale_${code}`, time: 90000 });
                            if (!modalCollector) return;

                            const name = modalCollector.fields.getTextInputValue("modal_name");
                            const price = parseInt(modalCollector.fields.getTextInputValue("modal_price"));
                            const description = modalCollector.fields.getTextInputValue("modal_description");

                            if (price >= 2147483647) return modalCollector.reply({ embeds: [errorEmbed(t("int_passing", { name: sale.name }, "errors"), true)], components: [] }).catch(() => {});

                            await client.db.editSale(interaction.guildId, sale.id, name || sale.name, isNaN(price) ? sale.price : price, description || sale.description);

                            _render = await render("sales", true, current, length);
                            return modalCollector.update({ embeds: _render.embeds, components: [] }).catch(() => {});

                        }

                        case "delete": {

                            const confirm = await client.functions.userinput.askValidation(i, t("confirm_delete"), false, "update");
                            if (!confirm) return

                            await client.db.deleteSale(interaction.guildId, sale.id);
                            return confirm.update({ embeds: [successEmbed(t("deleted", { name: sale.name }), true)], components: [] }).catch(() => {})

                        }

                    }

                })


                collector.on("end", (collected) => {
                    return interaction.editReply({ components: [] }).catch(() => {});
                })

                break;

            }



            case "afficher": {

                let sales = await client.db.getSales(interaction.guildId);
                if (!sales.length) return errorEmbed(t("no_sales"));

                switch(interaction.options.getString("trier-par")) {

                    case "lowest-price": sales = sales.sort((a, b) => a.price - b.price); break;
                    case "highest-price": sales = sales.sort((a, b) => b.price - a.price); break;
                    case "oldest": sales = sales.sort((a, b) => a.id - b.id); break;

                    case "recents":
                    default: sales = sales.sort((a, b) => b.id - a.id); break;

                }

                const memberAccount = await client.db.getMoney(interaction.guildId, interaction.member.id);
                
                async function render(sale, index, total) {
                    
                    const likes = await client.db.getMemberLikes(interaction.guildId, interaction.member.id);

                    const embed = new EmbedBuilder()
                        .setColor("Orange")
                        .setThumbnail(sale.thumbnail ?? (await interaction.guild.members.cache.get(sale.seller_id))?.displayAvatarURL())
                        .setTitle(t("sell_embed.title"))
                        .addFields([
                            { name: t("sell_embed.fields.seller"), value: `<@${sale.seller_id}>` },
                            { name: "Description", value: sale.description.length >= 1024 ? `${sale.description.substr(0, 1021)}...` : sale.description },
                            { name: t("sell_embed.fields.price"), value: `${separate(sale.price)}${economySymbol}` }
                        ])
                        .setImage(sale.image ?? null)

                    const rows = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                        .setCustomId("buy")
                        .setLabel(t("buttons.buy"))
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled((memberAccount?.bank_money ?? 0) < sale.price && (memberAccount?.cash_money ?? 0) < sale.price),
                        new ButtonBuilder()
                        .setCustomId("like")
                        .setEmoji(likes.find(s => s.sale_id == sale.id) ? client.constants.emojis.fullheart : client.constants.emojis.emptyheart)
                        .setStyle(ButtonStyle.Secondary)
                    )

                    if (total > 1) {

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
                                .setDisabled(index + 1 === total)
                        );

                    }

                    return {
                        embeds: [embed],
                        components: [rows]
                    };

                }

                const message = await interaction.reply(await render(sales[0], 0, sales.length)).catch(() => {})
                if (!message) return;

                const collector = await message.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.member.id, time: 120000 });
                if (!collector) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply")

                let current = 0;
                collector.on("collect", async(i) => {

                    const sale = sales[current];
                    
                    switch(i.customId) {

                        case "buy": {
                        
                            if (i.user.id === sale.seller_id) return i.update({ embeds: [errorEmbed(t("cant_buy_yourself"), true)], components: [] }).catch(() => {});
                            
                            const newMemberAccount = await client.db.getMoney(interaction.guildId, interaction.member.id);
                            if ((newMemberAccount?.bank_money ?? 0) + sale.price >= 2147483647) return i.update({ embeds: [errorEmbed(t("int_passing_member", { name: lang == "fr" ? "votre compte bancaire" : "your bank account", member: `<@${sale.seller_id}>` }, "errors"), true)], components: [] }).catch(() => {})

                            let method = "bank_money", reply = i
                            if ((newMemberAccount?.bank_money ?? 0) - overdraftLimit < sale.price || newMemberAccount?.blocked == 1 || (newMemberAccount?.frozen_date || newMemberAccount?.frozen_reason)) {

                                if (newMemberAccount.cash_money >= sale.price) {
                                    var askPayementMethod = await client.functions.userinput.askPayementMethod(i, "bank", false, "update")
                                    if (!askPayementMethod) return;
                                    
                                    method = "cash_money", reply = askPayementMethod
                                    return

                                } else {
                                    return i.update({ embeds: [errorEmbed(t("not_enough_money"), true)], components: [] }).catch(() => {})
                                }

                            }
                            
                            await client.db.addMoney(interaction.guildId, sale.seller_id, method, sale.price);
                            await client.db.addMoney(interaction.guildId, interaction.member.id, method, -sale.price);

                            await client.db.addTransactionLog(interaction.guildId, sale.seller_id, sale.price, `${lang == "fr" ? `Vente de` : `Sale of`} ${sale.name}`)
                            await client.db.addTransactionLog(interaction.guildId, interaction.member.id, -sale.price, `${lang == "fr" ? `Achat de` : `Purchase of`} ${sale.name}`)

                            await client.db.deleteSale(interaction.guildId, sale.id);

                            return reply.update({ embeds: [successEmbed(t("buyed", { name: sale.name, price: separate(sale.price), symbol: economySymbol }), true)], components: [] }).catch(() => {})

                        }

                        case `confirm-${interaction.member.id}`: {

                            await client.db.addMoney(interaction.guildId, sale.seller_id, "cash_money", sale.price);
                            await client.db.addMoney(interaction.guildId, interaction.member.id, "cash_money", -sale.price);
                            await client.db.deleteSale(interaction.guildId, sale.id);

                            return i.update({ embeds: [successEmbed(t("buyed", { name: sale.name, price: separate(sale.price), symbol: economySymbol }), true)], components: [] }).catch(() => {})

                        }

                        case "like": {
                            const likes = await client.db.getMemberLikes(interaction.guildId, interaction.member.id);
                            const like = likes.find(s => s.sale_id == sale.id)
                            
                            if (like) await client.db.unlikeSale(interaction.guildId, i.user.id, sale.id);
                            else await client.db.likeSale(interaction.guildId, i.user.id, sale.id);

                            await i.update(await render(sales[current], current, sales.length));
                            break;
                        }

                        case "previous": {
                            current--;
                            await i.update(await render(sales[current], current, sales.length));
                            break;
                        }

                        case "next": {
                            current++;
                            await i.update(await render(sales[current], current, sales.length));
                            break;
                        }

                    }
    
                })

                collector.on("end", (collected) => {
                    return interaction.editReply({ components: [] }).catch(() => {});
                })

                break;
            }

        }


        } catch (err) {
            console.error(err);

            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
        
    }
};