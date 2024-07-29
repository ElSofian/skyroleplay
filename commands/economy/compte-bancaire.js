const { EmbedBuilder, ApplicationCommandOptionType, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, PermissionsBitField, time } = require("discord.js");
const { Canvas, loadImage, loadFont } = require("canvas-constructor/napi-rs");
const { resolve, join } = require("node:path");
loadFont(resolve(join(__dirname, "../../assets/fonts/Poppins-Regular.ttf")), "PoppinsRegular");
loadFont(resolve(join(__dirname, "../../assets/fonts/Poppins-Bold.ttf")), "PoppinsBold");
loadFont(resolve(join(__dirname, "../../assets/fonts/Poppins-Medium.ttf")), "PoppinsMedium");

function emojis(number) {
    let emoji;
    switch(number) {
        case 1: emoji = "🥇"; break;
        case 2: emoji = "🥈"; break;
        case 3: emoji = "🥉"; break;
        default: emoji = `\`#${number}\``; break;
    }
    return emoji;
}

module.exports = {
    category: { "en": "economy", "fr": "économie" },
    name: "compte-bancaire",
    nameLocalizations: {
        "fr": "compte-bancaire",
        "en-US": "bank-account",
        "en-GB": "bank-account"
    },
    description: "Affiche, crée ou supprime un compte bancaire",
    descriptionLocalizations: {
        "fr": "Affiche, crée ou supprime un compte bancaire",
        "en-US": "Displays, creates or deletes a bank account",
        "en-GB": "Displays, creates or deletes a bank account"
    },
    options: [
        {
            name: "afficher",
            nameLocalizations: {
                "fr": "afficher",
                "en-US": "display",
                "en-GB": "display"
            },
            description: "Affiche un compte bancaire",
            descriptionLocalizations: {
                "fr": "Affiche un compte bancaire",
                "en-US": "Displays a bank account",
                "en-GB": "Displays a bank account"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "joueur",
                    nameLocalizations: {
                        "fr": "joueur",
                        "en-US": "player",
                        "en-GB": "player"
                    },
                    description: "Mentionnez le joueur auquel afficher le compte bancaire",
                    descriptionLocalizations: {
                        "fr": "Mentionnez le joueur auquel afficher le compte bancaire",
                        "en-US": "Mention the player whose bank account you want to display",
                        "en-GB": "Mention the player whose bank account you want to display"
                    },
                    required: false,
                    type: ApplicationCommandOptionType.User,
                },
            ],
        },
        {
            name: "créer",
            nameLocalizations: {
                "fr": "créer",
                "en-US": "create",
                "en-GB": "create"
            },
            description: "Crée un compte bancaire",
            descriptionLocalizations: {
                "fr": "Crée un compte bancaire",
                "en-US": "Creates a bank account",
                "en-GB": "Creates a bank account"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "joueur",
                    nameLocalizations: {
                        "fr": "joueur",
                        "en-US": "player",
                        "en-GB": "player"
                    },
                    description: "Mentionnez le joueur auquel créer le compte bancaire",
                    descriptionLocalizations: {
                        "fr": "Mentionnez le joueur auquel créer le compte bancaire",
                        "en-US": "Mention the player to create the bank account",
                        "en-GB": "Mention the player to create the bank account"
                    },
                    required: true,
                    type: ApplicationCommandOptionType.User,
                },
            ],
        },
        {
            name: "supprimer",
            nameLocalizations: {
                "fr": "supprimer",  
                "en-US": "delete",
                "en-GB": "delete"
            },
            description: "Supprime un compte bancaire",
            descriptionLocalizations: {
                "fr": "Supprime un compte bancaire",
                "en-US": "Deletes a bank account",
                "en-GB": "Deletes a bank account"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "joueur",
                    nameLocalizations: {
                        "fr": "joueur",
                        "en-US": "player",
                        "en-GB": "player"
                    },
                    description: "Mentionnez le joueur auquel supprimer le compte bancaire",
                    descriptionLocalizations: {
                        "fr": "Mentionnez le joueur auquel supprimer le compte bancaire",
                        "en-US": "Mention the player to delete the bank account",
                        "en-GB": "Mention the player to delete the bank account"
                    },
                    required: true,
                    type: ApplicationCommandOptionType.User,
                },
            ],
        },
        {
            name: "infos",
            description: "Affiche les informations d'un compte bancaire",
            descriptionLocalizations: {
                "fr": "Affiche les informations d'un compte bancaire",
                "en-US": "Displays the information of a bank account",
                "en-GB": "Displays the information of a bank account"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "joueur",
                    nameLocalizations: {
                        "fr": "joueur",
                        "en-US": "player",
                        "en-GB": "player"
                    },
                    description: "Mentionnez le joueur duquel vous souhaitez afficher les informations",
                    descriptionLocalizations: {
                        "fr": "Mentionnez le joueur duquel vous souhaitez afficher les informations",
                        "en-US": "Mention the player whose information you want to display",
                        "en-GB": "Mention the player whose information you want to display"
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true,
                }
            ],
        },
        {
            name: "classement",
            nameLocalizations: {
                "fr": "classement",
                "en-US": "leaderboard",
                "en-GB": "leaderboard"
            },
            description: "Voir les membres les plus riches du serveur",
            descriptionLocalizations: {
                "fr": "Voir les membres les plus riches du serveur",
                "en-US": "See the richest members of the server",
                "en-GB": "See the richest members of the server"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "nombre",
                    nameLocalizations: {
                        "fr": "nombre",
                        "en-US": "number",
                        "en-GB": "number"
                    },
                    description: "Nombre de membres à afficher",
                    descriptionLocalizations: {
                        "fr": "Nombre de membres à afficher",
                        "en-US": "Number of members to display",
                        "en-GB": "Number of members to display"
                    },
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        {
                            name: "10 membres",
                            nameLocalizations: {
                                "fr": "10 membres",
                                "en-US": "10 members",
                                "en-GB": "10 members"
                            },
                            value: "ten",
                        },
                        {
                            name: "20 membres",
                            nameLocalizations: {
                                "fr": "20 membres",
                                "en-US": "20 members",
                                "en-GB": "20 members"
                            },
                            value: "twenty",
                        },
                    ],
                },
                {
                    name: "type",
                    description: "Type d'argent à afficher",
                    descriptionLocalizations: {
                        "fr": "Type d'argent à afficher",
                        "en-US": "Type of money to display",
                        "en-GB": "Type of money to display"
                    },
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        {
                            name: "💳 Banque",
                            nameLocalizations: {
                                "fr": "💳 Banque",
                                "en-US": "💳 Bank",
                                "en-GB": "💳 Bank"
                            },
                            value: "bank",
                        },
                        {
                            name: "💵 Espèces",
                            nameLocalizations: {
                                "fr": "💵 Espèces",
                                "en-US": "💵 Cash",
                                "en-GB": "💵 Cash"
                            },
                            value: "species",
                        },
                        {
                            name: "💰 Argent sale",
                            nameLocalizations: {
                                "fr": "💰 Argent sale",
                                "en-US": "💰 Dirty money",
                                "en-GB": "💰 Dirty money"
                            },
                            value: "dirty",
                        },
                    ],
                },
            ],
        },
    ],
    run: async(client, interaction, { t, isPremium, isBeta, errorEmbed, successEmbed, verify, lang, economySymbol, overdraftLimit, separate }) => {

        try {

        const method = interaction.options.getSubcommand();
        const member = interaction.options.getMember("joueur") || interaction.member;
        const own = member.id === interaction.member.id;
        if (verify("member")) return;

        switch (method) {
            case "créer": {
                
                if (await client.db.hasBankAccount(interaction.guildId, member.id)) return errorEmbed(own ? t("has_bank_account.classic") : t("has_bank_account.mention_member", { member: member.toString() }));

                const options = await client.db.getOptions(interaction.guildId, ["economy.start_amount", "global.city_name"]);
                options["global.city_name"] ||= interaction.guild.name;

                await successEmbed(t("creation"), false, true)

                async function generate(type) {
                    let min = type == "card" ? 1000 : type == "secret" ? 100000 : 10000000, max = type == "card" ? 9000 : type == "secret" ? 900000 : 90000000;
                    let code = Math.floor(Math.random() * max) + min;
                    
                    while (`${code}`.split("")[0] == '0') code = Math.floor(Math.random() * max) + min;
                    if (type == "iban") while(await client.db.checkIban(interaction.guildId, code)) code = Math.floor(Math.random() * max) + min;
                    
                    return code;
                }

                let [card, secret, iban] = [await generate("card"), await generate("secret"), await generate("iban")];
                await client.db.createBankAccount(interaction.guildId, member.id, iban, secret, card, options["economy.start_amount"])
                await client.db.addTransactionLog(interaction.guildId, member.id, options["economy.start_amount"], t("bank_account_creation"))

                const embed = new EmbedBuilder()
                    .setColor("Blue")
                    .setTitle(t("embed_account.title"))
                    .setThumbnail("https://cdn.discordapp.com/attachments/778713489144938516/805182291906789426/3082dd40cdbe3ce2a85c3d8ad661ddc0.gif")
                    .setDescription(
                        t("embed_account.description", { member: member.toString(), emoji: client.constants.emojis.gouv, city: options["global.city_name"], startamount: parseFloat(options["economy.start_amount"]), symbol: economySymbol, iban: iban, secretCode: secret, cardCode: card })
                    )
                    .setFooter({ text: t("embed_account.footer") })
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] }).then(interaction.channel.send({ embeds: [successEmbed(t("created", { member: member.toString() }), true)] }).catch(() => {})).catch(() => {});

                const logsEmbed = new EmbedBuilder()
                    .setTitle(t("embed_logs_creation.title"))
                    .addFields([
                        { name: t("embed_logs_creation.field_banker"), value: `${interaction.user.toString()} (${interaction.user.id})`, inline: true },
                        { name: t("embed_logs_creation.field_client"), value: `${member.toString()} (${member.id})`, inline: true }
                    ])
                    .setThumbnail(interaction.user.displayAvatarURL());

                client.functions.logs.send(interaction, logsEmbed, "creation");
                break;
            }

            case "supprimer": {

                if (!(await client.functions.permissions.configModerator(interaction, "compte-bancaire supprimer"))) return;
                const packet = await client.db.deleteBankAccount(interaction.guildId, member.id);

                const cityName = (await client.db.getOption(interaction.guildId, "global.city_name")) || interaction.guild.name;

                if (packet.affectedRows > 0) {
                    const embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle(t("embed_close_account.title"))
                        .setThumbnail("https://cdn.discordapp.com/attachments/778713489144938516/805182291906789426/3082dd40cdbe3ce2a85c3d8ad661ddc0.gif")
                        .setDescription(t("embed_close_account.description", { member: member.toString(), emoji: client.constants.emojis.gouv, city: cityName }))
                        .setFooter({ text: t("embed_close_account.footer") })
                        .setTimestamp();

                    await interaction.reply({
                        embeds: [embed],
                    }).catch(() => {})

                    const logsEmbed = new EmbedBuilder()
                        .setTitle(t("embed_logs_close.title"))
                        .addFields([
                            { name: t("embed_logs_close.field_banker"), value: `${interaction.user.toString()} (${interaction.user.id})`, inline: true },
                            { name: t("embed_logs_close.field_client"), value: `${member.toString()} (${member.id})`, inline: true }
                        ])
                        .setThumbnail(interaction.user.displayAvatarURL());

                    client.functions.logs.send(interaction, logsEmbed, "deletion");

                } else {
                    errorEmbed(own ? t("no_bank_account", false, "errors") : t("no_member_account", { member: member.toString() }, "errors"));
                }

                break;
            }


            case "infos": {

                if (!(await client.functions.permissions.configModerator(interaction, "compte-bancaire infos", true)) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

                const memberAccount = await client.db.getBankAccount(interaction.guildId, member.id);
                if (!memberAccount) return errorEmbed(own ? t("no_bank_account", false, "errors") : t("no_member_account", { member: member.toString() }, "errors"));
                // if (![0, 1, 2, 3].includes(memberAccount?.question)) return errorEmbed(`${interaction.member.id !== memberAccount.user_id ? "Vous devez" : `${member.toString()} doit`} d'abord utiliser la commande \`/compte-bancaire afficher\` pour adapter le compte bancaire au nouveau système.`);

                const embed = new EmbedBuilder()
                .setColor("Green")
                .setTitle("<:money_icon:1127691543659167865>  " + t("embed_infos.title"))
                .setThumbnail(member.displayAvatarURL())
                .addFields([
                    { name: t("embed_infos.fields.amount"), value: `${separate(memberAccount.bank_money)}${economySymbol}`, inline: true },
                    { name: t("embed_infos.fields.crypto_wallet"), value: `${separate(memberAccount.crypto_wallet)}${economySymbol}`, inline: true },
                    { name: "Date", value: `${time(memberAccount.creation_date, "d")}`, inline: true },
                    { name: t("embed_infos.fields.iban"), value: `${memberAccount.iban}`, inline: true },
                    { name: t("embed_infos.fields.secret_code"), value: `${memberAccount.secret_code}`, inline: true },
                    { name: t("embed_infos.fields.card_code"), value: `${memberAccount.card_code}`, inline: true },
                    { name: t("embed_infos.fields.connexion_type"), value: t(`embed_infos.fields.connexions.${memberAccount.connexion_type}`), inline: true },
                    ...(memberAccount?.question ? [{ name: "Question", value: client.constants.questions[memberAccount.question][lang], inline: true }, { name: t("embed_infos.fields.answer"), value: `${memberAccount.answer}`, inline: true }] : []),
                    { name: t("embed_infos.fields.frozen_account"), value: t(`words.${memberAccount.frozen_date || memberAccount.frozen_reason ? "true" : "false"}`, false, "global") },
                    { name: t("embed_infos.fields.card_blocked"), value:  t(`words.${memberAccount.blocked ? "true" : "false"}`, false, "global") },
                ]) 

                return interaction.reply({ embeds: [embed], ephemeral: true })
            }


            case "afficher": {

                const account = await client.db.getBankAccount(interaction.guildId, member.id);
                if (!account || account.bank_money == null || isNaN(account.bank_money)) return errorEmbed(own ? t("no_bank_account", false, "errors") : t("no_member_account", { member: member.toString() }, "errors"));
                
                const options = await client.db.getOptions(interaction.guildId, ["global.city_name", "bank_cards.theme"]);

                // Adapting users to the new system
                if (![0, 1, 2, 3].includes(account?.question)) {

                    if (interaction.member.id !== account.user_id) return errorEmbed(`${member.toString()} doit d'abord utiliser la commande \`/compte-bancaire afficher\` pour adapter son compte bancaire au nouveau système.`);

                    // If the user hasn't created an account we say "welcome to the bank choose a question", if he already have an account we say "ALERT the system changed, choose a question"
                    const alreadyCreated = account?.creation_date ? false : true
                    const embed = new EmbedBuilder()
                    .setColor("Blue")
                    .setThumbnail("https://imgur.com/Tdfjmei.gif")
                    .setTitle(t(`embed_question.title${!alreadyCreated ? "_new_account": ""}`))
                    .setDescription(alreadyCreated ? t("embed_question.description", { member: member.toString() }) : t("embed_question.description_new_account", { member: member.toString() }))

                    const questions = client.constants.questions;

                    const sm = new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder().setCustomId("choose_question").setPlaceholder(t("embed_question.placeholder")).addOptions(questions.map(q => ({ label: q[lang], value: q.value })))
                    )

                    const message = await interaction.reply({ embeds: [embed], components: [sm], ephemeral: true}).catch(() => {})
                    if (!message) return

                    const collector = await message.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.user.id && i.customId == "choose_question", time: 90000 });
                    if (!collector) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply")

                    collector.on("collect", async (i) => {

                        const index = parseInt(i.values[0]) - 1
                        const question = questions[index][lang]
                        const code = Math.floor(Math.random() * 900000) + 100000;
                        const modal = new ModalBuilder().setCustomId(`modal_answer_${code}`).setTitle(t("embed_question.title")).setComponents(new ActionRowBuilder().addComponents(
                            new TextInputBuilder().setCustomId("answer").setLabel(t("embed_question.answer")).setPlaceholder(question).setMinLength(1).setMaxLength(255).setStyle(TextInputStyle.Short).setRequired(true)
                        ))

                        await i.showModal(modal).catch(() => {})
                        const modalCollector = await i.awaitModalSubmit({ filter: (ii) => ii.user.id === i.user.id && ii.customId == `modal_answer_${code}`, time: 90000 }).catch(() => {})
                        if (!modalCollector) return

                        const answer = modalCollector.fields.getTextInputValue("answer")
                        const responseEmbed = new EmbedBuilder()
                        .setColor("Blue")
                        .setTitle(t("embed_account.title"))
                        .setDescription(
                            t("embed_account.description", { member: member.toString(), emoji: client.constants.emojis.gouv, city: options["global.city_name"] ?? interaction.guild.name, symbol: economySymbol, iban: account?.iban, secretCode: account?.secret_code, cardCode: account?.card_code })
                        )
                        .setFooter({ text: t("embed_account.footer") })
                        .setTimestamp();

                        await client.db.setBankAccountSecurityQuestion(interaction.guildId, member.id, index, answer)
                        await modalCollector.update({ embeds: [alreadyCreated ? responseEmbed : successEmbed(t("embed_question.answered"), true)], components: [], ephemeral: true })
                        return collector.stop()
                    })

                    return
                }

                const isBan = await client.db.isFreezeAccount(interaction.guildId, member.id);
                const loans = await client.db.getLoans(interaction.guildId, member.id);

                const rows = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("deposit").setLabel(t("buttons.deposit")).setStyle(ButtonStyle.Success).setDisabled((isBan ? true : false) || account.cash_money !== null && account.cash_money <= 0),
                    new ButtonBuilder().setCustomId("withdraw").setLabel(t("buttons.withdraw")).setStyle(ButtonStyle.Danger).setDisabled((isBan ? true : false) || account.cash_money !== null && account.bank_money < overdraftLimit),
                    new ButtonBuilder().setCustomId("manage").setLabel(t("buttons.manage")).setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("others").setLabel(t("buttons.others")).setStyle(ButtonStyle.Secondary),
                );
                
                const manageRows = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("account").setLabel(t("buttons.account")).setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId("manage-connexion").setLabel(t("buttons.connexion")).setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("change-secret-code").setLabel(t("buttons.change_secret_code")).setStyle(ButtonStyle.Secondary),
                )

                const othersRows = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("account").setLabel(t("buttons.account")).setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId("card").setLabel(t("buttons.card")).setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("loans").setLabel(t("buttons.loans", { s: loans?.length > 1 ? "s" : "" })).setStyle(ButtonStyle.Secondary).setDisabled(!loans || loans?.length <= 0),
                    new ButtonBuilder().setCustomId("urgencies").setLabel(t("buttons.urgencies")).setStyle(ButtonStyle.Danger),
                )

                const codeRows = []
                const usedNumbers = [];
                for (let i = 0; i < 2; i++) {
                    let row = new ActionRowBuilder()
                    for (let j = 0; j < 5; j++) {
                        let number = Math.floor(Math.random() * 10)
                        while (usedNumbers.includes(number)) number = Math.floor(Math.random() * 10);

                        usedNumbers.push(number);
                        row.addComponents(new ButtonBuilder().setCustomId(number.toString()).setLabel(number.toString()).setStyle(ButtonStyle.Secondary));
                    }

                    codeRows.push(row)
                }

                const renderLoans = async(current) => {

                    const isBan = await client.db.isFreezeAccount(interaction.guildId, member.id);
                    const loans = await client.db.getLoans(interaction.guildId, member.id);
                    const newMemberAccount = await client.db.getMoney(interaction.guildId, member.id);
                    const loan = loans[current];

                    const idCards = [await client.db.getIDCard(interaction.guildId, loan.banker_id), await client.db.getIDCard(interaction.guildId, loan.banker_id, true)];
                    const name = idCards[0] ? `${idCards[0].first_name} ${idCards[0].last_name}` : idCards[1] ? `${idCards[1].first_name} ${idCards[1].last_name}` : interaction.guild.members.cache.get(loan.banker_id)?.displayName ?? t("unknown", false, "global")

                    loan.reason = loan.reason ? loan.reason.replace("Prêt :", "").replace("Loan :") : null

                    const canvas = new Canvas(930, 500)
                    .printImage(await loadImage(`assets/bank_cards/loans/${lang}/${options["bank_cards.theme"]}.png`), 0, 0, 930, 500)
                    .setTextAlign("left")
                    .setShadowBlur(1.35)
                    .setColor("#FFFFFF")
                    .setTextFont("27.5px PoppinsBold")
                    .printText(`${current+1}`, 145, 127.5)
                    .setTextFont("27px PoppinsRegular")
                    .setColor(options["bank_cards.theme"] == "light" ? "#3E4742" : "#F5F5F5")
                    .printText(name, 80, 260)
                    .printText(client.dayjs(loan.date).format("DD/MM/YYYY"), 80, 355)
                    .printText(loan.reason ? loan.reason.length > 15 ? `${loan.reason.substring(0, 23)}...` : loan.reason : t("no_reason"), 80, 450)
                    .setTextAlign("right")
                    .printText(`${separate(loan.amount - loan.payed)}${economySymbol}`, 850, 260)
                    .setTextFont("45px PoppinsRegular").setColor("#FFFFFF")
                    .printText(`${separate(loan.amount)}${economySymbol}`, 880, 132.5)

                    const transactions = (loan?.transactions?.split(","))?.reverse() ?? []
                    for(let i = 0; i < 3; i++) {
                        const transaction = transactions[i];
                        if (!transaction) continue;

                        canvas.setTextAlign("left").setTextFont("27px PoppinsRegular").setColor(options["bank_cards.theme"] == "light" ? "#72C6B7" : "#179E4B").printText("+", 525, 350 + (i * 50)).setColor(options["bank_cards.theme"] == "light" ? "#3E4742" : "#F5F5F5").printText(`${separate(parseFloat(transaction))}${economySymbol}`, 550, 350 + (i * 50))
                    }

                    const attachment = new AttachmentBuilder(await canvas.pngAsync(), { name: "loan.png" });
                    const loansEmbed = new EmbedBuilder()
                    .setColor("Green")
                    .setImage("attachment://loan.png");

                    const rows = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                        .setCustomId("others")
                        .setLabel(t("buttons.back"))
                        .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                        .setCustomId("refund")
                        .setLabel(t("buttons.refund"))
                        .setStyle(loan?.date_limit && Math.floor((Date.now() - loan.date_limit.getTime()) / (1000 * 60 * 60 * 24)) <= 7 ? ButtonStyle.Danger : ButtonStyle.Secondary) // <- S'il reste moins de 7 jours avant la fin de la date limit de remboursement du prêt le bouton se met en rouge
                        .setDisabled(isBan || loan.payed >= loan.amount || newMemberAccount?.bank_money < overdraftLimit)
                    )

                    if (loans.length > 1) {
                        rows.addComponents(
                            new ButtonBuilder().setCustomId("previous").setEmoji("◀").setStyle(ButtonStyle.Secondary).setDisabled(current == 0),
                            new ButtonBuilder().setCustomId("next").setEmoji("▶").setStyle(ButtonStyle.Secondary).setDisabled(current + 1 == loans.length)
                        )
                    }

                    return { embeds: [loansEmbed], components: [rows], files: [attachment], fetchReply: true };

                }

                const renderCard = async(customId) => {
                    const account = await client.db.getBankAccount(interaction.guildId, member.user.id);
                    if (!account || !account.bank_money == null || isNaN(account.bank_money)) return { embeds: [errorEmbed(t("no_bank_account", { member: member.toString() }, "errors"), true)], components: [], files: [] }

                    const idCards = [await client.db.getIDCard(interaction.guildId, member.id), await client.db.getIDCard(interaction.guildId, member.id, true)];
                    const name = idCards[0] ? `${idCards[0].first_name} ${idCards[0].last_name}` : idCards[1] ? `${idCards[1].first_name} ${idCards[1].last_name}` : interaction.guild.members.cache.get(member.id)?.displayName ?? t("unknown", false, "global")

                    const canvas = new Canvas(930, 500)
                    .printImage(await loadImage(`./assets/bank_cards/bank/${lang}/flat.png`), 0, 0, 930, 500)
                    .printImage(await loadImage(`./assets/bank_cards/bank/ship.png`), 765, 290, 90, 60)
                    .setTextFont("60px PoppinsMedium").setTextAlign("right").setColor("#ffffff")
                    .printText(`${separate(account.bank_money)}${economySymbol}`, 800, 130)
                    .setTextFont("30px PoppinsMedium").setTextAlign("left")
                    .printText(name, 50, 445)
                    
                    const attachment = new AttachmentBuilder(await canvas.pngAsync(), { name: "cb.png" });
                    const embed = new EmbedBuilder()
                        .setColor("#2a79ea")
                        .setAuthor({ name: member.displayName, iconURL: member.user.displayAvatarURL() })
                        .setImage("attachment://cb.png")
                        
                    const rows = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId("others").setLabel(t("buttons.back")).setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId("manage-card").setLabel(t("buttons.manage")).setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId("transfer").setLabel(t("buttons.transfer")).setStyle(ButtonStyle.Primary).setDisabled((isBan ? true : false) || (account?.bank_money ?? 0) < overdraftLimit),
                    )
                    
                    const secondRows = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId("card").setLabel(t("buttons.back")).setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId("change-card-code").setLabel(t("buttons.change_code")).setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId(`${account?.blocked == 1 ? "un" : ""}block`).setLabel(t(`buttons.${account?.blocked == 1 ? "un" : ""}block`)).setStyle(ButtonStyle.Danger),
                    )
                    
                    return { embeds: [embed], components: customId == "card" ? [rows] : [secondRows], files: [attachment] }

                }

                let code = "", fail = false;
                const renderConnexion = async(urgencies = null) => {

                    const account = await client.db.getBankAccount(interaction.guildId, member.id);
                    if (!account) return { embeds: [errorEmbed(t("no_bank_account", false, "errors"), true)], components: [], files: [] };

                    if (parseInt(code) == account.secret_code) return render()
                    if (code.length >= 6 && !urgencies) fail = true

                    const canvas = new Canvas(705, 295)
                    .printImage(await loadImage(`./assets/bank_cards/connexion/${lang}/${fail ? "error" : "success"}.png`), 0, 0, 705, 295)
                    .setTextFont("45px PoppinsBold").setColor("#ffffff")
                    
                    for (let i = 0; i < code.length; i++) canvas.printText("*", 135 + (i * 82), 240)

                    const attachment = new AttachmentBuilder(await canvas.pngAsync(), { name: "connexion.png" });
                    const embed = new EmbedBuilder()
                    .setColor("#2a79ea")
                    .setImage("attachment://connexion.png")

                    if (fail && !urgencies) {
                        var errorRow = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId("retry").setLabel(t("buttons.retry")).setStyle(ButtonStyle.Primary),
                            new ButtonBuilder().setCustomId("connexion-urgencies").setLabel(t("buttons.urgencies")).setStyle(ButtonStyle.Danger)
                        )
                    }

                    return { embeds: [embed], components: urgencies ? [urgencies] : fail ? [errorRow] : codeRows, files: [attachment], fetchReply: true }

                }

                const renderManageConnexion = async() => {

                    const account = await client.db.getBankAccount(interaction.guildId, member.id);
                    if (!account) return { embeds: [errorEmbed(t("no_bank_account", false, "errors"), true)], components: [], files: [] };

                    const rows = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId("manage").setLabel(t("buttons.back")).setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId("face_id").setLabel(t("buttons.face_id")).setStyle(ButtonStyle.Secondary).setDisabled(account.connexion_type == 1),
                        new ButtonBuilder().setCustomId("secret_code").setLabel(t("buttons.secret_code")).setStyle(ButtonStyle.Secondary).setDisabled(account.connexion_type == 2),
                        new ButtonBuilder().setCustomId("none").setLabel(t("buttons.none")).setStyle(ButtonStyle.Secondary).setDisabled(account.connexion_type == 3),
                    )

                    const embed = new EmbedBuilder()
                    .setColor("#2a79ea")
                    .setDescription(t("embed_connexion.description", { type: account.connexion_type == 1 ? "Face ID" : account.connexion_type == 2 ? t("buttons.secret_code") : t("words.none", false, "global"), settings: client.constants.emojis.settings, warning: client.constants.emojis.warning }))

                    return { embeds: [embed], components: [rows], files: [], fetchReply: true }

                }

                const render = async(secondRows = null) => {

                    const account = await client.db.getBankAccount(interaction.guildId, member.id);
                    if (!account) return { embeds: [errorEmbed(t("no_bank_account", false, "errors"), true)], components: [], files: [] };

                    if (!isPremium || (isPremium && options["bank_cards.theme"] == "dark")) {
                        await client.db.setOption(interaction.guildId, "bank_cards.theme", "light");
                        options["bank_cards.theme"] = "light";
                    }

                    const canvas = new Canvas(930, 500)
                        .printImage(await loadImage(`./assets/bank_cards/bank/${lang}/${own ? options["bank_cards.theme"] : `${options["bank_cards.theme"]}_member`}.png`), 0, 0, 930, 500)
                        .setColor("white")  
                        .setTextFont("45px PoppinsRegular")
                        .setTextAlign("right")
                        .printText(`${separate(account?.bank_money ?? 0)}${economySymbol}`, 880, 132.5);

                    const transactions = await client.db.getTransactions(interaction.guildId, member.id);

                    for (let i = 0; i < 5; i++) {

                        const transaction = transactions[i];
                        if (!transaction) break;

                        let emoji = `${transaction.amount}`.startsWith("-") ? "-" : "+";

                        canvas
                        .setTextAlign("center")
                        .setTextFont("40px PoppinsRegular")
                        .setColor(emoji == "+" ? options["bank_cards.theme"] == "light" ? "#72C6B7" : "#179E4B" : "#FF4646")
                        .printText(emoji, 95, 265 + (i * 50))
                        .setTextAlign("left")
                        .setTextFont("25px PoppinsRegular")
                        .setColor(options["bank_cards.theme"] == "light" ? "#3E4742" : "white")
                        .printText(`${(`${separate(transaction.amount)}`.replace(emoji, ""))}${economySymbol} (${transaction.reason.length > 48 ? `${transaction.reason.substring(0, 48)}...` : transaction.reason})`, 117.5, 260 + (i * 50));

                    }
                    
                    if (isBan) canvas.printImage(await loadImage(`assets/bank_cards/bank/${lang}/ban.png`), 0, 0, 930, 500);

                    const attachment = new AttachmentBuilder(await canvas.pngAsync(), { name: "cb.png" });
                    const embedSend = new EmbedBuilder()
                        .setColor("Green")
                        .setImage("attachment://cb.png");
    
                    return { embeds: [embedSend], components: [secondRows ?? rows], files: [attachment], fetchReply: true }
                    
                }
                
                const message = await interaction.reply(own && account.connexion_type == 1 || account.connexion_type == 3 ? await render() : await renderConnexion()).catch(() => {})
                if (!message) return;

                const collector = message.createMessageComponentCollector({ filter: (i) => i.user.id == interaction.member.id, time: 240000 });
                if (!collector) return errorEmbed(t("error_occurred", false, "errors"), false, true, "editReply");

                let current = 0;
                collector.on("collect", async (i) => {

                    const account = await client.db.getBankAccount(interaction.guildId, member.id);
                    if (!account) return i.update({ embeds: [errorEmbed(t("no_bank_account", false, "errors"), true)], components: [], files: [] }).catch(() => {});

                    switch(i.customId) {

                        // Connexion

                        case "retry":
                        case "1": case "2": case "3": case "4": case "5": case "6": case "7": case "8": case "9": case "0": {
                            if (i.customId == "retry") {
                                code = ""; fail = false;
                            } else code += i.customId;
                            
                            return i.update(await renderConnexion()).catch(() => {});
                        }


                        // Menu

                        case "manage-connexion": await i.update(await renderManageConnexion()).catch(() => {}); break;
                        
                        case "manage":
                        case "others":
                        case "account": await i.update(await render(i.customId.includes("others") ? othersRows : i.customId == "manage" ? manageRows : null)).catch(() => {}); break;

                        case "card": 
                        case "manage-card": await i.update(await renderCard(i.customId)).catch(() => {}); break;
                        
                        case "connexion-urgencies":
                        case "urgencies": {

                            const sm = new ActionRowBuilder().addComponents(
                                new StringSelectMenuBuilder()
                                .setCustomId("sm_urgencies")
                                .setPlaceholder(t("urgencies.sm_placeholder"))
                                .setMinValues(1).setMaxValues(1)
                                .setOptions([
                                    { label: i.customId.includes("connexion") ? "Connexion" : t("words.account", false, "global"), value: i.customId.includes("connexion") ? "connexion" : "account", emoji: client.constants.emojis[i.customId.includes("connexion") ? "user" : "bankaccount"] },
                                    { label: t("urgencies.options.forgot_iban"), value: "forgot_iban", emoji: client.constants.emojis.question },
                                    { label: t("urgencies.options.forgot_secret_code"), value: "forgot_secret_code", emoji: client.constants.emojis.question },
                                    { label: t("urgencies.options.forgot_card_code"), value: "forgot_card_code", emoji: client.constants.emojis.question },
                                ])
                            )

                            return i.update(i.customId == "connexion-urgencies" ? await renderConnexion(sm) : await render(sm)).catch(() => {});
                        }

                        case "sm_urgencies": {

                            const type = i.values[0].replace("forgot_", "");
                            if (type == "account") return i.update(await render(othersRows)).catch(() => {});
                            else if (type == "connexion") return i.update(await renderConnexion()).catch(() => {});

                            const questions = client.constants.questions

                            let reply = i;
                            if (type !== "iban") {

                                const code = Math.floor(Math.random() * 900000) + 100000;
                                const modal = new ModalBuilder().setCustomId(`modal_ask_${code}`).setTitle(t("ask_modal.title")).addComponents(new ActionRowBuilder().addComponents(
                                    new TextInputBuilder().setCustomId("question").setLabel("Question").setPlaceholder(questions[account.question][lang]).setMinLength(1).setMaxLength(255).setStyle(TextInputStyle.Short).setRequired(true)
                                ))

                                await i.showModal(modal).catch(() => {});
                                const modalCollector = await i.awaitModalSubmit({ filter: ii => ii.user.id == interaction.member.id && ii.customId == `modal_ask_${code}`, time: 75000 }).catch(() => {});
                                if (!modalCollector) return;

                                const answer = modalCollector.fields.getTextInputValue("question");
                                if (answer.toLowerCase() !== account.answer.toLowerCase()) return modalCollector.reply({ embeds: [errorEmbed(t("ask_modal.wrong_answer"), true)], components: [], files: [] });

                                reply = modalCollector
                            }

                            const embed = new EmbedBuilder()
                            .setColor("Blue")
                            .setTitle(t("ask_modal.reply_title"))
                            .setDescription(t(`ask_modal.${type}`, { code: type == "iban" ? account.iban : type.includes("card") ? account.card_code : account.secret_code }))
                            
                            return reply.reply({ embeds: [embed], ephemeral: type !== "iban" }).catch(() => {})

                        }

                        case "transfer": {

                            const code = Math.floor(Math.random() * 9000000000) + 1000000000
                            const modal = new ModalBuilder().setCustomId(`modal_amount_${code}`).setTitle(t("buttons.transfer"))
                            .setComponents(
                                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("iban").setLabel(t("card_modal.iban")).setPlaceholder(t("card_modal.placeholder_iban")).setMinLength(1).setMaxLength(8).setStyle(TextInputStyle.Short).setRequired(true)),
                                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("amount").setLabel(t("card_modal.amount")).setPlaceholder(t("card_modal.placeholder_amount")).setMinLength(1).setMaxLength(11).setStyle(TextInputStyle.Short).setRequired(false))
                            )

                            await i.showModal(modal).catch(() => {});
                            const modalCollector = await i.awaitModalSubmit({ filter: ii => ii.user.id == i.member.id && ii.customId == `modal_amount_${code}`, time: 45000 }).catch(() => {});
                            if (!modalCollector) return;

                            const iban = modalCollector.fields.getTextInputValue("iban");
                            const newAmount = await client.db.getMoney(interaction.guildId, member.id);
                            const newMemberAmount = await client.db.getBankAccountWithIban(interaction.guildId, iban);
                            if (!newAmount?.bank_money) return modalCollector.reply({ embeds: [errorEmbed(t("no_bank_account", false, "errors"), true)], components: [], files: [] }).catch(() => {});
                            if (newAmount?.frozen_date || newAmount?.frozen_reason) return modalCollector.reply({ embeds: [errorEmbed(t("frozen", false, "errors"), true)], components: [], files: [] }).catch(() => {})
                            
                            if (!newMemberAmount?.bank_money) return modalCollector.reply({ embeds: [errorEmbed(t("account_with_iban_not_found", { iban: iban }), true)], components: [], files: [] }).catch(() => {});
                            if (newMemberAmount?.frozen_date || newMemberAmount?.frozen_reason) return modalCollector.reply({ embeds: [errorEmbed(t("frozen_member", { member: `<@${newMemberAmount?.user_id}>` }, "errors"), true)], components: [], files: [] }).catch(() => {});

                            const amount = modalCollector.fields.getTextInputValue("amount") == t("all", false, "global") ? (newAmount?.bank_money ?? 0) : parseInt(modalCollector.fields.getTextInputValue("amount"));
                            if (isNaN(amount) || amount <= 0) return modalCollector.reply({ embeds: [errorEmbed(t("not_number", { number: amount }, "errors"), true)], components: [], files: [] }).catch(() => {});
                            if (amount > (newAmount?.bank_money ?? 0)) return modalCollector.reply({ embeds: [errorEmbed(t("not_enough_bank_money", { amount: separate(newAmount?.bank_money ?? 0), symbol: economySymbol }, "errors"), true)], components: [], files: [] }).catch(() => {});
                            if (amount + (newAmount?.bank_money ?? 0) >= 2147483647) return modalCollector.reply({ embeds: [errorEmbed(t("int_passing", { name: t("your_bank_account", false, "global") }, "errors"), true)], components: [], files: [] }).catch(() => {});
                            if (amount + (newMemberAmount?.bank_money ?? 0) >= 2147483647) return modalCollector.reply({ embeds: [errorEmbed(t("int_passing_member", { name: t("your_bank_account", false, "global"), member: `<@${`<@${newMemberAmount?.user_id}>`}>`, }, "errors"), true)], components: [], files: [] }).catch(() => {});

                            await client.db.addMoney(interaction.guildId, i.user.id, "bank_money", -amount);
                            await client.db.addMoney(interaction.guildId, newMemberAmount?.user_id, "bank_money", amount);

                            const idCards = [await client.db.getIDCard(interaction.guildId, i.user.id), await client.db.getIDCard(interaction.guildId, i.user.id, true)];
                            const idCardsMember = [await client.db.getIDCard(interaction.guildId, newMemberAmount?.user_id), await client.db.getIDCard(interaction.guildId, newMemberAmount?.user_id, true)];

                            const name = idCards[0] ? `${idCards[0].first_name} ${idCards[0].last_name}` : idCards[1] ? `${idCards[1].first_name} ${idCards[1].last_name}` : i.member.displayName;
                            const memberName = idCardsMember[0] ? `${idCardsMember[0].first_name} ${idCardsMember[0].last_name}` : idCardsMember[1] ? `${idCardsMember[1].first_name} ${idCardsMember[1].last_name}` : (await interaction.guild.members.fetch(newMemberAmount?.user_id))?.displayName ?? `<@${newMemberAmount?.user_id}>`;

                            await client.db.addTransactionLog(interaction.guildId, i.user.id, -amount, t("bank_transfer", { verb: lang == "fr" ? "à" : "to", name: memberName }))
                            await client.db.addTransactionLog(interaction.guildId, newMemberAmount?.user_id, amount, t("bank_transfer", { verb: lang == "fr" ? "de" : "from", name: name  }))

                            return modalCollector.update({ embeds: [successEmbed(t("payed", { amount: separate(amount), symbol: economySymbol, name: memberName }), true)], components: [], files: [] }).catch(() => {});
                        }

                        case "change-secret-code":
                        case "change-card-code": {
                            
                            const type = i.customId.split("-")[1]
                            const modalCode = Math.floor(Math.random() * 9000000000) + 1000000000
                            const modal = new ModalBuilder().setCustomId(`modal_code_${modalCode}`).setTitle(t("card_modal.title"))
                            .setComponents(
                                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("code").setLabel(t("card_modal.code")).setPlaceholder(t("card_modal.placeholder_code")).setMinLength(type == "card" ? 4 : 6).setMaxLength(type == "card" ? 4 : 6).setStyle(TextInputStyle.Short).setRequired(true)),
                                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("new_code").setLabel(t("card_modal.new_code")).setPlaceholder(t("card_modal.placeholder_new_code")).setMinLength(type == "card" ? 4 : 6).setMaxLength(type == "card" ? 4 : 6).setStyle(TextInputStyle.Short).setRequired(true))
                            )

                            await i.showModal(modal).catch(() => {})
                            const modalCollector = await i.awaitModalSubmit({ filter: ii => ii.user.id == i.member.id && ii.customId == `modal_code_${modalCode}`, time: 60000 }).catch(() => {});
                            if (!modalCollector) return;

                            const newCode = modalCollector.fields.getTextInputValue("new_code");
                            if (isNaN(parseInt(newCode))) return modalCollector.reply({ embeds: [errorEmbed(t("not_number", { number: newCode }, "errors"), true)], components: [], files: [] }).catch(() => {});
                            
                            const newBankAccount = await client.db.getBankAccount(interaction.guildId, i.user.id);
                            if (!newBankAccount) return modalCollector.reply({ embeds: [errorEmbed(t("no_bank_account", false, "errors"), true)], components: [], files: [] }).catch(() => {});
                            
                            const code = modalCollector.fields.getTextInputValue("code");
                            if (((type == "card" ? newBankAccount.card_code : newBankAccount.secret_code) ?? code) !== parseInt(code)) return modalCollector.reply({ embeds: [errorEmbed(t(`wrong_old_${type}_code`), true)], components: [], files: [] }).catch(() => {});
                            if (code == newCode) return modalCollector.reply({ embeds: [errorEmbed(t("same_code"), true)], components: [], files: [] }).catch(() => {});
                            if (newCode.toString().startsWith(0)) return modalCollector.reply({ embeds: [errorEmbed(t("code_starting_with_0"), true)], components: [], files: [] }).catch(() => {});

                            await client.db.setBankCode(interaction.guildId, i.user.id, type, newCode);

                            return modalCollector.update({ embeds: [successEmbed(t(`${type}_code_changed`), true)], components: [], files: [] }).catch(() => {});
                        }


                        case "face_id":
                        case "secret_code":
                        case "none": {

                            const code = Math.floor(Math.random() * 9000000000) + 1000000000
                            const modal = new ModalBuilder().setCustomId(`modal_code_${code}`).setTitle(t("buttons.connexion")).setComponents(new ActionRowBuilder().addComponents(
                                new TextInputBuilder().setCustomId("modal_secret_code").setLabel(t("buttons.secret_code")).setPlaceholder(t("connexion_modal.placeholder")).setMinLength(6).setMaxLength(6).setStyle(TextInputStyle.Short).setRequired(true)),
                            )

                            await i.showModal(modal).catch(() => {})
                            const modalCollector = await i.awaitModalSubmit({ filter: ii => ii.user.id == i.member.id && ii.customId == `modal_code_${code}`, time: 60000 }).catch(() => {});
                            if (!modalCollector) return;

                            const secretCode = modalCollector.fields.getTextInputValue("modal_secret_code");
                            if (isNaN(parseInt(secretCode)) || account.secret_code !== parseInt(secretCode)) return modalCollector.reply({ embeds: [errorEmbed(t("connexion_modal.wrong_secret_code"), true)], components: [], files: [] }).catch(() => {});
                            
                            const type = i.customId == "face_id" ? 1 : i.customId == "secret_code" ? 2 : 3
                            await client.db.setBankConnexionMethod(interaction.guildId, i.user.id, type);
                            
                            return modalCollector.update({ embeds: [successEmbed(t("connexion_modal.connexion_method_changed"), true)], components: [], files: [] }).catch(() => {});

                        }


                        case "unblock":
                        case "block": {

                            await client.db[`${i.customId}BankCard`](interaction.guildId, i.user.id);
                            return i.update({ embeds: [successEmbed(t(`${i.customId}ed`), true)], components: [], files: [] }).catch(() => {});

                        }


                        // Bank Account

                        case "refund":
                        case "deposit":
                        case "withdraw": {

                            const code = Math.floor(Math.random() * 9000000000) + 1000000000
                            const modal = new ModalBuilder()
                            .setCustomId(`modal_${i.customId}_${code}`)
                            .setTitle(t(`modal.title${i.customId == "refund" ? "_loans" : ""}`))
                            .setComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("amount").setLabel(t("modal.amount")).setPlaceholder(t(`modal.amount_placeholder${i.customId == "refund" ? "_loans" : ""}`)).setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(11).setRequired(false)));
    
                            await i.showModal(modal).catch(() => {})
                            const modalCollector = await i.awaitModalSubmit({ filter: (ii) => ii.user.id == i.user.id && ii.customId == `modal_${i.customId}_${code}`, time: 60000 }).catch(() => {});
                            if (!modalCollector) return i.update({ embeds: [errorEmbed(t("error_occurred", false, "errors"), true)], components: [], files: [] });
        
                            const newMemberAmount = await client.db.getMoney(interaction.guildId, member.id);
                            let loan = i.customId == "refund" ? (await client.db.getLoans(interaction.guildId, member.id))[current] : null;
                            
                            const quantity = i.customId == "deposit" ? (newMemberAmount?.cash_money ?? 0) : (newMemberAmount?.bank_money ?? 0);
                            const collectedValue = (modalCollector.fields.getTextInputValue("amount").toLowerCase());
                            let amount = collectedValue === t("all", false, "global") || !collectedValue ? quantity : parseFloat(collectedValue.replaceAll(",", "."));

                            if (!amount || isNaN(amount) || amount <= 0) return modalCollector.reply({ embeds: [errorEmbed(t("not_number", { number: amount === quantity ? quantity : collectedValue }, "errors"), true)], components: [], files: [] });
                            if (i.customId == "withdraw" ? quantity - amount < overdraftLimit : amount > quantity) return modalCollector.reply({ embeds: [errorEmbed(t("not_enough", { amount: separate(quantity), symbol: economySymbol, place: i.customId == "deposit" ? t("cash") : t("bank") }), true)], components: [], files: [] });
                            if (i.customId == "refund" && amount > (loan.amount - loan.payed)) amount = (loan.amount - loan.payed);
                            if (quantity + amount >= 2147483647) return modalCollector.reply({ embeds: [errorEmbed(t("int_passing", { name: lang == "fr" ? i.customId == "deposit" ? "votre compte" : "votre argent liquide" : i.customId == "deposit" ? "your bank account" : "your cash money" }, "errors"), true)], components: [], files: [] });
        
                            let newTransactions = loan?.transactions?.split(",") || [];
                            if (newTransactions.length >= 3) newTransactions.pop();
                            newTransactions.push(amount);
                            newTransactions = newTransactions.join(",");

                            if (i.customId == "refund") await client.db.payLoan(interaction.guildId, member.id, loan.id, amount, loan.bank_id, newTransactions, current+1, lang, amount == (loan.amount - loan.payed));
                            else {
                                if (i.customId == "withdraw") {
                                    await client.db.addMoney(interaction.guildId, member.id, "bank_money", -amount)
                                    await client.db.addMoney(interaction.guildId, interaction.member.id, "cash_money", amount);
                                } else if (i.customId == "deposit") {
                                    await client.db.addMoney(interaction.guildId, member.id, "bank_money", amount)
                                    await client.db.addMoney(interaction.guildId, interaction.member.id, "cash_money", -amount);
                                }
                                await client.db.addTransactionLog(interaction.guildId, member.id, i.customId == "withdraw" ? -amount : amount, `${lang == "fr" ? i.customId == "withdraw" ? "Retrait" : "Dépôt" : i.customId == "withdraw" ? "Withdraw" : "Deposit"}`);
                            }
                            
                            modalCollector.update({ embeds: [successEmbed(t(`${i.customId}ed`, { amount: separate(amount), symbol: economySymbol, rest: loan?.amount < amount ? t("rest", { amount: (loan?.amount - loan?.payed) - amount, symbol: economySymbol }) : "", all: loan?.payed + amount >= loan?.amount ? t("all") : "" }), true)], components: [], files: [] }).catch(() => {});
                            break;

                        }

                        case "loans": await i.update(await renderLoans(current)); break;
                        case "previous": current--; await i.update(await renderLoans(current)); break;
                        case "next": current++; await i.update(await renderLoans(current)); break;
     
                    }

                });

                collector.on("end", (collected) => {
                    return interaction.editReply({ components: [] }).catch(() => {});
                });

                break;
            }
            
            case "classement": {

                const options = await client.db.getOptions(interaction.guildId, [
                    "economy.symbol",
                    "global.city_name",
                ]);

                const type = interaction.options.getString("type", false);
                let number = interaction.options.getString("nombre");
                if (number == 'ten') number = 10;
                if (number == 'twenty') number = 20;

                let builder = "";
                let top;
                let index = 0;

                switch(type) {
                    case "bank": {
                        top = await client.db.getClassement(interaction.guildId, 3, number)

                        for (const data of top) {
                            index++;
                            builder += `${emojis(index)} - <@${data.user_id}> - \`${separate(data?.bank_money)}${economySymbol}\`\n`
                        }
                        break;
                    }
                    case "species": {
                        top = await client.db.getClassement(interaction.guildId, 2, number)

                        for (const data of top) {
                            index++;
                            builder += `${emojis(index)} - <@${data.user_id}> - \`${separate(data?.cash_money)}${economySymbol}\`\n`
                        }
                        break;
                    }
                    case "dirty": {
                        top = await client.db.getClassement(interaction.guildId, 1, number)

                        for (const data of top) {
                            index++;
                            builder += `${emojis(index)} - <@${data.user_id}> - \`${separate(data?.dirty_money)}${economySymbol}\`\n`
                        }
                        break;
                    }
                }

                let typeAsText = { "bank": t("type_top.bank"), "species": t("type_top.cash"), "dirty": t("type_top.sale") }[type];

                if (!builder) return errorEmbed(t("no_bank_account_found", { type: typeAsText }));

                const embed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle(t("embed_top.title", { city: options["global.city_name"] || interaction.guild.name }))
                    .setThumbnail(interaction.guild.iconURL())
                    .setDescription(builder)
                    .setFooter({ text: t("embed_top.footer", { type: typeAsText }), iconURL: client.user.displayAvatarURL() })
                
                interaction.reply({ embeds: [embed] }).catch(() => {});
                break;
            }
        }


        } catch (err) {
            console.error(err);

            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    }
}
