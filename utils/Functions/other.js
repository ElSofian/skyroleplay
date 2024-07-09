const { EmbedBuilder } = require("discord.js");
const colors = {
    "invisible": 0x2f3136, // Embed colors, displayed as invisible
    "noir": 0x000000,
    "blanc": 0xffffff,
    "vert": 0x57f287,
    "bleu": 0x3498db,
    "jaune": 0xfee75c,
    "violet": 0x9b59b6,
    "fuschia": 0xeb459e,
    "or": 0xf1c40f,
    "orange": 0xe67e22,
    "rouge": 0xed4245,
    "gris": 0x95a5a6,
    "vert foncé": 0x1f8b4c,
    "bleu foncé": 0x206694,
    "violet foncé": 0x71368a,
    "or foncé": 0xc27c0e,
    "orange foncé": 0xa84300,
    "rouge foncé": 0x992d22,
    "gris foncé": 0x7f8c8d,
    "gris clair": 0xbcc0c0,
};

/**
 * Builds a list
 * @param {string[]} items The items to assemble
 * @param {string} lastConnector The last connector (for example "and" or "or")
 * @returns {string}
 */
module.exports = class Other {
    
    constructor(client, options) {
        this.client = client;
        this.options = options;

        this._cooldown = new Map();
    }
    
    stringifyList = (items, lastConnector) => {
        return [items.slice(0, -1).join(", "), items.slice(-1)[0]].join(items.length < 2 ? "" : ` ${lastConnector} `);
    };

    /**
     * Resolves a string into a color integer (example "rouge" or hexadecimal "dc243c")
     * @param {string} color The string to resolve
     * @returns {number?}
     */
    isHexColor = (color) => {

        switch(color) {
            case "rouge": case "red": color = "#ed4245"; break;
            case "bleu": case "blue": color = "#3498db"; break;
            case "vert": case "green": color = "#57f287"; break;
            case "jaune": case "yellow": color = "#fee75c"; break;
            case "violet": case "purple": color = "#9b59b6"; break;
            case "fuschia": color = "#eb459e"; break;
            case "or": case "gold": color = "#f1c40f"; break;
            case "orange": color = "#e67e22"; break;
            case "gris": case "grey": color = "#95a5a6"; break;
            case "gris clair": case "lightgrey": color = "#bcc0c0"; break;
            case "gris foncé": case "darkgrey": color = "#7f8c8d"; break;
            case "noir": case "black": color = "#030303"; break;
        }
        
        return /^#(?:[0-9a-fA-F]{3}){1,2}$/i.test(color) ? color : null
    };

    /**
     * Splits an array into different chunks of the same size
     * @param {any[]} array The array to chunk
     * @param {number} chunkSize The size of every chunk
     * @returns {any[][]}
     */
    chunkArray = (array, chunkSize) => {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    };

    /**
     * Creates a resolved promise with a delay
     * @param {number} time The time (in ms)
     * @returns {Promise<void>}
     */
    wait = (time) => new Promise((r) => setTimeout(r, time));

    createCollector = (message, interaction, endTime, lang, type = "createMessageComponentCollector") => new Promise(async (resolve) => {
        // Ask method
        const collector = message[type]({
            filter: (i) => i.user.id === interaction.user.id,
            time: endTime,
        });
    
        if (!collector)
            return interaction[interaction.replied || interaction.deferred ? "editReply" : "reply"]({
                embeds: [new EmbedBuilder().setColor("Red").setDescription(`${this.client.constants.emojis.redEchec} ${this.client.translate.t(lang, "error_occurred",  false, "errors")}`)],
                components: [],
                content: null,
            }).catch(() => {});
    
        collector.on("collect", async (i) => {
            collector.stop()
            return resolve(i);
        });
    
        collector.on("end", (collected) => {
            if (collected.size) return;
    
            interaction.editReply({ content: null, components: [] }).catch(() => {});
    
            return resolve("end");
        });
    });

    /**
     * Generates a random number between a min and a max
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    /**
     * Adds time to a date (defaults now)
     * @param {string} timeToAdd The time to add (example "1j", "1a", "1m")
     * @param {Date} [startTime] The start time (defaults to now)
     * @returns {Date} The new date
     */
    addTime = (timeToAdd, startTime = this.client.dayjs()) => {
        startTime = this.client.dayjs(startTime);
        try {
            const [, amount, unit] = timeToAdd.trim().match(/^(-?[0-9]+)([jma])$/i);
            const amountInt = parseInt(amount);

            switch (unit.toLowerCase()) {
                case "m":
                    return startTime.add(amountInt, "months").toDate();
                case "j":
                    return startTime.add(amountInt, "days").toDate();
                case "a":
                    return startTime.add(amountInt, "years").toDate();
                default:
                    return startTime.toDate();
            }
        } catch (e) {
            return startTime.toDate();
        }
    };

    /**
     * Adds time to a duration
     * @param {string} duration The initial duration (example "1j", "1a", "1m")
     * @param {string} time_to_add The time to add (example "1j", "1a", "1m")
     * @returns {string} The new duration
     */
    addDuration = (duration, time_to_add) => {

        let total_amount, final_unit, calcul, calcul2;
        let [, premium_amount, unit] = duration.trim().match(/^(-?[0-9]+)([jma])$/i);
        premium_amount = parseInt(premium_amount);
        unit = unit.toLowerCase();

        let [, amount_to_add, unit2] = time_to_add.trim().match(/^(-?[0-9]+)([jma])$/i);
        amount_to_add = parseInt(amount_to_add);
        unit2 = unit2.toLowerCase();

        if(unit === unit2) {
            final_unit = unit;
            total_amount = premium_amount + amount_to_add;
        }
        else if(unit === "j" && ["m","a"].includes(unit2)) {
            final_unit = "j";
            calcul = unit2 === "m" ? 30.4167 : 365;
            calcul2 = Math.ceil(amount_to_add*calcul);
            total_amount = premium_amount + calcul2;
        }
        else if(unit === "m" && ["j","a"].includes(unit2)) {
            final_unit = "j";
            calcul = unit2 === "j" ? 1 : 365;
            calcul2 = Math.ceil(premium_amount*30.4167)
            total_amount = calcul2 + amount_to_add*calcul;
        }
        else {
            final_unit = unit2;
            calcul = unit2 === "m" ? 12 : 365;
            total_amount = premium_amount*calcul + amount_to_add;
        }

        let intToStr = total_amount.toString();            
        return `${intToStr}${final_unit}`;
    };

    /**
     * this.client.translate.ts a duration into a string
     * @param {string} duration The duration to this.client.translate.t (example "1j", "1a", "1m")
     * @param {string} [lang] The language if translation is needed
     * @returns {string} The duration as a string
     */
    durationToText = async (duration, interaction, lang = null) => {
        if(!lang) lang = await this.client.db.getOption(interaction.guildId, "guild.lang");

        if(["m"].includes(duration))
            return duration.replace("m", ' ' + this.client.translate.t(lang, "duration_to_text.month", false, "global"));
        else if(["a"].includes(duration))
            return duration.replace("a", ' ' + this.client.translate.t(lang, "duration_to_text.year", false, "global"));
        else
            return duration.replace("j", ' ' + this.client.translate.t(lang, "duration_to_text.day", false, "global"));
    };

    /**
     * this.client.translate.ts a Premium subscription status into a string
     * @param {string} key The Premium subscription key
     * @param {string} [lang] The language if translation is needed
     * @returns {string} The status as a string
     */
    statusToText = async (key, interaction) => {
        const lang = await this.client.db.getOption(interaction.guildId, "guild.lang");
        switch (key.status) {
            case 0:
                return `${this.client.constants.emojis.edit} ${this.client.translate.t(lang, "premium_status.inactive", false, "global")}`;
            case 1:
                return `${this.client.constants.emojis.add} ${this.client.translate.t(lang, "premium_status.enabled", false, "global")}`;
            case 2:
                return `${this.client.constants.emojis.remove} ${this.client.translate.t(lang, "premium_status.expired", false, "global")}`;
            case 3:
                return `${this.client.constants.emojis.pause} ${this.client.translate.t(lang, "premium_status.pause", false, "global")}`;
            default:
                return `${this.client.constants.emojis.help} ${this.client.translate.t(lang, "premium_status.unknown", false, "global")}`;
        }
    };

    // capitalize first letter
    cfl = (string) => {
        if(typeof string !== 'string') throw new Error("Argument in the function 'capitalizeFirstLetter()' must be a string.");
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    separate = (number, separator = " ", decimalSeparator = ".") => {
        if(!number) number = 0;
        switch(typeof number) {
            case "string": number = parseFloat(number); break;
            case "number": break;
            default: throw new Error("Argument in the function 'separate()' must be a string or a number.");
        }
        
        const [integerPart, decimalPart] = number.toFixed(2).split('.');
        const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
        const formattedDecimalPart = decimalPart === "00" ? "" : decimalSeparator + (decimalPart.endsWith("0") ? decimalPart[0] : decimalPart);
        return formattedIntegerPart + formattedDecimalPart;
    }

    async total(client, key) {
        if(!["guilds", "channels", "users"].includes(key)) throw new Error("The key parameter in the function 'total()' must be 'guilds', 'channels' or 'users'.");
        let counts;
        switch(key) {
            case "guilds": counts = await client.cluster.fetchClientValues(`guilds.cache.size`).catch(() => []); break;
            case "channels": counts = await client.cluster.fetchClientValues(`channels.cache.size`).catch(() => []); break;
            case "users": counts = await client.cluster.broadcastEval((client) => {
                return client.guilds.cache.filter((guild) => guild.available).reduce((acc, cur) => acc + cur.memberCount, 0);
            }).catch(() => []); break;
        }
        return this.separate(counts.reduce((a, b) => a + b, 0));
    }
    

    concatObjectsInArray = (array) => {
        var result = {};
        array.forEach(function (obj) {
            Object.keys(obj).forEach(function (key) {
                result[key] = obj[key];
            });
        });
        return result;
    }

    addCooldown(guildId, userId, cooldown) {
        this._cooldown.set(`${guildId}-${userId}`, Date.now() + cooldown * 1000);
    }

    getRemainingCooldown(guildId, userId) {
        const end = this._cooldown.get(`${guildId}-${userId}`);
        const now = Date.now();
        if (!end || end < now) return 0;
        return Math.ceil((end - now) / 1000);
    }

    fetchGuilds(guildIdsArray) {
        const res = this.client.cluster.broadcastEval((client, guildIdsArray) => {
            const guilds = [];
            guildIdsArray.forEach((guildId) => {
                const guild = client.guilds.cache.get(guildId);
                if (guild) guilds.push(guild);
            });
            return guilds;
        }, { context: guildIdsArray });
        return res.then((r) => r.reduce((a, b) => a.concat(b), []));
    }

}
