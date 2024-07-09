const { EmbedBuilder } = require('discord.js');

module.exports.run = async(client, member) => {

        const isPremium = await client.db.isPremium(member.guild.id);
        if(!isPremium || member.user.bot) return;

        const options = await client.db.getOptions(member.guild.id, [
            "economy.symbol",
            "economy.start_amount",
            "economy.create_account_bank_start",
            "channel.logs",
            "global.city_name",
            "guild.lang"
        ]);

        if(!options["economy.create_account_bank_start"]) return;
        if(await client.db.hasBankAccount(member.guild.id, member.id)) return;

        // Generate IBAN, secret code and card code
        async function generate(type) {
            let min = type == "card" ? 1000 : type == "secret" ? 100000 : 10000000, max = type == "card" ? 9000 : type == "secret" ? 900000 : 90000000
            let code = Math.floor(Math.random() * max) + min;
            
            while (`${code}`.split("")[0] == '0') code = Math.floor(Math.random() * max) + min;
            if(type == "iban") while(await client.db.checkIban(member.guild.id, code)) code = Math.floor(Math.random() * max) + min;
            
            return code;
        }

        let iban = await generate("iban"), secret = await generate("secret"), card = await generate("card");
        await client.db.createBankAccount(member.guild.id, member.id, iban, secret, card, options["economy.start_amount"] ?? 0);
        await client.db.addTransactionLog(member.guild.id, member.id, options["economy.start_amount"], client.translate.t(options["guild.lang"], "guildMemberAdd.bank_account_creation", false, "events"))

        const logsEmbed = new EmbedBuilder()
            .setColor("Green")
            .setTitle(`${client.constants.emojis.add} ` + client.translate.t(options["guild.lang"], "guildMemberAdd.logs_embed.title", false, "events"))
            .addFields([
                { name: client.translate.t(options["guild.lang"], "guildMemberAdd.logs_embed.banker", false, "events"), value: `<@${client.user.id}> (${client.user.id})`, inline: true },
                { name: client.translate.t(options["guild.lang"], "guildMemberAdd.logs_embed.client", false, "events"), value: `${member.toString()} (${member.id})`, inline: true }
            ])
            .setThumbnail(member.user.displayAvatarURL())
            .setFooter({ text: options["global.city_name"] || member.guild.name, iconURL: member.guild.iconURL() })
            .setTimestamp();

        const channel = member.guild.channels.cache.get(options["channel.logs"]);
        if(!channel) return;
        
        channel.send({ embeds: [logsEmbed] }).catch(() => { });

}