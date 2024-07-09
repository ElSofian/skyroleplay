const { EmbedBuilder, StringSelectMenuBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, CommandInteraction, ButtonStyle } = require("discord.js");
const { Canvas, loadImage } = require("canvas-constructor/napi-rs");

/**
 * Sends a validation message to the user
 * @param {CommandInteraction} interaction The original interaction
 * @param {string} text The text to display
 * @param {string} [method] The method used to reply to the interaction (default to "reply")
 * @returns {Promise<?ButtonInteraction>} The final button interaction (if the user confirmed), or null if the user canceled or if the collector expired
 */
module.exports = class UserInput {
    
    constructor(client, options) {
        this.client = client;
        this.options = options;
    }
    

    askValidation = async (interaction, text, ephemeral = true, method = "reply") => {

        const lang = await this.client.db.getOption(interaction.guildId, "guild.lang");
        const embed = new EmbedBuilder().setColor("Green").setDescription(`${this.client.constants.emojis.reussi} ${text}`);

        // This unique id allows to identify the messages more accurately and to avoid confusion on other messages
        const id = interaction.member.id;

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel(this.client.translate.t(lang, "interactionCreate.validation.buttons.validate", false, "events", interaction)).setCustomId(`confirm-${id}`),
            new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel(this.client.translate.t(lang, "interactionCreate.validation.buttons.cancel", false, "events", interaction)).setCustomId(`cancel-${id}`)
        );

        if(method) await interaction[method]({ embeds: [embed], components: [row], files: [], ephemeral: ephemeral }).catch(() => {});
        
        const collector = interaction.channel.createMessageComponentCollector({
            filter: (i) => i.isButton() && i.customId.endsWith(id) && i.user.id === interaction.user.id,
            max: 1,
            time: 120000,
        });

        return new Promise((resolve, reject) => {
            collector.on("collect", async (i) => {
                if(i.customId === `confirm-${id}`) return resolve(i);

                await i.update({
                    embeds: [new EmbedBuilder().setColor("Red").setDescription(`${this.client.constants.emojis.redEchec} ${this.client.translate.t(lang, "interactionCreate.validation.cancelled", false, "events")}`)],
                    components: []
                }).catch(() => {});

                resolve(null);
                collector.stop()
            });

            collector.on("end", async (collected) => {
                if(collected.size) return;

                await interaction.editReply({
                    content: null,
                    embeds: [new EmbedBuilder().setColor("Red").setDescription(`${this.client.constants.emojis.redEchec} ${this.client.translate.t(lang, "time", false, "errors")}`)],
                    components: [],
                }).catch(() => {});

                resolve(null);
            });
        });

    };
    
    displayTPE = async (interaction, interactionToRespond, params = {}) => {
        
        const lang = await this.client.db.getOption(interaction.guildId, "guild.lang");
        const render = async(code = "", error = false) => {
            
            const canvas = await this.client.functions.canvas.get("/tpe", { locale: lang, amount: params?.amount ?? 0, symbol: params?.symbol ?? "$", ...(code && { code: code }) })
            const attachment = new AttachmentBuilder(canvas, { name: `tpe.png` })
            const embed = new EmbedBuilder().setColor(error ? "Red" : "#35393E").setImage(`attachment://tpe.png`)
            
            const firstLine = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("1").setLabel("1").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("2").setLabel("2").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("3").setLabel("3").setStyle(ButtonStyle.Secondary),
            )
            const secondLine = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("4").setLabel("4").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("5").setLabel("5").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("6").setLabel("6").setStyle(ButtonStyle.Secondary),
            )
            const thirdLine = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("7").setLabel("7").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("8").setLabel("8").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("9").setLabel("9").setStyle(ButtonStyle.Secondary),
            )
            const fourthLine = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("delete").setEmoji("1102053128834121818").setStyle(ButtonStyle.Danger).setDisabled(code.length < 1),
                new ButtonBuilder().setCustomId("0").setLabel("0").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("validate").setEmoji("1102053653696745512").setStyle(ButtonStyle.Success).setDisabled(code.length < 4),
            )
            const rows = [firstLine, secondLine, thirdLine, fourthLine]
            const retryRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("retry").setLabel(this.client.translate.t(lang, "words.retry", false, "global", interaction)).setStyle(ButtonStyle.Danger));

            return {
                embeds: [embed],
                components: error ? [retryRow] : rows,
                files: [attachment]
            }

        }
        
        const message = await interactionToRespond.update(await render()).catch(() => {})
        if(!message) return

        const collector = message.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.user.id, time: 120000 });
        if(!collector) return

        let code = "";
        return new Promise((resolve, reject) => {
            
            collector.on("collect", async (i) => {

                const newMemberAccount = await this.client.db.getBankAccount(interaction.guildId, i.user.id);
                if(!newMemberAccount) return collector.stop();

                switch(i.customId) {
                    case "retry": code = ""; i.update(await render(code)).catch(() => {}); break;
                    case "validate": {

                        if(newMemberAccount.card_code == parseInt(code)) {
                            resolve(i)
                            return collector.stop();
                        }

                        i.update(await render(code, newMemberAccount.card_code !== parseInt(code))).catch(() => {}) 
                        break;
                    }

                    default: {
                        i.customId == "delete" ? code = code.slice(0, -1) : code += i.customId;
                        if(code.length > 4) code = code.slice(0, 4)
                        
                        i.update(await render(code)).catch(() => {})
                        break;
                    }
                }

            })
        })

    }

    askPayementMethod = async(interaction, defaultMethod, ephemeral = true, method = "reply") => {

        const lang = await this.client.db.getOption(interaction.guildId, "guild.lang");
        const embed = new EmbedBuilder().setColor("Green").setDescription(`${this.client.constants.emojis.reussi} ${this.client.translate.t(lang, `interactionCreate.payement_method.text.${defaultMethod}`, false, "events", interaction)}`);

        // This unique id allows to identify the messages more accurately and to avoid confusion on other messages
        const id = interaction.member.id;
        
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel(this.client.translate.t(lang, "interactionCreate.validation.buttons.validate", false, "events", interaction)).setCustomId(`confirm-${id}`),
            new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel(this.client.translate.t(lang, "interactionCreate.validation.buttons.cancel", false, "events", interaction)).setCustomId(`cancel-${id}`)
        );

        if(method) await interaction[method]({ embeds: [embed], components: [row], files: [], ephemeral: ephemeral }).catch(() => {});
        
        const collector = interaction.channel.createMessageComponentCollector({
            filter: (i) => i.isButton() && i.customId.endsWith(id) && i.user.id === interaction.user.id,
            max: 1,
            time: 60000,
        });

        return new Promise((resolve, reject) => {
            collector.on("collect", async (i) => {
                if(i.customId === `confirm-${id}`) return resolve(i);

                await i.update({
                    embeds: [new EmbedBuilder().setColor("Red").setDescription(`${this.client.constants.emojis.redEchec} ${this.client.translate.t(lang, "interactionCreate.payement_method.cancelled", false, "events")}`)],
                    components: []
                }).catch(() => {});

                resolve(null);
                collector.stop()
            });

            collector.on("end", async (collected) => {
                if(collected.size) return;

                await interaction.editReply({
                    content: null,
                    embeds: [new EmbedBuilder().setColor("Red").setDescription(`${this.client.constants.emojis.redEchec} ${this.client.translate.t(lang, "time", false, "errors")}`)],
                    components: [],
                }).catch(() => {});

                resolve(null);
            });
        });

    }

    askPPAType = async(interaction, types, ephemeral = true, method = "reply") => {
        return new Promise(async (resolve, reject) => {

            const lang = await this.client.db.getOption(interaction.guildId, "guild.lang");
            const embed = new EmbedBuilder().setColor("Green").setDescription(`${this.client.translate.t(lang, "select_weapon_type", false, "commands/moderation", interaction)}`);

            // This unique id allows to identify the messages more accurately and to avoid confusion on other messages 
            const id = interaction.member.id;

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId(`ppa-type-${id}`).setPlaceholder(this.client.translate.t(lang, "weapon_type", false, "commands/moderation", interaction)).setOptions(types.map((type) => {
                    return { label: type.name, value: type.value, emoji: type.emoji }
                }))
            );

            if(method) await interaction[method]({ embeds: [embed], components: [row], files: [], ephemeral: ephemeral }).catch(console.error);
                
            const collector = interaction.channel.createMessageComponentCollector({
                filter: (i) => i.isStringSelectMenu() && i.customId.endsWith(id) && i.user.id === interaction.user.id,
                max: 1,
                time: 60000,
            });

            collector.on("collect", async (i) => {
                resolve(i.values[0]);
            });

            collector.on("end", async (collected) => {
                if(collected.size) return;

                await interaction.editReply({
                    content: null,
                    embeds: [new EmbedBuilder().setColor("Red").setDescription(`${this.client.constants.emojis.redEchec} ${this.client.translate.t(lang, "time", false, "errors")}`)],
                    components: [],
                }).catch(console.error);

                resolve(null);
            });
            
        });
    }

}