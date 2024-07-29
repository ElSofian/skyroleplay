const { EmbedBuilder, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = {
    category: { "en": "roleplay", "fr": "roleplay" },
    name: "ticket-gratter",
    nameLocalizations: {    
        "fr": "ticket-gratter",
        "en-GB": "scratch-card",
        "en-US": "scratch-ticket"
    },
    description: "Acheter un ticket à gratter.",
    descriptionLocalizations: {
        "fr": "Acheter un ticket à gratter.",
        "en-GB": "Buy a scratch ticket.",
        "en-US": "Buy a scratch ticket."
    },
    run: async(client, interaction, { t, errorEmbed, successEmbed, economySymbol }) => {

        
        try {
            
        await interaction.deferReply().catch(() => {})

        const options = await client.db.getOptions(interaction.guildId, [
            "scratch.price",
            "scratch.first.emoji", "scratch.second.emoji", "scratch.third.emoji",
            "scratch.first", "scratch.second", "scratch.third"
        ]);

        const result = await client.functions.userinput.askValidation(interaction, t("ask", { money: `${options["scratch.price"]}${economySymbol}` }), false, "editReply");
        if (!result) return;

        const memberAccount = await client.db.getMoney(interaction.guildId, interaction.member.id);
        if ((memberAccount?.cash_money ?? 0) < options["scratch.price"]) return errorEmbed(t("no_money"), false, true, "editReply");

        var boxes = ["⬛", "⬛", "⬛"]
        var items = [options["scratch.first.emoji"], options["scratch.second.emoji"], options["scratch.third.emoji"]]

        const embed = new EmbedBuilder()
            .setColor("White")
            .setTitle(t("title"))
            .setThumbnail('https://media.discordapp.net/attachments/850491658339352577/986612596700495872/gif_grattage.gif')
            .setDescription(
                `${t("description", { user: interaction.member.toString() })}
            \n\n ${boxes[0]}  ${boxes[1]}  ${boxes[2]} \n\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n${items[0]} ${options["scratch.first"]}${economySymbol}・ ${items[1]} ${options["scratch.second"]}${economySymbol}・ ${items[2]} ${options["scratch.third"]}${economySymbol}`)

        const row = new ActionRowBuilder().addComponents( new ButtonBuilder().setCustomId(`scratch`).setEmoji("🎰").setStyle(ButtonStyle.Secondary));

        const sendEmbed = await interaction.followUp({ embeds: [embed], components: [row], fetchReply: true }).catch(() => { });
        if (!sendEmbed) return result.update({ content: null, embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], components: [] }).catch(() => {});
     
        let amount = 0
        let last_date = Date.now();
        let end = false;

        function getMoney(text) {
            switch (text) {
                case options["scratch.first.emoji"]: return options["scratch.first"];
                case options["scratch.second.emoji"]: return options["scratch.second"];
                case options["scratch.third.emoji"]: return options["scratch.third"];
            }
        };

        const collector = sendEmbed.createMessageComponentCollector({ filter: (i) => i.isButton() && i.customId == `scratch` && i.user.id === interaction.member.id, time: 60000 });
        if (!collector) return result.update({ content: null, embeds: [errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), true)], components: [] }).catch(() => {});

        result.update({ embeds: [successEmbed(t("confirm"), true)], components: [] }).catch(() => {});

        collector.on("collect", async (i) => {

            setTimeout(() => i.update().catch(() => {}), 2000)
    
            if ((Date.now() - last_date >= 2000 || amount == 0) && amount < 3) {

                amount++;
                boxes[amount - 1] = items[client.functions.other.randomBetween(0, 2)];

                embed.setDescription(`${t("description", { user: interaction.user.toString() })}
                \n\n ${boxes[0]}  ${boxes[1]}  ${boxes[2]} \n\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n${options["scratch.first.emoji"]} ${options["scratch.first"]}${economySymbol}・${options["scratch.second.emoji"]} ${options["scratch.second"]}${economySymbol}・${options["scratch.third.emoji"]} ${options["scratch.third"]}${economySymbol}`)

                let components = sendEmbed.components;
                if (amount == 3) components = [];

                sendEmbed.edit({ embeds: [embed], components }).catch(() => {});
                last_date = Date.now()

                if (amount == 3 || (boxes[0] !== boxes[1] && boxes[1] !== "⬛")) {

                    let result = boxes.every((val, i, arr) => val === arr[0])

                    result ? embed.setColor("Green") : embed.setColor("Red");
                    result ? result = "win" : result = "lose";
                 
                    let money = getMoney(boxes[0]);

                    embed.setDescription(`${t("description", { user: interaction.user.toString() })}
                        \n\n ${boxes[0]}  ${boxes[1]}  ${boxes[2]}  ${t(result, { money: `${money}${economySymbol}` })}\n\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n${options["scratch.first.emoji"]} ${options["scratch.first"]}${economySymbol}・${options["scratch.second.emoji"]} ${options["scratch.second"]}${economySymbol}・${options["scratch.third.emoji"]} ${options["scratch.third"]}${economySymbol}`);

                    sendEmbed.edit({ embeds: [embed], components: [] }).catch(() => {});

                    const newMemberAmount = await client.db.getMoney(interaction.guildId, i.user.id);
                    if (newMemberAmount?.cash_money + money >= 2147483647) return sendEmbed.edit({ content: null, embeds: [errorEmbed(t("int_passing", { name: lang == "fr" ? "votre argent liquide" : "your cash money" }, "errors"), true)], components: [] }).catch(() => {})
                    await client.db.addMoney(interaction.guildId, interaction.user.id, "cash_money", result == "win" ? money - options["scratch.price"] : -options["scratch.price"]);
                    
                    end = true;
                    return collector.stop();
                }
            };

        });

        collector.on("end", (collected) => {
            if (collected.size >= 3 || end) return;
            sendEmbed.edit({ content: null, embeds: [errorEmbed(t("time", false, "errors"), true)], components: [] }).catch(() => {});
        });


        } catch (err) {
            console.error(err);

            return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
        }

    },
};
