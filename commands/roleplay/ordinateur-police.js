const { EmbedBuilder, ApplicationCommandOptionType, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, time } = require("discord.js");
const { Canvas, loadImage, loadFont } = require("canvas-constructor/napi-rs");
const { resolve, join } = require("node:path");
loadFont(resolve(join(__dirname, "../../assets/fonts/Poppins-Light.ttf")), "PoppinsLight");
loadFont(resolve(join(__dirname, "../../assets/fonts/Poppins-Medium.ttf")), "PoppinsMedium");

const code = Math.floor(Math.random() * 9000000000) + 1000000000
module.exports = {
    category: { "en": "roleplay", "fr": "roleplay" },
    name: "ordinateur-police",
    nameLocalizations: {
        "fr": "ordinateur-police",
        "en-US": "police-computer",
        "en-GB": "police-computer"
    },
    description: "Affiche l'ordinateur de police.",
    descriptionLocalizations: {
        "fr": "Affiche l'ordinateur de police.",
        "en-US": "Display the police computer.",
        "en-GB": "Display the police computer."
    },
    options: [{
        name: "unité",
        nameLocalizations: {
            "fr": "unité",
            "en-US": "unit",
            "en-GB": "unit"
        },
        description: "Choisissez l'unité de police à qui vous souhaitez accéder.",
        descriptionLocalizations: {
            "fr": "Choisissez l'unité de police à qui vous souhaitez accéder.",
            "en-US": "Choose the police unit you want to access.",
            "en-GB": "Choose the police unit you want to access."
        },
        type: ApplicationCommandOptionType.String,
        required: false,
        autocomplete: true
    }],
    betaTest: true,
    run: async(client, interaction, { t, successEmbed, errorEmbed, lang, economySymbol, isPremium, separate }) => {

        try {

        if(!["683269450086219777", "909074665681612800"].includes(interaction.member.id)) return errorEmbed(`La commande \`ordinateur-police\` est actuellement en cours de développement. Vous pouvez suivre toute l'actualité des mises à jours en rejoignant notre [serveur de support](${client.constants.links.support}) !`)
        if(interaction.options.getString("unité") && !interaction.options.getString("unité").startsWith(`${code}`)) return errorEmbed(t("pass_autocomplete", { option: lang == "fr" ? "unité" : "unit" }, "errors"));

        await interaction.deferReply().catch(() => {});

        const logo = await client.db.getOption(interaction.guildId, "police_computer.logo");
        const police = await client.db.getSpecifyCompany(interaction.guildId, "police");
        const employees = await client.db.getCompanyEmployees(police?.id);

        const getName = async(id, withPoliceNumber = false) => {
            const idCards = [await client.db.getIDCard(interaction.guildId, id), await client.db.getIDCard(interaction.guildId, id, true)]
            if(idCards[0]) return `${withPoliceNumber ? `  [${(employees.find((e) => e.user_id == interaction.member.id))?.police_number ?? "00"}] ` : ""}${idCards[0].first_name} ${idCards[0].last_name}`;
            else if(idCards[1]) return `${withPoliceNumber ? `  [${(employees.find((e) => e.user_id == interaction.member.id))?.police_number ?? "00"}] ` : ""}${idCards[1].first_name} ${idCards[1].last_name}`;
            
            await interaction.guild.members.fetch();
            const fetchMember = interaction.guild.members.cache.get(id);
            return fetchMember ? `${withPoliceNumber ? `  [${(employees.find((e) => e.user_id == interaction.member.id))?.police_number ?? "00"}] ${fetchMember?.displayName}` : fetchMember?.displayName}` : t("words.unknown", false, "global");
        }

        const name = await getName(interaction.member.id, true);
        let tries = 0, username = "", password = "";
        async function render(customId, path, secondRows = null, thirdRows = null) {

            const connectRows = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("connect").setLabel(t("buttons.connect")).setStyle(ButtonStyle.Primary))
            let options = { locale: lang }

            switch(customId) {
                case "lock_wrong": options = { locale: lang, username: username, password: password }; break;
            }

            const canvas = await client.functions.canvas.get(path, options)
            const attachment = new AttachmentBuilder(canvas, { name: "computer.png" })
            const embed = new EmbedBuilder().setColor("#030303").setImage("attachment://computer.png")

            return {
                embeds: [embed],
                components: thirdRows ?? secondRows ?? [connectRows],
                files: [attachment]
            }

        }

        async function search(type, current, values) {

            const canvas = new Canvas(1720, 1015)
            .printImage(await loadImage(logo ?? `./assets/police_computer/logo.png`), 50, 50, 560, 97)
            .printImage(await loadImage(`./assets/police_computer/${lang}/lock.png`), 0, 0, 1720, 1015)

        }

        // Buttons
        const rows = [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("fines").setLabel(t("buttons.fines")).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("criminal-records").setLabel(t("buttons.criminal-records")).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("pound").setLabel(t("buttons.pound")).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("others-search").setLabel(t("buttons.search")).setStyle(ButtonStyle.Secondary),
            ),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("disconnect").setLabel(t("buttons.disconnect")).setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId("manage").setLabel(t("buttons.manage")).setStyle(ButtonStyle.Secondary),
            )
        ]
        
        const secondRows = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("home").setLabel(t("buttons.home")).setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("add").setLabel(t("buttons.add")).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("search").setLabel(t("buttons.search")).setStyle(ButtonStyle.Secondary),
        )

        const searchRows = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("home").setLabel(t("buttons.home")).setStyle(ButtonStyle.Primary),  
            new ButtonBuilder().setCustomId("interpol").setLabel(t("buttons.interpol")).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("id_cards").setLabel(t("buttons.id_cards")).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("plates").setLabel(t("buttons.plates")).setStyle(ButtonStyle.Secondary),
        )

        const manageRows = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("identifiers").setLabel(t("buttons.identifiers")).setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("access").setLabel(t("buttons.access")).setStyle(ButtonStyle.Primary),
        )

        const menuRows = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("previous").setEmoji("◀"),
            new ButtonBuilder().setCustomId("next").setEmoji("▶"),
        )

        const retryButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("retry").setLabel(t("buttons.retry")).setStyle(ButtonStyle.Primary)
        )

        const isLogged = await client.db.getMemberFlag(interaction.guildId, interaction.member.id, "police_computer.logged");
        let _render = await render(null, isLogged == 1 ? "home" : "lock", isLogged == 1 ? rows : null)

        const message = await interaction.editReply({ embeds: _render.embeds, components: _render.components, files: _render.files, fetchReply: true })
        if(!message) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");

        const collector = await message.createMessageComponentCollector({ filter: (i) => i.user.id == interaction.user.id, time: 240000 });
        if(!collector) return collector.update({ embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], components: [], files: [] })
        
        let type, currentPound = 0, currentCR = 0, currentFine = 0;
        collector.on("collect", async(i) => {
             
            if(["retry", "connect", "home", "disconnect"].includes(i.customId)) {

                const isLogged = await client.db.getMemberFlag(interaction.guildId, interaction.member.id, "police_computer.logged");
                if(isLogged == 0 || i.customId == "retry") {

                    const code = Math.floor(Math.random() * 9000000000) + 1000000000
                    const modal = new ModalBuilder()
                    .setCustomId(`connect_modal_${code}`)
                    .setTitle("Connexion")
                    .setComponents(
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("identifier").setLabel(t("modal.identifier")).setPlaceholder(t("modal.placeholder_identifier")).setStyle(TextInputStyle.Short).setMinLength(1).setRequired(true)),
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("password").setLabel(t("modal.password")).setPlaceholder(t("modal.placeholder_password")).setStyle(TextInputStyle.Short).setMinLength(1).setRequired(true)),
                    )

                    await i.showModal(modal).catch(() => {})
                    const modalCollector = await i.awaitModalSubmit({ filter: i => i.user.id === interaction.member.id && i.customId == `connect_modal_${code}`, max: 1, time: 60000 })
                    if(!modalCollector) return;

                    const modalIdentifier = modalCollector.fields.getTextInputValue("identifier");
                    const modalPassword = modalCollector.fields.getTextInputValue("password");

                    tries++; username = modalIdentifier; password = modalPassword;
                    
                    const session = await client.db.getLogin(interaction.guildId, modalIdentifier, modalPassword);
                    if(!session) return modalCollector.update(await render(null, `./assets/police_computer/${lang}/lock_error.png`, [retryButton]))
                    else {
                        await client.db.setMemberFlag(interaction.guildId, interaction.member.id, "police_computer.logged", 1);
                        return modalCollector.update(await render(null, `./assets/police_computer/${lang}/home.png`, rows))
                    }

                }

                if(i.customId == "disconnect") {
                    await client.db.setMemberFlag(interaction.guildId, interaction.member.id, "police_computer.logged", 0);
                    return collector.stop("end");
                }
                
                type = i.customId;
                return i.update(await render(type, `./assets/police_computer/${lang}/${["disconnect"].includes(type) ? type : "home"}.png`, type == "disconnect" ? [secondRows] : rows))

            } else {

                // Interaction Is List of
                if(["interpol", "criminal-records", "pound", "fines", "others-search"].includes(i.customId)) {

                    type = i.customId;
                    await i.update(await render(type, `./assets/police_computer/${type}.png`, [type == "others-search" ? searchRows : secondRows]))

                    return

                // Others actions
                } else {

                    const code = Math.floor(Math.random() * 9000000000) + 1000000000
                    const actionModal = new ModalBuilder()
                    .setCustomId(`modal_action_${code}`)
                    .setTitle(t(`modal.title`))

                    let nameComponents = [
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("first_name").setLabel(t("modal.first_name")).setPlaceholder(t("modal.placeholder_first_name")).setMinLength(1).setMaxLength(255).setStyle(TextInputStyle.Short).setRequired(true)),
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("last_name").setLabel(t("modal.last_name")).setPlaceholder(t("modal.placeholder_last_name")).setMinLength(1).setMaxLength(255).setStyle(TextInputStyle.Short).setRequired(true)),
                    ];
                    
                    let vehicleComponents = [
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("vehicule_name").setLabel(t("modal.vehicule_name")).setPlaceholder(t("modal.placeholder_vehicule_name")).setMaxLength(255).setStyle(TextInputStyle.Short).setRequired(false)),
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("license_plate").setLabel(t("modal.license_plate")).setPlaceholder(t("modal.placeholder_license_plate")).setMinLength(1).setMaxLength(255).setStyle(TextInputStyle.Short).setRequired(true)),
                    ];
                    
                    let fineComponents = [
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("fine_id").setLabel(t("modal.fine_id")).setPlaceholder(t("modal.placeholder_fine_id")).setMinLength(1).setMaxLength(11).setStyle(TextInputStyle.Short).setRequired(true)),
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("amount").setLabel(t("modal.amount")).setPlaceholder(t("modal.placeholder_amount")).setMinLength(1).setMaxLength(11).setStyle(TextInputStyle.Short).setRequired(true)),
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("reason").setLabel(t("modal.reason")).setPlaceholder(t("modal.placeholder_reason")).setMinLength(1).setMaxLength(255).setStyle(TextInputStyle.Short).setRequired(true)),
                    ];

                    switch(type) {

                        case "criminal-records":
                            if(i.customId !== "remove") actionModal.setComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("id").setLabel(t("modal.id")).setPlaceholder(t("modal.placeholder_id")).setMinLength(1).setStyle(TextInputStyle.Short).setRequired(true)));
                            break;

                        case "pound": actionModal.setComponents(...vehicleComponents); break;
                        case "fines": {
                            if(i.customId == "search") actionModal.addComponents(...nameComponents, fineComponents[0]);
                            else if(i.customId == "add") actionModal.addComponents(...nameComponents, ...fineComponents.slice(1));
                            break;
                        }

                        default: actionModal.addComponents(...nameComponents); break;

                    }

                    await i.showModal(actionModal).catch(() => {})

                    const modalCollector = await i.awaitModalSubmit({ filter: i => i.user.id === interaction.member.id && i.customId == `modal_action_${code}`, max: 1, time: 60000 })
                    if(!modalCollector) return;

                    switch (type) {
                        case "pound":
                            var modalvehiculeName = modalCollector.fields.getTextInputValue("vehicule_name");
                            var modalLicensePlate = modalCollector.fields.getTextInputValue("license_plate");
                            var vehicule = await client.db.getPlateCG(interaction.guildId, modalLicensePlate, modalvehiculeName && modalLicensePlate ? "both" : "plate", modalvehiculeName);
                            if (!vehicule) return modalCollector.reply({ embeds: [errorEmbed(t("no_vehicule_found", { vehicule_name: modalvehiculeName, license_plate: modalLicensePlate ? `(${license_plate})` : "" }), true)], components: [], files: [] });
                            break;

                        case "criminal-records":
                            if (i.customId !== "add") var modalCrId = modalCollector.fields.getTextInputValue("id");
                            break;

                        case "fines":
                            var modalFirstName = modalCollector.fields.getTextInputValue("first_name");
                            var modalLastName = modalCollector.fields.getTextInputValue("last_name");
                            
                            var memberId = await client.db.getIDCardByName(interaction.guildId, modalFirstName, modalLastName);
                            if (modalFirstName && modalLastName && !memberId) return modalCollector.reply({ embeds: [errorEmbed(t("no_member_found", { first_name: modalFirstName, last_name: modalLastName }), true)], components: [], files: [] });
                          
                            if (i.customId === "add") {
                                var modalAmount = modalCollector.fields.getTextInputValue("amount").replaceAll(",", ".");
                                if (isNaN(parseFloat(modalAmount)) || parseFloat(modalAmount) <= 0) return modalCollector.reply({ embeds: [errorEmbed(t("invalid_amount", false, "errors"), true)], components: [], files: [] });
                            } else if(i.customId === "search") var modalFineID = modalCollector.fields.getTextInputValue("fine_id")

                          
                            break;

                        default:
                            var modalFirstName = modalCollector.fields.getTextInputValue("first_name");
                            var modalLastName = modalCollector.fields.getTextInputValue("last_name");
                            var memberId = await client.db.getIDCardByName(interaction.guildId, modalFirstName, modalLastName);
                            if (!memberId) return modalCollector.reply({ embeds: [errorEmbed(t("no_member_found", { first_name: modalFirstName, last_name: modalLastName }), true)], components: [], files: [] });
                          
                          break;
                      }
                      

                    switch(i.customId) {

                        case "add": {

                            switch(type) {

                                case "interpol": {
                                    const isWanted = await client.db.isWanted(interaction.guildId, memberId.id);
                                    if(isWanted) return modalCollector.reply({ embeds: [errorEmbed(t("already_wanted", { first_name: modalFirstName, last_name: modalLastName }), true)], components: [], files: [] });

                                    const modalReason = modalCollector.fields.getTextInputValue("reason");
                                    await client.db.putWanted(interaction.guildId, interaction.member.id, memberId.id, modalReason);
                                    
                                    return modalCollector.update(await render(type, `./assets/police_computer/${type}.png`, [secondRows]))
                                }

                                case "criminal-records": {

                                    const criminalRecords = await client.db.getCriminalRecords(interaction.guildId, memberId.id);
                                    if(criminalRecords.length >= 50) return modalCollector.reply({ embeds: [errorEmbed(t("max_criminal_records", { emoji: client.constants.emojis.premium }), true)], components: [], files: [] });

                                    const modalReason = modalCollector.fields.getTextInputValue("reason");
                                    await client.db.insertCriminalRecords(interaction.guildId, memberId.user_id, modalReason, i.user.id);
                                    
                                    return modalCollector.update(await render(type, `./assets/police_computer/${type}.png`, [secondRows]))
                                }

                                case "pound": {
                                    const isPounded = await client.db.isPounded(interaction.guildId, vehicule.id);
                                    if(isPounded) return modalCollector.reply({ embeds: [errorEmbed(t("already_pounded", { vehicule_name: vehicule.vehicule_name, license_plate: vehicule.license_plate ? `(${vehicule.license_plate})` : "" }), true)], components: [], files: [] });

                                    await client.db.setStatusCG(interaction.guildId, interaction.member.id, vehicule.license_plate, 1)
                                    
                                    return modalCollector.update(await render(type, `./assets/police_computer/${type}.png`, [secondRows]))
                                }

                                case "fines": {
                                    const modalReason = modalCollector.fields.getTextInputValue("reason");
                                    
                                    await client.db.addMemberBill(interaction.guildId, memberId.user_id, interaction.member.id, police?.id ?? null, 1, modalAmount, modalReason);
                                    return modalCollector.update(await render(type, `./assets/police_computer/${type}.png`, [secondRows]))
                                }
                                    

                            }

                        }

                        case "remove": {

                            let confirmMessage, successMessage;
                            switch(type) {

                                case "interpol": {
                                    const isWanted = await client.db.isWanted(interaction.guildId, memberId.id);
                                    if(!isWanted) return modalCollector.reply({ embeds: [errorEmbed(t("not_wanted", { first_name: modalFirstName, last_name: modalLastName }), true)], components: [], files: [] });

                                    confirmMessage = t("confirm_delete_wanted", { first_name: modalFirstName, last_name: modalLastName });
                                    successMessage = t("remove_wanted", { first_name: modalFirstName, last_name: modalLastName });

                                    break;
                                }

                                case "criminal-records": {
                                    const criminalRecord = await client.db.getCriminalRecords(interaction.guildId, modalCrId, true)
                                    if(!criminalRecord) return modalCollector.reply({ embeds: [errorEmbed(t("no_criminal_record_id_found", { id: modalCrId }), true)], components: [], files: [] });
                                    
                                    confirmMessage = t("confirm_delete_cr", { first_name: criminalRecord.first_name, last_name: criminalRecord.last_name, id: modalCrId, reason: criminalRecord.reason })
                                    successMessage = t("remove_criminal_records", { first_name: criminalRecord.first_name, last_name: criminalRecord.last_name, id: modalCrId, reason: criminalRecord.reason });

                                    break;
                                }

                                case "pound": {
                                    const isPounded = await client.db.isPounded(interaction.guildId, vehicule.id);
                                    if(!isPounded) return modalCollector.reply({ embeds: [errorEmbed(t("not_pounded", { vehicule_name: vehicule.vehicule_name, license_plate: vehicule.license_plate ? `(${vehicule.license_plate})` : "" }), true)], components: [], files: [] });

                                    confirmMessage = t("confirm_delete_pounded", { vehicule_name: vehicule.vehicule_name, license_plate: vehicule.license_plate ? `(${vehicule.license_plate})` : "" });
                                    successMessage = t("remove_pounded", { vehicule_name: vehicule.vehicule_name, license_plate: vehicule.license_plate ? `(${vehicule.license_plate})` : "" });

                                    break;
                                }

                                case "fines": {
                                    const fine = await client.db.getMemberBill(interaction.guildId, modalFineID);
                                    if(!fine) return modalCollector.reply({ embeds: [errorEmbed(t("no_fine_found", { id: modalFineID }), true)], components: [], files: [] });
                                    if(fine.fine !== 1) return modalCollector.reply({ embeds: [errorEmbed(t("not_fine", { id: modalFineID }), true)], components: [], files: [] });

                                    confirmMessage = t("confirm_delete_fine", { id: modalFineID, amount: separate(fine.amount), symbol: economySymbol });
                                    successMessage = t("remove_fine", { id: modalFineID, amount: separate(fine.amount), symbol: economySymbol });

                                    break;
                                }

                            }

                            const confirm = await client.functions.userinput.askValidation(modalCollector, confirmMessage, false)
                            if(!confirm) return;
                            
                            switch(type) {
                                case "interpol": await client.db.deleteWanted(interaction.guildId, memberId.id); break;
                                case "criminal-records": await client.db.deleteCriminalRecords(interaction.guildId, modalCrId); break;
                                case "pound": await client.db.setStatusCG(interaction.guildId, interaction.member.id, vehicule.license_plate, 0); break;
                                case "fines": await client.db.deleteMemberBill(modalFineID); break;
                            }

                            return confirm.update(await render(type, `./assets/police_computer/${type}.png`, [secondRows])).catch(() => {});

                        }

                        case "previous":
                        case "next":
                        case "search": {

                            let value;
                            switch(type) {

                                case "criminal-records": {
                                    const criminalRecords = await client.db.getCriminalRecordByName(interaction.guildId, modalFirstName, modalLastName);
                                    if(!criminalRecords) return modalCollector.reply({ embeds: [errorEmbed(t("no_criminal_records_found", { first_name: modalFirstName, last_name: modalLastName }), true)], components: [], files: [] });

                                    value = criminalRecords;
                                    if(i.customId == "next") currentCR++;
                                    else if(i.customId == "previous") currentCR--;
                                }

                                case "pound": {
                                    const vehicules = await client.db.getPoundeds(interaction.guildId, modalFirstName, modalLastName);
                                    if(!vehicules) return modalCollector.reply({ embeds: [errorEmbed(t("no_pounded_vehicules_found", { first_name: modalFirstName, last_name: modalLastName }), true)], components: [], files: [] });
                                    
                                    value = vehicules;
                                    if(i.customId == "next") currentPound++;
                                    else if(i.customId == "previous") currentPound--;

                                }

                                case "fines": {
                                    const fines = await client.db.getMemberBills(interaction.guildId, modalFirstName, modalLastName);
                                    if(!fines) return modalCollector.reply({ embeds: [errorEmbed(t("no_fines_found", { first_name: modalFirstName, last_name: modalLastName }), true)], components: [], files: [] });

                                    value = fines;
                                    if(i.customId == "next") currentFine++;
                                    else if(i.customId == "previous") currentFine--;

                                }

                            }
                            const current = type == "fines" ? currentFine : type == "pound" ? currentPound : currentCR
                            const currentValue = value?.[current]
                            console.log(currentValue)
                            if(!currentValue) return modalCollector.reply({ embeds: [errorEmbed(t(`no_${type}_found`, { first_name: modalFirstName, last_name: modalLastName }), true)], components: [], files: [] });

                            return modalCollector.update(await search(type, current, currentValue));

                        }

                    }

                }

            }
        })

        collector.on("end", async(collected) => {
            if(collected.find(i => i.customId == "disconnect")) return interaction.editReply(await render(null, `./assets/police_computer/${lang}/disconnected.png`, [])).catch(() => {});

            return interaction.editReply({ components: [] }).catch(() => {});
        })


        } catch (err) {
            console.error(err);
            client.bugsnag.notify(err);
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
    },


    runAutocomplete: async(client, interaction, { isPremium, lang }) => {

        if(!isPremium) return interaction.respond([{ name: "🚔 Police", value: `${code}&#46;police` }])

        const focusedOption = interaction.options.getFocused(true);
        const police = await client.db.getSpecifyCompany(interaction.guildId, "police");

        const filtered = [];
        if(focusedOption.value !== "") {
            const filtredArray = [];
            filtredArray.push(...police.filter(r => r.name.toLowerCase() == focusedOption.value.toLowerCase()),);
            filtredArray.push(...police.filter(r => r.name.toLowerCase().startsWith(focusedOption.value.toLowerCase())));
            filtredArray.push(...police.filter(r => r.name.toLowerCase().includes(focusedOption.value.toLowerCase())));

            const unique = [...new Set(filtredArray)]
            filtered.push(...unique);
        } else {
            filtered.push(...police);
        }

        return interaction.respond(filtered.slice(0, 25).map(c => ({ name: c.name, value: `${code}&#46;${c.id}` }))).catch(() => {});

    }
};
