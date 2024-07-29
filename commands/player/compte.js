const { EmbedBuilder, AttachmentBuilder, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

module.exports = {
    category: { "en": "player", "fr": "joueur" },
    name: "compte",
    nameLocalizations: {
        "fr": "compte",
        "en-GB": "account",
        "en-US": "account",
    },
    description: "Affiche votre compte sur le réseau social choisi.",
    descriptionLocalizations: {
        "fr": "Affiche votre compte sur le réseau social choisi.",
        "en-GB": "Display your social account.",
        "en-US": "Display your social account."
    },
    options: [{
        name: "réseau",
        nameLocalizations: {
            "fr": "réseau"
        },
        description: "Choisissez le réseau sur lequel vous souhaitez aller.",
        descriptionLocalizations: {
            "fr": "Choisissez le réseau sur lequel vous souhaitez aller.",
            "en-GB": "Choose the social media to display",
            "en-US": "Choose the social media to display",
        },
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
            {
                name: "Twitter",
                value: "twitter"
            },
            {
                name: "Instagram",
                value: "instagram"
            },
            {
                name: "Telegram",
                value: "telegram"
            }
        ]
    }],
    run: async(client, interaction, { t, errorEmbed, successEmbed, lang }) => {

        try {

			const type = interaction.options.getString("réseau", true);
			let color, thumbnail, warningEmoji, certifiedEmoji = "" //client.constants.emojis.certified;
			switch(type) {
				case "instagram": color = "#8134AF"; thumbnail = "https://imgur.com/FrpD6Sc.png"; warningEmoji = client.constants.emojis.instagram_warning; break;
				case "twitter": color = "#00acee"; thumbnail = "https://imgur.com/1jAxzaY.png"; warningEmoji = client.constants.emojis.twitter_warning; break;
				case "telegram": color = "#0088CC"; thumbnail = "https://imgur.com/HMr5ZS9.png"; warningEmoji = client.constants.emojis.telegram_warning; break;
			}
	
			const connectRows = new ActionRowBuilder().addComponents(
				new ButtonBuilder().setCustomId("connect").setLabel(t("buttons.connect")).setStyle(ButtonStyle.Secondary),
				new ButtonBuilder().setCustomId("signup").setLabel(t("buttons.signup")).setStyle(ButtonStyle.Secondary)
			)
			const retryRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("retry").setLabel(t("buttons.retry")).setStyle(ButtonStyle.Secondary))
	
			const rows = new ActionRowBuilder().addComponents(
				new ButtonBuilder().setCustomId("disconnect").setLabel(t("buttons.disconnect")).setStyle(ButtonStyle.Primary),
				new ButtonBuilder().setCustomId("manage").setLabel(t("buttons.manage")).setStyle(ButtonStyle.Secondary),
				new ButtonBuilder().setCustomId("following").setLabel(t("buttons.following")).setStyle(ButtonStyle.Secondary),
				new ButtonBuilder().setCustomId("followers").setLabel(t("buttons.followers")).setStyle(ButtonStyle.Secondary),
			)
	
			const manageRows = [new ActionRowBuilder().addComponents(
				new ButtonBuilder().setCustomId("back").setLabel(t("buttons.back")).setStyle(ButtonStyle.Primary),
				new ButtonBuilder().setCustomId("delete").setLabel(t("buttons.delete")).setStyle(ButtonStyle.Danger),
			),
			new ActionRowBuilder().addComponents(
				new ButtonBuilder().setCustomId("change_name").setLabel(t("buttons.change_name")).setStyle(ButtonStyle.Secondary),
				new ButtonBuilder().setCustomId("change_nickname").setLabel(t("buttons.change_nickname")).setStyle(ButtonStyle.Secondary),
				new ButtonBuilder().setCustomId("change_pp").setLabel(t("buttons.change_pp")).setStyle(ButtonStyle.Secondary),
				new ButtonBuilder().setCustomId("change_bio").setLabel(t("buttons.change_bio")).setStyle(ButtonStyle.Secondary),
			)]
	
			let name, nickname, bio, password, accountId;
			const render = async (path = "connect", options = {}) => {
				
				const accountConnected = await client.db.getSocialAccountConnected(interaction.guildId, interaction.member.id, type);
				if (accountConnected && path == "connect") {
					accountId = accountConnected.id, name = accountConnected.name, nickname = accountConnected.nickname, bio = accountConnected.bio, password = accountConnected.password;
					path = "account", options.specificRows = rows
				}
	
				let profilePicture = interaction.member.displayAvatarURL();
				if (path !== "connect") {
					const account = await client.db.getSocialAccountLogin(interaction.guildId, type, nickname, password);
					if (!account) return { embeds: [errorEmbed(t("no_longer_exists"), true)], components: [], files: [] }
					else accountId = account.id
	
					// profilePicture = await client.s3.getObject(`social_account/${type}/${interaction.guildId}-${interaction.member.id}`, { buffer: false });
					profilePicture = interaction.member.displayAvatarURL()
				}

				const embed = new EmbedBuilder()
				.setColor(options?.error ? "Red" : color)
				.setThumbnail(thumbnail)
				.setAuthor({
					name: path == "connect" ? t("connection") : `${name} (@${nickname})`,
					iconURL: path == "connect" ? `https://cdn.discordapp.com/emojis/${client.constants.emojis.connexion.slice(-20, -1)}.png` : profilePicture
				})
				.setDescription(bio ?? t(`embed.description.${path}`, { 
					type: client.functions.other.cfl(type), 
					followers: options?.followAmount, 
					following: options?.followAmount, 
					warningEmoji: "⚠️",
					clientId: client.user.id
				}))
	
				return {
					embeds: [embed],
					components: path == "manage" ? options?.specificRows ?? [] : [options?.specificRows ?? connectRows]
				}
			}
	
			const message = await interaction.reply(await render("connect", { specificRows: connectRows })).catch(() => {});
			if (!message) return;
	
			const collector = message.createMessageComponentCollector({ filter: (i) => i.user.id == interaction.member.id, time: 180000 });
			if (!collector) return;
	
			collector.on("collect", async(i) => {
	
				switch(i.customId) {
					
					case "manage": i.update(await render(i.customId, { specificRows: manageRows })).catch(() => {}); break;
					case "back": i.update(await render()).catch(() => {}); break;
	
					case "retry":
					case "connect": {
	
						const code = Math.floor(Math.random() * 9000000000) + 1000000000
						const modal = new ModalBuilder()
						.setCustomId(`${code}_modal_connect`)
						.setTitle(client.functions.other.cfl(type))
						.setComponents(
							new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("nickname").setLabel(t("modal.nickname")).setPlaceholder(t("modal.placeholder_nickname")).setMinLength(4).setMaxLength(55).setStyle(TextInputStyle.Short)),
							new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("password").setLabel(t("modal.password")).setPlaceholder(t("modal.placeholder_password")).setMinLength(4).setMaxLength(55).setStyle(TextInputStyle.Short))
						)
	
						await i.showModal(modal).catch(() => {});
	
						const modalCollector = await i.awaitModalSubmit({ filter: (ii) => ii.user.id == i.user.id && ii.customId == `${code}_modal_connect`, time: 60000 })
						if (!modalCollector) return;
	
						const modalNickname = modalCollector.fields.getTextInputValue("nickname")
						const modalPassword = modalCollector.fields.getTextInputValue("password")
						nickname = modalNickname, password = modalPassword
						
						const login = await client.db.getSocialAccountLogin(interaction.guildId, type, nickname, password) 
						if (!login) modalCollector.update(await render("connect_error", { error: true, specificRows: retryRow })).catch(() => {});
						else {
							nickname = login.nickname, accountId = login.id
							await client.db.setSocialAccountConnexion(interaction.guildId, accountId, interaction.member.id)
							modalCollector.update(await render("account", { specificRows: rows })).catch(() => {});
						}
					
						break;
					}
	
					case "signup": {
	
						const code = Math.floor(Math.random() * 9000000000) + 1000000000
						const modal = new ModalBuilder()
						.setCustomId(`${code}_modal_connect`)
						.setTitle(client.functions.other.cfl(type))
						.setComponents(
							new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("name").setLabel(t("modal.name")).setPlaceholder(t("modal.placeholder_name")).setMinLength(4).setMaxLength(55).setStyle(TextInputStyle.Short)),
							new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("nickname").setLabel(t("modal.nickname")).setPlaceholder(t("modal.placeholder_nickname")).setMinLength(4).setMaxLength(55).setStyle(TextInputStyle.Short)),
							new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("password").setLabel(t("modal.password")).setPlaceholder(t("modal.placeholder_password")).setMinLength(4).setMaxLength(55).setStyle(TextInputStyle.Short)),
							new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("bio").setLabel(t("modal.bio")).setPlaceholder(t("modal.placeholder_bio")).setMinLength(2).setMaxLength(300).setStyle(TextInputStyle.Paragraph))
						)
	
						await i.showModal(modal).catch(() => {});
	
						const modalCollector = await i.awaitModalSubmit({ filter: (ii) => ii.user.id == i.user.id && ii.customId == `${code}_modal_connect`, time: 60000 })
						if (!modalCollector) return;
	
						const modalname = modalCollector.fields.getTextInputValue("name");
						const modalNickname = modalCollector.fields.getTextInputValue("nickname");
						const modalPassword = modalCollector.fields.getTextInputValue("password");
						const modalBio = modalCollector.fields.getTextInputValue("bio");
						name = modalname, password = modalPassword, nickname = modalNickname, bio = modalBio;
						
						const createSocialAccount = await client.db.createSocialAccount(interaction.guildId, interaction.member.id, type, name, nickname, bio, password)
						accountId = createSocialAccount.insertId
	
						modalCollector.update(await render("account", { specificRows: rows })).catch(() => {});
					
						break;
	
					}
	
					case "disconnect": {
	
						await client.db.setSocialAccountConnexion(interaction.guildId, accountId, null)
						i.update(await render("connect", { specificRows: connectRows })).catch(() => {});
						break;
					}
	
					case "delete": {
	
						const confirm = await client.functions.userInput.askValidation(i, t("confirm", { type: client.functions.other.cfl(type), name: name }), true, "update");
						if (!confirm) return
	
						await client.s3.deleteObject(`social_account/${type}/${interaction.guildId}-${interaction.member.id}`)
						await client.db.deleteSocialAccount(interaction.guildId, accountId)
						confirm.update(await render("deleted", { specificRows: null })).catch(() => {});
	
						break;
					}

					case "change_name": {
	
						const code = Math.floor(Math.random() * 9000000000) + 1000000000
						const modal = new ModalBuilder()
						.setCustomId(`${code}_modal_change_name`)
						.setTitle(t(type))
						.setComponents(
							new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("name").setLabel(t(`modal.name`)).setPlaceholder(t(`modal.placeholder_new_name`)).setMinLength(4).setMaxLength(55).setStyle(TextInputStyle.Short))
						)
	
						await i.showModal(modal)
	
						const modalCollector = await i.awaitModalSubmit({ filter: (ii) => ii.user.id == i.user.id && ii.customId == `${code}_modal_change_name`, time: 60000 })
						if (!modalCollector) return;
	
						const modalName = modalCollector.fields.getTextInputValue("name");
						name = modalName;

						if (await client.db.getSocialAccountByName(interaction.guildId, name, type)) return errorEmbed(t("name_already_exists"), false, true, "reply", i);

						await client.db.setSocialAccountName(interaction.guildId, accountId, name)
						modalCollector.update(await render("account", { specificRows: rows }));
						break;
						
					}
	
					case "change_nickname": {
	
						const code = Math.floor(Math.random() * 9000000000) + 1000000000
						const modal = new ModalBuilder()
						.setCustomId(`${code}_modal_change_nickname`)
						.setTitle(t(type))
						.setComponents(
							new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("nickname").setLabel(t(`modal.nickname`)).setPlaceholder(t(`modal.placeholder_new_nickname`)).setMinLength(4).setMaxLength(55).setStyle(TextInputStyle.Short))
						)
	
						await i.showModal(modal).catch(() => {});
	
						const modalCollector = await i.awaitModalSubmit({ filter: (ii) => ii.user.id == i.user.id && ii.customId == `${code}_modal_change_nickname`, time: 60000 })
						if (!modalCollector) return;
	
						const modalNickname = modalCollector.fields.getTextInputValue("nickname");
						nickname = modalNickname;

						await client.db.setSocialAccountNickname(interaction.guildId, accountId, nickname)
						modalCollector.update(await render("account", { specificRows: rows }));
						break;
						
					}
					
					case "change_bio": {

						const code = Math.floor(Math.random() * 9000000000) + 1000000000
						const modal = new ModalBuilder()
						.setCustomId(`${code}_modal_change_bio`)
						.setTitle(t(type))
						.setComponents(
							new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("bio").setLabel(t(`modal.bio`)).setPlaceholder(t(`modal.placeholder_new_bio`)).setMinLength(2).setMaxLength(300).setStyle(TextInputStyle.Short))
						)
	
						await i.showModal(modal)
	
						const modalCollector = await i.awaitModalSubmit({ filter: (ii) => ii.user.id == i.user.id && ii.customId == `${code}_modal_change_bio`, time: 60000 })
						if (!modalCollector) return;
	
						const modalBio = modalCollector.fields.getTextInputValue("bio");
						bio = modalBio;

						await client.db.setSocialAccountBio(interaction.guildId, accountId, bio);
						modalCollector.update(await render("account", { specificRows: rows }));
						break;

					}

					case "change_pp": {
	
						i.update(await render("change_pp", { specificRows: null })).catch(() => {});
	
						const collector = i.channel?.createMessageCollector({ filter: (m) => m.author.id == i.user.id && m.content !== "" && m.content.includes(client.user.id), time: 60000 });
						if (!collector) return
	
						collector.on("collect", async(m) => {
	
							const attachment = m.attachments.first()
							if (!attachment) return m.reply({ embeds: [errorEmbed(t("no_attachment"), true)], components: [], files: [] }).catch(() => {});
	
							await client.s3.uploadObject(`social_account/${type}/${interaction.guildId}-${interaction.member.id}`, attachment)
							return m.reply({ embeds: [successEmbed(t("changed_pp"), true)], components: [], files: [] }).catch(() => {});
							
						})
	
						collector.on("end", async() => {})
						break;
					}
	
					case "followers":
					case "following": {

						const follow = await client.db[`getSocial${client.functions.other.cfl(i.customId)}`](interaction.guildId, accountId);
						if (!follow.length) return errorEmbed(t(`no_${i.customId}`), false, true, "reply", i);
	
						const display = [{
							name: t("buttons.back"),
							emoji: client.constants.emojis[`${type}_back`],
						}, ...follow]
	
						const selectMenu = new ActionRowBuilder().addComponents(
							new StringSelectMenuBuilder().setCustomId(`sm_${i.customId}`).setPlaceholder(t("select_menu.placeholder", { type: t(`select_menu.${i.customId}`) })).addOptions(
								display.map((f) => 
									({ label: f?.name ?? `${f.nickname} (@${f.name})`,
									   value: f?.name ? "back" : `${f.user_id}&#46;${i.customId == "followers" ? f.account_id : f.target_id}`,
									   emoji: f?.emoji ?? "👤"
									})
								)
							)
						)
						
						i.update(await render(i.customId, { followAmount: follow?.length, specificRows: selectMenu })).catch(() => {})
						break;
	
					}
	
					
					case "sm_following":
					case "sm_followers": {
	
						if (i.values[0] == "back") return i.update(await render("account", { specificRows: rows })).catch(() => {});
						
						const memberId = i.values[0].split("&#46;")[0]
						const followId = i.values[0].split("&#46;")[1]
						const isFollowers = i.customId.includes("followers")
						const followAccount = await client.db.getSocialAccount(interaction.guildId, followId, type);
						if (!followAccount) return errorEmbed(t("no_longer_exists"), false, true, "reply", i);
	
						await interaction.guild.members.fetch();
						const member = interaction.guild.members.cache.get(memberId);
						if (!member) return errorEmbed(t("member_not_found", { link: client.constants.links.support }, "errors"), false, true, "reply", i);
	
						let profilePicture = await client.s3.getObject(`social_account/${type}/${interaction.guildId}-${member.id}`, { buffer: false });
						if (!profilePicture) profilePicture = member.displayAvatarURL()
				
						const embed = new EmbedBuilder()
						.setColor(color)
						.setThumbnail(thumbnail)
						.setAuthor({ name: `${followAccount.nickname} (@${followAccount.name})`, iconURL: profilePicture })
						.addFields([
							{ name: t("embed.fields.name"), value: followAccount.name, inline: true },
							{ name: t("embed.fields.nickname"), value: followAccount.nickname, inline: true },
							{ name: t("embed.fields.certified"), value: t(`words.${followAccount.certified == 1 ? "yes" : "no"}`, false, "global"), inline: true },
							{ name: t("embed.fields.creation_date"), value: time(followAccount.date, "R"), inline: false },
							{ name: t("embed.fields.followers"), value: `${followAccount.followers}`, inline: true },
							{ name: t("embed.fields.following"), value: `${followAccount.following}`, inline: true },
						])
	
						const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(isFollowers ? "followers" : "following").setLabel(t("buttons.back")).setStyle(ButtonStyle.Primary))
						i.update({ embeds: [embed], components: [row] }).catch(() => {})
	
						break;
					}
	
	
				}
	
			})
	
			collector.on("end", async() => {
				interaction.editReply({ components: [] }).catch(() => {});
			})
			
	
			} catch (err) {
				console.error(err);
				return errorEmbed(t("error_occurred", { link: client.constants.links.support }, "errors"), false, true, "editReply");
			}
	
		}
};
