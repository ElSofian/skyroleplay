const { AttachmentBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ApplicationCommandOptionType } = require("discord.js");
const { Canvas, loadImage, loadFont } = require("canvas-constructor/napi-rs");
const { resolve, join } = require("node:path");
loadFont(resolve(join(__dirname, "../../assets/fonts/Poppins-Regular.ttf")), "Poppins");
loadFont(resolve(join(__dirname, "../../assets/fonts/Poppins-SemiBold.ttf")), "Poppins-B");
loadFont(resolve(join(__dirname, "../../assets/fonts/Poppins-ExtraBold.ttf")), "Poppins-EB");
loadFont(resolve(join(__dirname, "../../assets/fonts/Jennifer-Lynne.ttf")), "Jennifer-Lynne");

module.exports = {
    category: { "en": "player", "fr": "joueur" },
    name: "papiers",
    nameLocalizations: {
        "fr": "papiers",
        "en-US": "papers",
        "en-GB": "papers"
    },
    description: "Affiche vos papiers ou ceux d'un joueur.",
    descriptionLocalizations: {
        "fr": "Affiche vos papiers ou ceux d'un joueur.",
        "en-US": "Displays your papers or those of a player.",
        "en-GB": "Displays your papers or those of a player."
    },
    options: [{
        name: "joueur",
        nameLocalizations: {
            "fr": "joueur",
            "en-GB": "player",
            "en-US": "player"
        },
        description: "Mentionnez le joueur dont vous voulez afficher les papiers.",
        descriptionLocalizations: {
            "fr": "Mentionnez le joueur dont vous voulez afficher les papiers.",
            "en-GB": "Mentions the player whose papers you want to display.",
            "en-US": "Mentions the player whose papers you want to display."
        },
        type: ApplicationCommandOptionType.User,
        required: false
    }],
    cooldown: 5,
    run: async(client, interaction, { t, errorEmbed, verify, isPremium }) =>{

        try {
        
        const member = interaction.options.getMember("joueur") || interaction.member;
        if (interaction.options.getMember("joueur") && verify("member", { cantBotInclued: true })) return
        
        const [idCards, cg, driverLicenses, weaponLicenses] = await Promise.all([
            [await client.db.getIDCard(interaction.guildId, member.user.id), await client.db.getIDCard(interaction.guildId, member.user.id, true)],
            client.db.getMemberCG(interaction.guildId, member.user.id),
            client.db.getDriverLicense(interaction.guildId, member.user.id, null, 1),
            client.db.getWeaponLicense(interaction.guildId, member.user.id)
        ]);
        
        const rows = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("id_cards").setStyle(ButtonStyle.Secondary).setLabel(t("buttons.id_cards", { s: idCards[0] && idCards[1] ? "s" : "" })).setEmoji("🪪").setDisabled(!idCards[0] && !idCards[1]),
            new ButtonBuilder().setCustomId("cg").setStyle(ButtonStyle.Secondary).setLabel(t("buttons.cg", { s: cg.length > 1 ? "s" : "" })).setEmoji("🚙").setDisabled(!cg.length),
            new ButtonBuilder().setCustomId("driver_license").setStyle(ButtonStyle.Secondary).setLabel(t("buttons.driver_license", { s: driverLicenses.length > 1 ? "s" : "" })).setEmoji("📇").setDisabled(!driverLicenses.length),
            new ButtonBuilder().setCustomId("weapon_license").setStyle(ButtonStyle.Secondary).setLabel(t("buttons.weapon_license", { s: weaponLicenses.length > 1 ? "s" : "" })).setEmoji("🔫").setDisabled(!weaponLicenses.length)
        )

        async function render(values, type, index) {

            const embed = new EmbedBuilder()
            .setColor("#5865F2")
            
            if (!type) {

                embed.setThumbnail(member.displayAvatarURL()).setTitle(t("embed.title")).setDescription(t("embed.description"))
                return { embeds: [embed], components: [rows], files: [], fetchReply: true }
                
            } else {
                
                var secondRows  = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("wallet").setStyle(ButtonStyle.Primary).setLabel(t("buttons.wallet")))
                
                if (values[0] && values[1]) {
                    
                    secondRows.addComponents(
                        new ButtonBuilder().setCustomId(`previous`).setStyle(ButtonStyle.Secondary).setEmoji("◀").setDisabled(index === 0),
                        new ButtonBuilder().setCustomId(`next`).setStyle(ButtonStyle.Secondary).setEmoji("▶").setDisabled(index + 1 === values.length)
                    );
                    
                }
                
                switch(type) {

                    case "id_cards": {
    
                        if (!values[0] && values[1]) index++
                        
                        const data = values[index];
                        if (!data) return { embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], components: [], files: [] }
                        
                        let theme = await client.db.getOption(interaction.guildId, "id_cards.theme");
                
                        if (!isPremium && theme !== "flat") {
                            if (theme !== "flat") client.db.setOption(interaction.guildId, "id_cards.theme", "flat");
                            theme = "flat";
                        }
                        
                        const age = client.dayjs().diff(data.birthdate, "years")
                        
                        const canvas = new Canvas(930, 500)
                        .printImage(await loadImage(`assets/id_cards/${theme}.png`), 0, 0, 930, 500)
                        .setTextFont("25px Arial")
                        .setColor(theme === "flat" ? "#ffffff" : "#030303")
                        .printText(data.last_name, 400, 158)
                        .printText(data.first_name, 468, 208)
                        .printText(`${age} ans`, 672, 282)
                        .printText(client.dayjs(data.birthdate).format("DD/MM/YYYY"), 436, 282)
                        .printText(data.gender === 1 ? "H" : "F", 400, 325)
                        .printText(data.birthplace, 360, 361)

                        
                        if (theme === "flat") canvas.printCircularImage(await loadImage(member.user.displayAvatarURL({ extension: "png" })), 155, 250, 90);
                        else canvas.printImage(await loadImage(member.user.displayAvatarURL({ extension: "png" })), 0, 140, 310, 300);
                        
                        if (data.taken == 1) canvas.printImage(await loadImage("assets/id_cards/taken.png"), 0, 0, 930, 500);
                        
                        const attachment = new AttachmentBuilder(await canvas.pngAsync(), { name: "paper.png" })
                        embed.setImage("attachment://paper.png")
                        return { embeds: [embed], components: [secondRows], files: [attachment], fetchReply: true }
    
                    }

                    case "cg": {

                        const data = values[index];
                        if (!data) return { embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], components: [], files: [] }

                        const canvas = new Canvas(930, 500)
                        .printImage(await loadImage(`./assets/member_cg/${data.type}.png`), 0, 0, 930, 500)
                        .setTextFont("37px Poppins")
                        .setColor("#dedede")
                        .printText(`${data.first_name} ${data.last_name}`, 120, 170)
                        .printText(`${data.vehicule_name} ・ ${data.license_plate}`, 120, 335)
                        .setTextFont("31.5px Poppins")
                        .printText(data.adress ?? t("cg.no_adress"), 65, 215)
                        .printText(`${t("cg.buying_date")} : ${client.dayjs(data.date).format('DD/MM/YYYY')}`, 65, 380)
                        
                        if (data.status == 1) canvas.printImage(await loadImage(`./assets/member_cg/pound.png`), 0, 0, 930, 500)
                        if (data.status == 2) canvas.printImage(await loadImage(`./assets/member_cg/theft.png`), 0, 0, 930, 500)
                        
                    
                        const attachment = new AttachmentBuilder(await canvas.pngAsync(), { name: "paper.png" })
                        embed.setImage("attachment://paper.png")
                        return { embeds: [embed], components: [secondRows], files: [attachment], fetchReply: true }

                    }

                    case "driver_license": {
                        
                        const data = values[index];
                        if (!data) return { embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], components: [], files: [] }
                        let theme = await client.db.getOption(interaction.guildId, "driver_licences.theme");
        
                        if (!isPremium) {
                            if (theme !== "flat") await client.db.setOption(interaction.guildId, "driver_licences.theme", "flat");
                            theme = "flat";
                        }
                        
                        const canvas = new Canvas(930, 500)
                        switch(theme) {

                            case "flat": {

                                canvas.printImage(await loadImage(`./assets/driver_licences/flat/${data.type == "motorbike" ? "motorcycle" : data.type}.png`), 0, 0, 930, 500)
                                .setTextFont("40px Poppins-EB").setColor("white")
                                .printText(t("driver_license.license_name"), 92.5, 60)
                                .setTextFont("36px Poppins-B").setTextAlign("center")
                                .printText(t(`driver_license.types.${data.type == "motorbike" ? "motorcycle" : data.type}`), 640, 215)
                                .printText(`${data.points} point${data.points > 1 ? "s" : ""}`, 640, 310)
                                .printText(client.dayjs(data.date).format("DD/MM/YYYY"), 640, 402.5)
                                
                                canvas.printCircularImage(await loadImage(member.user.displayAvatarURL({ extension: "png" })), 170, 300, 110);
                                break;

                            }

                            
                            case "us": {

                                canvas.printImage(await loadImage(`./assets/driver_licences/us/${data.type == "motorbike" ? "motorcycle" : data.type}.png`), 0, 0, 930, 500)
                                .setTextFont("bold 45px Arial").setColor("#003399")
                                .printText(t("driver_license.license_name"), 215, 65)
                                .setTextFont("36px Poppins-B").setTextAlign("center")
                                .printText(t(`driver_license.types.${data.type == "motorbike" ? "motorcycle" : data.type}`), 675, 215)
                                .printText(`${data.points} point${data.points > 1 ? "s" : ""}`, 675, 315)
                                .printText(client.dayjs(data.date).format("DD/MM/YYYY"), 675, 407.5)
                                
                                canvas.printCircularImage(await loadImage(member.user.displayAvatarURL({ extension: "png" })), 215, 290, 130);
                                break;

                            }


                            case "fr": {

                                canvas.printImage(await loadImage(`./assets/driver_licences/${theme}.png`), 0, 0, 930, 500)
                                .setTextFont("bold 32px Arial").setColor("#003399")
                                .printText("Type", 458, 175)
                                .printText("Points", 458, 280)
                                .printText(t("driver_license.acquisition_date"), 458, 385)
                                .setColor("#1E1E1E")
                                .printText(t(`driver_license.types.${data.type == "motorbike" ? "motorcycle" : data.type}`), 486, 220)
                                .printText(`${data.points} point${data.points > 1 ? "s" : ""}`, 486, 325)
                                .printText(client.dayjs(data.date).format("DD/MM/YYYY"), 490, 430)
                                
                                canvas.printCircularImage(await loadImage(member.user.displayAvatarURL({ extension: "png" })), 215, 290, 130);
                                break;

                            }


                        }
                        

                        const attachment = new AttachmentBuilder(await canvas.pngAsync(), { name: "paper.png" })
                        embed.setImage("attachment://paper.png")
                        return { embeds: [embed], components: [secondRows], files: [attachment], fetchReply: true }

                    }

                    case "weapon_license": {

                        const data = values[index];
                        if (!data) return { embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], components: [], files: [] }
                        const idData = idCards[0];
        
                        let theme = await client.db.getOption(interaction.guildId, "weapon_licences.theme");

                        if (!isPremium) {
                            if (theme !== "flat") client.db.setOption(interaction.guildId, "weapon_licences.theme", "flat");
                            theme = "flat";
                        }

                        const canvas = new Canvas(930, 500)

                        switch(theme) {

                            case "flat": {
                            
                                canvas.printImage(await loadImage(`./assets/weapon_licences/flat/${data.type}.png`), 0, 0, 930, 500)
                                .setTextFont("35px Poppins-B").setColor("white")
                                .printText(t(`weapon_license.types.${data.type}`), 525, 290)
                                .printText(client.dayjs(data.date).format("DD/MM/YYYY"), 525, 385)
                                
                                if (idData) canvas.setTextFont("35px Poppins-B").printText(`${idData.last_name} ${idData.first_name}`, 425, 177.5)
                                break;

                            }


                            case "us": {

                                canvas.printImage(await loadImage(`./assets/weapon_licences/${theme}.png`), 0, 0, 930, 500)
                                .setTextFont("40px Poppins-B").setColor("white")
                                .printText(t(`weapon_license.license_name.us`), 235, 57.5)
                                .setTextFont("36px Poppins-B")
                                .printText(t(`weapon_license.name.us`), 99, 153)
                                .printText("Type", 99, 268)
                                .printText(t("weapon_license.since"), 99, 383)
                                .setColor("black")
                                .printText(idData ? `${idData.last_name} ${idData.first_name}` : member.displayName, 110, 197)
                                .printText(t(`weapon_license.types.${data.type}`), 110, 317)
                                .printText(client.dayjs(data.date).format("DD/MM/YYYY"), 110, 434)
                                break;

                            }


                            case "fr": {

                                canvas.printImage(await loadImage(`./assets/weapon_licences/${theme}.png`), 0, 0, 930, 500)
                                .setTextFont("bold 34px Arial").setColor("#003399").setTextAlign("center")
                                .printWrappedText(t(`weapon_license.license_name.fr`), 537.5, 50, 700)
                                .setTextAlign("left")
                                .setTextFont("bold 34px Arial")
                                .printText(t(`weapon_license.name.fr`), 48, 159)
                                .printText("Type", 48, 268)
                                .printText(t("weapon_license.since"), 48, 374)
                                .setColor("white")
                                .printText(idData ? `${idData.last_name} ${idData.first_name}` : member.displayName, 84, 204)
                                .printText(t(`weapon_license.types.${data.type}`), 84, 313)
                                .printText(client.dayjs(data.date).format("DD/MM/YYYY"), 84, 422)
                                .setTextFont("bold 18px Arial")
                                .printText(t("weapon_license.undersigned"), 803, 448)
                                .setTextFont("32px Jennifer-Lynne")
                                .printText(t("weapon_license.interior_departement"), 725, 480)
                                break;

                            }

                        }
                        
                        if (theme === "flat") canvas.printCircularImage(await loadImage(member.user.displayAvatarURL({ extension: "png" })), 170, 300, 110);
                        
                        const attachment = new AttachmentBuilder(await canvas.pngAsync(), { name: "paper.png" })
                        embed.setImage("attachment://paper.png")
                        return { embeds: [embed], components: [secondRows], files: [attachment], fetchReply: true }

                    }
    
                }

            }

        }

        const message = await interaction.reply(await render(null, null, 0)).catch(() => {});
        if (!message) return;

        const collector = await message.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.member.id, time: 90000, components: []});
        if (!collector) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");

        let current = 0, type = null, index = null;
        collector.on("collect", async (i) => {

            if (!["next", "previous"].includes(i.customId) && index !== i.customId) current = 0;
            index = i.customId == "wallet" ? null : ["previous", "next"].includes(i.customId) ? index : i.customId;

            switch(i.customId) {
                
                case "wallet": type = null; break;

                case "previous": current--; break;
                case "next": current++; break;

                case "id_cards": type = idCards; break;
                case "cg": type = cg; break;
                case "driver_license": type = driverLicenses; break;
                case "weapon_license": type = weaponLicenses; break;

            }

            await i.update(await render(type, index, current)).catch(() => {})

        })

        collector.on("end", (collected) => {
            return interaction.editReply({ components: [] }).catch(() => {});
        })


        } catch (err) {
            console.error(err);

            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }
        
    }
};
