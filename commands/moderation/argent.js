const { EmbedBuilder, Role, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    category: { "en": "moderation", "fr": "modération" },
    name: "argent",
    nameLocalizations: {
        "fr": "argent",
        "en-GB": "money",
        "en-US": "money"
    },
    description: "Ajoute ou retire de l'argent à un joueur",
    descriptionLocalizations: {
        "fr": "Ajoute ou retire de l'argent à un joueur",
        "en-GB": "Adds or removes money from a player",
        "en-US": "Adds or removes money from a player"
    },
    options: [
        {
            name: "ajouter",
            nameLocalizations: {
                "fr": "ajouter",
                "en-GB": "add",
                "en-US": "add"
            },
            description: "Ajoute de l'argent à un joueur",
            descriptionLocalizations: {
                "fr": "Ajoute de l'argent à un joueur",
                "en-GB": "Adds money to a player",
                "en-US": "Adds money to a player"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "destinataire-s",
                    nameLocalizations: {
                        "fr": "destinataire-s",
                        "en-GB": "recipient-s",
                        "en-US": "recipient-s"
                    },
                    description: "Mentionnez le joueur ou le rôle (les membres l'ayant) à qui ajouter de l'argent",
                    descriptionLocalizations: {
                        "fr": "Mentionnez le joueur ou le rôle (les membres l'ayant) à qui ajouter de l'argent",
                        "en-GB": "Mention the player or role (members having it) to whom to add money",
                        "en-US": "Mention the player or role (members having it) to whom to add money"
                    },
                    type: ApplicationCommandOptionType.Mentionable,
                    required: true,
                },
                {
                    name: "méthode",
                    nameLocalizations: {
                        "fr": "méthode",
                        "en-GB": "method",
                        "en-US": "method"
                    },
                    description: "La méthode d'ajout",
                    descriptionLocalizations: {
                        "fr": "La méthode d'ajout",
                        "en-GB": "The method of adding",
                        "en-US": "The method of adding"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: "💵 Espèces",
                            nameLocalizations: {
                                "fr": "💵 Espèces",
                                "en-GB": "💵 Cash",
                                "en-US": "💵 Cash"
                            },
                            value: "cash_money",
                        },
                        {
                            name: "💳 Banque",
                            nameLocalizations: {
                                "fr": "💳 Banque",
                                "en-GB": "💳 Bank",
                                "en-US": "💳 Bank"
                            },
                            value: "bank_money",
                        },
                        {
                            name: "💰 Argent sale",
                            nameLocalizations: {
                                "fr": "💰 Argent sale",
                                "en-GB": "💰 Dirty money",
                                "en-US": "💰 Dirty money"
                            },
                            value: "dirty_money",
                        },
                    ],
                },
                {
                    name: "montant",
                    nameLocalizations: {
                        "fr": "montant",
                        "en-GB": "amount",
                        "en-US": "amount"
                    },
                    description: "Le montant à ajouter",
                    descriptionLocalizations: {
                        "fr": "Le montant à ajouter",
                        "en-GB": "The amount to add",
                        "en-US": "The amount to add"
                    },
                    type: ApplicationCommandOptionType.Number,
                    required: true,
                    minValue: 1,
                    maxValue: 999999999,
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
            description: "Retire de l'argent à un joueur",
            descriptionLocalizations: {
                "fr": "Retire de l'argent à un joueur",
                "en-GB": "Removes money from a player",
                "en-US": "Removes money from a player"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "destinataire-s",
                    nameLocalizations: {
                        "fr": "destinataire-s",
                        "en-GB": "recipient-s",
                        "en-US": "recipient-s"
                    },
                    description: "Mentionnez le joueur ou le rôle (les membres l'ayant) à qui retirer de l'argent",
                    descriptionLocalizations: {
                        "fr": "Mentionnez le joueur ou le rôle (les membres l'ayant) à qui retirer de l'argent",
                        "en-GB": "Mention the player or role (members having it) to whom to remove money",
                        "en-US": "Mention the player or role (members having it) to whom to remove money"
                    },
                    type: ApplicationCommandOptionType.Mentionable,
                    required: true,
                },
                {
                    name: "méthode",
                    nameLocalizations: {
                        "fr": "méthode",
                        "en-GB": "method",
                        "en-US": "method"
                    },
                    description: "La méthode de retrait",
                    descriptionLocalizations: {
                        "fr": "La méthode de retrait",
                        "en-GB": "The method of removing",
                        "en-US": "The method of removing"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: "💵 Espèces",
                            nameLocalizations: {
                                "fr": "💵 Espèces",
                                "en-GB": "💵 Cash",
                                "en-US": "💵 Cash"
                            },
                            value: "cash_money",
                        },
                        {
                            name: "💳 Banque",
                            nameLocalizations: {
                                "fr": "💳 Banque",
                                "en-GB": "💳 Bank",
                                "en-US": "💳 Bank"
                            },
                            value: "bank_money",
                        },
                        {
                            name: "💰 Argent sale",
                            nameLocalizations: {
                                "fr": "💰 Argent sale",
                                "en-GB": "💰 Dirty money",
                                "en-US": "💰 Dirty money"
                            },
                            value: "dirty_money",
                        },
                    ],
                },
                {
                    name: "montant",
                    nameLocalizations: {
                        "fr": "montant",
                        "en-GB": "amount",
                        "en-US": "amount"
                    },
                    description: "Le montant à retirer",
                    descriptionLocalizations: {
                        "fr": "Le montant à retirer",
                        "en-GB": "The amount to remove",
                        "en-US": "The amount to remove"
                    },
                    type: ApplicationCommandOptionType.Number,
                    required: true,
                    minValue: 1,
                    maxValue: 999999999,
                }
            ],
    }],         
    moderation: true,
    run: async(client, interaction, { t, errorEmbed, successEmbed, verify, lang, overdraftLimit, separate }) => {

        try {

        var method = interaction.options.getSubcommand();
        let methods = ["add", "remove"];
        let index = 0;
        let validMembers;

        for (let i of ["ajouter", "retirer"]) {
            i == method ? method = methods[index] : index++;
        };

        const value = interaction.options.getMentionable("destinataire-s") // role or member
        const amount = interaction.options.getNumber("montant");
        const type = interaction.options.getString("méthode");
        const symbol = await client.db.getOption(interaction.guildId, "economy.symbol");

        // a role is mentioned
        if (value instanceof Role) {

            if (!await client.db.isPremium(interaction.guildId)) return errorEmbed(t("premium", { emoji: client.constants.emojis.premium }, "errors"));

            const role = value;
            const getGuildMembers = await client.db.getMembers(interaction.guildId);
            const guildEnsuredMembers = getGuildMembers.map((a) => a.user_id);

            if (!guildEnsuredMembers.length) return errorEmbed(t("no_members", { role: role.toString() }));

            validMembers = (await interaction.guild.members.fetch()).filter((m) => (m.roles.cache).has(role.id) && !m.user.bot && guildEnsuredMembers.includes(m.user.id));

            const getGuild = await client.db.getGuildMoney(interaction.guildId);
            if (!getGuild?.length && type == "bank_money") return errorEmbed(t("not_guild_bank_accounts"));

            const members = getGuild.map((b) => b.user_id);
            const guildWithMoney = getGuild.map((b) => [b.user_id, b.cash_money ? parseFloat(b.cash_money) : null, b.dirty_money ? parseFloat(b.dirty_money) : null, b.bank_money ? parseFloat(b.bank_money) : null]);

            validMembers = validMembers.filter(m => members?.includes(m.user.id));
            if (!members.length || !validMembers?.size) return errorEmbed(t("not_valid_members", { role: role.toString() }));

            if (method === "remove") {
                let index = type == "cash_money" ? 1 : type == "dirty_money" ? 2 : 3;
                validMembers = validMembers.filter((m) => guildWithMoney?.some(n => n[index] >= amount && m.user.id === n[0] && n[type] !== null ));
            }

            if (!validMembers?.size) return errorEmbed(t("not_valid_members", { role: role.toString() }));

            await successEmbed(t("adding", { method: t(interaction.options.getSubcommand()), amount: validMembers.size, s: validMembers.size > 1 ? "s" : "" }))

            let membersIdsList = [];
            
            for (const m of validMembers) {
                if (type == "bank_money" && (await client.db.getBankAccount(interaction.guildId, m[0]))) await client.db.addTransactionLog(interaction.guildId, m[0], method === "add" ? amount : -amount, method == "add" ? lang == "fr" ? "Payement du Gouvernement" : "Government Payment" : lang == "fr" ? "Retrait du Gouvernement" : "Government Withdrawal")
                membersIdsList.push(m[0]);
            }
            
            await client.db.massAddMoney(interaction.guildId, membersIdsList, type, method === "add" ? amount : -amount);

            successEmbed(t("time", {
                money: `${separate(amount)}${symbol}`,
                state: method === "add" ? t("added") : t("withdrawn"),
                type: { bank_money: t("text_type.bank_money"), cash_money: t("text_type.cash_money"), dirty_money: t("text_type.dirty_money") }[type],
                at: t(validMembers.size > 1 ? "at.plurial" : "at.singular"),
                s: validMembers.size > 1 ? "s" : "",
                amount: validMembers.size.toString(),
                role: role.toString(),
                after: type == "bank_money" ? t("after") : ""
            }), false, false, "editReply");

        }
        // a member is mentioned
        else {

            const member = value;
            if (verify("member", { cantBotInclued: true })) return;

            const own = member.id === interaction.user.id;
            const money = `${separate(amount)}${symbol}`;

            let userAccount = await client.db.getMoney(interaction.guildId, member.id);
            if (type === "bank_money"
                && (!userAccount || userAccount.bank_money == null || isNaN(userAccount.bank_money))) return errorEmbed(t("no_member_account", { member: member.toString() }, "errors"));

            if (type === "dirty_money") {

                userAccount = await client.db.getDirtyMoney(interaction.guildId, member.user.id);
                if (method === "remove" && (userAccount[type] == null || userAccount[type] <= 0 || userAccount[type] < amount)) return errorEmbed(own ? t("no_user_dirty_money", { money: money }) : t("no_member_dirty_money", { member: member.toString(), money: money }) );

                if (userAccount[type] + amount >= 2147483647) return errorEmbed(t("int_passing_member", { name: lang == "fr" ? "d'argent sale" : "dirty money", member: member.toString() }, "errors"));

                await client.db.addDirtyMoney(interaction.guildId, member.user.id, method === "add" ? amount : -amount);

            } else {

                if (type === "cash_money" && method === "remove" && (userAccount[type] == null || userAccount[type] < amount || userAccount[type] - amount < 0)) return errorEmbed(own ? t("less_self_remove_cash", { money: money }) : t("member_remove_cash", { member: member.toString(), money: money }));
                
                if (method === "add" && userAccount[type] + amount >= 2147483647) return errorEmbed(t("int_passing_member", { name: lang == "fr" ? type == "bank_money" ? "du compte bancaire" : "d'argent liquide" : type == "bank_money" ? "the bank account" : "cash money", member: member.toString() }, "errors"));

                await client.db.addMoney(interaction.guildId, member.id, type, method === "add" ? amount : -amount);
                if (type == "bank_money") await client.db.addTransactionLog(interaction.guildId, member.id, method === "add" ? amount : -amount, lang == "fr" ? `${method == "add" ? "Payement" : "Retrait"} du gouvernement` : `Government ${method == "add" ? "payment" : "withdrawal"}`);
            }

            let sentence, choice;
            if (own) method == "add" ? choice = "self_add" : choice = "self_remove";
            else method == "add" ? choice = "user_add" : choice = "user_remove";

            switch (type) {
                // ------------------ DIRTY ------------------
                case "dirty_money":
                    sentence = t(`${choice}_dmoney`, own ? { money: money } : { money: money, member: member.toString() });
                    break;
                // ------------------ BANK ------------------
                case "bank_money":
                    sentence = t(`${choice}_bank`, own ? { money: money } : { money: money, member: member.toString() });
                    break;

                // ------------------ CASH ------------------
                case "cash_money":
                default: 
                    sentence = t(`${choice}_cash`, own ? { money: money } : { money: money, member: member.toString() });
                    break;
            };

            successEmbed(sentence);
        }

        // Logs embed
        let typeAsText = { bank_money: "💳 " + t("typeAsText.bank_money"), cash_money: "💵 " + t("typeAsText.cash_money"), dirty_money: "💰 " + t("typeAsText.dirty_money") }[type];
        const logsEmbed = new EmbedBuilder()
            .setTitle(method === "add" ? t("logs_embed.title.add") : t("logs_embed.title.remove"))
            .addFields([
                { name: t("logs_embed.fields.type"), value: typeAsText, inline: true },
                { name: t("logs_embed.fields.amount"), value: `${separate(amount)}${symbol}`, inline: true },
                { name: t("logs_embed.fields.author"), value: `${interaction.user.toString()} (${interaction.user.id})`, inline: true },
                { name: t("logs_embed.fields.beneficiary"), value: value instanceof Role ? `${value.toString()} (${t("logs_embed.fields.beneficiaryvalue", { number: validMembers.size.toString() })})` : `${value.toString()} (${value.id})`, inline: true }
            ])
            .setThumbnail(interaction.user.displayAvatarURL());

        return client.functions.logs.send(interaction, logsEmbed, method === "add" ? "creation" : "deletion");

        } catch (err) {
            console.error(err);

            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
        
    }
};