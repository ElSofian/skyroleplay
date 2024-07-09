const { InteractionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, GuildMember } = require("discord.js");

module.exports.run = async(client, interaction) => {
    
    if(!interaction?.isRepliable || interaction.user.bot) return;
    if(!interaction.inGuild() || !interaction.guildId) return;
    
    const blacklisted = await client.db.isUserBlacklisted(interaction.user.id);
    const [lang, economySymbol, overdraftLimit] = await Promise.all([
        client.db.getOption(interaction.guildId, "guild.lang"),
        client.db.getOption(interaction.guildId, "economy.symbol"),
        client.db.getOption(interaction.guildId, "overdraft.limit")
    ]);
    
    // Functions
    function t(key, params = false, type = null) { // translate for commands
        if(type == null) {
            if(interaction.type == InteractionType.ApplicationCommand || interaction.type === InteractionType.ApplicationCommandAutocomplete) type = `commands/${client.commands.get(interaction.commandName).category.en}`;
            else if(interaction.type == InteractionType.MessageComponent) type = "events";
        }

        return client.translate.t(lang, key, params, type, interaction);
    }

    function errorEmbed(description, justEmbed = false, ephemeral = true, replyType = "reply", i = interaction) {
        let embed = new EmbedBuilder().setColor("Red").setDescription(`${client.constants.emojis.redEchec} ${description}`);
        let content = { embeds: [embed], components: [], content: null, files: [], ephemeral: ephemeral };

        if (justEmbed) return embed;
        return i[replyType](content).catch(err => {
            if(err.code == "InteractionNotReplied") i.reply(content).catch(() => {});
            if(err.code == "InteractionAlreadyReplied") i.editReply(content).catch(console.error);
        });
    }

    function successEmbed(description, justEmbed = false, ephemeral = false, replyType = "reply", i = interaction) {
        let embed = new EmbedBuilder().setColor("Green").setDescription(`${["bourse"].includes(interaction.commandName) ? "" : client.constants.emojis.reussi} ${description}`);
        let content = { embeds: [embed], components: [], content: null, files: [], ephemeral: ephemeral };

        if (justEmbed) return embed;
        return i[replyType](content).catch(err => {
            if(err.code == "InteractionNotReplied") i.reply(content).catch(() => {});
            if(err.code == "InteractionAlreadyReplied") i.editReply(content).catch(console.error);
        });
    }

    const roleStaff = await client.db.getOption(interaction.guildId, "roles.moderator");
    function verify(param, keys = {}, specificTranslation = null) {
        let translation = null;
        if(typeof param == "string") param = [param];
        
        param.forEach(p => {
            switch(p) {
                case "reason": if(interaction.options.getString("raison").length > keys.limit) translation = ("reason_too_long", { length: keys.limit }, "errors"); break;

                case "member":
                default: {
                    if (!(interaction.options.getMember("joueur") || interaction.member) instanceof GuildMember) translation = t("not_in_server", { member: interaction.options.getMember("joueur") ? interaction.options.getMember("joueur").toString() : t("member_is_null", false, "errors") }, "errors");
                    if(keys.cantBotInclued && interaction.options.getMember("joueur") !== null && interaction.options.getMember("joueur").id === client.user.id) translation = t("cant_include_bot", false, "errors");
                    if(keys.cantSelfInclued && interaction.options.getMember("joueur") !== null && interaction.options.getMember("joueur").id === interaction.member.id) translation = t("cant_include_yourself", false, "errors");
                    if(keys.isStaff && roleStaff !== null && !interaction.member.roles.cache.has(roleStaff)) translation = t("staff_cmd", { role: roleStaff }, "errors");
                    if(keys.isAdmin && !interaction.member.permissions.has("Administrator")) translation = t("admin_cmd", false, "errors");
                    break;
                }
            }
        })

        return translation ? errorEmbed(specificTranslation ?? translation) : null
    }
  
    if(interaction.type == InteractionType.ApplicationCommand || interaction.type == InteractionType.ApplicationCommandAutocomplete) {

        // if (interaction.type === InteractionType.ApplicationCommandAutocomplete) return interaction.respond([{ name: "Le bot est en maintenance", value: "maintenance" }]);
        // return interaction.reply("Le bot est en maintenance, merci de patienter.").catch(() => {});
  
        // Check blacklist cache
        if(blacklisted) return errorEmbed(t("interactionCreate.blacklist", false, "events"));
        if(!interaction.channel) return errorEmbed(t("interactionCreate.channel", false, "events"));

        // Check whether the bot has permissions on the interaction channel
        const hasSendPermissions = interaction.channel.permissionsFor(client.user.id).has("ViewChannel" || "SendMessages" || "EmbedLinks");
        if (!hasSendPermissions && interaction.type !== InteractionType.ApplicationCommandAutocomplete) return errorEmbed(t("interactionCreate.perms_send", { channel: interaction.channel.toString() }, "events"));

        const command = client.commands.get(interaction.commandName);
        if(!command && interaction.type !== InteractionType.ApplicationCommandAutocomplete) return errorEmbed(t("interactionCreate.command_not_found", { cmd: interaction.commandName }, "events"))
            
        var getStaff = await client.db.getStaff(interaction.member.id);
        if(command.category.en == "admindev") {
            if(interaction.guildId !== client.config.team_server) return interaction.reply(`${client.constants.emojis.redEchec} Cette commande est désactivée sur ce serveur !`).catch(() => { });
            if(command.staff_level && getStaff && command.staff_level > getStaff.level) return errorEmbed(t("interactionCreate.perms", false, "events"));
            else if(!getStaff || getStaff && [0, 1].includes(getStaff.level)) return errorEmbed(t("interactionCreate.private_cmd", false, "events"));
        };

        // Check permissions
        const fullCommandName = [interaction.commandName, interaction.options.getSubcommandGroup(false), interaction.options.getSubcommand(false)].filter((c) => c != null).join(" ");

        if(interaction.type === InteractionType.ApplicationCommand) {
            let hasPerms = await client.functions.permissions.checkPermissions(interaction, fullCommandName);
            if(hasPerms.result == false) return;
        }

        if(!(await client.functions.permissions.configModerator(interaction, fullCommandName, command.moderation))) return;

        // Check if the command is for bêta testers only
        const isBeta = await client.db.isBeta(interaction.guildId);
        if(command.betaTest && !isBeta && interaction.type !== InteractionType.ApplicationCommandAutocomplete) return errorEmbed(`${client.constants.emojis.beta} ` + t("interactionCreate.beta_test_cmd", { link: client.constants.links.support }, "events"));

        // Check if the command is premium
        const isPremium = await client.db.isPremium(interaction.guildId);
        if(command.premium && !isPremium && interaction.type !== InteractionType.ApplicationCommandAutocomplete) return errorEmbed(`${client.constants.emojis.premium} ` + t("interactionCreate.premium_cmd", { url: client.constants.links.premium }, "events"));

        // Check cooldown
        const remainingTime = client.functions.other.getRemainingCooldown(interaction.guildId, interaction.user.id);
        if(remainingTime > 0 && interaction.type !== InteractionType.ApplicationCommandAutocomplete) return errorEmbed(t("interactionCreate.cooldown", { time: remainingTime, cmd: interaction.commandName }, "events"))
        
        const state = await client.db.getMemberState(interaction.guildId, interaction.member.id)
        if(!["urgences", "réanimer", "statut", "aide", "bot-info", "check-staff", "invitation"].includes(interaction.commandName) && !command.moderation && !command?.staff_level && interaction.type === InteractionType.ApplicationCommand && (state?.coma ?? 0) == 1) return errorEmbed(t("interactionCreate.in_coma", false, "events"));
        if(interaction.commandName !== "menottes" && !command.moderation && !command?.staff_level && interaction.type == InteractionType.ApplicationCommand && state?.handcuffed == 1) return errorEmbed(t("handcuffed", { member: interaction.user.toString() }, "errors"));
        if(
            !["inventaire", "item", "sms", "service", "publication", "prison", "menottes", "coma", "statut", "contacts", "cachette", "blanchiment", "drogues", "gang", "salaire", "payer", "", "aide", "bot-info", "check-staff", "invitation"].includes(interaction.commandName)
            && !command.moderation && !command?.staff_level && interaction.type == InteractionType.ApplicationCommand && state?.jail == 1
        ) return errorEmbed(t("in_jail", { member: interaction.user.toString() }, "errors"));

        try {
            if(interaction.type == InteractionType.ApplicationCommand) client.logger.command(`${fullCommandName} used by userId: [${interaction.user.id}] on guildId: [${interaction.guildId}]`);
            if(command?.cooldown > 1 && interaction.type == InteractionType.ApplicationCommand) client.functions.other.addCooldown(interaction.guildId, interaction.user.id, command.cooldown);
            await command[interaction.type === InteractionType.ApplicationCommandAutocomplete ? "runAutocomplete" : "run"](client, interaction, { t, successEmbed, errorEmbed, verify, isPremium, isBeta, lang, economySymbol, overdraftLimit, separate: client.functions.other.separate });
        } catch (error) {
            console.log(error)
            errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
            client.db.sendError(lang, error, "Interaction error", interaction);
            console.log("Erreur lors de l'interaction de la commande " + interaction.commandName + " : " + error);
        }
    }

    

    if(interaction.type == InteractionType.MessageComponent) {

        const customId = interaction.customId;
        if(!customId) return;

        // Check blacklist cache
        if(blacklisted) return;
        
        let method;
        if(["enter", "quit", "end", "crypto", "idcard", "revive"].includes(customId)) {
            if(["enter", "quit", "end"].includes(customId)) method = `session_${customId}`;
            else method = customId;
        } else if (customId.includes("salary-")) method = customId.replace(/(accept|cancel)-salary-\d+/, "$1-salary");
        else method = customId

        const symbol = await client.db.getOption(interaction.guildId, "economy.symbol");
        if(interaction.message?.author.id !== client.user.id) return;

        const permissionForChannel = interaction.channel.permissionsFor(interaction.guild.members.me);
        if(!permissionForChannel.has(PermissionsBitField.Flags.ViewChannel | PermissionsBitField.Flags.SendMessages | PermissionsBitField.Flags.EmbedLinks)) return;

        if(interaction.message.embeds.length <= 0) return;
        switch (method) {

            // Crypto selling
            case "cancel-crypto-sell":
            case "accept-crypto-sell": {

                if(interaction.member.id !== "683269450086219777" && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return errorEmbed(t("missing_permission", { permission: lang == "fr" ? "Administrateur" : "Administrator" }, "errors"))
                
                const embed = interaction.message.embeds[0].data;
                const description = embed.description;
                
                let [memberId, quantity, amount] = description.match(/\d[\d\s.]*\d|\d/g).map(n => /^\d/.test(n) ? n.includes('.') || n.includes(",") ? parseFloat(n) : BigInt(n.replace(/\s/g, '')).toString() : NaN);
                amount = parseFloat(amount);
                
                const crypto = client.cryptos.find(c => c.id.toLowerCase() == description.match(/\*\*([^*]+)\*\*/)[1].toLowerCase())
                
                if(method == "cancel-crypto-sell") return errorEmbed(t("interactionCreate.cancel_crypto_sell", { member: `<@${memberId}>`, quantity: quantity?.toFixed(4), name: crypto.name, amount: amount?.toFixed(2), symbol: symbol }, "events"));

                const memberCrypto = await client.db.getMemberCrypto(interaction.guildId, memberId, crypto.id);
                if(!memberCrypto || memberCrypto?.quantity < quantity) return errorEmbed(t("interactionCreate.not_enough_crypto", { member: `<@${memberId}>`, quantity: quantity, name: crypto.name }, "events"))

                const memberAccount = await client.db.getBankAccount(interaction.guildId, memberId);
                if(!memberAccount) return errorEmbed(t("no_bank_account", false, "errors"));
                if(memberAccount?.bank_money >= 2147483647) return errorEmbed(t("int_passing", { name: t("words.your_bank_account", false, "global") }, "errors"));

                amount = crypto.current_price * quantity;
                await client.db.removeMemberCrypto(interaction.guildId, memberId, crypto.id, quantity?.toFixed(4), quantity?.toFixed(4) == memberCrypto.quantity?.toFixed(4))
                await client.db.addMoney(interaction.guildId, memberId, "bank_money", amount?.toFixed(2))
                await client.db.addTransactionLog(interaction.guildId, memberId, amount?.toFixed(2), lang == "fr" ? `Vente de ${crypto.name}` : `Sale of ${crypto.name}`)

                return interaction.update({ embeds: [successEmbed(t("interactionCreate.selled", { quantity: quantity?.toFixed(4), name: crypto.name, amount: amount?.toFixed(2), symbol: symbol }, "events"), true)], components: [] }).catch(() => {})

            }

            case "edit_idcard_accept": 
            case "edit_idcard_refuse":
            case "create_idcard_accept":
            case "create_idcard_refuse": {

                const isEdit = customId.includes("edit");
                const roleStaff = await client.db.getOption(interaction.guildId, "roles.moderator");
                if((roleStaff && !interaction.member.roles.cache.has(roleStaff)) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return errorEmbed(t("interactionCreate.perms", false, "events"));

                const embed = interaction.message.embeds[0].data;
                if(interaction.customId.includes("refuse")) {
                    const newEmbed = EmbedBuilder.from(embed).setColor("Red").setTitle(t(`interactionCreate.refused_idcard`, false, "events")).setDescription(null)
                    return interaction.update({ embeds: [newEmbed], components: [] }).catch(() => {})
                }

                const [firstName, lastName, gender, birthdate, birthplace, fake] = embed.fields.map(f => f.value);
                const memberId = embed.description.match(/([1-9][0-9]{17,18})/gm)[0];
                const dateMatch = birthdate.match(/^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/);
                const birthdateInFormat = new Date(`${dateMatch?.[3]}/${dateMatch?.[2]}/${dateMatch?.[1]}`);

                const idCard = { first_name: firstName, last_name: lastName, gender: gender == t("words.man", false, "global") ? 1 : 2, birthdate: birthdateInFormat, birthplace: birthplace, fake: fake == t("words.yes", false, "global") ? 1 : 0 }
                await client.db[isEdit ? "editIDCard" : "createIDCard"](interaction.guildId, memberId, idCard)

                const newEmbed = EmbedBuilder.from(embed).setColor("Green").setTitle(t(`interactionCreate.${isEdit ? "edited" : "created"}_idcard`, false, "events")).setDescription(null)
                return interaction.update({ embeds: [newEmbed], components: [] }).catch(() => {})

            }

            // Salary Accepted && Denied
            case "cancel-salary":
            case "accept-salary": {
                
                let _isModerator = await client.functions.permissions.isModerator(interaction, interaction.member, { advanced: true });
                var role = _isModerator.existing_role;
                
                // Check if the member is a moderator and can accept or cancel the salary
                if(_isModerator.result == false) {
                    if(role) return errorEmbed(t("interactionCreate.salary_error1", { role: role }, "events"));
                    else return errorEmbed(t("interactionCreate.salary_error2", false, "events"));
                };

                const embed = interaction.message.embeds[0].data;
                const user_id = embed.description.match(/([1-9][0-9]{17,18})/gm)[0];
                if(!user_id) return console.log("[ERROR] -> interactionCreate.js l.213");
                const price = customId.split('-')[2] || 0;
                let sendEmbed;

                if(method == "cancel-salary") {
                    sendEmbed = EmbedBuilder.from(embed).setDescription(`${client.constants.emojis.echec} ` + t("interactionCreate.deny_salary.description", { id: user_id, money: `${client.functions.other.separate(price)}${symbol}` }))
                    .setFields({ name: t("interactionCreate.deny_salary.who"), value: interaction.user.toString() })
                    .setColor("Red")

                    return interaction.update({ embeds: [sendEmbed], components: [] }).catch(() => {});
                    
                } else {

                    const companyName = embed.description.split("**")[2]?.match(/\*(.*?)\*/)?.[1]
                    const company = companyName ? await client.db.getCompanyByName(interaction.guildId, companyName) : null; 
                    if(companyName && !company) return errorEmbed(t("interactionCreate.company_not_found", { company: companyName }, "events"));
                    if(companyName && company.length > 1) return errorEmbed(t("interactionCreate.multiple_companies", false, "events"));
                    
                    const isBan = await client.db.isFreezeAccount(interaction.guildId, user_id);
                    if(isBan) return errorEmbed(t("freeze_account_member", { member: `<@${user_id}>` }, "errors"));
                    
                    if(company) {

                        if(company[0].money < price) return errorEmbed(t("interactionCreate.not_enough_money_company", { company: companyName }, "events"))

                        await client.db.addMoneyToCompany(company[0].id, -price)
                        await client.db.addTransactionLog(interaction.guildId, company[0].id, -price, lang == "fr" ? "Salaire" : "Salary");
                    }

                    await client.db.addMoney(interaction.guildId, user_id, "bank_money", price);
                    await client.db.addTransactionLog(interaction.guildId, user_id, price, lang == "fr" ? "Salaire" : "Salary");
                    
                    sendEmbed = EmbedBuilder.from(embed).setDescription(`${client.constants.emojis.reussi} ` + t("interactionCreate.accept_salary.description", { id: user_id, money: `${client.functions.other.separate(price)}${symbol}` }))
                        .setFields({ name: t("interactionCreate.accept_salary.who"), value: interaction.user.toString() })
                        .setColor("Green")

                    await interaction.update({ embeds: [sendEmbed], components: [] }).catch(() => {});

                    const logsEmbed = new EmbedBuilder()
                        .setTitle(t("interactionCreate.accept_salary.title"))
                        .setThumbnail(interaction.user.displayAvatarURL())
                        .addFields([
                            { name: t("interactionCreate.accept_salary.by"), value: `${interaction.user.toString()} (${interaction.user.id})`, inline: true },
                            { name: t("interactionCreate.accept_salary.for"), value: `<@${user_id}> (${user_id})`, inline: true },
                            { name: t("interactionCreate.accept_salary.amount"), value: `${price.toLocaleString(lang)}${symbol}` }
                        ])

                    client.functions.logs.send(interaction, logsEmbed, "info");
                    break;

                }
            }

            case "revive":
            case "session_enter":
            case "session_quit":
            case "session_end": {

                if(method == "session_end") {

                    const roleStaff = await client.db.getOption(interaction.guildId, "roles.moderator");
                    if((roleStaff && !interaction.member.roles.cache.has(roleStaff)) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
                    return errorEmbed(t("interactionCreate.perms", false, "events"));

                    await client.db.deleteSession(interaction.guildId, interaction.message.id);
                    return interaction.update({ embeds: [successEmbed(t("interactionCreate.session_ended", { author: `<@${interaction.user.id}>` }), true)], components: [] })
                
                }

                if(method == "revive") {
                    
                    const roleEms = await client.db.getOption(interaction.guildId, "roles.ems");
                    const companyEMS = await client.db.getSpecifyCompany(interaction.guildId, "ems");
                    if(!roleEms && !companyEMS?.length) return errorEmbed(t("interactionCreate.no_ems_role", { link: client.constants.links.dashboard }))
                    
                    let isEmsEmployee = false;
                    if(companyEMS?.length) {
                        for (const company of companyEMS) {
                            const employees = await client.db.getCompanyEmployees(company.id);
                            if(employees.find(({ user_id }) => user_id == interaction.member.id)) {
                                isEmsEmployee = true;
                                break;
                            }
                        }
                    }
                    
                    if(!interaction.member.roles.cache.has(roleEms) && !isEmsEmployee) return errorEmbed(t("interactionCreate.not_ems"));

                    const embed = interaction.message.embeds[0].data;
                    const description = embed.description;

                    const memberId = description.replace(/[^0-9]/g, '');
                    if(!memberId) return console.log("[ERROR] -> interactionCreate.js l.386");

                    const memberState = await client.db.getMemberState(interaction.guildId, memberId);
                    if(memberState.coma !== 1) return errorEmbed(t("interactionCreate.not_in_coma", { member: `<@${memberId}>` }))

                    await client.db.removeComa(interaction.guildId, memberId, memberState.hunger == 0 && memberState.thirst == 0 ? `thirst = 20, hunger` : memberState.hunger == 0 ? "hunger" : "thirst");
                    interaction.update({ embeds: [successEmbed(t("interactionCreate.revived", { member: `<@${memberId}>`, author: `<@${interaction.user.id}>` }), true)], components: [] })

                } else {

                    const embed = interaction.message.embeds[0].data;
                    const description = embed.description;
                    
                    const isEnter = interaction.customId.endsWith("enter");
                    if(isEnter ? description.includes(interaction.user.toString()) : !description.includes(interaction.user.toString())) return errorEmbed(t(`interactionCreate.${isEnter ? "already" : "not"}_in_session`));
                    
                    const session = await client.db.getSession(interaction.guildId, interaction.member.id);
                    if(isEnter && session) return errorEmbed(t("interactionCreate.already_in_another_session", { link: `https://discord.com/channels/${session.guild_id}/${interaction.channel.id}/${session.message_id}` }));

                    const newDescription = isEnter ? description + `\n${interaction.user.toString()}` : description.replace(interaction.user.toString(), "");
                    const passengers = newDescription.match(/<@!?\d{17,19}>/gm);
                    
                    if(isEnter && passengers?.length > 30) return errorEmbed(t("interactionCreate.full_session"));

                    const newEmbed = EmbedBuilder.from(embed).setDescription(newDescription);
                    const newRows = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId("session_enter").setLabel(t("session.enter", false, "global")).setStyle(ButtonStyle.Success).setDisabled(passengers?.length == 30),
                        new ButtonBuilder().setCustomId("session_quit").setLabel(t("session.quit", false, "global")).setStyle(ButtonStyle.Danger),
                        new ButtonBuilder().setCustomId("session_end").setLabel(t("session.end", false, "global")).setStyle(ButtonStyle.Secondary)
                    )
                
                    await client.db[`${isEnter ? "add" : "remove"}Session`](interaction.guildId, interaction.member.id, interaction.message.id);
                    await interaction.update({ embeds: [newEmbed], components: [newRows] })

                }
                
                const time = await client.db.getOption(interaction.guildId, "hunger_thirst.time");
                let interval;
                interval = setInterval(async() => {
                    
                    const session = await client.db.getSession(interaction.guildId, interaction.member.id);
                    if (!session) return clearInterval(interval);
                    
                    const hungerQuantity = await client.db.getOption(interaction.guildId, "hunger.quantity");
                    const thirstQuantity = await client.db.getOption(interaction.guildId, "thirst.quantity");
                    await client.db.removeState(interaction.guildId, interaction.member.id, hungerQuantity, thirstQuantity);
                    
                    const memberState = await client.db.getMemberState(interaction.guildId, interaction.member.id);
                    
                    await interaction.guild.channels.fetch();
                    const channelId = await client.db.getOption(interaction.guildId, "hunger_thirst.channel");
                    let channel = interaction.guild.channels.cache.get(channelId)
                    let dmMember = false;
                    if(!channel) {
                        channel = interaction.member
                        dmMember = true;
                    }

                    let isHunger = (25 < memberState.hunger && memberState.hunger <= 50)
                    let isVeryHunger = (0 < memberState.hunger && memberState.hunger <= 25)
                    if(isHunger || isVeryHunger) {
                        const embed = new EmbedBuilder()
                        .setColor(isVeryHunger ? "Red" : "Yellow")
                        .setDescription(t(`interactionCreate.${isVeryHunger ? "very_" : ""}hungry`, { hunger: memberState.hunger }))
                        
                        const memberFlag = await client.db.getMemberFlag(interaction.guildId, interaction.member.id, isVeryHunger ? "hunger.very.alert" : "hunger.alert");
                        if(memberFlag == 0) {
                            await client.db.updateMemberStateAlert(interaction.guildId, interaction.member.id, isVeryHunger ? "hunger.very.alert" : "hunger.alert", 1)
                            channel?.send({ content: dmMember ? null : `||${interaction.user.toString()}||`, embeds: [embed] }).catch(() => {
                                interaction.channel.send({ content: `||${interaction.user.toString()}||`, embeds: [embed] })
                            })
                        }
                    }
                    
                    let isThirst = (25 < memberState.thirst && memberState.thirst <= 50)
                    let isVeryThirst = (0 < memberState.thirst && memberState.thirst <= 25)
                    if(isThirst || isVeryThirst) {
                        const embed = new EmbedBuilder()
                        .setColor(isVeryThirst ? "Red" : "Yellow")
                        .setDescription(t(`interactionCreate.${isVeryThirst ? "very_" : ""}thirsty`, { hunger: memberState.thirst }))
                        
                        const memberFlag = await client.db.getMemberFlag(interaction.guildId, interaction.member.id, isVeryThirst ? "thirst.very.alert" : "thirst.alert");
                        if(memberFlag == 0) {
                            await client.db.updateMemberStateAlert(interaction.guildId, interaction.member.id, isVeryThirst ? "thirst.very.alert" : "thirst.alert", 1)   
                            channel?.send({ content: dmMember ? null : `||${interaction.user.toString()}||`, embeds: [embed] }).catch(() => {
                                interaction.channel.send({ content: `||${interaction.user.toString()}||`, embeds: [embed] })
                            })
                        }
                    }

                    if(memberState.hunger <= 0 || memberState.thirst <= 0) {
                        
                        clearInterval(interval)
                        await client.db.putComa(interaction.guildId, interaction.member.id)
                        
                        const embed = new EmbedBuilder()
                        .setColor("Red")
                        .setDescription(`🚑 ${t("interactionCreate.coma", { member: interaction.user.toString(), state: memberState.hunger <= 0 && memberState.thirst <= 0 ? t("interactionCreate.both") : memberState.hunger <= 0 ? t("interactionCreate.hunger") : t("interactionCreate.thirst")})}`)
                        
                        const rows = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("revive").setStyle(ButtonStyle.Danger).setEmoji("🚑").setLabel(t("interactionCreate.revive")))
                        const comaChannel = await client.db.getOption(interaction.guildId, "hunger_thirst.channel");
                        if(comaChannel) {
                            const channel = interaction.guild.channels.cache.get(comaChannel);
                            if(channel) channel.send({ content: `||${interaction.user.toString()}||`, embeds: [embed], components: [rows] }).catch(() => {
                                interaction.channel.send({ content: `||${interaction.user.toString()}||`, embeds: [embed], components: [rows] })
                            })
                        } else {
                            interaction.channel.send({ content: `||${interaction.user.toString()}||`, embeds: [embed], components: [rows] })
                        }

                        return
                        
                    }
                    
                }, time)
                
                break;
            }

        }
        

    };

}