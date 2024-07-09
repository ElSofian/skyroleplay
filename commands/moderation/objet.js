const { ApplicationCommandOptionType } = require("discord.js");

const code = Math.floor(Math.random() * 9000000000) + 1000000000
module.exports = {
    category: { "en": "moderation", "fr": "modération" },
    name: "objet",
    nameLocalizations: {
        "fr": "objet",
        "en-GB": "item",
        "en-US": "item"
    },
    description: "Gère les objets d'un joueur.",
    descriptionLocalizations: { 
        "fr": "Gère les objets d'un joueur.",
        "en-GB": "Manages a player's items.",
        "en-US": "Manages a player's items."
    },
    options: [
        {
            name: 'ajouter',
            nameLocalizations: {
                "fr": "ajouter",
                "en-GB": "add",
                "en-US": "add"
            },
            description: 'Ajoute un objet à un joueur.',
            descriptionLocalizations: {
                "fr": "Ajoute un objet à un joueur.",
                "en-GB": "Adds an item to a player.",
                "en-US": "Adds an item to a player."
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
                    description: "Joueur à qui donner l'objet.",
                    descriptionLocalizations: {
                        "fr": "Joueur à qui donner l'objet.",
                        "en-GB": "Player to give the item to.",
                        "en-US": "Player to give the item to."
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: "objet",
                    nameLocalizations: {
                        "fr": "objet",
                        "en-GB": "item",
                        "en-US": "item"
                    },
                    description: "Objet de l'objet à ajouter.",
                    descriptionLocalizations: {
                        "fr": "Objet de l'objet à ajouter.",
                        "en-GB": "Item of the item to add.",
                        "en-US": "Item of the item to add."
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                },
                {
                    name: "quantité",
                    nameLocalizations: {
                        "fr": "quantité",
                        "en-GB": "quantity",
                        "en-US": "quantity"
                    },
                    description: "Quantité à fournir.",
                    descriptionLocalizations: {
                        "fr": "Quantité à fournir.",
                        "en-GB": "Quantity to give.",
                        "en-US": "Quantity to give."
                    },
                    type: ApplicationCommandOptionType.Number,
                    required: false,
                    minValue: 1,
                    maxValue: 999999999,
                },
            ]
        },
        {
            name: 'retirer',
            nameLocalizations: {
                "fr": "retirer",
                "en-GB": "remove",
                "en-US": "remove"
            },
            description: 'Retire un objet à un joueur.',
            descriptionLocalizations: {
                "fr": "Retire un objet à un joueur.",
                "en-GB": "Removes an item from a player.",
                "en-US": "Removes an item from a player."
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
                    description: "Joueur à qui retirer l'objet.",
                    descriptionLocalizations: {
                        "fr": "Joueur à qui retirer l'objet.",
                        "en-GB": "Player to remove the item from.",
                        "en-US": "Player to remove the item from."
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: "objet",
                    nameLocalizations: {
                        "fr": "objet",
                        "en-GB": "item",
                        "en-US": "item"
                    },
                    description: "Objet de l'objet à retirer.",
                    descriptionLocalizations: {
                        "fr": "Objet de l'objet à retirer.",
                        "en-GB": "Item of the item to remove.",
                        "en-US": "Item of the item to remove."
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                },
                {
                    name: "quantité",
                    nameLocalizations: {
                        "fr": "quantité",
                        "en-GB": "quantity",
                        "en-US": "quantity"
                    },
                    description: "Quantité à retirer.",
                    descriptionLocalizations: {
                        "fr": "Quantité à retirer.",
                        "en-GB": "Quantity to remove.",
                        "en-US": "Quantity to remove."
                    },
                    type: ApplicationCommandOptionType.Number,
                    required: false,
                    minValue: 1,
                },
            ]
    }],
    moderation: true,
    run: async(client, interaction, { t, errorEmbed, successEmbed, verify, lang }) => {

        try {

        const method = interaction.options.getSubcommand();
        const member = interaction.options.getMember("joueur");

        if(verify("member", { cantBotInclued: true })) return;
        if(method == "retirer" && !(interaction.options.getString("objet") ?? `${code}`).startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == "fr" ? "objet" : "object" }, "errors"))
        
        const item = interaction.options.getString("objet").split("&#46;");
        const itemId = item[1]

        const findItem = await client.db.getShopItem(interaction.guildId, itemId, true)
        if(!findItem) return errorEmbed(t("item_not_found"));
        
        const memberItem = await client.db.getMemberItem(interaction.guildId, member.id, itemId)
        const giveQuantity = !interaction.options.getNumber("quantité") ? (memberItem?.quantity ?? 1) : interaction.options.getNumber("quantité");

        switch (method) {
            case 'ajouter':

                const maxWeight = await client.db.getOption(interaction.guildId, "inventory.max_weight");
                const inventoryWeight = (await client.db.getMemberItems(interaction.guildId, interaction.member.id)).reduce((a, b) => a + (b.weight * b.quantity), 0) + (await client.db.getMemberDrugs(interaction.guildId, interaction.member.id)).reduce((a, b) => a + ((b?.untreated ?? 0) + (b?.treated ?? 0)), 0);

                if(maxWeight && inventoryWeight + findItem.weight > maxWeight) return errorEmbed(t("inventory_full_member", { member: member.toString(), item: findItem.name }, "errors"))
                if(findItem.role_add && !member.roles.cache.has(findItem.role_add)) await member.roles.add(findItem.role_add).catch(() => errorEmbed(t("cant_give_role", { role: findItem.role_add.toString() }, "errors")))
                if(findItem.role_remove && giveQuantity == memberItem?.quantity) await member.roles.remove(findItem.role_add).catch(() => errorEmbed(t("cant_remove_role", { role: findItem.role_add.toString() }, "errors")));
                if(findItem.role_remove) await member.roles.remove(findItem.role_remove).catch(() => errorEmbed(t("cant_remove_role", { role: findItem.role_remove.toString() }, "errors")))

                await client.db.addMemberItem(interaction.guildId, member.id, findItem.id, giveQuantity);

                successEmbed(t("gave", { quantity: giveQuantity, name: findItem.name, member: member.toString() }))
                break;


            case 'retirer':

                if(!memberItem) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"))
                const { id, name, quantity, role_add, hidden_quantity } = memberItem

                if(role_add && member.roles.cache.has(role_add) && giveQuantity == quantity) await member.roles.remove(role_add).catch(() => errorEmbed(t("cant_remove_role", { role: role_add.toString() }, "errors")))
                if(giveQuantity > quantity) {

                    const confirm = await client.functions.userinput.askValidation(interaction, t("only", { quantity: quantity, name: name }));
                    if(!confirm) return;

                    
                }

                await client.db.removeMemberItem(interaction.guildId, member.user.id, id, giveQuantity, hidden_quantity == 0 && giveQuantity == quantity);

                successEmbed(t("removed", { quantity: giveQuantity > quantity ? quantity : giveQuantity, name: name, member: member.toString() }), false, false, interaction.replied ? "editReply" : "reply")
                break;

        };

        
        } catch (err) {
            console.error(err);
client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
    },

    
    runAutocomplete: async(client, interaction, { economySymbol }) => {

        const focusedOption = interaction.options.getFocused(true)
        const withdraw = interaction.options._subcommand == "retirer"
        const items = withdraw ? await client.db.getMemberItems(interaction.guildId, interaction.options._hoistedOptions[0].value) : await client.db.getShopItems(interaction.guildId);
        const sortedItems = items.sort((a, b) => a.name.localeCompare(b.name));

        const filtered = [];
        if(focusedOption.value !== "") {
            const filtredArray = [];
            filtredArray.push(...sortedItems.filter(r => r.name.toLowerCase() == focusedOption.value.toLowerCase()));
            filtredArray.push(...sortedItems.filter(r => r.name.toLowerCase().startsWith(focusedOption.value.toLowerCase())));
            filtredArray.push(...sortedItems.filter(r => r.name.toLowerCase().includes(focusedOption.value.toLowerCase())));

            const unique = [...new Set(filtredArray)];
            filtered.push(...unique);
        } else {
            filtered.push(...sortedItems);
        }

        await interaction.respond(filtered.slice(0, 25).map(i => ({ name: `[${withdraw ? i.quantity : i.price}${withdraw ? "" : economySymbol}]・${i.name}`, value: `${code}&#46;${i.id}` }) )).catch(() => {});

    }
};
