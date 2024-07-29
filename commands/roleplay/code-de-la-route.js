const { Embed, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    category: { "en": "roleplay", "fr": "roleplay" },
    name: "code-de-la-route",
    nameLocalizations: {
        "fr": "code-de-la-route",
        "en-GB": "highway-code",
        "en-US": "highway-code"
    },
    description: "Passez votre code de la route.",
    descriptionLocalizations: {
        "fr": "Passez votre code de la route.",
        "en-GB": "Pass your highway code.",
        "en-US": "Pass your highway code."
    },
    run: async(client, interaction, { t, errorEmbed, lang }) => {

        try {

            
        const hasHighwayCode = await client.db.hasHighwayCode(interaction.guildId, interaction.member.id)
        if (hasHighwayCode) return errorEmbed(t("already_have_code"))
        
        await interaction.deferReply()

        const theme = await client.db.getOption(interaction.guildId, "id_cards.theme"); // Si thème "fr" -> code fr sinon code en (version pas la langue)
        const questions = [
            {
                en: {
                    name: "Am I well placed to go :",
                    a: "Straight ahead",
                    b: "To the right",
                    response: "b",
                    image: "1",
                },
                fr: {
                    name: "Suis-je bien placé pour aller :",
                    a: "Tout Droit",
                    b: "À droite",
                    response: "b",
                    image: "1",
                },
            },
            {
                en: {
                    name: "Can I turn around ?",
                    a: "Yes",
                    b: "No",
                    response: "b",
                    image: "2",
                },
                fr: {
                    name: "Puis-je faire demi tour ?",
                    a: "Oui",
                    b: "Non",
                    response: "b",
                    image: "2",
                },
            },
            {
                en: {
                    name: "Can I turn right ?",
                    a: "Yes",
                    b: "No",
                    response: "b",
                    image: "2"
                },
                fr: {
                    name: "Je peux tourner à droite ?",
                    a: "Oui",
                    b: "Non",
                    response: "b",
                    image: "2"
                },
            },
            {
                en: {
                    name: "Do I have to go straight ahead ?",
                    a: "Yes",
                    b: "No",
                    response: "a",
                    image: "2"
                },
                fr: {
                    name: "Je dois aller tout droit ?",
                    a: "Oui",
                    b: "Non",
                    response: "a",
                    image: "2"
                },
            },
            {
                en: {
                    name: "In this situation what do you do ?",
                    a: "I overtake the bus",
                    b: "I let the bus pass",
                    c: "I get on the left lane",
                    d: "I honk to warn him that I'm overtaking him",
                    response: "b",
                    image: "3",
                },
                fr: {
                    name: "Dans cette situation que faites-vous ?",
                    a: "Je dépasse le bus",
                    b: "Je laisse passer le bus",
                    c: "Je me met sur la voie de gauche",
                    d: "Je klaxon pour le prévenir que je le dépasse",
                    response: "b",
                    image: "3",
                },
            },
            {
                en: {
                    name: "Can I overtake this bike ?",
                    a: "Yes",
                    b: "No",
                    response: "b",
                    image: "4",
                },
                fr: {
                    name: "Je peux doubler ce vélo ?",
                    a: "Oui",
                    b: "Non",
                    response: "b",
                    image: "4",
                },
            },
            {
                en: {
                    name: "I am a witness of a road accident.",
                    a: "It is not my duty to take care of this",
                    b: "I stop",
                    response: "b",
                    image: "5",
                },
                fr: {
                    name: "Je suis témoin d'un accident de la route.",
                    a: "Ce n'est pas mon devoir de m'occuper de cela",
                    b: "Je m'arrête",
                    response: "b",
                    image: "5",
                },
            },
            {
                en: {
                    name: "Can I park directly on the right ?",
                    a: "Yes",
                    b: "No",
                    response: "b",
                    
                },
                fr: {
                    name: "Je peux stationner directement à droite ?",
                    a: "Oui",
                    b: "Non",
                    response: "b",
                    image: "6",
                },
            },
            {
                en: {
                    name: "Can I stop directly on the right with my warnings ?",
                    a: "Yes",
                    b: "No",
                    response: "a",
                    image: "6",
                },
                fr: {
                    name: "Je peux m'arrêter directement à droite avec mes warnings ?",
                    a: "Oui",
                    b: "Non",
                    response: "a",
                    image: "6",
                },
            },
            {
                en: {
                    name: "I turn on my high beams ?",
                    a: "Yes",
                    b: "No",
                    response: "a",
                    image: "7",
                },
                fr: {
                    name: "J'allume mes feux de route ?",
                    a: "Oui",
                    b: "Non",
                    response: "a",
                    image: "7",
                },
            },
            {
                en: {
                    name: "On this type of road, am I limited to 130km/h ?",
                    a: "Yes",
                    b: "No",
                    response: "a",
                    image: "7",
                },
                fr: {
                    name: "Sur ce type de route, je suis limité à 130km/h ?",
                    a: "Oui",
                    b: "Non",
                    response: "a",
                    image: "7",
                },
            },
            {
                en: {
                    name: "I continue straight ahead, so I must :",
                    a: "I stop",
                    b: "I give way to the right",
                    c: "I continue to move forward",
                    response: "b",
                    image: "8",
                },
                fr: {
                    name: "Je continue tout droit, je dois donc :",
                    a: "Je m'arrête",
                    b: "Je cède le passage à droite",
                    c: "Je continue d'avancer",
                    response: "b",
                    image: "8",
                },
            },
            {
                en: {
                    name: "I turn right, so I must :",
                    a: "I stop",
                    b: "I give way to the right",
                    c: "I continue to move forward",
                    response: "c",
                    image: "8",
                },
                fr: {
                    name: "Je tourne à droite, je dois donc :",
                    a: "Je m'arrête",
                    b: "Je cède le passage à droite",
                    c: "Je continue d'avancer",
                    response: "c",
                    image: "8",
                },
            },
            {
                en: {
                    name: "I have been waiting at the red light for 5 minutes, I want to go left.",
                    a: "I put my left turn signal on and I pass them",
                    b: "I put my left turn signal on and I wait",
                    response: "b",
                    image: "9",
                },
                fr: {
                    name: "J'attends au feux rouge depuis 5 minutes, je veux allez à gauche.",
                    a: "Je mets mon clignotant à gauche et je les dépasse",
                    b: "Je met mon clignotant à gauche et j'attend",
                    response: "b",
                    image: "9",
                },
            },
            {
                en: {
                    name: "I must circulate at most at :",
                    a: "30km/h",
                    b: "50km/h",
                    c: "70km/h",
                    d: "90km/h",
                    response: "b",
                    image: "10",
                },
                fr: {
                    name: "Je dois circuler au maximum à :",
                    a: "30km/h",
                    b: "50km/h",
                    c: "70km/h",
                    d: "90km/h",
                    response: "b",
                    image: "10",
                },
            },
            {
                en: {
                    name: "The two parked vehicles, risk :",
                    a: "A fine and the impoundment of the vehicles",
                    b: "A prison sentence and destruction of vehicles",
                    c: "The withdrawal of the driving license",
                    response: "a",
                    image: "11",
                },
                fr: {
                    name: "Les deux véhicules stationnés, risquent :",
                    a: "Une contravention et la mise en fourrière des véhicule",
                    b: "Une peine de prison et destruction des véhicules",
                    c: "Le retrait du permis de conduire",
                    response: "a",
                    image: "11",    
                },
            },
            {
                en: {
                    name: "I checked around and no car is present.",
                    a: "I slow down and I pass",
                    b: "I pass since I have already checked that there was no danger",
                    c: "I stop",
                    d: "I wait for a car to pass to pass",
                    response: "c",
                    image: "12",
                },
                fr: {
                    name: "J'ai vérifié aux alentours et aucune voiture n'est présente.",
                    a: "Je ralentis et je passe",
                    b: "Je passe puisque j'ai déjà vérifié qu'il n'y avais aucun danger",
                    c: "Je m'arrête",
                    d: "J'attend qu'une voiture passe pour passer",
                    response: "c",
                    image: "12",
                },
            },
            {
                en: {
                    name: "This vehicle overtook me dangerously.",
                    a: "I honk and I take my distances",
                    b: "Make high beam calls",
                    c: "I take my distances",
                    response: "a",
                    image: "13",
                },
                fr: {
                    name: "Ce véhicule m'a dépassé dangereusement.",
                    a: "Je klaxon et je prends mes distances",
                    b: "Fait des appels de feux de route",
                    c: "Je prends mes distances",
                    response: "a",
                    image: "13",
                },
            },
            {
                en: {
                    name: "Some medications taken with alcohol increase negative effects ?",
                    a: "Yes",
                    b: "No",
                    response: "a",
                    image: "14",
                },
                fr: {
                    name: "Certains médicaments absorbés avec l'alcool augmentent les effets négatifs ?",
                    a: "Oui",
                    b: "Non",
                    response: "a",
                    image: "14",
                },
            },
            {
                en: {
                    name: "What is the percentage of alcohol in the blood from which I am no longer allowed to drive ?",
                    a: "0,5g/L",
                    b: "0,8g/L",
                    c: "1,5g/L",
                    d: "2,5g/L",
                    response: theme == "fr" ? "a" : "b",
                    image: "15",
                },
                fr: {
                    name: "Quel est le pourcentage d'alcool dans le sang à partir du quel je ne suis plus autorisé à conduire ?",
                    a: "0,5g/L",
                    b: "0,8g/L",
                    c: "1,5g/L",
                    d: "2,5g/L",
                    response: theme == "fr" ? "a" : "b",
                    image: "15",
                },
            },
        ];


        const min = await client.db.getOption(interaction.guildId, "highway_code.min")
        const embed = new EmbedBuilder().setColor("#5865F2").setThumbnail("https://imgur.com/YKCAfwB.png").setTitle(t("code")).setDescription(t("description", { total: questions.length, min: min }))
        const rows = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("start") .setLabel(t("start")).setStyle(ButtonStyle.Primary))

        const render = async(current, end = false, points) => {

            const renderEmbed = EmbedBuilder.from(embed)
            const question = questions[current][lang]

            if (end) {

                if (points >= min) {
                    renderEmbed.setDescription(t("success", { points: points, total: questions.length }))
                    await client.db.giveHighwayCode(interaction.guildId, interaction.member.id)
                } else {
                    renderEmbed.setDescription(t("failed", { points: points, total: questions.length }))
                }

            } else renderEmbed.setDescription(`${question.name}`)

            
            const attachment = new AttachmentBuilder(`./assets/highway_code/${question.image}.png`, { name: "image.png" })
            renderEmbed.setImage("attachment://image.png")
            
            const responseRows = new ActionRowBuilder()
            for (const r of ["a", "b", "c", "d"]) {

                const response = question?.[r]
                if (!response) continue;
                
                responseRows.addComponents(new ButtonBuilder().setCustomId(r).setLabel(r.toUpperCase()).setStyle(ButtonStyle.Secondary))
                if (!end) renderEmbed.addFields([{ name: `${t("response")} ${r.toUpperCase()}`, value: response }])

            }
            
            return {
                embeds: [renderEmbed],
                components: end ? [] : [responseRows],
                files: end ? [] : [attachment]
            }

        }

        const message = await interaction.editReply({ embeds: [embed], components: [rows], fetchReply: true })
        if (!message) return;

        const collector = message.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.user.id, time: 420000 });
        if (!collector) return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");

        let current = 0, points = 0, end = false;
        collector.on("collect", async (i) => {

            switch(i.customId) {

                case "start": i.update(await render(0)); break;
                default: {

                    if (current < questions.length) {
                        if (questions[current][lang].response == i.customId) points++;
                        if (current+1 !== questions.length) current++;
                        else end = true
                    }
        
                    i.update(await render(current, end, points))
                    
                    break;
                }

            }
            
        })


        collector.on("end", (collected) => {
            interaction.editReply({ components: [] }).catch(() => {});
        })


        } catch (err) {
            console.error(err);
            
            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    }
};
