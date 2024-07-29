const { PermissionsBitField, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, UserSelectMenuBuilder, StringSelectMenuBuilder, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, time } = require("discord.js");
const { isWebUri } = require("valid-url");

const code = Math.floor(Math.random() * 9000000000) + 1000000000
module.exports = {
    category: { "en": "companies", "fr": "entreprises" },
    name: "entreprise",
    nameLocalizations: {
        "fr": "entreprise",
        "en-GB": "company",
        "en-US": "company"
    },
    description: "Crée, modifie, supprime ou affiche votre entreprise",
    descriptionLocalizations: {
        "fr": "Crée, modifie, supprime ou affiche votre entreprise",
        "en-GB": "Create, modify, delete or display your company",
        "en-US": "Create, modify, delete or display your company"
    },
    options: [
        {
            name: "créer",
            nameLocalizations: {
                "fr": "créer",
                "en-GB": "create",
                "en-US": "create"
            },
            description: "Crée ou modifie votre entreprise",
            descriptionLocalizations: {
                "fr": "Crée ou modifie votre entreprise",
                "en-GB": "Create or modify your company",
                "en-US": "Create or modify your company"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "nom",
                    nameLocalizations: {
                        "fr": "nom",
                        "en-GB": "name",
                        "en-US": "name"
                    },
                    description: "Le nom de l'entreprise",
                    descriptionLocalizations: {
                        "fr": "Le nom de l'entreprise", 
                        "en-GB": "The name of the company",
                        "en-US": "The name of the company"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "type",
                    description: "Le type d'entreprise",
                    descriptionLocalizations: {
                        "fr": "Le type d'entreprise",
                        "en-GB": "The type of company",
                        "en-US": "The type of company"
                    },
                    type: ApplicationCommandOptionType.Number,
                    required: true,
                    choices: [
                        {
                            name: "Entreprise publique",
                            nameLocalizations: {
                                "fr": "Entreprise publique",
                                "en-GB": "Public company",
                                "en-US": "Public company"
                            },
                            value: 1,
                        },
                        {
                            name: "Entreprise privée",
                            nameLocalizations: {
                                "fr": "Entreprise privée",
                                "en-GB": "Private company",
                                "en-US": "Private company"
                            },  
                            value: 2,
                        },
                        {
                            name: "Organisation",
                            nameLocalizations: {
                                "fr": "Organisation",
                                "en-GB": "Organization",
                                "en-US": "Organization"
                            },
                            value: 3,
                        },
                        {
                            name: "Gang",
                            value: 4,
                        },
                        {
                            name: "Association",
                            value: 5
                        }
                    ],
                },
                {
                    name: "nombre-max-employés",
                    nameLocalizations: {
                        "fr": "nombre-max-employés",
                        "en-GB": "max-employees-number",
                        "en-US": "max-employees-number"
                    },
                    description: "Le nombre maximal d'employés autorisés dans l'entreprise",
                    descriptionLocalizations: {
                        "fr": "Le nombre maximal d'employés autorisés dans l'entreprise",
                        "en-GB": "The maximum number of employees allowed in the company",
                        "en-US": "The maximum number of employees allowed in the company"
                    },
                    type: ApplicationCommandOptionType.Number,
                    required: false,
                    minValue: 1,
                },
                {
                    name: "couleur",
                    nameLocalizations: {
                        "fr": "couleur",
                        "en-GB": "color",
                        "en-US": "color"
                    },
                    description: "La couleur affichée sur le panel de l'entreprise",
                    descriptionLocalizations: {
                        "fr": "La couleur affichée sur le panel de l'entreprise",
                        "en-GB": "The color displayed on the company panel",
                        "en-US": "The color displayed on the company panel"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: false
                },
                {
                    name: "logo",
                    description: "Le lien de l'image du logo de l'entreprise",
                    descriptionLocalizations: {
                        "fr": "Le lien de l'image du logo de l'entreprise",
                        "en-GB": "The link to the image of the company logo",   
                        "en-US": "The link to the image of the company logo"
                    },
                    type: ApplicationCommandOptionType.Attachment,
                    required: false
                },
                {
                    name: "spécialité",
                    nameLocalizations: {
                        "fr": "spécialité",
                        "en-GB": "specialty",
                        "en-US": "specialty"
                    },
                    description: "La spécialité de l'entreprise", 
                    descriptionLocalizations: {
                        "fr": "La spécialité de l'entreprise",
                        "en-GB": "The specialty of the company",
                        "en-US": "The specialty of the company"
                    },
                    type: ApplicationCommandOptionType.String,
                    required: false,
                    choices: [
                        { name: "🚔 Police", value: "police" },
                        { name: "🏥 EMS", value: "ems" },
                        { name: "🏦 Banque", nameLocalizations: { "fr": "💰 Banque", "en-GB": "💰 Bank", "en-US": "💰 Bank" }, value: "bank" },
                        { name: "🏠 Agence Immobilière", nameLocalizations: { "fr": "🏠 Agence Immobilière", "en-GB": "🏠 Real Estate Agency", "en-US": "🏠 Real Estate Agency" }, value: "realestate" }
                    ]
                },
            ],
        },
        {
            name: "supprimer",
            nameLocalizations: {
                "fr": "supprimer",
                "en-GB": "delete",
                "en-US": "delete"
            },
            description: "Supprime votre entreprise",
            descriptionLocalizations: {
                "fr": "Supprime votre entreprise",
                "en-GB": "Delete your company",
                "en-US": "Delete your company"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: "nom-entreprise",
                nameLocalizations: {
                    "fr": "nom-entreprise",
                    "en-GB": "company-name",
                    "en-US": "company-name"
                },
                description: "Nom de l'entreprise à supprimer",
                descriptionLocalizations: {
                    "fr": "Nom de l'entreprise à supprimer",
                    "en-GB": "Name of the company to delete",
                    "en-US": "Name of the company to delete"
                },
                type: ApplicationCommandOptionType.String,
                required: true,
                autocomplete: true,
            }]
        },
        {
            name: "afficher",
            nameLocalizations: {
                "fr": "afficher",
                "en-GB": "display",
                "en-US": "display"
            },
            description: "Affiche votre entreprise",
            descriptionLocalizations: {
                "fr": "Affiche votre entreprise",   
                "en-GB": "Display your company",
                "en-US": "Display your company"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "nom-entreprise",
                    nameLocalizations: {
                        "fr": "nom-entreprise",
                        "en-GB": "company-name",
                        "en-US": "company-name" 
                    },
                    description: "Nom de l'entreprise publique à afficher",
                    descriptionLocalizations: {
                        "fr": "Nom de l'entreprise publique à afficher",
                        "en-GB": "Name of the public company to display",
                        "en-US": "Name of the public company to display"    
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                    minLength: 1
                }
            ]
        }
    ],
    premium: true,
    run: async(client, interaction, { t, errorEmbed, successEmbed, lang, economySymbol, overdraftLimit, isPremium, isBeta, separate }) => {

        try {

        const method = interaction.options.getSubcommand();
        const companyTypes = [
            {
                name: t("company_type.public"),
                value: 1,
            },
            {
                name: t("company_type.private"),
                value: 2,
            },
            {
                name: t("company_type.organization"),
                value: 3,
            },
            {
                name: t("company_type.gang"),
                value: 4,
            },
            {
                name: t("company_type.association"),
                value: 5,
            }
        ];



        switch (method) {
            //! CREER

            case "créer": {

                if (!(await client.functions.permissions.configModerator(interaction, "entreprise créer"))) return;
                
                const findCompany = await client.db.findCompany(interaction.guildId, interaction.options.getString("nom"))
                if (findCompany) return errorEmbed(t("company_already_exists", { name: interaction.options.getString("nom") }))

                const logo = interaction.options.getAttachment("logo");
                let logoURL = null;
                //if (logo) await imgurUploader(logo.url, { title: logo.name }).then(data => { logoURL = data?.link });
                
                const companyData = {
                    name: interaction.options.getString("nom"),
                    type: interaction.options.getNumber("type"),
                    speciality: interaction.options.getString("spécialité") ?? null,
                    max_employees: interaction.options.getNumber("nombre-max-employés") ?? null,
                    color: interaction.options.getString("couleur") ?? "#2c2f33", 
                    logo: logoURL ?? null,
                };

                
                if (companyData.name.length > 50) return errorEmbed(t("name_limit")); // Valide company name
                if (companyData?.max_employees <= 0) return errorEmbed(t("no_zero_employees")); // Validate max employees

                // Validate color
                if (interaction.options.getString("couleur")) {
                    const resolvedColor = client.functions.other.isHexColor(companyData.color.toLowerCase());
                    if (!resolvedColor) return errorEmbed(t("color_undefined", { color: interaction.options.getString("couleur"), link: client.constants.links.colorPicker }, "errors"));
                    else companyData.color = resolvedColor;
                }

                if (interaction.options.getAttachment("logo") && !isWebUri(companyData.logo)) companyData.logo = null;
            
                await client.db.createCompany(interaction.guildId, interaction.user.id, companyData);

                const unknown = t("premium_status.unknown", false, "global");
                const type = companyTypes.find(({ value }) => value === companyData.type)?.name ?? unknown;

                const embed = new EmbedBuilder()
                    .setColor(companyData.color)
                    .setThumbnail(companyData?.logo ?? "https://image.freepik.com/vecteurs-libre/presentation-entreprise-flat-illustration_1212-78.jpg")
                    .setTitle(t("embed_panel.title", { company: companyData.name }))
                    .addFields([
                        { name: t("embed_panel.fields.boss"), value: interaction.user.toString(), inline: true },
                        { name: t("embed_panel.fields.staff.have_staff",  { maxstaff: companyData?.max_employees ? `/${companyData?.max_employees}` : "" }), value: t("embed_panel.fields.staff.dont_staff"), inline: true },
                        { name: t("embed_panel.fields.type"), value: type },
                        { name: t("embed_panel.fields.datecreation"), value: time(new Date(), "d") },
                        { name: t("embed_panel.fields.speciality"), value: companyData?.speciality ? t(`embed_panel.fields.specialities.${companyData?.speciality}`) : t("embed_panel.fields.speciality.none") },
                    ]);

                await interaction.reply({ embeds: [embed] }).catch(() => {})
                
                const logsEmbed = new EmbedBuilder()
                    .setTitle(t("embed_companycreate.title"))
                    .addFields([
                        { name: t("embed_companycreate.fields.boss"), value: `${interaction.user.toString()} (${interaction.user.id})` },
                        { name: t("embed_companycreate.fields.name"), value: companyData.name },
                        { name: t("embed_companycreate.fields.type"), value: type }
                    ])
                    .setThumbnail(companyData.logo ?? "https://image.freepik.com/vecteurs-libre/presentation-entreprise-flat-illustration_1212-78.jpg");

                client.functions.logs.send(interaction, logsEmbed, "creation");
                break;
            }

            //! SUPPRIMER

            case "supprimer": {

                if (!(await client.functions.permissions.configModerator(interaction, "entreprise supprimer"))) return;
                if (!(interaction.options.getString("nom-entreprise") ?? `${code}`).startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == "fr" ? "nom-entreprise" : "company-name" }, "errors"));

                const companyId = interaction.options.getString("nom-entreprise").split("&#46;")[1]
                const company = await client.db.getCompany(interaction.guildId, companyId)
                const validation = await client.functions.userinput.askValidation(interaction, t("question_delete_company", { name: company.name }));
                if (!validation) return;
                
                await client.db.deleteCompany(company.id);
                await validation.update({ embeds: [successEmbed(t("validation_delete", { name: company.name }), true)], components: [] }).catch(() => {});

                const logsEmbed = new EmbedBuilder()
                    .setTitle(t("embed_delete_company.title"))
                    .addFields([ { name: t("embed_delete_company.field_boss"), value: `${interaction.user.toString()} (${interaction.user.id})` } ])
                    .setThumbnail(interaction.user.displayAvatarURL());

                client.functions.logs.send(interaction, logsEmbed, "deletion");

                break;
            }

            //! AFFICHER (pannel ou coffre)
            case "afficher": {

                if (!(interaction.options.getString("nom-entreprise") ?? `${code}`).startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == "fr" ? "nom-entreprise" : "company-name" }, "errors"));
                
                await interaction.deferReply().catch(() => {});
                
                const companyId = interaction.options.getString("nom-entreprise").split("&#46;")[1];
                const company = await client.db.getCompany(interaction.guildId, companyId);
                if (!company) return errorEmbed(t("no_company_found", { companyName: company.name }), false, true, "editReply");

                let { id, name, type, max_employees, creation_date, color, logo, money, speciality } = company;
                const resolvedColor = client.functions.other.isHexColor(color.toLowerCase());
                color = resolvedColor ?? "#2c2f33";

                const employees = await client.db.getCompanyEmployees(id);
                let charEmployees = "", displayEmployees = 0, limitDisplayEmployees = false;

                for(const employee of employees) {
                    if (employee.owner == 1) continue;
                    
                    const newChar = `${employee?.police_number ? `**[${`${employee.police_number}`.length == 1 ? "0" : ""}${employee.police_number}]** ` : ""}<@${employee.user_id}>\n`
                    if (charEmployees.length + newChar.length >= 1008) {
                        limitDisplayEmployees = true;
                        break;
                    };
                    
                    charEmployees += newChar;
                    displayEmployees++;
                }

                const companyType = companyTypes.find(({ value }) => value == type)?.name ?? t("unknown");

                const rows = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("out").setLabel(t("buttons.out")).setStyle(ButtonStyle.Primary))
                if (![t("company_type.organization"), t("company_type.gang")].includes(companyType)) rows.addComponents(new ButtonBuilder().setCustomId("account").setLabel(t("buttons.account")).setStyle(ButtonStyle.Secondary))
                rows.addComponents(
                    new ButtonBuilder().setCustomId("safe").setLabel(t("buttons.safe")).setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("desk").setLabel(t("buttons.desk")).setStyle(ButtonStyle.Secondary)
                )

                const ownersAmount = (employees.filter(c => c.owner == 1).length)
                const employeesAmount = `${employees.length == 0 ? 0 : employees.length - ownersAmount}`
                const companyEmbed = new EmbedBuilder()
                    .setColor(color ?? "#2c2f33")
                    .setThumbnail(logo ?? "https://image.freepik.com/vecteurs-libre/presentation-entreprise-flat-illustration_1212-78.jpg")
                    .setTitle(t("embed_company.title", { company: name }))
                    .addFields([
                        { name: t("embed_company.fields.boss"), value: `${(employees.filter(c => c.owner == 1)).length > 0 ? employees.filter(c => c.owner == 1).map(c => `<@${c.user_id}>`).join("\n") : t("embed_company.fields.boss.no_boss")}`, inline: true },
                        { name: t("embed_company.fields.staff.have_staff", { staff: `${employeesAmount}${max_employees ? `/${max_employees}` : ""}` }), value: employees.length > ownersAmount ? limitDisplayEmployees ? `${charEmployees}${t("embed_company.fields.staff.others", { amount: (employees.length - ownersAmount) - displayEmployees, s: (employees.length - ownersAmount) - displayEmployees > 1 ? "s" : ""  })}` : charEmployees : t("embed_company.fields.staff.dont_staff"), inline: true },
                        { name: t("embed_company.fields.type"), value: companyType },
                        { name: t("embed_company.fields.datecreation"), value: time(creation_date, "d") },
                        { name: t("embed_panel.fields.speciality"), value: speciality ? t(`embed_panel.fields.specialities.${speciality}`) : t("embed_panel.fields.speciality.none") },
                    ])

                const secondRows = async(index, member, company, customId = null) => {

                    const employees = await client.db.getCompanyEmployees(id);
                    switch(index) {

                        case "access_second":
                        case "access": {
                            const rows = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                .setCustomId(index == "access_second" ? "access" : "desk")
                                .setLabel(t("buttons.back"))
                                .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                .setCustomId(index.endsWith("second") ? "add" : "account_access")
                                .setLabel(index.endsWith("second") ? t("buttons.add") : t("buttons.account"))
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(index.endsWith("second") ? (employees.filter(e => e[`${customId.replace("_access", "")}_access`] == 0)).length >= employees.length : employees.length - 1 <= 0),
                                new ButtonBuilder()
                                .setCustomId(index.endsWith("second") ? "remove" : "safe_access")
                                .setLabel(index.endsWith("second") ? t("buttons.remove") : t("buttons.safe"))
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(index.endsWith("second") ? (employees.filter(e => e[`${customId.replace("_access", "")}_access`] == 1)).length - 1 <= 0 : employees.length - 1 <= 0),
                            )

                            if (index == "access") rows.addComponents(
                                new ButtonBuilder().setCustomId("desk_access").setLabel(t("buttons.desk")).setStyle(ButtonStyle.Secondary).setDisabled(index.endsWith("second") ? ((employees.filter(e => e[`${customId.replace("_access", "")}_access`] == 0)).length - 1) <= 0 : employees.length - 1 <= 0),
                            )

                            return rows
                        }

                        case "desk": {
                            const deskRows = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                .setCustomId("panel")
                                .setLabel(t("buttons.panel"))
                                .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                .setCustomId("recruit")
                                .setLabel(t("buttons.recruit"))
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(company?.max_employees ? (employees.length - 1) >= company.max_employees : false),
                                new ButtonBuilder()
                                .setCustomId("fire")
                                .setLabel(t("buttons.fire"))
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled((employees.length - 1) <= 0),
                            	new ButtonBuilder()
								.setCustomId("access")
								.setLabel(t("buttons.access"))
								.setStyle(ButtonStyle.Secondary)
								.setDisabled(!employees.find(({ user_id, owner }) => user_id == interaction.user.id && owner == 1) || (employees.length - 1) <= 0)
							)

                            return deskRows
                        }

                        default: {
                            return new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId("panel")
                                    .setLabel(t("buttons.panel"))
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId("deposit")
                                    .setLabel(t("buttons.deposit"))
                                    .setStyle(ButtonStyle.Secondary)
                                    .setDisabled(index == "account" ? (member?.bank_money ?? 0) <= 0 : (member?.length ?? 0) <= 0),
                                new ButtonBuilder()
                                    .setCustomId("withdraw")
                                    .setLabel(t("buttons.withdraw"))
                                    .setStyle(ButtonStyle.Secondary)
                                    .setDisabled(index == "account" ? (company ?? 0) <= 0 : (company?.length ?? 0) <= 0),
                            );
                        }
                    }
                }                
                
                const accountEmbed = async() => {

                    const company = await client.db.getCompany(interaction.guildId, id)
                    const transactions = await client.db.getTransactions(interaction.guildId, company?.id);
                    const memberAccount = await client.db.getBankAccount(interaction.guildId, interaction.user.id);

                    const accountEmbed = new EmbedBuilder()
                        .setColor(company?.color ?? "Default")
                        .setThumbnail(company?.logo ?? "https://image.freepik.com/vecteurs-libre/presentation-entreprise-flat-illustration_1212-78.jpg")
                        .setTitle(t("embed_company.title", { company: company?.name }))
                        .addFields([
                            { name: t("embed_company.fields.account"), value: `${separate(company?.money)}${economySymbol}` },
                            { name: t("embed_company.fields.last_transactions"), value: transactions.length > 0 ? `${transactions.map(t => `${`${t.amount}`.startsWith("-") ? `\\-` : "+"} ${`${separate(t.amount)}`.replace("-", "")}${economySymbol} (${t.reason})`).join("\n")}`.substring(0, 1024) : t("embed_company.fields.no_transactions") }
                        ])

                    return { embeds: [accountEmbed], components: [await secondRows(index, memberAccount, money)] }

                }

                const safeEmbed = async(customId, page, pageSM, displaySM = false) => {

                    const display = [{ name: `nidev&#46;${t("words.safe", false, "global")}&#46;safe`, quantity: 0, type: "safe" }];

                    const memberInventory = (await client.db.getMemberItems(interaction.guildId, interaction.member.id)).map(i => ({ name: i.name, type: "items", quantity: i.quantity, hidden_quantity: i.hidden_quantity, id: i.id }) )
                    const memberDrugs = []
                    const { bank_money, hidden_cash_money, hidden_dirty_money, ...memberMoney } = await client.db.getMoney(interaction.guildId, interaction.member.id)
                    for (const drug of (await client.db.getMemberDrugs(interaction.guildId, interaction.member.id))) {
                        ["untreated", "treated"].forEach(type => { if (drug[type] > 0) memberDrugs.push({ name: t(`drugs.${type}`, { drugName: drug.name }, "global"), type: `drugs&#46;${type}`, quantity: drug[type], hidden_quantity: drug[`hidden_${type}`], id: drug.drug_id })  })
                    }
                    
                    const memberAll = [...Object.keys(memberMoney).filter(k => memberMoney?.[k] > 0).map(k => ({ name: t(k), type: k, quantity: memberMoney[k], id: k })), ...memberDrugs, ...memberInventory, ]

                    const safe = [];
                    const { safe_money, dirty_money } = await client.db.getCompany(interaction.guildId, id)
                    const companyInventory = (await client.db.getCompanyInventory(id)).filter(i => i.id);
                    const companyDrugs = await client.db.getCompanyInventory(id, true)
                    for (const drug of companyDrugs) ["untreated", "treated"].forEach(type => { if (drug[type] > 0) safe.push({ name: t(`drugs.${type}`, { drugName: drug.name }, "global"), type: `drugs&#46;${type}`, quantity: drug[type], id: drug.drug_id })  })
                    
                    if (safe_money > 0) safe.push({ name: t("cash_money"), type: "cash_money", quantity: safe_money, id: "cash_money" })
                    if (dirty_money > 0) safe.push({ name: t("dirty_money"), type: "dirty_money", quantity: dirty_money, id: "dirty_money" })
                    if (companyInventory.length > 0) safe.push(...(companyInventory.map(i => ({ name: i.name, type: "items", quantity: i.quantity, id: i.item_id }) )))

                    const safeChunks = client.functions.other.chunkArray(safe, 7)
                    let chunks = client.functions.other.chunkArray(customId.includes("deposit") ? memberAll : safe, customId.includes("deposit") ? 22 : 7)
                    let currentPage = customId.includes("deposit") ? pageSM : page

                    if (!chunks?.[currentPage] && chunks?.[currentPage - 1]) {
                        currentPage--; pageSM--; page--;
                    }

                    if (chunks.length > 1) {
                        if (currentPage !== 0) display.push({ name: `nidev&#46;${t("words.previous", false, "global")}&#46;previous`, quantity: 0, type: "larrow" })
                        if (currentPage + 1 !== chunks.length) display.push({ name: `nidev&#46;${t("words.next", false, "global")}&#46;next`, quantity: 0, type: "rarrow" })
                    }

                    if (!chunks || !chunks[0] || !chunks.length) display.splice(0, (customId.includes("deposit") ? memberAll.length : safe.length) + display.length)
                    else display.push(...(chunks?.[currentPage] ?? chunks?.[0]).map(i => ({ name: i.name, type: i.type, quantity: i.quantity, id: i.id })))

                    const embed = new EmbedBuilder()
                    .setColor(color ?? "Default")
                    .setThumbnail(logo ?? "https://image.freepik.com/vecteurs-libre/presentation-entreprise-flat-illustration_1212-78.jpg")
                    .setTitle(t("safe_modal.title", { company: name }))
                    .setDescription(!safeChunks[safeChunks.length == 1 ? 0 : page] ? t("no_item_company") : safeChunks[safeChunks.length == 1 ? 0 : page].map(i => `[${i.quantity}${i.type.endsWith("_money") ? economySymbol : i.type.startsWith("drugs") ? "g" : ""}] ・ ${i.name}`).join("\n"))

                    if (displaySM) {
                        if (display.length > 0) {
                            var sm = new ActionRowBuilder().addComponents(
                                new StringSelectMenuBuilder()
                                .setCustomId(customId.includes("sm_") ? customId : `sm_${customId}`)
                                .setPlaceholder(t("safe_modal.select_placeholder"))
                                .addOptions(
                                    display.map(item => ({ emoji: client.constants.emojis[item.type.startsWith("drugs") ? "drugs" : item.type], label: `${item.name.startsWith("nidev&#46;") ? item.name.split("&#46;")[1] : item.name}${item.name.startsWith("nidev&#46;") ? "" : ` (${item.type == "items" ? "x" : ""}${item.quantity}${item.type.endsWith("_money") ? economySymbol : item.type.startsWith("drugs") ? "g" : ""})`}`, value: item.type.endsWith("_money") ? `${item.type}&#46;${item.name}&#46;${item.quantity}` : `${item.type}&#46;${item.id}&#46;${item.name}&#46;${item.quantity}` }))
                                )
                            )
                        } else displaySM = false
                        
                    }
                    
                    if (safeChunks.length > 1) {
                    
                        embed.setFooter({ text: `${page + 1}/${safeChunks.length}` });
                        var changeEmbedRow = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                            .setStyle(ButtonStyle.Secondary)
                            .setCustomId(`previous`)
                            .setEmoji("◀")
                            .setDisabled(page === 0),
                            new ButtonBuilder()
                            .setStyle(ButtonStyle.Secondary)
                            .setCustomId(`next`)
                            .setEmoji("▶")
                            .setDisabled(page + 1 === safeChunks.length)
                        );
                    
                    }

                    return {
                        embeds: [embed],
                        components: displaySM ? [sm] : safeChunks.length > 1 ? [await secondRows(index, memberAll, safe, customId), changeEmbedRow] : [await secondRows(index, memberAll, safe, customId)],
                    };
                }

                const deskEmbed = async(customId, current, employees, goDesk = false) => {

                    const embed = new EmbedBuilder()
                    .setColor(color ?? "Default")
                    .setThumbnail(logo ?? "https://image.freepik.com/vecteurs-libre/presentation-entreprise-flat-illustration_1212-78.jpg")
                    .setTitle(t("buttons.desk"))
                    .setDescription(t(`embed_desk.${goDesk ? "description" : customId.replace("sm_", "")}`, { amount: employees.length }))
                    
                    const sm = new ActionRowBuilder()
                    if (customId.includes("recruit")) sm.addComponents(new UserSelectMenuBuilder().setCustomId(customId.includes("sm_") ? customId : `sm_${customId}`).setPlaceholder(t("recruit_placeholder")))
                    else if (customId.includes("fire") || customId.includes("give")) {

                        const options = [{ label: t("buttons.desk"), value: "nidev&#46;desk", emoji: client.constants.emojis.desk }]
                        const chunks = client.functions.other.chunkArray(employees, 22);
                        if (!chunks[0] || !chunks || !chunks.length) return { embeds: [embed], components: [await secondRows("desk")] }

                        if (chunks.length > 1) {
                            if (current !== 0) options.push({ label: t("words.previous", false, "global"), value: `nidev&#46;previous`, emoji: client.constants.emojis.larrow })
                            if (current + 1 !== chunks.length) options.push({ label: t("words.next", false, "global"), value: `nidev&#46;next`, emoji: client.constants.emojis.rarrow })
                        }
                        
                        options.push(...(await Promise.all(chunks[current].map(async e => {
                            const idCards = [await client.db.getIDCard(interaction.guildId, e.user_id), await client.db.getIDCard(interaction.guildId, e.user_id, true)]
                            const name = idCards[0] ? `${idCards[0].first_name} ${idCards[0].last_name}` : idCards[1] ? `${idCards[1].first_name} ${idCards[1].last_name}` : (await interaction.guild.members.fetch(e.user_id))?.displayName ?? t("unkown")
                            return { label: name, value: `${e.user_id}.${name}`, emoji: "👤" }
                        }
                        ))))
                        
                        sm.addComponents(new StringSelectMenuBuilder().setCustomId(customId.includes("sm_") ? customId : `sm_${customId}`).setPlaceholder(t(`${customId.replace("sm_", "")}_placeholder`)).addOptions(options))

                    }

                    return {
                        embeds: [embed],
                        components: goDesk ? [await secondRows("desk", null, company, customId)] : [sm],
                    }

                }

                const accessEmbed = async(customId, current, employees, goAccess = false) => {

                    const company = await client.db.getCompany(interaction.guildId, id)
                    const embed = new EmbedBuilder()
                    .setColor(color ?? "Default")
                    .setThumbnail(logo ?? "https://image.freepik.com/vecteurs-libre/presentation-entreprise-flat-illustration_1212-78.jpg")
                    .setTitle(t("buttons.access"))
                    let rows;
                    
                    if (customId.includes("back") || customId == "access") embed.setDescription(t(`embed_access.description`, { amount: employees.length }))
                    else {
                        const chunksAccessEmployees = client.functions.other.chunkArray(employees.sort((a, b) => a.owner == 1 ? -1 : b.owner == 1 ? 1 : 0).filter(e => e[index] == 1), 5);
                        embed.addFields([{ name: t(`buttons.${index.replace("_access", "")}`), value: chunksAccessEmployees?.[current]?.length > 0 ? `${chunksAccessEmployees[current].map(e => `- <@${e.user_id}>`).join("\n")}`.substring(0, 1024) : t("no_one", { place: t(`buttons.${index.replace("_access", "")}`).toLowerCase() }) }])
                        if (chunksAccessEmployees?.length > 1) {
                            rows = new ActionRowBuilder().addComponents(
                                new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`previous-access`).setEmoji("◀").setDisabled(current == 0),
                                new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`next-access`).setEmoji("▶").setDisabled(current + 1 == chunksAccessEmployees.length)
                            )
                        }
                    }

                    const sm = new ActionRowBuilder()
                    if (["add", "remove"].includes(customId) || customId.includes("sm_")) {

                        const options = [{ label: t("buttons.access"), value: "nidev&#46;access", emoji: client.constants.emojis.access }]
                        const chunks = client.functions.other.chunkArray(employees.filter(e => e.owner == 0 && e[index] == (customId.includes("add") ? 0 : 1)), 5);
                        if (!chunks[0] || !chunks || !chunks.length) return { embeds: [embed], components: [await secondRows("access_second", null, company, customId)] }

                        if (chunks.length > 1) {
                            if (current !== 0) options.push({ label: t("words.previous", false, "global"), value: `nidev&#46;previous`, emoji: client.constants.emojis.larrow })
                            if (current + 1 !== chunks.length) options.push({ label: t("words.next", false, "global"), value: `nidev&#46;next`, emoji: client.constants.emojis.rarrow })
                        }

                        options.push(...(await Promise.all(chunks[current].map(async e => {
                            await interaction.guild.members.fetch();
                            const idCards = [await client.db.getIDCard(interaction.guildId, e.user_id), await client.db.getIDCard(interaction.guildId, e.user_id, true)]
                            const name = idCards[0] ? `${idCards[0].first_name} ${idCards[0].last_name}` : idCards[1] ? `${idCards[1].first_name} ${idCards[1].last_name}` : (interaction.guild.members.cache.get(e.user_id))?.displayName ?? t("unkown")
                            return { label: name, value: `${e.user_id}.${name}`, emoji: "👤" }
                        }
                        ))))
                        
                        sm.addComponents(new StringSelectMenuBuilder().setCustomId(`sm_${customId.replace("sm_", "")}`).setPlaceholder(t(`embed_access.${customId.replace("sm_", "")}_placeholder`, { place: t(`buttons.${index.replace("_access", "")}`).toLowerCase() })).addOptions(options))

                    }
                    
                    return {
                        embeds: [embed],
                        components: goAccess ? [await secondRows("access", null, company, customId)] : ["safe_access", "account_access", "desk_access"].includes(customId) ? (rows ? [await secondRows("access_second", null, company, customId), rows] : [await secondRows("access_second", null, company, customId)]) : [sm],
                    }

                }
                
                const message = await interaction.editReply({ embeds: [companyEmbed], components: [rows] })
                if (!message) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");

                const collector = await message.createMessageComponentCollector({ filter: (i) => i.user.id == interaction.user.id, time: 240000 });
                if (!collector) return;

                let current = 0, currentSM = 0, currentDesk = 0, currentAccess = 0, currentSMAccess = 0, index;
                collector.on("collect", async (i) => {

                    switch(i.customId) {

                        // GO OUT

                        case "out": return collector.stop();

                        // PANNEL

                        case "panel": return i.update({ embeds: [companyEmbed], components: [rows] });
                        

                        // ACCOUNT

                        case "account": {

                            index = "account";
                            const newEmployees = await client.db.getCompanyEmployees(id);
                            if (newEmployees.filter(({ user_id, account_access, owner }) => user_id == i.user.id && (account_access == 1 || owner == 1))?.length <= 0 && !i.member.permissions.has(PermissionsBitField.Flags.Administrator)) return i.reply({ embeds: [errorEmbed(t("no_access"), true)], components: [], ephemeral: true }).catch(() => {});

                            await i.update(await accountEmbed()).catch(() => {});
                            break;
                        }

                        
                        // DESK
                        case "fire":
                        case "recruit":
                        case "access":
                        case "desk": {
                            
                            index = i.customId == "access" ? "access" : "desk";

                            const newEmployees = await client.db.getCompanyEmployees(id);
                            if ((newEmployees.filter(({ user_id, desk_access, owner }) => user_id == i.user.id && (desk_access == 1 || owner == 1)))?.length <= 0 && !i.member.permissions.has(PermissionsBitField.Flags.Administrator)) return i.reply({ embeds: [errorEmbed(t(i.customId == "access" ? "not_owner" : "no_access"), true)], components: [], ephemeral: true }).catch(() => {});
                            
                            switch(i.customId) {
                                case "access": return i.update(await accessEmbed(i.customId, currentAccess, newEmployees, true)).catch(() => {});
                                case "desk": return i.update(await deskEmbed(i.customId, currentDesk, newEmployees, true)).catch(() => {});
                                default: return i.update(await deskEmbed(i.customId, currentDesk, newEmployees.filter(c => c.owner == 0))).catch(() => {});
                            }

                        }

                        case "previous-access": currentAccess--; return i.update(await accessEmbed(index, currentAccess, employees)).catch(() => {});
                        case "next-access": currentAccess++; return i.update(await accessEmbed(index, currentAccess, employees)).catch(() => {});

                        case "safe_access":
                        case "account_access":
                        case "desk_access":
                        case "add":
                        case "remove":
                        case "sm_add":
                        case "sm_remove": {

                            const currentEmployees = await client.db.getCompanyEmployees(id);
                            
                            if (i.customId.endsWith("_access")) index = i.customId;
                            else if (i.customId.startsWith("sm_")) {
                                const value = i.values[0].split("&#46;")
                                if (value[0].startsWith("nidev")) {
                                    if (value[1].includes("next")) currentSMAccess++;
                                    if (value[1].includes("previous")) currentSMAccess--;
                                    else if (value[1] == "access") return i.update(await accessEmbed(index, currentSMAccess, currentEmployees))
                                    
                                    await i.update(await accessEmbed(i.customId, currentSMAccess, currentEmployees))
                                    break;
                                }

                                if (currentEmployees.find(({ user_id, owner }) => user_id == value[0] && owner == 1)) return i.reply({ embeds: [errorEmbed(t("cant_remove_access_for_boss"), true)], components: [], ephemeral: true }).catch(() => {});
                                await client.db[i.customId.includes("add") ? "giveAccess" : "removeAccess"](id, value[0], index);
                            }
                            
                            const newEmployees = await client.db.getCompanyEmployees(id);
                            await i.update(await accessEmbed(i.customId, currentAccess, newEmployees))
                            break;

                        }

                        case "sm_recruit":
                        case "sm_fire": {

                            const newEmployees = await client.db.getCompanyEmployees(id);
                            const value = i.values[0].split("&#46;")
                            if (value[0].startsWith("nidev")) {
                                if (value[1].includes("next")) currentDesk++;
                                if (value[1].includes("previous")) currentDesk--;
                                else if (value[1] == "desk") return i.update(await deskEmbed(i.customId, currentDesk, newEmployees, true))
                                
                                await i.update(await deskEmbed(i.customId, currentDesk, newEmployees.filter(c => c.owner == 0)))
                                break;
                            }

                            const memberId = value[0].split(".")[0];
                            let name = `<@${memberId}>`
                            
                            const idCards = [await client.db.getIDCard(interaction.guildId, memberId), await client.db.getIDCard(interaction.guildId, memberId, true)]
                            if (idCards[0]) name = `**${idCards[0].first_name} ${idCards[0].last_name}** *(<@${memberId}>)*`
                            if (idCards[1]) name = `**${idCards[1].first_name} ${idCards[1].last_name}** *(<@${memberId}>)*`
                            
                            // if (memberId == i.user.id) return i.reply({ embeds: [errorEmbed(t(`cant_${i.customId.replace("sm_", "")}_yourself`), true)], components: [], ephemeral: true })
                            if (i.customId == "sm_recruit" && newEmployees.find(e => e.user_id == memberId)) return i.reply({ embeds: [errorEmbed(t("already_in_company_member", { member: name }), true)], components: [], ephemeral: true }).catch(() => {})
                            
                            if (company.speciality == "police" && i.customId == "sm_recruit") {

                                const code = Math.floor(Math.random() * 9000000000) + 1000000000
                                const modal = new ModalBuilder()
                                .setCustomId(`sm_recruit_police_${code}`)
                                .setTitle(t("police_modal.title"))
                                .setComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("police_number").setLabel(t("police_modal.police_number")).setPlaceholder(t("police_modal.placeholder")).setRequired(true).setStyle(TextInputStyle.Short)))

                                await i.showModal(modal).catch(() => {})
                                const modalCollector = await i.awaitModalSubmit({ filter: (i) => i.user.id == interaction.user.id && i.customId == `sm_recruit_police_${code}`, time: 30000 });
                                if (!modalCollector) return;

                                const policeNumber = modalCollector.fields.getTextInputValue("police_number");
                                const parsedPoliceNumber = parseInt(policeNumber);
                                if (isNaN(parsedPoliceNumber) || parsedPoliceNumber <= 0) return modalCollector.reply({ embeds: [errorEmbed(t("invalid_police_number"), true)], components: [] }).catch(() => {});

                                await client.db.recruitMemberCompany(interaction.guildId, memberId, id, policeNumber);
                                return modalCollector.update({ embeds: [successEmbed(t("recruit", { member: name }), true)], components: [] })

                            }

                            await client.db[`${i.customId.replace("sm_", "")}MemberCompany`](interaction.guildId, memberId, id);
                            await i.update({ embeds: [successEmbed(t(i.customId.replace("sm_", ""), { member: name }), true)], components: [] }).catch(() => {});
                            
                            break;

                        }

                        // SAFE

                        case "previous":
                        case "next":
                        case "safe": {

                            index = "safe";
                            const newEmployees = await client.db.getCompanyEmployees(id);
                            if ((newEmployees.filter(({ user_id, safe_access, owner }) => user_id == i.user.id && (safe_access == 1 || owner == 1)))?.length <= 0 && !i.member.permissions.has(PermissionsBitField.Flags.Administrator)) return i.reply({ embeds: [errorEmbed(t("no_access"), true)], components: [], ephemeral: true }).catch(() => {});

                            const _render = await safeEmbed(i.customId, 0, 0);

                            switch(i.customId) {

                                case "safe": {
                                    const message = await i.update({ embeds: _render.embeds, components: _render.components, fetchReply: true }).catch(() => {});
                                    if (!message) return; // interaction isn't edited && only one page to display
                                    break;
                                }

                                case `previous`: {
                                    current--;
                                    await i.update(await safeEmbed(i.customId, current, currentSM)).catch(() => {});
                                    break;
                                }
        
                                case `next`: {
                                    current++;
                                    await i.update(await safeEmbed(i.customId, current, currentSM)).catch(() => {});
                                    break;
                                }
                                
                            }
                            
                            break;
                            
                        }
                        
                        // DEPOSIT & WITHDRAW IN SAFE OR ACCOUNT

                        case "deposit":
                        case "withdraw": {

                            if (index == "safe") return i.update(await safeEmbed(i.customId, current, currentSM, true)).catch(() => {});
                            else {

                                const code = Math.floor(Math.random() * 9000000000) + 1000000000
                                const modal = new ModalBuilder()
                                .setCustomId(`modal_companies_${code}`)
                                .setTitle(t("safe_modal.title"))
                                .setComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("amount").setLabel(t("account_modal.amount")).setPlaceholder(t("account_modal.amount_placeholder")).setMinLength(1).setStyle(TextInputStyle.Short).setRequired(false)));
                                
                                await i.showModal(modal).catch(() => {});
                                const modalCollector = await i.awaitModalSubmit({ filter: ii => ii.user.id === i.user.id && ii.customId == `modal_companies_${code}`, time: 60000 })
                                if (!modalCollector) return;

                                const company = await client.db.getCompany(interaction.guildId, companyId);
                                if (!company) return modalCollector.reply({ embeds: [errorEmbed(t("no_company", false, "errors"), true)], components: [], ephemeral: true }).catch(() => {})

                                const userAccount = await client.db.getBankAccount(interaction.guildId, i.user.id);
                                if (userAccount?.blocked == 1) return modalCollector.reply({ embeds: [errorEmbed(t("blocked", false, "errors"), true)], components: [], ephemeral: true }).catch(() => {});
                                if (userAccount?.frozen_date || userAccount?.frozen_reason) return modalCollector.reply({ embeds: [errorEmbed(t("frozen", false, "errors"), true)], components: [], ephemeral: true }).catch(() => {});
                                if (!userAccount || userAccount.bank_money == null || isNaN(userAccount.bank_money)) return modalCollector.reply({ embeds: [errorEmbed(t("no_bank_account", false, "errors"), true)], components: [], ephemeral: true }).catch(() => {});
                                
                                const quantity = i.customId == "withdraw" ? company.money : userAccount.bank_money;
                                const getModalAmount = modalCollector.fields.getTextInputValue("amount");

                                const amount = ["tout", "all"].includes(getModalAmount.toLowerCase()) || !getModalAmount ? quantity : parseFloat(getModalAmount.replaceAll(",", "."));
                                if (!amount || isNaN(amount) || amount <= 0) return modalCollector.reply({ embeds: [errorEmbed(t("not_number", { number: getModalAmount }, "errors"), true)], components: [], ephemeral: true }).catch(() => {});

                                if (quantity - amount < (i.customId == "withdraw" ? 0 : overdraftLimit)) return modalCollector.reply({ embeds: [errorEmbed(t(i.customId == "withdraw" ? "money_lower" : "money_account", { money: separate(quantity), symbol: economySymbol, company: company.name }), true)], components: [], ephemeral: true }).catch(() => {});
                                if (i.customId == "withdraw" && userAccount.bank_money + amount >= 2147483647) return modalCollector.reply({ embeds: [errorEmbed(t("int_passing", { name: lang == "fr" ? "votre compte" : "your account" }, "errors"), true)], components: [], ephemeral: true }).catch(() => {});

                                await client.db.addMoney(interaction.guildId, interaction.member.id, "bank_money", i.customId == "withdraw" ? amount : -amount);
                                await client.db.addMoneyToCompany(company.id, i.customId == "withdraw" ? -amount : amount);
                                
                                const idCard = await client.db.getIDCard(interaction.guildId, interaction.member.id)
                                await client.db.addTransactionLog(interaction.guildId, company.id, i.customId == "withdraw" ? -amount : amount, `${lang == "fr" ? i.customId == "withdraw" ? "Retrait de" : "Dépôt de" : i.customId == "withdraw" ? "Withdraw from" : "Deposit deJ"} ${idCard ? `${idCard.first_name} ${idCard.last_name}` : interaction.member.displayName}`)
                                await client.db.addTransactionLog(interaction.guildId, i.user.id, i.customId == "withdraw" ? amount : -amount, `${lang == "fr" ? i.customId == "withdraw" ? "Retrait de" : "Dépôt chez" : i.customId == "withdraw" ? "Withdraw from" : "Deposit at"} ${company.name}`)

                                return modalCollector.update(await accountEmbed()).catch(() => {});

                            }

                        }

                        case "sm_deposit":
                        case "sm_withdraw": {
                            
                            const item = i.values[0].split("&#46;")
                            if (!item) return i.reply({ embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], components: [], ephemeral: true });
                            
                            if (item[2].startsWith("nidev")) {
                                if (item[4].endsWith("safe")) return i.update(await safeEmbed(i.customId, current, currentSM));
                                if (item[4].endsWith("next")) i.customId == "sm_deposit" ? currentSM++ : current++;
                                else if (item[4].endsWith("previous")) i.customId == "sm_deposit" ? currentSM-- : current--;
                                
                                await i.update(await safeEmbed(i.customId, current, currentSM, true))
                                break;
                            }

                            const itemType = item[0];
                            const itemId = item[itemType.startsWith("drugs") ? 2 : 1];
                            const itemName = item[itemType.startsWith("drugs") ? 3 : 2];
                            const itemQuantity = item[itemType.endsWith("_money") ? 2 : itemType.startsWith("drugs") ? 4 : 3];

                            let modalCollector = { fields: { getTextInputValue: () => itemQuantity }, update: (...args) => i.update(...args), reply: (...args) => i.reply(...args) };
                            if (itemQuantity > 1) {

                                const code = Math.floor(Math.random() * 9000000000) + 1000000000
                                const modal = new ModalBuilder()
                                .setCustomId(`modal_companies_${code}`)
                                .setTitle(t("safe_modal.title"))
                                .setComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("quantity").setLabel(t("safe_modal.quantity")).setPlaceholder(t("safe_modal.quantity_placeholder")).setMinLength(1).setStyle(TextInputStyle.Short).setRequired(false)))
                                
                                await i.showModal(modal).catch(() => {});
                                modalCollector = await i.awaitModalSubmit({ filter: ii => ii.user.id === i.user.id && ii.customId == `modal_companies_${code}`, time: 60000 })
                                if (!modalCollector) return;

                            }

                            switch(itemType) {


                                case "dirty_money":
                                case "cash_money":{
        
                                    const newCompanySafeMoney = await client.db.getCompany(interaction.guildId, companyId);
                                    const newMemberAmount = await client.db.getMoney(interaction.guildId, i.user.id);
                                    const newQuantity = (i.customId == "sm_deposit" ? newMemberAmount : newCompanySafeMoney)[i.customId == "sm_deposit" ? itemType : itemType.replace("cash", "safe")]

                                    const amount = ["tout", "all"].includes((modalCollector.fields.getTextInputValue("quantity")).toLowerCase()) || !modalCollector.fields.getTextInputValue("quantity") ? newQuantity : parseInt(modalCollector.fields.getTextInputValue("quantity"));
        
                                    if (!amount || isNaN(amount) || !newQuantity) return modalCollector.reply({ embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], components: [], ephemeral: true }).catch(() => {})
                                    if (amount > newQuantity) return modalCollector.reply({ embeds: [errorEmbed(t(`not_enough_${itemType}`, { amount: separate(newQuantity), symbol: economySymbol }), true)], components: [], ephemeral: true }).catch(() => {});
                                    if (amount + newQuantity >= 2147483647) return modalCollector.reply({ embeds: [errorEmbed(t("int_passing", { name: t(`words.${itemType}`, false, "global") }, "errors"), true)], components: [], ephemeral: true }).catch(() => {})
        
                                    await client.db[`${i.customId == "sm_withdraw" ? "remove" : "add"}CompanySafeMoney`](id, amount, itemType == "dirty_money");
                                    await client.db.addMoney(interaction.guildId, i.user.id, itemType, i.customId == "sm_withdraw" ? amount : -amount);
        
                                    return modalCollector.update(await safeEmbed(i.customId, current, currentSM, true)).catch(() => {})
        
                                }
        
                                case "drugs": 
                                case "items":
                                default: {
        
                                    const newMemberDrugs = await client.db.getMemberDrugs(interaction.guildId, i.user.id);
                                    const newMemberInventory = await client.db.getMemberItems(interaction.guildId, i.user.id);
                                    
                                    const maxWeight = await client.db.getOption(interaction.guildId, "inventory.max_weight");
                                    const inventoryWeight = newMemberInventory.reduce((a, b) => a + (b.weight * b.quantity), 0) + newMemberDrugs.reduce((a, b) => a + ((b?.untreated ?? 0) + (b?.treated ?? 0)), 0);
                                    
                                    let quantity, type = null;
                                    if (itemType == "items") {

                                        const newCompanyInventory = await client.db.getCompanyInventory(company.id);
                                        
                                        var findItem = i.customId == "sm_withdraw" ? newCompanyInventory.find(i => i.name.toLowerCase() == itemName.toLowerCase()) : newMemberInventory.find(i => i.name.toLowerCase() == itemName.toLowerCase());
                                        if (!findItem) return modalCollector.reply({ embeds: [errorEmbed(t("item_not_found", { item: itemName }), true)], components: [], ephemeral: true }).catch(() => {});
                                        
                                        var { hidden_quantity, weight, role_add, role_remove, role_required } = findItem;
                                        quantity = findItem.quantity
                                        
                                        if (i.customId == "sm_withdraw" && maxWeight && inventoryWeight + weight > maxWeight) return modalCollector.reply({ embeds: [errorEmbed(t("inventory_full", false, "errors"), true)], components: [], ephemeral: true }).catch(() => {})
                                        if (i.customId == "sm_withdraw" && role_required && !interaction.member.roles.cache.has(role_required) && isPremium) return modalCollector.reply({ embeds: [errorEmbed(t("role_required", { role: `<@&${role_required}>`, item: findItem.name }, "errors"), true)], components: [], ephemeral: true }).catch(() => {})
                                        if (i.customId == "sm_withdraw" && role_add && isPremium) await interaction.member.roles.add(role_add).catch(() => errorEmbed(t("cant_give_role", { role: role_add.toString() }, "errors"), false, false, "reply", modalCollector))
                                        if (i.customId == "sm_withdraw" && role_add && quantity === amount && isPremium) await interaction.member.roles.remove(role_add).catch(() => errorEmbed(t("cant_remove_role", { role: role_add.toString() }, "errors"), false, false, "reply", modalCollector))
                                        if (i.customId == "sm_deposit" && role_remove && isPremium) await interaction.member.roles.remove(role_remove).catch(() => errorEmbed(t("cant_remove_role", { role: role_remove.toString() }, "errors"), false, false, "reply", modalCollector))
                                        
                                    } else {

                                        const newSafeDrugs = await client.db.getCompanyInventory(company.id, true);

                                        var drug = i.customId == "sm_withdraw" ? newSafeDrugs.find(d => d.drug_id == parseInt(itemId)) : newMemberDrugs.find(d => d.drug_id == parseInt(itemId));
                                        if (!drug) return modalCollector.reply({ embeds: [errorEmbed(t("drug_not_found", { drug: itemName }), true)], components: [], ephemeral: true }).catch(() => {});
                                        
                                        type = item[1]
                                        var otherType = type == "untreated" ? "treated" : "untreated"
                                        quantity = drug[type]

                                        if (i.customId == "sm_withdraw" && maxWeight && inventoryWeight + quantity > maxWeight) return modalCollector.reply({ embeds: [errorEmbed(t("inventory_full", false, "errors"), true)], components: [], ephemeral: true }).catch(() => {})
                                    
                                    }
        
                                    const amount = ["tout", "all"].includes((modalCollector.fields.getTextInputValue("quantity")).toLowerCase()) || !modalCollector.fields.getTextInputValue("quantity") ? quantity : parseInt(modalCollector.fields.getTextInputValue("quantity"));
        
                                    if (itemType == "items" && i.customId == "sm_withdraw" && maxWeight && inventoryWeight + (weight * amount) > maxWeight) return modalCollector.reply({ embeds: [errorEmbed(t("inventory_full", false, "errors"), true)], components: [], ephemeral: true }).catch(() => {})
                                    if (!amount || isNaN(amount) || !quantity) return modalCollector.reply({ embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], components: [], ephemeral: true }).catch(() => {})
                                    if (amount > quantity) return modalCollector.reply({ embeds: [errorEmbed(t("not_enough_item", { quantity: (quantity).toLocaleString(lang), item: itemType == "items" ? name : drug.name }), true)], components: [], ephemeral: true }).catch(() => {})
                                    if (amount + quantity >= 2147483647) return modalCollector.reply({ embeds: [errorEmbed(t("int_passing", { name: itemType == "items" ? name : drug.name }, "errors"), true)], components: [], ephemeral: true }).catch(() => {})
        
                                    await client.db[`${i.customId == "sm_withdraw" ? "take" : "put"}CompanyInventory`](interaction.guildId, id, itemType, itemId, type, amount, itemType == "drugs" ? drug[otherType] == 0 && amount == quantity : amount == quantity)
                                    
                                    if (itemType == "drugs") await client.db[`${i.customId == "sm_withdraw" ? "add" : "remove"}MemberDrug`](interaction.guildId, i.user.id, itemId, type, amount, drug.untreated == 0 && drug.treated && drug[otherType] == 0 && amount == quantity);
                                    else await client.db[`${i.customId == "sm_withdraw" ? "add" : "remove"}MemberItem`](interaction.guildId, i.user.id, itemId, amount, i.customId == "sm_withdraw" ? null : hidden_quantity == 0 && amount == quantity);
                                    
                                    return modalCollector.update(await safeEmbed(i.customId, current, currentSM, true)).catch(() => {})

                                }
                            }

                        }

                    }

                })

                collector.on("end", () => {
                    return interaction.editReply({ components: [] }).catch(() => {});
                });              

                break;
            }
                
        }


        } catch (err) {
            console.error(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    },

    runAutocomplete: async(client, interaction, { isPremium }) => {

        if (!isPremium) return interaction.respond([]).catch(() => {});
        const focusedOption = interaction.options.getFocused(true);
        const response = [];

        const company = await client.db.getMemberCompanies(interaction.guildId, interaction.member.id)
        const companies = (await client.db.getCompaniesWithOwner(interaction.guildId)).sort((a, b) => a.name.localeCompare(b.name))
        
        switch(interaction.options.getSubcommand()) {

            case "afficher": {
                const companyNames = company.map(c => c.id);
                response.push(...company.sort((a, b) => a.owner == 1 ? -1 : 1), ...companies.filter(c => !companyNames.includes(c.id) && c.type == 1));
                break;
            }

            case "supprimer": {
                response.push(...companies.map(c => ({ name: c.name, value: `${code}&#46;${c.id}&#46;${c.name}` }) ))
                break;
            }

        }

        const filtered = [];
        if (focusedOption.value !== "") {
            const filtredArray = [];
            filtredArray.push(...response.filter(r => r.name.toLowerCase() == focusedOption.value.toLowerCase()),);
            filtredArray.push(...response.filter(r => r.name.toLowerCase().startsWith(focusedOption.value.toLowerCase())));
            filtredArray.push(...response.filter(r => r.name.toLowerCase().includes(focusedOption.value.toLowerCase())));

            const unique = filtredArray.reduce((acc, current) => acc.some(item => item.name === current.name && item.value === current.value) ? acc : [...acc, current], []);
            filtered.push(...unique);
        } else {
            const unique = response.reduce((acc, current) => acc.some(item => item.name === current.name && item.value === current.value) ? acc : [...acc, current], []);
            filtered.push(...unique);
        }

        return interaction.respond(filtered.slice(0, 25).map(c => ({ name: c.name, value: `${code}&#46;${c?.value?.split("&#46;")[1] ?? c.id}&#46;${c?.value?.split("&#46;")[1] ?? c.id}` }))).catch(() => {});

    }
};
