const { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ApplicationCommandOptionType, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const imgurUploader = require("imgur-uploader");
const { Canvas, loadImage } = require("canvas-constructor/napi-rs");

const code = Math.floor(Math.random() * 9000000000) + 1000000000
module.exports = {
    category: { "en": "roleplay", "fr": "roleplay" },
    name: "boutique",
    nameLocalizations: {
        "fr": "boutique",
        "en-GB": "shop",
        "en-US": "shop"
    },
    description: "Affiche, ajoute ou retire des objets de la boutique",
    descriptionLocalizations: {
        "fr": "Affiche, ajoute ou retire des objets de la boutique",
        "en-GB": "Displays, adds or removes items from the shop",
        "en-US": "Displays, adds or removes items from the shop"
    },
    options: [
        {
            name: "créer",
            nameLocalizations: {
                "fr": "créer",
                "en-GB": "create",
                "en-US": "create"
            },
            description: "Crée une boutique",
            descriptionLocalizations: { 
                "fr": "Crée une boutique",  
                "en-GB": "Creates a shop",  
                "en-US": "Creates a shop"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: "nom",    
                nameLocalizations: {
                    "fr": "nom",    
                    "en-GB": "name",    
                    "en-US": "name"
                },  
                description: "Le nom de la boutique",
                descriptionLocalizations: {
                    "fr": "Le nom de la boutique",
                    "en-GB": "The name of the shop",
                    "en-US": "The name of the shop"
                },
                type: ApplicationCommandOptionType.String,
                required: true, 
            },
            {
                name: "description",
                description: "La description de la boutique",   
                descriptionLocalizations: {
                    "fr": "La description de la boutique",
                    "en-GB": "The description of the shop",
                    "en-US": "The description of the shop"  
                },
                type: ApplicationCommandOptionType.String,  
                required: false,
            },
            {
                name: "couleur",
                nameLocalizations: {
                    "fr": "couleur",
                    "en-GB": "color",
                    "en-US": "color"
                },
                description: "La couleur de la boutique",
                descriptionLocalizations: {
                    "fr": "La couleur de la boutique",
                    "en-GB": "The color of the shop",
                    "en-US": "The color of the shop"
                },
                type: ApplicationCommandOptionType.String,
                required: false,
            },
            {
                name: "vignette",
                nameLocalizations: {
                    "fr": "vignette",
                    "en-GB": "thumbnail",
                    "en-US": "thumbnail"
                },
                description: "L'image qui sera en vignette de la boutique",
                descriptionLocalizations: {
                    "fr": "L'image qui sera en vignette de la boutique",
                    "en-GB": "The image that will be the thumbnail of the shop",
                    "en-US": "The image that will be the thumbnail of the shop"
                },
                type: ApplicationCommandOptionType.Attachment,
                required: false,
            },
            {
                name: "entreprise",
                nameLocalizations: {
                    "fr": "entreprise",
                    "en-GB": "company",
                    "en-US": "company"
                },
                description: "L'entreprise qui est relié à la boutique",
                descriptionLocalizations: {
                    "fr": "L'entreprise qui est relié à la boutique",
                    "en-GB": "The company that is linked to the shop",
                    "en-US": "The company that is linked to the shop"
                },
                type: ApplicationCommandOptionType.String,
                required: false,
                autocomplete: true
            }]
        },
        {
            name: "supprimer",
            nameLocalizations: {
                "fr": "supprimer",
                "en-GB": "delete",
                "en-US": "delete"
            },
            description: "Supprime une boutique",
            descriptionLocalizations: {
                "fr": "Supprime une boutique",
                "en-GB": "Deletes a shop",
                "en-US": "Deletes a shop"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: "boutique",
                nameLocalizations: {
                    "fr": "boutique",
                    "en-GB": "shop",
                    "en-US": "shop"
                },
                description: "Le nom de la boutique à supprimer",
                descriptionLocalizations: {
                    "fr": "Le nom de la boutique à supprimer",
                    "en-GB": "The name of the shop to delete",
                    "en-US": "The name of the shop to delete"
                },
                type: ApplicationCommandOptionType.String,
                required: true,
                autocomplete: true
            }]
        },
        {
            name: "ajouter",
            nameLocalizations: {
                "fr": "ajouter",
                "en-GB": "add",
                "en-US": "add"
            },
            description: "Ajoute un objet à une boutique",
            descriptionLocalizations: {
                "fr": "Ajoute un objet à une boutique",
                "en-GB": "Adds an item to a shop",
                "en-US": "Adds an item to a shop"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "boutique",
                    nameLocalizations: {
                        "fr": "boutique",
                        "en-GB": "shop",
                        "en-US": "shop"
                    },
                    description: "La boutique dans laquelle ajouter l'objet",
                    descriptionLocalizations: {
                        "fr": "La boutique dans laquelle ajouter l'objet",
                        "en-GB": "The shop in which to add the item",
                        "en-US": "The shop in which to add the item"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                },
                {
                    name: "objet",
                    nameLocalizations: {
                        "fr": "objet",
                        "en-GB": "item",
                        "en-US": "item"
                    },
                    description: "Le nom de l'objet à ajouter",
                    descriptionLocalizations: {
                        "fr": "Le nom de l'objet à ajouter",
                        "en-GB": "The name of the item to add",
                        "en-US": "The name of the item to add"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "prix",
                    nameLocalizations: {
                        "fr": "prix",
                        "en-GB": "price",
                        "en-US": "price"
                    },
                    description: "Le prix de l'objet",
                    descriptionLocalizations: {
                        "fr": "Le prix de l'objet",
                        "en-GB": "The price of the item",
                        "en-US": "The price of the item"
                    },
                    type: ApplicationCommandOptionType.Number,
                    required: true,
                    minValue: 0,
                    maxValue: 999999999,
                },
                {
                    name: "description",    
                    description: "La description de l'objet",   
                    descriptionLocalizations: {
                        "fr": "La description de l'objet",
                        "en-GB": "The description of the item",
                        "en-US": "The description of the item"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
                {
                    name: "poids",
                    nameLocalizations: {
                        "fr": "poids",
                        "en-GB": "weight",
                        "en-US": "weight"
                    },
                    description: "Le poids de l'objet en grammes",
                    descriptionLocalizations: {
                        "fr": "Le poids de l'objet en grammes",
                        "en-GB": "The weight of the item in grams",
                        "en-US": "The weight of the item in grams"
                    },
                    type: ApplicationCommandOptionType.Number,
                    required: false,
                    minValue: 0,
                    maxValue: 999999999,
                },
                {
                    name: "role-requis",
                    nameLocalizations: {
                        "fr": "role-requis",
                        "en-GB": "required-role",
                        "en-US": "required-role"
                    },
                    description: "Le rôle requis pour acheter l'objet",
                    descriptionLocalizations: {
                        "fr": "Le rôle requis pour acheter l'objet",
                        "en-GB": "The required role to buy the item",
                        "en-US": "The required role to buy the item"
                    },
                    type: ApplicationCommandOptionType.Role,
                    required: false,
                },
                {
                    name: "role-à-ajouter",
                    nameLocalizations: {
                        "fr": "role-à-ajouter",
                        "en-GB": "role-to-add",
                        "en-US": "role-to-add"
                    },
                    description: "Le rôle à ajouter à l'acheteur",
                    descriptionLocalizations: {
                        "fr": "Le rôle à ajouter à l'acheteur",
                        "en-GB": "The role to add to the buyer",
                        "en-US": "The role to add to the buyer"
                    },
                    type: ApplicationCommandOptionType.Role,
                    required: false,
                },
                {
                    name: "role-à-retirer",
                    nameLocalizations: {
                        "fr": "role-à-retirer",
                        "en-GB": "role-to-remove",
                        "en-US": "role-to-remove"
                    },
                    description: "Le rôle à retirer à l'acheteur",
                    descriptionLocalizations: {
                        "fr": "Le rôle à retirer à l'acheteur", 
                        "en-GB": "The role to remove from the buyer",   
                        "en-US": "The role to remove from the buyer"
                    },
                    type: ApplicationCommandOptionType.Role,
                    required: false,
                }
            ],
        },
        {
            name: "retirer",
            nameLocalizations: {
                "fr": "retirer",
                "en-GB": "remove",
                "en-US": "remove"
            },
            description: "Retire un objet d'une boutique",
            descriptionLocalizations: {
                "fr": "Retire un objet d'une boutique", 
                "en-GB": "Removes an item from a shop",
                "en-US": "Removes an item from a shop"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "boutique",
                    nameLocalizations: {
                        "fr": "boutique",
                        "en-GB": "shop",
                        "en-US": "shop"
                    },
                    description: "La boutique dans laquelle retirer l'objet",
                    descriptionLocalizations: {
                        "fr": "La boutique dans laquelle retirer l'objet",
                        "en-GB": "The shop in which to remove the item",
                        "en-US": "The shop in which to remove the item"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                },
                {
                    name: "objet",
                    nameLocalizations: {
                        "fr": "objet",  
                        "en-GB": "item",
                        "en-US": "item"
                    },
                    description: "Le nom de l'objet à retirer",
                    descriptionLocalizations: {
                        "fr": "Le nom de l'objet à retirer",
                        "en-GB": "The name of the item to remove",  
                        "en-US": "The name of the item to remove"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                },
            ],
        },
        {
            name: "afficher",
            nameLocalizations: {
                "fr": "afficher",
                "en-GB": "display",
                "en-US": "display"
            },
            description: "Affiche la/les boutique(s)",
            descriptionLocalizations: { 
                "fr": "Affiche la/les boutique(s)",
                "en-GB": "Displays the shop(s)",
                "en-US": "Displays the shop(s)"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                    name: "boutique",
                    nameLocalizations: {
                        "fr": "boutique",
                        "en-GB": "shop",
                        "en-US": "shop"
                    },
                    description: "La boutique à afficher",
                    descriptionLocalizations: {
                        "fr": "La boutique à afficher",
                        "en-GB": "The shop to display",
                        "en-US": "The shop to display"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
            }],
    }],
    run: async(client, interaction, { t, isPremium, errorEmbed, successEmbed, overdraftLimit, economySymbol, lang, separate }) => {

        try {

        const method = interaction.options.getSubcommand();
        const options = await client.db.getOptions(interaction.guildId, ["global.city_name", "inventory.max_weight"]);
        
        switch (method) {

            // Create a shop
            case "créer": {

                await interaction.deferReply().catch(() => {});
                if(!(await client.functions.permissions.configModerator(interaction, "boutique créer", true, "editReply"))) return;

                if(!(interaction.options.getString("entreprise") ?? `${code}`).startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == "fr" ? "entreprise" : "company" }, "errors"), false, true, "editReply")

                const shops = await client.db.getShop(interaction.guildId);
                if(!isPremium && shops.length >= 3) return errorEmbed(t("max_shops", { emoji: client.constants.emojis.premium }), false, true, "editReply");

                const name = interaction.options.getString("nom");
                const description = interaction.options.getString("description");
                const companyName = (interaction.options.getString("entreprise") ?? "").split("&#46;")[3];
                const companyId = (interaction.options.getString("entreprise") ?? "").split("&#46;")[2]
                const thumbnail = interaction.options.getAttachment("vignette");
                let color = interaction.options.getString("couleur");

                if(name.includes(".")) return errorEmbed(t("dot_in_shop_name"), false, true, "editReply");
                if(color && !isPremium || thumbnail && !isPremium || companyId && !isPremium) return errorEmbed(t("premium_only", { emoji: client.constants.emojis.premium }), false, true, "editReply");

                let thumbnailUrl;
                if(thumbnail) {
                    await imgurUploader(thumbnail.url, { title: thumbnail.name }).then(data => {
                        thumbnailUrl = (data?.link ?? null);
                    }).catch(() => interaction.channel.send(t("imgur_error")).catch(() => {}));
                }

                if(color) {
                    const resolvedColor = client.functions.other.isHexColor(color.toLowerCase());
                    if(!resolvedColor) return errorEmbed(t("color_undefined", { color: color, link: client.constants.links.colorPicker }, "errors"), false, true, "editReply");
                    else color = resolvedColor;
                }

                // Validate name    
                if(name.length > 255) return errorEmbed(t("long_name", { limit: 255 }), false, true, "editReply");
                if(description && description.length > 255) return errorEmbed(t("long_description", { limit: 255 }), false, true, "editReply");

                await client.db.createShop(interaction.guildId, name, description, companyId, color, thumbnailUrl);

                const createShopEmbed = new EmbedBuilder()
                .setColor(color ?? "Green")
                .setThumbnail(thumbnailUrl ?? "https://cdn.discordapp.com/attachments/850491658339352577/952237820989296771/buy_shop.gif")
                .setDescription(`${client.constants.emojis.shop} ${t("add_embed.title.shop")}`)
                .addFields([
                    { name: t("add_embed.fields.name"), value: name, inline: true },
                    { name: "Description", value: description ?? t("add_embed.fields.none_feminin"), inline: true },
                    { name: t("add_embed.fields.company"), value: companyName ?? t("add_embed.fields.none_feminin"), inline: true },
                ]);

                return interaction.editReply({ embeds: [createShopEmbed] }).catch(() => {});

            }


            // Delete a shop    
            case "supprimer": {
                
                if(!(await client.functions.permissions.configModerator(interaction, "boutique supprimer"))) return;
                if(!(interaction.options.getString("boutique") ?? `${code}`).startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == 'fr' ? "boutique" : "shop" }, "errors"));
                
                const id = interaction.options.getString("boutique").split("&#46;")[2];
                const shop = await client.db.getShop(interaction.guildId, id);
                if(!shop) return errorEmbed(t("shop_not_found"));
                
                const confirm = await client.functions.userinput.askValidation(interaction, t("confirm_delete_shop"));
                if(!confirm) return;
                

                await client.db.deleteShop(shop.id);

                return confirm.update({ embeds: [successEmbed(t("success_delete_shop"), true)], components: [] }).catch(() => {});
            }


            // Add an object
            case "ajouter": {
                if(!(await client.functions.permissions.configModerator(interaction, "boutique ajouter", true, "editReply"))) return;

                await interaction.deferReply().catch(() => {});
                if(!(interaction.options.getString("boutique") ?? `${code}`).startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == 'fr' ? "boutique" : "shop" }, "errors"));

                const shopId = interaction.options.getString("boutique").split("&#46;")[2]
                const shopName = interaction.options.getString("boutique").split("&#46;")[3];
                const shop = await client.db.getShop(interaction.guildId, shopId);
                if(!shop) return errorEmbed(t("shop_not_found", { shop: shopName }), false, true, "editReply");

                const shopItems = await client.db.getShopItems(interaction.guildId, shop.id);
                if(!isPremium && shopItems.length >= 20) return errorEmbed(t("max_shop_items", { emoji: client.constants.emojis.premium }), false, true, "editReply");

                const name = interaction.options.getString("objet");
                const description = interaction.options.getString("description") || null;
                const price = interaction.options.getNumber("prix");
                const weight = interaction.options.getNumber("poids") ?? 0;
                const requiredRole = interaction.options.getRole("role-requis");
                const roleToAdd = interaction.options.getRole("role-à-ajouter");
                const roleToRemove = interaction.options.getRole("role-à-retirer");

                // Validate shop
                const shop_check = await client.db.getShop(interaction.guildId, shopId);
                if (!shop_check) return errorEmbed(t("shop_not_found"), false, true, "editReply");

                // Validate name
                if(name.includes(".")) return errorEmbed(t("dot_in_item_name"), false, true, "editReply")
                if (name.length > 75) return errorEmbed(t("long_name", { limit: 75 }), false, true, "editReply");
                if (description && description.length > 100) return errorEmbed(t("long_description", { limit: 100 }), false, true, "editReply");
                if (["treated drug", "untreated drug", "dirty money", "drogue traitée", "drogue non traitée", "argent sale"].includes(name.toLowerCase())) return errorEmbed(t("cant_add", { name: name }), false, true, "editReply");
    
                if((roleToAdd || roleToRemove) && !interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) return errorEmbed(t("no_manage_role_permission", { role: roleToAdd ?? roleToRemove }), false, true, "editReply");

                if (roleToAdd || roleToRemove || requiredRole) {
                    let firstRole = interaction.member.roles?.cache?.sort((r1, r2) => r2.rawPosition - r1.rawPosition)?.first() ?? undefined;
                    if (!firstRole || (firstRole && (firstRole.rawPosition <= (roleToAdd?.rawPosition ?? 0) || firstRole.rawPosition <= (roleToRemove?.rawPosition ?? 0)))) {
                        return errorEmbed(t("role_higher", false, "errors"), false, true, "editReply");
                    }
                    else if ((roleToAdd?.id ?? '0') === (roleToRemove?.id ?? '1')) return errorEmbed(t("role_same", false, "errors"), false, true, "editReply");
                    else if ((roleToAdd?.id ?? '0') === (requiredRole?.id ?? '1')) return errorEmbed(t("role_add_required_same", false, "errors"), false, true, "editReply");
                }

                // Check items count
                const maxSize = 20;
                const currentItems = await client.db.getShopItems(interaction.guildId, shop.id)
                if(currentItems && currentItems.length >= maxSize && !isPremium) return errorEmbed(t("max_object", { max: maxSize }), false, true, "editReply");

                await client.db.addShopItem(interaction.guildId, shop.id, name, description, price, weight, requiredRole?.id ?? null, roleToAdd?.id ?? null, roleToRemove?.id ?? null);

                const embed = new EmbedBuilder()
                    .setColor(shop?.color ?? "Green")
                    .setThumbnail(shop?.thumbnail ?? "https://cdn.discordapp.com/attachments/850491658339352577/952237820989296771/buy_shop.gif")
                    .setDescription(`${client.constants.emojis.shop} ${t("add_embed.title.item", { shop: shopName })}`)
                    .addFields([
                        { name: t("add_embed.fields.name"), value: name, inline: true },
                        { name: t("add_embed.fields.price"), value: price === 0 ? t("add_embed.fields.free") : `${separate(price)}${economySymbol}`, inline: true },
                        { name: "Description", value: description ?? t("add_embed.fields.none_feminin"), inline: false },
                        { name: t("add_embed.fields.weight"), value: (weight / 1000) >= 1 ? `${weight / 1000}kg` : `${weight}g`, inline: false },
                        { name: t("add_embed.fields.requiredRole"), value: requiredRole ? requiredRole.toString() : t("add_embed.fields.none_masculin"), inline: true },
                        { name: t("add_embed.fields.roleToAdd"), value: roleToAdd ? roleToAdd.toString() : t("add_embed.fields.none_masculin"), inline: true },
                        { name: t("add_embed.fields.roleToRemove"), value: roleToRemove ? roleToRemove.toString() : t("add_embed.fields.none_masculin"), inline: true }
                    ]);

                return interaction.editReply({ embeds: [embed] }).catch(() => {});
                
            }

            // Remove
            case "retirer": {

                if(!(await client.functions.permissions.configModerator(interaction, "boutique retirer", true, "editReply"))) return;
                if(!(interaction.options.getString("boutique") ?? `${code}`).startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == 'fr' ? "boutique" : "shop" }, "errors"));
                if(!(interaction.options.getString("objet") ?? `${code}`).startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == 'fr' ? "objet" : "object" }, "errors"));

                // Validate shop
                const shopId = interaction.options.getString("boutique").split("&#46;")[2]
                const shop = await client.db.getShop(interaction.guildId, shopId);
                if(!shop) return errorEmbed(t("shop_not_found"));
                const shopItemId = interaction.options.getString("objet").split("&#46;")[2]
                const shopItem = await client.db.getShopItem(interaction.guildId, shopItemId);
                if (!shopItem) return errorEmbed(t("item_not_found"));

                await client.db.deleteShopItem(interaction.guildId, parseInt(shop.id), shopItem.id);

                const embed = new EmbedBuilder()
                    .setColor(shop?.color ?? "Red")
                    .setThumbnail(shop?.thumbnail ?? "https://cdn.discordapp.com/attachments/850491658339352577/952237820989296771/buy_shop.gif")
                    .setDescription(`${client.constants.emojis.shop} ${t("remove_embed.title")}`)
                    .addFields([
                        { name: t("add_embed.fields.name"), value: shopItem.name, inline: true },
                        { name: t("add_embed.fields.price"), value: shopItem.price === 0 ? t("add_embed.fields.free") : `${separate(shopItem.price)}${economySymbol}`, inline: true }
                    ]);

                return interaction.reply({ embeds: [embed] }).catch(() => {});

            }

            // Display shop
            case "afficher": {

                
                const shops = await client.db.getShop(interaction.guildId);
                if(!shops.length) return errorEmbed(t("no_shops"))
                
                await interaction.deferReply().catch(() => {});
                if(!(interaction.options.getString("boutique") ?? `${code}`).startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == 'fr' ? "boutique" : "shop" }, "errors"), false, true, "editReply");

                const shopId = interaction.options.getString("boutique").split("&#46;")[2];
                const shop = await client.db.getShop(interaction.guildId, shopId);
                if(!shop) return errorEmbed(t("shop_not_found"), false, true, "editReply");

                const items = (await client.db.getShopItems(interaction.guildId, parseInt(shop.id))).sort((a, b) => a.name.localeCompare(b.name))
                if(!items || !items.length) return errorEmbed(t("no_object"), false, true, "editReply");

                const cart = [];
                
                // Function used to render a chunk (embed, select menu, and pages buttons)
                async function render(items, index, total, isCart = false) {
                    
                    const memberAccount = await client.db.getMoney(interaction.guildId, interaction.member.id);
                    let free_msg = t("add_embed.fields.free");
                    const embed = new EmbedBuilder()
                        .setColor((isPremium ? shop?.color : null) ?? "Green")
                        .setTitle(isCart ? t("cart") : `${shop?.color || shop?.thumbnail ? "" : client.constants.emojis.shop} ${shop.name}`)
                        .setThumbnail((isPremium ? shop?.thumbnail : null) ?? "https://cdn.discordapp.com/attachments/850491658339352577/952237820989296771/buy_shop.gif")
                        .setDescription(`${items.map((i) =>
                            `**${i.name} ${isCart && i.quantity > 1 ? `(x${i.quantity})` : ""}** ・ ${i.price === 0 ? free_msg : `${separate(i.price)}${economySymbol}`}${i?.weight <= 0 ? "" : (i.weight / 1000) >= 1 ? `  *(${i.weight / 1000}kg)*` : `  *(${i.weight}g)*`}${i.description ? `\n> *${i.description}*` : ""}`)
                            .join("\n\n")}
                            ${isCart ? `\n__**TOTAL :**__\n${separate(cart.reduce((a, b) => a + (b.price * b.quantity), 0))}${economySymbol}` : ""}`
                    )

                    const shopItems = [];
                    if(cart.length > 0 && !isCart) shopItems.push({ name: `${code}&#46;${lang == "fr" ? "Panier" : "Cart"}&#46;cart`, description: undefined, price: 0, quantity: 0, emoji: client.constants.emojis.cart })
                    if(total > 1) {
                        if(index !== 0) shopItems.push({ name: `${code}&#46;${t("words.previous", false, "global")}&#46;previous`, description: undefined, price: 0, quantity: 0, emoji: client.constants.emojis.larrow })
                        if(index + 1 !== total) shopItems.push({ name: `${code}&#46;${t("words.next", false, "global")}&#46;next`, description: undefined, price: 0, quantity: 0, emoji: client.constants.emojis.rarrow })
                    }
                    shopItems.push(...items);
                        
                    const sm = new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                        .setCustomId(`${isCart ? "remove" : "add"}_cart`)
                        .setPlaceholder(t(`buttons.placeholder_${isCart ? "remove" : "add"}`))
                        .addOptions(shopItems.map((i) => ({
                            label: `${i.name.startsWith(`${code}`) ? i.name.split("&#46;")[1] : i.name}${i.name.startsWith(`${code}`) ? "" : ` (${i.price === 0 ? t("add_embed.fields.free") : `${separate(i.price)}${economySymbol}`})`}`,
                            description: (i?.description ?? "").substring(0, 100) || undefined,
                            value: `${i.name}&#46;${i.id}`,
                            emoji: i?.emoji ?? undefined
                        })))
                    )
                        
                    const cartButtons = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                            .setCustomId("shop")
                            .setLabel(t("buttons.shop"))
                            .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                            .setCustomId("buy")
                            .setLabel(t("buttons.buy"))
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(!cart.length || (cart.reduce((a, b) => a + (b.price * b.quantity), 0) > 0 ? ((memberAccount?.bank_money ?? 0) < overdraftLimit && (memberAccount?.cash_money ?? 0) <= 0) : false)),
                            new ButtonBuilder()
                            .setCustomId("cancel")
                            .setLabel(t("buttons.cancel"))
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(!cart.length),
                        )

                            
                    if(total > 1 && !isCart) embed.setFooter({ text: `${index + 1}/${total}` });

                    return {
                        embeds: [embed],
                        components: isCart ? [sm, cartButtons] : [sm],
                        files: []
                    };
                }

                // Create pages
                const chunks = client.functions.other.chunkArray(items, 10);
                if(!chunks || !chunks[0] || chunks[0].length <= 0) return errorEmbed(t("display_error"), false, true, "editReply");

                const total = chunks.length;
                const _render = await render(chunks[0], 0, total);

                const message = await interaction.editReply({ embeds: _render.embeds, components: _render.components, fetchReply: true })
                if(!message) return; // interaction isn't edited
                
                const collector = message.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.member.id, time: 180000 });
                if(!collector) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");

                let current = 0, currentCart = 0, removingCart;
                collector.on("collect", async (i) => {

                    switch (i.customId) {

                        case "shop": await i.update(await render(chunks[current], current, total)).catch(() => {}); break;

                        case "cancel": {

                            cart.splice(0, cart.length);
                            await i.update(await render(chunks[current], current, total)).catch(() => {});
                            break;
                        }

                        
                        case "add_cart": {

                            const value = i.values[0];
                            const itemId = value.split("&#46;")[1];
                            const chunksCart = client.functions.other.chunkArray(cart, 10);

                            if(value.startsWith(`${code}`)) {
                                if(value.split("&#46;")[2] == "next") current++;
                                else if(value.split("&#46;")[2] == "previous") current--;
                                else return i.update(await render(chunksCart[currentCart], currentCart, chunksCart.length, true))

                                await i.update(await render(chunks[current], current, total)).catch(() => {});
                                break;
                            }

                            let item = await client.db.getShopItem(interaction.guildId, itemId);
                            if(!item) return i.update({ embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], content: null, components: [] }).catch(() => {});

                            let reply = i;
                            if(cart.find((i) => i.id === item.id)) {

                                const index = cart.findIndex((i) => i.id === item.id);
                                const code = Math.floor(Math.random() * 9000000000) + 1000000000
                                const modal = new ModalBuilder()
                                .setCustomId(`modal_add_cart_${code}`)
                                .setTitle(t("buttons.cart"))
                                .setComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("quantity").setLabel(t("modal.quantity")).setPlaceholder(t("modal.placeholder_quantity", { item: (cart.find((i) => i.id === item.id))?.name }).substring(0, 150)).setMinLength(1).setMaxLength(11).setStyle(TextInputStyle.Short).setRequired(false)))
                            
                                await i.showModal(modal).catch(() => {})
                                const modalCollector = await i.awaitModalSubmit({ filter: (ii) => ii.user.id === i.user.id && ii.customId == `modal_add_cart_${code}`, time: 30000 });
                                if(!modalCollector) return

                                const collectedValue = modalCollector.fields.getTextInputValue("quantity");
                                const modalQuantity = ["tout", "all"].includes(collectedValue.toLowerCase()) ? (cart[index]?.quantity ?? 1) : !collectedValue ? 1 : parseInt(collectedValue) ?? 1;
                                if(isNaN(modalQuantity) || modalQuantity <= 0) return modalCollector.reply({ embeds: [errorEmbed(t("not_number", { number: modalQuantity }, "errors"), true)], components: [] })
                                
                                const inventory = await client.db.getMemberItems(interaction.guildId, interaction.user.id);
                                const memberDrugs = await client.db.getMemberDrugs(interaction.guildId, interaction.member.id);
                                const inventoryWeight = inventory.reduce((a, b) => a + (b.weight * b.quantity), 0) + memberDrugs.reduce((a, b) => a + ((b?.untreated ?? 0) + (b?.treated ?? 0)), 0);
                                const cartWeight = cart.reduce((a, b) => a + (b.weight * b.quantity), 0);

                                reply = modalCollector

                                const maxWeight = options["inventory.max_weight"];
                                if(maxWeight && (inventoryWeight + cartWeight + (item.weight * modalQuantity)) > maxWeight) return reply?.reply({ embeds: [errorEmbed(t("inventory_weight", { maxWeight: maxWeight >= 1000 ? `${maxWeight / 1000}kg` : `${maxWeight}g`, currentWeight: inventoryWeight >= 1000 ? `${inventoryWeight / 1000}kg` : `${inventoryWeight}g` }), true)], ephemeral: true }).catch(() => {});

                                cart[index].quantity += modalQuantity;

                            } else {
                                
                                const maxWeight = options["inventory.max_weight"];
                                const inventory = await client.db.getMemberItems(interaction.guildId, interaction.user.id);
                                const memberDrugs = await client.db.getMemberDrugs(interaction.guildId, interaction.member.id);
                                const inventoryWeight = inventory.reduce((a, b) => a + (b.weight * b.quantity), 0) + memberDrugs.reduce((a, b) => a + ((b?.untreated ?? 0) + (b?.treated ?? 0)), 0);
                                const cartWeight = cart.reduce((a, b) => a + (b.weight * b.quantity), 0);
                                if(maxWeight && (inventoryWeight + cartWeight + item.weight) > maxWeight) return reply?.reply({ embeds: [errorEmbed(t("inventory_weight", { maxWeight: maxWeight >= 1000 ? `${maxWeight / 1000}kg` : `${maxWeight}g`, currentWeight: inventoryWeight >= 1000 ? `${inventoryWeight / 1000}kg` : `${inventoryWeight}g` }), true)], ephemeral: true }).catch(() => {});
                                
                                cart.push({ id: item.id, name: item.name, description: item.description, price: item.price, quantity: 1, weight: item?.weight ?? 0 });

                            }

                            return reply?.update(await render(chunks[current], current, total)).catch(() => {});

                        }

                        case "remove_cart": {
                        
                            const value = i.values[0]
                            const itemId = value.split("&#46;")[1];
                            const chunksCart = client.functions.other.chunkArray(cart, 10);
                            
                            if(value.startsWith(`${code}`)) {
                                if(value.split("&#46;")[2] == "next") currentCart++;
                                else if(value.split("&#46;")[2] == "previous") currentCart--;

                                await i.update(await render(chunksCart[currentCart], currentCart, chunksCart.length, true)).catch(() => {});
                                break;
                            }

                            let item = await client.db.getShopItem(interaction.guildId, itemId);
                            if(!item) return i.update({ content: null, embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], components: [] }).catch(() => {});
                            const index = cart.findIndex((i) => i.id === item.id);

                            let reply = i, modalQuantity = 1;
                            if(removingCart?.item_id == item.id) {

                                const code = Math.floor(Math.random() * 9000000000) + 1000000000
                                const modal = new ModalBuilder()
                                .setCustomId(`modal_remove_cart_${code}`)
                                .setTitle(t("buttons.cart"))
                                .setComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("quantity").setLabel(t("modal.quantity")).setPlaceholder(t("modal.placeholder_quantity", { item: (cart.find((i) => i.id === item.id))?.name }).substring(0, 150)).setMinLength(1).setMaxLength(11).setStyle(TextInputStyle.Short).setRequired(false)))
                            
                                await i.showModal(modal).catch(() => {})
                                const modalCollector = await i.awaitModalSubmit({ filter: (ii) => ii.user.id === i.user.id && ii.customId == `modal_remove_cart_${code}`, time: 30000 });
                                if(!modalCollector) return

                                modalQuantity = ["tout", "all"].includes(modalCollector.fields.getTextInputValue("quantity")) || !modalCollector.fields.getTextInputValue("quantity") ? (cart[index].quantity ?? 1) : parseInt(modalCollector.fields.getTextInputValue("quantity"));
                                if(isNaN(modalQuantity) || modalQuantity <= 0 || modalQuantity > (cart[index].quantity ?? 0)) return modalCollector.reply({ embeds: [errorEmbed(t("not_number", { number: modalQuantity }, "errors"), true)], components: [] })

                                reply = modalCollector
                            } else {
                                removingCart = { item_id: item.id }
                            }

                            cart[index].quantity -= modalQuantity;
                            if(cart[index].quantity <= 0) cart.splice(index, 1);

                            const newChunksCart = client.functions.other.chunkArray(cart, 10)

                            let __render;
                            if(!cart.length) __render = await render(chunks[current], current, total)
                            else __render = await render(newChunksCart?.[currentCart] ?? newChunksCart?.[currentCart-1] ?? newChunksCart?.[0], currentCart, newChunksCart.length, true)
                            return reply?.update(__render).catch(() => {});

                        }

                        // Choose the payement method
                        case "buy": {
                            
                            const newMemberAmount = await client.db.getMoney(interaction.guildId, i.user.id);
                            const amount = cart.reduce((a, b) => a + (b.price * b.quantity), 0)
                            
                            const rows = new ActionRowBuilder().addComponents(
                                new ButtonBuilder().setCustomId("cash_method").setLabel(t("buttons.cash")).setStyle(ButtonStyle.Secondary).setDisabled(newMemberAmount.cash_money < amount),
                                new ButtonBuilder().setCustomId("bank_card_or_without_contact").setLabel(t("buttons.bank")).setStyle(ButtonStyle.Secondary).setDisabled(((newMemberAmount?.bank_money ?? 0) < (overdraftLimit - amount)) || !newMemberAmount || newMemberAmount.bank_money == null || isNaN(newMemberAmount.bank_money || newMemberAmount?.blocked == 1 || newMemberAmount?.frozen_date || newMemberAmount?.frozen_reason)),
                                new ButtonBuilder().setCustomId("cancel").setLabel(t("buttons.cancel")).setStyle(ButtonStyle.Danger),
                            )

                            return i.update({ embeds: [successEmbed(t("choose_payement_method"), true)], components: [rows] }).catch(() => {});

                        }

                        // If the user choose bank method ask if he wants to pay with his bank card or without contact
                        case "bank_card_or_without_contact": {

                            const newMemberAmount = await client.db.getMoney(interaction.guildId, i.user.id);
                            const amount = cart.reduce((a, b) => a + (b.price * b.quantity), 0)
                            const limitPayementWithoutContact = await client.db.getOption(interaction.guildId, "economy.pay_without_contact.limit");

                            const rows = new ActionRowBuilder().addComponents(
                                new ButtonBuilder().setCustomId("bank_method_with_card").setLabel(t("buttons.card")).setStyle(ButtonStyle.Secondary).setDisabled((newMemberAmount?.bank_money ?? 0) < amount),
                                new ButtonBuilder().setCustomId("bank_method_without_contact").setLabel(t("buttons.without_contact")).setStyle(ButtonStyle.Secondary).setDisabled((newMemberAmount?.bank_money ?? 0) < (overdraftLimit - amount) || amount > limitPayementWithoutContact || !newMemberAmount || newMemberAmount.bank_money == null || isNaN(newMemberAmount.bank_money || newMemberAmount?.blocked == 1 || newMemberAmount?.frozen_date || newMemberAmount?.frozen_reason)),
                                new ButtonBuilder().setCustomId("cancel").setLabel(t("buttons.cancel")).setStyle(ButtonStyle.Danger),
                            )

                            // display tpe
                            const canvas = await client.functions.canvas.get("/tpe", { locale: lang, symbol: economySymbol, amount: separate(amount) }).catch(() => errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true, false, "editReply"));
                            const attachment = new AttachmentBuilder(canvas, { name: "tpe.png" })
                            const embed = new EmbedBuilder().setColor("#35393E").setImage('attachment://tpe.png')

                            return i.update({ embeds: [embed], components: [rows], files: [attachment] })

                        }

                        // If the user wants to buy an item
                        case "cash_method":
                        case "bank_method_with_card":
                        case "bank_method_without_contact": {
                                
                            const method = i.customId.replace("method_without_contact", "money").replace("method_with_card", "money").replace("method", "money");
                            const amount = cart.reduce((a, b) => a + (b.price * b.quantity), 0)
                            
                            let reply = i;
                            if(i.customId == "bank_method_with_card") {
                                const displayTPE = await client.functions.userinput.displayTPE(interaction, i, { amount: separate(amount), symbol: economySymbol });
                                if(!displayTPE) return
                                else reply = displayTPE
                            }

                            await reply?.update({ embeds: [successEmbed(t("buying"), true)], components: [], files: [] })

                            const isBan = await client.db.isFreezeAccount(interaction.guildId, interaction.member.id);
                            if(isBan) return reply?.editReply({ embeds: [errorEmbed(t("freeze_account", false, "errors"), true)], components: [], files: [] }).catch(() => {});

                            const inventory = await client.db.getMemberItems(interaction.guildId, interaction.user.id);
                            let count = { total: 0, amount: 0, stop: false }
                            for (const item of cart) {
                                
                                const shopItem = await client.db.getShopItem(interaction.guildId, item.id, true);
                                if(!shopItem || count.stop) break;

                                if(shopItem.role_required && !interaction.member.roles.cache.has(shopItem.role_required)) return reply?.editReply({ embeds: [errorEmbed(t("role_required", { role: shopItem.role_required, item: shopItem.name }, "errors"), true)], components: [], files: [] }).catch(() => {});
                                if(shopItem.role_add && isPremium) await interaction.member.roles.add(shopItem.role_add).catch(() => errorEmbed(t("cant_give_role", { role: shopItem.role_add.toString() }, "errors"), false, false, "editReply", reply));
                                if(shopItem.role_remove && isPremium) await interaction.member.roles.remove(shopItem.role_remove).catch(() => errorEmbed(t("cant_remove_role", { role: shopItem.role_remove.toString() }, "errors"), false, false, "editReply", reply));
                                if(shopItem.max_items && (item.quantity + (((inventory.find(i => i.id == item.id))?.quantity ?? 0) + (inventory.find(i => i.id == item.id))?.hidden_quantity) > shopItem.max_items)) count.stop = true
                            
                                else {
                                    await client.db.addMemberItem(interaction.guildId, interaction.user.id, shopItem.id, item.quantity);
                                    count.total++
                                    count.amount += (shopItem.price * item.quantity);
                                }
                            }
                            
                            if(count.amount !== 0) {
                                
                                if(shop?.company_id) {
                                    await client.db.addMoneyToCompany(shop.company_id, count.amount)
                                    await client.db.addTransactionLog(interaction.guildId, shop.company_id, count.amount, `${lang == "fr" ? "Achat de" : "Purchase of"} ${cart.length > 1 ? `${cart.length} articles` : cart[0].name}`)
                                }

                                await client.db.addMoney(interaction.guildId, interaction.user.id, method, -count.amount);
                                if(method == "bank_money") await client.db.addTransactionLog(interaction.guildId, interaction.member.id, -count.amount, `${lang == "fr" ? "Achat de" : "Purchase of"} ${cart.length > 1 ? `${cart.length} articles` : cart[0].name}`)
                            }
                            
                            await reply?.editReply({ embeds: [successEmbed(t("buyed", { cart: count?.stop ? count.total : cart.length == 1 ? cart[0].quantity : cart.length, items: cart.length == 1 ? cart[0].name : "items", for: count.amount == 0 ? "" : t("for"), price: count?.total == 0 ? "" : count.amount == 0 ? t("price.free") : `**${separate(amount)}${economySymbol}**`, max: count?.stop ? t("stop") : " !" }), true)], components: [], files: [] })
  
                            collector.stop();
                            break;
                        }
                    }

                });

                collector.on("end", (collected) => {
                    return interaction.editReply({ components: [] }).catch(() => {});
                })

            }
        }

        
        } catch (err) {
            console.error(err);
            client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
    },

    runAutocomplete: async(client, interaction, { economySymbol }) => {

        const focusedOption = interaction.options.getFocused(true);
        const response = [];

        const shops = (await client.db.getShop(interaction.guildId)).sort((a, b) => a.name.localeCompare(b.name))
        if(interaction.options._subcommand == "retirer" && interaction.options._hoistedOptions.length == 2) {
            const items = (await client.db.getShopItems(interaction.guildId, (shops.find(({ id }) => id == interaction.options._hoistedOptions[0].value.split("&#46;")[2]))?.id)).sort((a, b) => a.name.localeCompare(b.name))
            response.push(...items.map(i => ({ name: i.name, value: `${code}&#46;items&#46;${i.id}&#46;${i.name}&#46;${i.price}` }) ))
        } else if(interaction.options._subcommand == "créer") {
            const companies = (await client.db.getCompanies(interaction.guildId)).sort((a, b) => a.name.localeCompare(b.name))
            response.push(...companies.map(c => ({ name: c.name, value: `${code}&#46;companies&#46;${c.id}&#46;${c.name}` }) ))
        } else {
            response.push(...shops.filter(s => s.id).map(s => ({ name: s.name, value: `${code}&#46;shops&#46;${s.id}&#46;${s.name}` }) ))
        }

        const filtered = [];
        if(focusedOption.value !== "") {
            const filtredArray = [];
            filtredArray.push(...response.filter(r => r.name.toLowerCase() == focusedOption.value.toLowerCase()));
            filtredArray.push(...response.filter(r => r.name.toLowerCase().startsWith(focusedOption.value.toLowerCase())));
            filtredArray.push(...response.filter(r => r.name.toLowerCase().includes(focusedOption.value.toLowerCase())));

            const unique = filtredArray.reduce((acc, current) => acc.some(item => item.name === current.name && item.value === current.value) ? acc : [...acc, current], []);
            filtered.push(...unique);
        } else {
            const unique = response.reduce((acc, current) => acc.some(item => item.name === current.name && item.value === current.value) ? acc : [...acc, current], []);
            filtered.push(...unique);
        }

        await interaction.respond(filtered.slice(0, 25).map(v => ({ name: v.value.split("&#46;")[1] == "items" ? `${v.name} (${v.value.split("&#46;")[4]}${economySymbol})` : v.name, value: v.value  }))).catch(() => {})

    }
};
