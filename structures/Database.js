const { createPool } = require("mysql");
const { EmbedBuilder, WebhookClient, InteractionType, codeBlock } = require("discord.js");

module.exports = class Database {
    constructor(client) {
        this.client = client;

        this.pool = createPool({ ...client.config.database, supportBigNumbers: true, bigNumberStrings: false });

        this._queryOne("SELECT 1+1;")
            .then(() => client.logger.db("Database connected"))
            .catch((error) => client.db.sendError("en", error, "Database connect error"));
    }

    /**
     * Identical to `_query`, except that it returns the first row if the query is SELECT
     */
    async _queryOne(sql, values) {
        return new Promise((resolve, reject) => {
            this.pool.query(sql, values, (error, results) => {
                if (error) {
                    this.client.logger.error(sql)
                    this.client.logger.error(`> ${error.sqlMessage}\n──────── 📛 FULL ERROR 📛 ────────`, "DATABASE QUERYONE ERROR");
                    return reject(error);
                }
                resolve(results[0]);
            });
        });
    }

    /**
     * Queries the database
     * @param {string} sql SQL code
     * @param {string[]} [values] The placeholders values
     * @returns {Promise<*>} The result
     */
    async _query(sql, values) {
        return new Promise((resolve, reject) => {
            this.pool.query(sql, values, (error, results) => {
                if (error) {
                    this.client.logger.error(sql)
                    this.client.logger.error(`> ${error.sqlMessage}\n──────── 📛 FULL ERROR 📛 ────────`, "DATABASE QUERY ERROR");
                    return reject(error);
                }
                resolve(results);
            });
        });
    }

    async _multiple(...operations) {
        return new Promise(async (resolve, reject) => {
            const responses = [];
            
            for (let [sql, values] of operations) {
                try {
                    const res = await this._query(sql, values);
                    responses.push(res);
                } catch (error) {
                    this.client.logger.error(sql)
                    this.client.logger.error(`> ${error.sqlMessage}\n──────── 📛 FULL ERROR 📛 ────────`, "DATABASE MULTIPLE ERROR");
                    return reject(error);
                }
            }

            resolve(responses);
        });
    }

    //############################# PREMIUM / BÊTA TESTERS ############################

    async isPremium(guildId) {
        const data = await this._queryOne("SELECT count(*) FROM premium WHERE guild_id = ? AND status = 'active';", [guildId]);
        return data["count(*)"] > 0;
    }

    async getPremiums() {
        return this._query("SELECT * FROM premium;");
    }

    async isBeta(guildId) {
        const data = await this._queryOne("SELECT bêta_test FROM guilds WHERE guild_id = ?;", [guildId]);
        return (data?.["bêta_test"] ?? 0) == 1;
    }

    async getCurrentPremium(guildId, getPaused = false) {
        return this._queryOne("SELECT * FROM premium WHERE guild_id = ? AND status IN ('active','current');", [guildId]);
    }

    async searchExpiredPremiums() {
        return this._query(`SELECT * FROM premium WHERE status = 'active' AND end_date <= ?;`, [new Date()]);
    }

    // async setPremiumGuild(oldGuildOrKey, newGuild) {
    //     return this._query(`UPDATE premium SET guild_id = ? WHERE ${oldGuildOrKey.match(/^[0-9]{17,19}$/) ? "guild_id" : "premium_key"} = ?;`, [newGuild, oldGuildOrKey]);
    // }

    // async setPremiumEnd(key, newEnd) {
    //     return this._query("UPDATE premium SET end_date = ? WHERE premium_key = ?", [newEnd, key]);
    // }

    async setPremiumStatus(id, status) {
        return this._query("UPDATE premium SET status = ? WHERE id = ?", [status, id]);
    }

    // async setPremiumComment(key, comment) {
    //     return this._query("UPDATE premium SET comment = ? WHERE premium_key = ?", [comment, key]);
    // }

    // async setPremiumDuration(key, duration) {
    //     return this._query("UPDATE premium SET duration = ? WHERE premium_key = ?", [duration, key]);
    // }

    // async setPremiumTransactionId(key, transactionId) {
    //     return this._query("UPDATE premium SET transaction_id = ? WHERE premium_key = ?", [transactionId, key]);
    // }

    // async enablePremium(key, guildId, activatorId, duration) {
    //     const start = new Date();
    //     const end = this.client.functions.other.addTime(duration, start);
    //     return this._query("UPDATE premium SET guild_id = ?, status = 1, start_date = ?, end_date = ?, user_id = ? WHERE premium_key = ?;", [guildId, start, end, activatorId, key]);
    // }

    // async setRemainingTimeAfterPause(key, remainingTime) {
    //     return this._query("UPDATE premium SET remaining_time_after_pause = ? WHERE premium_key = ?", [remainingTime, key]);
    // }

    // async setPremiumAlert(key, status) {
    //     return this._query("UPDATE premium SET alert = ? WHERE premium_key = ?", [status, key]);
    // }

    // async deletePremiumKey(key) {
    //     return this._query("DELETE FROM premium WHERE premium_key = ?;", [key]);
    // }

    // async startPremiumTrialVersion(guildId, userId) {
    //     return this._query("INSERT INTO trial_versions (guild_id, user_id) VALUES (?, ?);", [
    //         guildId, userId
    //     ]);
    // }

    // async isPremiumTrialVersionUsed(guildId) {
    //     return this._queryOne("SELECT count(*) FROM trial_versions WHERE guild_id = ?;", [guildId]).then((data) => data["count(*)"] > 0);
    // }

    //############################# MEMBERS ############################

    async ensureGuild(guildId) {
        return this._query("INSERT IGNORE INTO guilds (guild_id) VALUES (?);", [guildId]).catch(() => {});
    }

    async ensureMember(guildId, userId) {
        await this.ensureGuild(guildId);
        return this._query("INSERT IGNORE INTO members (guild_id, user_id) VALUES (?, ?);", [guildId, userId]).catch(() => {});
    }

    async getMember(guildId, userId) {
        await this.ensureMember(guildId, userId);
        return this._queryOne("SELECT * FROM members WHERE guild_id = ? AND user_id = ?;", [guildId, userId]);
    }

    async getMembers(guildId) {
        return this._query("SELECT * FROM members WHERE guild_id = ?;", [guildId]);
    }

    async getMemberState(guildId, userId) {
        await this.ensureMember(guildId, userId);
        return this._queryOne("SELECT members.*, member_flags.* FROM members LEFT JOIN member_flags ON members.guild_id = member_flags.guild_id AND members.user_id = member_flags.user_id WHERE members.guild_id = ? AND members.user_id = ?;", [guildId, userId]);
    }

    async getMemberFlags(guildId, userId) {
        await this.ensureMember(guildId, userId);
        const data = await this._query("SELECT * FROM member_flags WHERE guild_id = ? AND user_id = ?;", [guildId, userId]);
        
        return data.reduce((acc, row) => {
            acc[row.flag] = row.value;
            return acc;
        }, {});
    }

    async getMemberFlag(guildId, userId, flag) {
        await this.ensureMember(guildId, userId);
        const data = await this._queryOne(`SELECT * FROM member_flags WHERE guild_id = ? AND user_id = ? AND flag = ?;`, [guildId, userId, flag]);

        return data ? this._parseData(data) : null;
    }

    async setMemberFlag(guildId, userId, flag, value) {
        await this.ensureMember(guildId, userId);
        return this._query(`INSERT INTO member_flags (guild_id, user_id, flag, value) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE value = ?;`, [guildId, userId, flag, value, value]);
    }

    async getMemberStateAlerts(guildId, userId) {
        await this.ensureMember(guildId, userId);
        return this._queryOne("SELECT alert_hunger, alert_very_hunger, alert_thirst, alert_very_thirst FROM member_flags WHERE guild_id = ? AND user_id = ?;", [guildId, userId]);
    }

    async updateMemberStateAlert(guildId, userId, alert, value) {
        await this.ensureMember(guildId, userId);
        return this._query(`INSERT INTO member_flags (guild_id, user_id, flag, value) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE value = ?;`, [guildId, userId, alert, value, value]);
    }

    async setState(guildId, userId, hungerQuantity, thirstQuantity) {
        await this.ensureMember(guildId, userId);
        return this._query(`UPDATE members SET hunger = ?, thirst = ? WHERE guild_id = ? AND user_id = ?;`, [hungerQuantity, thirstQuantity, guildId, userId]);
    }

    async addState(guildId, userId, hungerQuantity, thirstQuantity) {
        await this.ensureMember(guildId, userId);
        const state = await this.getMemberState(guildId, userId);
        return this._query(`INSERT INTO members (guild_id, user_id, hunger, thirst) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE hunger = hunger + ?, thirst = thirst + ?;`, [guildId, userId, state?.hunger ?? 100, state?.thirst ?? 100, hungerQuantity, thirstQuantity]);
    }

    async removeState(guildId, userId, hungerQuantity, thirstQuantity) {
        await this.ensureMember(guildId, userId);
        const state = await this.getMemberState(guildId, userId);
        return this._query(`INSERT INTO members (guild_id, user_id, hunger, thirst) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE hunger = hunger - ?, thirst = thirst - ?;`, [guildId, userId, state?.hunger ?? 100, state?.thirst ?? 100, hungerQuantity, thirstQuantity]);
    }

    async putComa(guildId, userId) {
        return this._query("UPDATE members SET coma = 1 WHERE guild_id = ? AND user_id = ?;", [guildId, userId]);
    }

    async removeComa(guildId, userId, responsable = null) {
        return this._query(`UPDATE members SET coma = 0${responsable ? `, ${responsable} = 20` : ""} WHERE guild_id = ? AND user_id = ?;`, [guildId, userId]);
    }

    async putHandcuffs(guildId, userId) {
        return this._query("UPDATE members SET handcuffed = 1 WHERE guild_id = ? AND user_id = ?;", [guildId, userId]);
    }

    async removeHandcuffs(guildId, userId) {
        return this._query("UPDATE members SET handcuffed = 0 WHERE guild_id = ? AND user_id = ?;", [guildId, userId]);
    }

    async putJail(guildId, userId) {
        return this._query("UPDATE members SET jail = 1 WHERE guild_id = ? AND user_id = ?;", [guildId, userId]);
    }

    async removeJail(guildId, userId) {
        return this._query("UPDATE members SET jail = 0 WHERE guild_id = ? AND user_id = ?;", [guildId, userId]);
    }

    async getAllSessions() {
        return this._query("SELECT * FROM sessions;");
    }

    async getSessions(guildId) {
        return this._query("SELECT * FROM sessions WHERE guild_id = ?;", [guildId]);
    }

    async getSession(guildId, userId) {
        return this._queryOne(`SELECT * FROM sessions WHERE guild_id = ? AND user_id = ?;`, [guildId, userId]);
    }

    async getSessionByMessageId(guildId, messageId) {
        return this._queryOne(`SELECT * FROM sessions WHERE guild_id = ? AND message_id = ?;`, [guildId, messageId]);
    }

    async isInSession(guildId, userId) {
        return this._queryOne("SELECT * FROM sessions WHERE guild_id = ? AND user_id = ?;", [guildId, userId]);
    }

    async addSession(guildId, userId, messageId) {
        await this.ensureGuild(guildId);
        return this._query("INSERT IGNORE INTO sessions (guild_id, user_id, message_id) VALUES (?, ?, ?);", [guildId, userId, messageId]);
    }

    async removeSession(guildId, userId, messageId) {
        return this._queryOne("DELETE FROM sessions WHERE guild_id = ? AND user_id = ? AND message_id = ?", [guildId, userId, messageId]);
    }

    async forceEndSession(guildId) {
        return this._query("DELETE FROM sessions WHERE guild_id = ?;", [guildId]);
    }

    async deleteSession(guildId, messageId) {
        return this._query("DELETE FROM sessions WHERE guild_id = ? AND message_id = ?;", [guildId, messageId]);
    }

    async setLastMedicalCheckup(guildId, userId) {
        await this.ensureMember(guildId, userId);
        return this._query("UPDATE members SET last_medical_checkup = CURRENT_TIMESTAMP() WHERE guild_id = ? AND user_id = ?;", [guildId, userId]);
    }

    async isUserBlacklisted(userId) {
        return this._queryOne("SELECT user_id FROM blacklist_members WHERE user_id = ?;", [userId]);
    }

    //############################# SOCIAL MEDIAS ############################

    async getSocialAccount(guildId, userId, type) {
        if(!["twitter", "instagram", "telegram"].includes(type)) throw new Error("Parameter 'type' must be 'twitter', 'instagram' or 'telegram' in getSocialAccount() function.")
        return this._queryOne("SELECT * FROM social_account WHERE guild_id = ? AND user_id = ? AND type = ?;", [guildId, userId, type]);
    }

    async getSocialFollowers(guildId, userId, type) {
        if(!["twitter", "instagram", "telegram"].includes(type)) throw new Error("Parameter 'type' must be 'twitter', 'instagram' or 'telegram' in getSocialAccount() function.")
        return this._queryOne("SELECT * FROM social_followers WHERE guild_id = ? AND target_id = ? AND type = ?;", [guildId, userId, type]);
    }

    async getSocialFollowing(guildId, userId, type) {
        if(!["twitter", "instagram", "telegram"].includes(type)) throw new Error("Parameter 'type' must be 'twitter', 'instagram' or 'telegram' in getSocialAccount() function.")
        return this._queryOne("SELECT * FROM social_followers WHERE guild_id = ? AND user_id = ? AND type = ?;", [guildId, userId, type]);
    }

    async setNickname(guildId, userId, type, nickname) {
        if(!["twitter", "instagram", "telegram"].includes(type)) throw new Error("Parameter 'type' must be 'twitter', 'instagram' or 'telegram' in getSocialAccount() function.")
        return this._queryOne("UPDATE social_account SET nickname = ? WHERE guild_id = ? AND user_id = ? AND type = ?;", [nickname, guildId, userId, type]);
    }

    //############################# STOCK EXCHANGE ############################

    async getCrypto(name) {
        return this._queryOne("SELECT * FROM cryptos WHERE name = ?;", [name]);
    }

    async getInvestments() {
        return this._query("SELECT * FROM member_cryptos;");
    }

    async getMemberCryptos(guildId, userId) {
        return this._query("SELECT * FROM member_cryptos WHERE guild_id = ? AND user_id = ?;", [guildId, userId]);
    }

    async getMemberCrypto(guildId, userId, cryptoName) {
        return this._queryOne("SELECT * FROM member_cryptos WHERE guild_id = ? AND user_id = ? AND crypto_name = ?;", [guildId, userId, cryptoName]);
    }

    async addMemberCrypto(guildId, userId, name, quantity) {
        return this._query("INSERT INTO member_cryptos (guild_id, user_id, crypto_name, quantity) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?;", [guildId, userId, name, quantity, quantity]);
    }

    async removeMemberCrypto(guildId, userId, name, quantity, all = false) {
        if (all) return this._query("DELETE FROM member_cryptos WHERE guild_id = ? AND user_id = ? AND crypto_name = ?;", [guildId, userId, name]);
        else return this._query("UPDATE member_cryptos SET quantity = quantity - ? WHERE guild_id = ? AND user_id = ? AND crypto_name = ?;", [quantity, guildId, userId, name]);
    }

    //############################# CONTACTS ############################

    async getMemberContacts(guildId, userId) {
        return this._query("SELECT name, number FROM contacts WHERE guild_id = ? AND user_id = ?;", [guildId, userId]);
    }

    async hasContact(guildId, userId, name) {
        const data = await this._queryOne("SELECT name FROM contacts WHERE guild_id = ? AND user_id = ? AND name = ?;", [guildId, userId, name]);   
        return data ? data : false;
    }

    async addMemberContact(guildId, userId, name, number) {
        return this._query("INSERT INTO contacts (guild_id, user_id, name, number) VALUES (?, ?, ?, ?);", [guildId, userId, name, number]);
    }

    async removeMemberContact(guildId, userId, name) {
        return this._query("DELETE FROM contacts WHERE guild_id = ? AND user_id = ? AND name = ?;", [guildId, userId, name]);
    }

    //############################# WANTED ############################

    async isWanted(guildId, idCard) {   
        const data = await this._queryOne("SELECT id_cards.user_id FROM wanted LEFT JOIN id_cards ON id_cards.id = wanted.identity_card_id WHERE wanted.guild_id = ? AND id_cards.id = ?;", [guildId, idCard]); 
        return data ? data : false;
    }

    async getWanteds(guildId) {
        return this._query("SELECT id_cards.*, wanted.officer_id, wanted.reason, wanted.date FROM wanted LEFT JOIN id_cards ON id_cards.id = wanted.identity_card_id WHERE wanted.guild_id = ?;", [guildId])
    }

    async getWanted(guildId, idCard) {
        return this._queryOne("SELECT id_cards.*, wanted.officer_id, wanted.reason, wanted.date FROM wanted LEFT JOIN id_cards ON id_cards.id = wanted.identity_card_id WHERE wanted.guild_id = ? AND id_cards.id = ?;",
        [guildId, idCard]);
    }

    async putWanted(guildId, officerId, idCard, reason) {
        await this.ensureGuild(guildId);
        return this._query("INSERT INTO wanted (guild_id, officer_id, identity_card_id, reason) VALUES (?, ?, ?, ?);", [guildId, officerId, idCard, reason]);
    }

    async deleteWanted(guildId, idCard) {
        return this._query("DELETE FROM wanted WHERE guild_id = ? AND identity_card_id = ?;", [guildId, idCard]);
    }

    //############################# ILLEGAL ############################

    async getDrugs(guildId, drugName = null) {
        return this[drugName ? "_queryOne" : "_query"](`SELECT * FROM drugs WHERE guild_id = ?${drugName ? " AND name = ?" : ""};`, drugName ? [guildId, drugName] : [guildId] );
    }

    async getDrugById(guildId, drugId) {
        return this._queryOne("SELECT * FROM drugs WHERE guild_id = ? AND id = ?;", [guildId, drugId]);
    }

    async getDrugEffectTime(guildId, drugId) {
        return this._queryOne("SELECT effect_time FROM drugs WHERE guild_id = ? AND id = ?;", [guildId, drugId]).then(data => data.effect_time);
    }

    async getMemberDrugs(guildId, userId, drugId = null, hidden = false, type) {
        const data = await this._query(`SELECT member_drugs.*, drugs.image, drugs.name FROM member_drugs LEFT JOIN drugs ON member_drugs.drug_id = drugs.id WHERE member_drugs.guild_id = ? AND member_drugs.user_id = ?${drugId ? " AND member_drugs.drug_id = ?" : ""}${hidden ? ` AND member_drugs.hidden_${type} > 0`: ""};`, 
        drugId ? [ guildId, userId, drugId ] : [ guildId, userId ]);

        return !data ? null : drugId ? data[0] : data;
    }

    async getMemberDrugByName(guildId, userId, drugName) {
        return this._queryOne("SELECT member_drugs.*, drugs.image, drugs.name FROM member_drugs LEFT JOIN drugs ON member_drugs.drug_id = drugs.id WHERE member_drugs.guild_id = ? AND member_drugs.user_id = ? AND drugs.name = ?;", [guildId, userId, drugName]);
    }

    async hideMemberDrug(guildId, userId, drugId, typeOfDrug, quantity) {
        return this._query(`UPDATE member_drugs SET hidden_${typeOfDrug} = hidden_${typeOfDrug} + ?, ${typeOfDrug} = ${typeOfDrug} - ? WHERE guild_id = ? AND user_id = ? AND drug_id = ?;`, [quantity, quantity, guildId, userId, drugId]);
    }

    async retrieveMemberDrug(guildId, userId, drugId, typeOfDrug, quantity) {
        return this._query(`UPDATE member_drugs SET hidden_${typeOfDrug} = hidden_${typeOfDrug} - ?, ${typeOfDrug} = ${typeOfDrug} + ? WHERE guild_id = ? AND user_id = ? AND drug_id = ?;`, [quantity, quantity, guildId, userId, drugId]);
    }

    async addMemberDrug(guildId, userId, drugId, type, quantity) {
        await this.ensureMember(guildId, userId);
        await this._query(
            `INSERT INTO member_drugs (guild_id, user_id, drug_id, untreated, treated) VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE ${type} = ${type} + ?`,
            [guildId, userId, drugId, type === "untreated" ? quantity : 0, type === "treated" ? quantity : 0, quantity]
        );
    }

    async removeMemberDrug(guildId, userId, id, type, quantity, deleteDrug = false) {
        if(deleteDrug) return this._query(`DELETE FROM member_drugs WHERE guild_id = ? AND user_id = ?${id ? " AND drug_id = ?" : ""};`, id ? [guildId, userId, id] : [guildId, userId]);
        return this._query(`UPDATE member_drugs SET ${type} = ${type} - ? WHERE guild_id = ? AND user_id = ? AND drug_id = ?;`, [quantity, guildId, userId, id]);
    }

    async addDirtyMoney(guildId, userId, amount, hidden = false) {
        await this.ensureMember(guildId, userId);
        return this._query(`UPDATE members SET ${hidden ? "hidden_dirty_money" : "dirty_money"} = ${hidden ? "hidden_dirty_money" : "dirty_money"} + ? WHERE guild_id = ? AND user_id = ?;`, [
            amount,
            guildId,
            userId,
        ]);
    }

    async massAddDirtyMoney(guildId, userIdList, amount) {
        return this._query(`UPDATE members SET dirty_money = dirty_money + ? WHERE guild_id = ? AND user_id in (${userIdList.map(u => u)}) AND dirty_money + ? > 0;`, [
            amount,
            guildId,
            amount
        ]);
    }

    async getDirtyMoney(guildId, userId) {
        await this.ensureMember(guildId, userId);
        return this._queryOne(`SELECT hidden_dirty_money, dirty_money FROM members WHERE guild_id = ? AND user_id = ?;`, [guildId, userId]);
    }

    async getBurglaryItems(guildId) {
        const data = await this._query("SELECT burglary_items.min, burglary_items.max, shops_items.* FROM burglary_items LEFT JOIN shops_items ON burglary_items.item_id = shops_items.id WHERE burglary_items.guild_id = ?;", [guildId]);
        return !data.length ? null : data;
    }

    async getWars(guildId) {
        return this._query("SELECT * FROM wars WHERE guild_id = ?;", [guildId]);
    }

    async getWar(guildId, gangId, ennemiesId) {
        return this._queryOne("SELECT * FROM wars WHERE guild_id = ? AND gang_id = ? AND ennemies_id = ?;", [guildId, gangId, ennemiesId]);
    }

    async addWar(guildId, gangId, ennemiesId) {
        return this._query("INSERT INTO wars (guild_id, gang_id, ennemies_id) VALUES (?, ?, ?);", [guildId, gangId, ennemiesId]);
    }

    async deleteWar(guildId, gangId, ennemiesId) {
        return this._query("DELETE FROM wars WHERE guild_id = ? AND gang_id = ? AND ennemies_id = ?;", [guildId, gangId, ennemiesId]);
    }

    //############################# RESET ############################

    async resetMember(guildId, userId) {

        this.resetMemberProperties(guildId, userId);
        this.resetMemberVehicles(guildId, userId);
        
        return this._multiple(
            ["DELETE FROM leboncoin WHERE guild_id = ? AND seller_id = ?;", [guildId, userId]],
            ["DELETE FROM members WHERE guild_id = ? AND user_id = ?;", [guildId, userId]],
            ["DELETE FROM transactions WHERE guild_id = ? AND target_id = ?;", [guildId, userId]],
            ["DELETE FROM weapon_licences WHERE guild_id = ? AND user_id = ?;", [guildId, userId]],
            ["DELETE FROM companies_bills WHERE guild_id = ? AND user_id = ?", [guildId, userId]],
            ["DELETE FROM contacts WHERE guild_id = ? AND user_id = ?", [guildId, userId]]
        );
    }
    
    async resetGuild(guildId) {
        return this._multiple(
            ["DELETE FROM options WHERE guild_id = ?;", [guildId]],
            ["DELETE FROM members WHERE guild_id = ?;", [guildId]],
            ["DELETE FROM commands_permissions WHERE guild_id = ?;", [guildId]],
            ["DELETE FROM companies WHERE guild_id = ?;", [guildId]],
            ["DELETE FROM shops_items WHERE guild_id = ?;", [guildId]],
            ["DELETE FROM drugs WHERE guild_id = ?;", [guildId]]
        );
    }

    async resetGuildDashboardOptions(guildId) {
        return this._multiple(
            ["DELETE FROM options WHERE guild_id = ?;", [guildId]],
            ["DELETE FROM commands_permissions WHERE guild_id = ?;", [guildId]]
        );
    }

    async resetGuildMembers(guildId) {
        return this._queryOne("DELETE FROM members WHERE guild_id = ?;", [guildId]);
    }

    async resetGuildEconomy(guildId) {
        return this._multiple(
            ["DELETE FROM bank_accounts WHERE guild_id = ?;", [guildId]],
            ["DELETE FROM transactions WHERE guild_id = ?;", [guildId]],
            ["DELETE FROM member_cryptos WHERE guild_id = ?;", [guildId]],
            ["UPDATE companies SET money = 0, dirty_money = 0, safe_money = 0 WHERE guild_id = ?;", [guildId]],
            ["UPDATE members SET dirty_money = 0, cash_money = 0 WHERE guild_id = ?;", [guildId]],
            ["UPDATE estates SET dirty_money = 0, money = 0 WHERE guild_id = ?", [guildId]],
            ["UPDATE member_cg SET dirty_money = 0, money = 0 WHERE guild_id = ?", [guildId]]
        );
    }
    
    async resetGuildShopItems(guildId) {
        return this._query("DELETE FROM shops_items WHERE guild_id = ?;", [guildId])
    }

    async resetGuildInventories(guildId) {
        return this._query("DELETE FROM member_items WHERE guild_id = ?;", [guildId])
    }

    async resetGuildCompanies(guildId) {
        return this._query("DELETE FROM companies WHERE guild_id = ?;", [guildId])
    }

    async resetGuildCards(guildId) {
        return this._multiple(
            ["DELETE FROM member_cg WHERE guild_id = ?;", [guildId]],
            ["DELETE FROM id_cards WHERE guild_id = ?;", [guildId]],
            ["DELETE FROM driver_licences WHERE guild_id = ?;", [guildId]],
            ["DELETE FROM weapon_licences WHERE guild_id = ?;", [guildId]]
        );
    }

    async resetGuildCriminalRecords(guildId) {
        return this._query("DELETE FROM criminal_records WHERE guild_id = ?;", [guildId])
    }

    //############################# CONSUMPTIONS ############################

    async addDrugConsumptions(guildId, userId, name, quantity, endDate) {
        await this.ensureMember(guildId, userId);
        await this._query(
            `INSERT INTO consumptions (guild_id, user_id, item_name, item_type, quantity, end_date, item_state) VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + ?, end_date = ?`,
            [guildId, userId, name, "drug", quantity, endDate, 1, quantity, endDate]
        );
    }

    async getMemberDrugsConsumption(guildId, userId) {
        return this._query(`SELECT item_name, quantity FROM consumptions WHERE guild_id = ? AND user_id = ? AND item_type = "drug";`,
            [guildId, userId]);
    }

    async getEndedConsumptions() {
        return this._query(`SELECT id FROM consumptions WHERE end_date <= NOW();`);
    }

    async deleteEndedConsumptions(idsList) {
        return this._query(`DELETE FROM consumptions WHERE id in (${idsList.map(cons => cons.id)});`);
    }

    //############################# MEMBER ITEMS ############################

    async addMemberItem(guildId, userId, itemId, quantity = 1, nickname = null) {
        await this.ensureMember(guildId, userId);
        await this._query(
            `INSERT INTO member_items (guild_id, user_id, item_id, nickname, quantity) VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
            [guildId, userId, itemId, nickname, quantity, quantity]
        );
    }

    async removeMemberItem(guildId, userId, itemId, quantity, deleteItem = false) {
        if(deleteItem) return this._query("DELETE FROM member_items WHERE guild_id = ? AND user_id = ? AND item_id = ?;", [guildId, userId, itemId])
        else return this._query("UPDATE member_items SET quantity = quantity - ? WHERE guild_id = ? AND user_id = ? AND item_id = ?;", [quantity, guildId, userId, itemId]);
    }

    async hideMemberItem(guildId, userId, itemId, quantity) {
        return this._query(
            `UPDATE member_items SET hidden_quantity = hidden_quantity + ?, quantity = quantity - ? WHERE guild_id = ? AND user_id = ? AND item_id = ?;`,
            [quantity, quantity, guildId, userId, itemId]
        );
    }

    async retrieveMemberItem(guildId, userId, itemId, quantity) {
        return this._query(
            `UPDATE member_items SET hidden_quantity = hidden_quantity - ?, quantity = quantity + ? WHERE guild_id = ? AND user_id = ? AND item_id = ?;`,
            [quantity, quantity, guildId, userId, itemId]
        );  
    }

    async depositItem(guildId, userId, itemId, itemType, drugType = null, localisation, placeId, quantity, allItemsRemoved = false) {
        if(!["estate", "vehicle"].includes(localisation)) throw new Error("Localisation must be 'estate' or 'vehicle'");
        if(!["items", "drugs"].includes(itemType)) throw new Error("itemType must be 'items' or 'drugs'");
        if(itemType == "drugs" && !drugType) throw new Error("Drug type must be specified into 'depositItem()' function.");

        if(itemType == "items") {
            if(allItemsRemoved) await this._query(`DELETE FROM member_items WHERE guild_id = ? AND user_id = ? AND item_id = ?;`, [guildId, userId, itemId]);
            else await this._query(`UPDATE member_items SET quantity = quantity - ? WHERE guild_id = ? AND user_id = ? AND item_id = ?;`, [quantity, guildId, userId, itemId])

            return this._query(`INSERT INTO ${localisation}_inventory (guild_id, ${localisation}_id, item_id, quantity) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?;`,
            [guildId, placeId, itemId, quantity, quantity]
            );
        } else {
            if(allItemsRemoved) await this._query(`DELETE FROM member_drugs WHERE guild_id = ? AND user_id = ? AND drug_id = ?;`, [guildId, userId, itemId]);
            else await this._query(`UPDATE member_drugs SET ${drugType} = ${drugType} - ? WHERE guild_id = ? AND user_id = ? AND drug_id = ?;`, [quantity, guildId, userId, itemId])

            return this._query(`INSERT INTO ${localisation}_drugs (guild_id, ${localisation}_id, drug_id, ${drugType}) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE ${drugType} = ${drugType} + ?;`,
            [guildId, placeId, itemId, quantity, quantity]
            );
        }
    }

    async withdrawItem(guildId, userId, itemId, itemType, drugType = null, localisation, placeId, quantity, all = false) {

        if(!["estate", "vehicle"].includes(localisation)) throw new Error("Localisation must be 'estate' or 'vehicle' into 'withdrawItem()' function.");
        if(!["items", "drugs"].includes(itemType)) throw new Error("Item type must be 'items' or 'drugs' into 'withdrawItem()' function.");
        
        if(itemType == "items") {
            
            if(all) await this._query(`DELETE FROM ${localisation}_inventory WHERE guild_id = ? AND ${localisation}_id = ? AND item_id = ?;`, [guildId, placeId, itemId]);
            else await this._query(`UPDATE ${localisation}_inventory SET quantity = quantity - ? WHERE guild_id = ? AND ${localisation}_id = ? AND item_id = ?;`, [quantity, guildId, placeId, itemId]);
            
        } else {
            
            if(all) await this._query(`DELETE FROM ${localisation}_drugs WHERE guild_id = ? AND ${localisation}_id = ? AND drug_id = ?;`, [guildId, placeId, itemId]);
            else await this._query(`UPDATE ${localisation}_drugs SET ${drugType} = ${drugType} - ? WHERE guild_id = ? AND ${localisation}_id = ? AND drug_id = ?;`, [quantity, guildId, placeId, itemId]);
            
        }
        
        if(itemType == "items") return this._query(`INSERT INTO member_items (guild_id, user_id, item_id, quantity) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?;`, [guildId, userId, itemId, quantity, quantity])
        else return this._query(`INSERT INTO member_drugs (guild_id, user_id, drug_id, ${drugType}) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE ${drugType} = ${drugType} + ?;`, [guildId, userId, itemId, quantity, quantity])

    }

    async removeSafeItem(guildId, safeId, type, itemId, quantity, all = false) {

        if(!["cg", "properties", "companies"].includes(type)) throw new Error("Localisation must be 'cg', 'properties' or 'companies' into 'removeSafeItem()' function.");

        switch(type) {
            case "cg": type = "vehicle"; break;
            case "properties": type = "estate"; break;
        }

        if(all) await this._query(`DELETE FROM ${type}_inventory WHERE guild_id = ? AND ${type.replace("ies", "y")}_id = ? AND item_id = ?;`, [guildId, safeId, itemId]);
        else await this._query(`UPDATE ${type}_inventory SET quantity = quantity - ? WHERE guild_id = ? AND ${type.replace("ies", "y")}_id = ? AND item_id = ?;`, [quantity, guildId, safeId, itemId]);

    }

    async getMemberItems(guildId, userId) {
        return this._query(`
            SELECT member_items.quantity, member_items.hidden_quantity, shops_items.weight, IF(member_items.nickname IS NOT NULL, member_items.nickname, shops_items.name) AS name, shops_items.image, shops_items.hunger_add, shops_items.thirst_add, shops_items.id, shops_items.type, shops_items.role_required, shops_items.role_add, shops_items.role_remove, shops_items.max_items
            FROM member_items
            LEFT JOIN shops_items ON shops_items.id = member_items.item_id
            WHERE member_items.guild_id = ? AND member_items.user_id = ?
        `, [guildId, userId]);
    }

    async getMemberItem(guildId, userId, itemId) {
        return this._queryOne(`
            SELECT member_items.quantity, member_items.hidden_quantity, shops_items.weight, IF(member_items.nickname IS NOT NULL, member_items.nickname, shops_items.name) AS name, shops_items.image, shops_items.hunger_add, shops_items.thirst_add, shops_items.id, shops_items.type, shops_items.role_required, shops_items.role_add, shops_items.role_remove, shops_items.max_items
            FROM member_items LEFT JOIN shops_items ON shops_items.id = member_items.item_id
            WHERE member_items.item_id = ? AND member_items.guild_id = ? AND member_items.user_id = ?
        `, [itemId, guildId, userId]);
    }

    async getQuantityMemberItemWithSameNickname(guildId, userId, itemName) {
        return this._queryOne(`SELECT COUNT(*) AS count FROM member_items WHERE guild_id = ? AND user_id = ? AND nickname = ?;`, [guildId, userId, itemName]).then(data => data?.count ?? 0)
    }

    async setNicknameItem(guildId, userId, itemId, nickname) {
        return this._query(`UPDATE member_items SET nickname = ? WHERE guild_id = ? AND user_id = ? AND item_id = ?;`, [nickname, guildId, userId, itemId]);
    }

    //############################# SHOP ITEMS ############################

    async getShop(guildId, id = null) {
        return this[id ? "_queryOne": "_query"](`SELECT id, name, company_id, description, thumbnail, color FROM shops WHERE guild_id = ?${id ? " AND id = ?" : ""};`, id ? [guildId, id] : [guildId]);
    }

    async getShopItems(guildId, shopId = null) {
        return this._query(`SELECT * FROM shops_items WHERE guild_id = ?${shopId ? " AND shop_id = ?" : ""};`, shopId ? [guildId, shopId] : [guildId]); 
    }

    async getShopItem(guildId, itemId, fullInformations = false) {
        return this._queryOne(`SELECT ${fullInformations ? "*" : "id, name, price, weight, image, emoji"} FROM shops_items WHERE guild_id = ? AND id = ?;`, [guildId, itemId]);
    }

    async getShopItemByName(guildId, item, fullInformations = false) {
        return this._queryOne(`SELECT ${fullInformations ? "*" : "id, name, price, weight, image, emoji"} FROM shops_items WHERE guild_id = ? AND name = ?;`, [guildId, item]);
    }

    async createShop(guildId, name, description = null, companyId = null, color = null, thumbnail = null) {
        await this.ensureGuild(guildId);
        return this._query("INSERT INTO shops (guild_id, name, description, company_id, color, thumbnail) VALUES (?, ?, ?, ?, ?, ?);", [guildId, name, description, companyId, color, thumbnail]);
    }

    async editShop(guildId, shopId, name, description = null, color = null, thumbnail = null) {
        await this.ensureGuild(guildId);
        return this._query("UPDATE shops SET name = ?, description = ?, color = ?, thumbnail = ? WHERE guild_id = ? AND id = ?;", [name, description, color, thumbnail, guildId, shopId]);  
    }

    async deleteShop(shopId) {   
        await this._query("DELETE FROM shops_items WHERE shop_id = ?;", [shopId]); 
        return this._query("DELETE FROM shops WHERE id = ?;", [shopId]);  
    }

    async editShopItem(guildId, shopId, name, price) {
        return this._query("UPDATE shops_items SET price = ? WHERE guild_id = ? AND shop_id = ? AND name = ?;", [price, guildId, shopId, name]);
    }

    async addShopItem(guildId, shopId, name, description, price, weight, requiredRole, roleToAdd, roleToRemove) {
        return this._query("INSERT INTO shops_items (guild_id, shop_id, name, description, price, weight, role_required, role_add, role_remove) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);", [guildId, shopId, name, description, price, weight, requiredRole, roleToAdd, roleToRemove]);
    }

    async deleteShopItem(guildId, shopId, itemId) {
        return this._query("DELETE FROM shops_items WHERE guild_id = ? AND shop_id = ? AND id = ?;", [guildId, shopId, itemId]);
    }

    //############################# COMPANIES ############################

    async isCompanyOwner(guildId, userId) {
        const data = await this._queryOne(
            "SELECT companies_employees.company_id, companies.owner_id FROM companies_employees LEFT JOIN companies ON companies_employees.company_id = companies.id WHERE companies.guild_id = ? companies_employees.user_id = ?;",
            [guildId, userId]
        );
        return data?.company_id ? data?.owner_id === userId : null;
    }

    async findCompany(guildId, name) {
        const data = await this._queryOne("SELECT id FROM companies WHERE guild_id = ? AND name = ?;", [guildId, name]);
        return data?.id ? true : false;
    }

    async createCompany(guildId, ownerId, companyData) {

        await this.ensureMember(guildId, ownerId);
        const values = [guildId, ...Object.values(companyData)];
        const { insertId } = await this._query(`INSERT INTO companies (guild_id, name, type, speciality, max_employees, color, logo) VALUES (?, ?, ?, ?, ?, ?, ?);`, values);
        await this._query(`INSERT INTO companies_employees (company_id, user_id, owner, safe_access, account_access, desk_access) VALUES (?, ?, ?, ?, ?, ?);`, [insertId, ownerId, 1 /*is Owner*/, 1, 1, 1]);

        return insertId;
    }

    async deleteCompany(id) {
        return this._query("DELETE FROM companies WHERE id = ?;", [id])
    }

    async getCompanies(guildId) {
        return this._query("SELECT companies.* FROM companies WHERE companies.guild_id = ?;", [guildId]);
    }

    async getCompaniesWithOwner(guildId) {
        const data = await this._query(`SELECT companies.*, GROUP_CONCAT(IF(companies_employees.owner = 1, companies_employees.user_id, NULL)) AS user_id FROM companies LEFT JOIN companies_employees ON companies.id = companies_employees.company_id WHERE companies.guild_id = ? GROUP BY companies.id`, [guildId]);

        return data.map(company => {
          const user_id = company.user_id ? company.user_id.split(',') : [];
          return { ...company, user_id };
        });
    }
      
    async getMemberCompanies(guildId, userId) {
        const data = await this._query(
            "SELECT companies.*, companies_employees.owner FROM companies_employees LEFT JOIN companies ON companies_employees.company_id = companies.id WHERE companies.guild_id = ? AND companies_employees.user_id = ?;",
            [guildId, userId]
        );
        return data ?? null
    }

    async getCompany(guildId, companyId) {
        const data = await this._queryOne("SELECT * FROM companies WHERE guild_id = ? AND id = ?;", [guildId, companyId]);
        return data ?? null;
    }

    async getCompanyByName(guildId, name) {
        return this._query("SELECT * FROM companies WHERE guild_id = ? AND name = ?;", [guildId, name]);
    }

    async getSpecifyCompany(guildId, speciality, id = null, getFirst = false) {
        const data = await this._query(`SELECT * FROM companies WHERE guild_id = ? AND speciality = ?${id ? ` AND id = ?` : ""};`, id ? [guildId, speciality, id] : [guildId, speciality]);
        return id || getFirst && data.length > 0 ? data[0] : data;
    }

    async getCompanyOwner(companyId) {
        return this._queryOne("SELECT user_id FROM companies_employees WHERE company_id = ? AND owner = 1;", [companyId]);
    }

    async getCompanyEmployees(companyId) {
        return this._query("SELECT * FROM companies_employees WHERE company_id = ?;", [companyId]);
    }

    async getCompanyInventory(companyId, drugs = false) {
        if(drugs) return this._query(`SELECT companies_drugs.*, drugs.name, drugs.image FROM companies_drugs LEFT JOIN drugs ON companies_drugs.drug_id = drugs.id WHERE companies_drugs.company_id = ?`, [companyId]);
        return this._query(`SELECT * FROM companies_inventory LEFT JOIN shops_items ON companies_inventory.item_id = shops_items.id WHERE companies_inventory.company_id = ?;`, [companyId]);
    }

    async getCompanyItem(companyId, itemId) {
        const data = await this._queryOne("SELECT quantity FROM companies_inventory WHERE company_id = ? AND item_id = ?;", [companyId, itemId]);
        return data ?? null;
    }

    async putCompanyInventory(guildId, companyId, type, itemId, drugType = null, quantity) {
        if(!["drugs", "items"].includes(type)) throw new Error("Parameter 'type' must be 'drugs' or 'items' in 'putCompanyInventory()' function.");
        if(type == "drugs" && !["untreated", "treated"].includes(drugType)) throw new Error("Parameter 'drugType' must be 'untreated' or 'treated' in 'putCompanyInventory()' function.")
        
        if(type == "items") {

            return this._query("INSERT INTO companies_inventory (guild_id, company_id, item_id, quantity) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?;",
                [guildId, companyId, itemId, quantity, quantity]
            );

        } else {

            return this._query(`INSERT INTO companies_drugs (company_id, drug_id, ${drugType}) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE ${drugType} = ${drugType} + ?;`,
                [companyId, itemId, quantity, quantity]
            );

        }
    }

    async takeCompanyInventory(guildId, companyId, type, itemId, drugType = null, quantity, deleteItem = false) {

        if(!["drugs", "items"].includes(type)) throw new Error("Parameter 'type' must be 'drugs' or 'items' in 'putCompanyInventory()' function.");
        if(type == "drugs" && !["untreated", "treated"].includes(drugType)) throw new Error("Parameter 'drugType' must be 'untreated' or 'treated' in 'putCompanyInventory()' function.")

        if(type == "items") {
            
            if(deleteItem) return this._query("DELETE FROM companies_inventory WHERE company_id = ? AND item_id = ? AND guild_id = ?;", [companyId, itemId, guildId]);
            else return this._query("UPDATE companies_inventory SET quantity = quantity - ? WHERE company_id = ? AND item_id = ? AND guild_id = ?;",
                [quantity, companyId, itemId, guildId]
            );

        } else {

            if(deleteItem) return this._query(`DELETE FROM companies_drugs WHERE company_id = ? AND drug_id = ?;`, [companyId, itemId]);
            else return this._query(`UPDATE companies_drugs SET ${drugType} = ${drugType} - ? WHERE company_id = ? AND drug_id = ?`,
                [quantity, companyId, itemId]
            );

        }
    }

    async addCompanySafeMoney(companyId, amount, dirty = false) {
        return this._query(`UPDATE companies SET ${dirty ? "dirty_money" : "safe_money"} = ${dirty ? "dirty_money" : "safe_money"} + ? WHERE id = ?`, [amount, companyId]);
    }

    async removeCompanySafeMoney(companyId, amount, dirty = false) {
        return this._query(`UPDATE companies SET ${dirty ? "dirty_money" : "safe_money"} = ${dirty ? "dirty_money" : "safe_money"} - ? WHERE id = ?`, [amount, companyId]);
    }

    async giveAccess(companyId, userId, type) {
        return this._query(`UPDATE companies_employees SET ${type} = 1 WHERE company_id = ? AND user_id = ?`, [companyId, userId]);
    }

    async removeAccess(companyId, userId, type) {
        return this._query(`UPDATE companies_employees SET ${type} = 0 WHERE company_id = ? AND user_id = ?`, [companyId, userId]);
    }

    async recruitMemberCompany(userId, companyId, policeNumber = null) {
        return this._query("INSERT INTO companies_employees (company_id, user_id, owner, police_number) VALUES (?, ?, ?, ?);", [companyId, userId, 0 /*is not Owner*/, policeNumber]);
    }

    async fireMemberCompany(userId, companyId) {
        return this._query("DELETE FROM companies_employees WHERE user_id = ? AND company_id = ?;", [userId, companyId]);
    }

    async addMoneyToCompany(companyId, amount, dirty = false) {
        return this._query(`UPDATE companies SET ${dirty ? "dirty_money" : "money"} = ${dirty ? "dirty_money" : "money"} + ? WHERE id = ?`, [amount, companyId]);
    }

    async setCompanyOwner(company, employeesLength, userId, newOwnerIsEmployee = false) {
        if(!newOwnerIsEmployee && company?.max_employees && company.max_employees < (employeesLength + 1)) await this._query("DELETE FROM companies_employees WHERE company_id = ? AND owner = 1;", [company.id]);
        else await this._query("UPDATE companies_employees SET owner = 0, safe_access = 0, desk_access = 0, account_access = 0 WHERE company_id = ? AND owner = 1;", [company.id]);
        
        if(newOwnerIsEmployee) return this._query("UPDATE companies_employees SET owner = 1, safe_access = 1, desk_access = 1, account_access = 1 WHERE company_id = ? AND user_id = ?", [company.id, userId]);
        else return this._query("INSERT INTO companies_employees (company_id, user_id, owner, safe_access, desk_access, account_access) VALUES (?, ?, ?, ?, ?, ?);", [company.id, userId, 1, 1, 1, 1]);
    }

    //############################# BILLS ############################

    async getMemberBills(guildId, userId) {
        return this._query("SELECT * FROM companies_bills WHERE guild_id = ? AND user_id = ?;", [guildId, userId]);
    }

    async getMemberBill(guildId, id) {
        return this._queryOne("SELECT * FROM companies_bills WHERE guild_id = ? AND id = ?;", [guildId, id]);
    }

    async addMemberBill(guildId, userId, authorId, companyId, fine, amount, reason) {
        return this._queryOne("INSERT INTO companies_bills (guild_id, user_id, author_id, company_id, fine, amount, reason) VALUES (?, ?, ?, ?, ?, ?, ?);", [guildId, userId, authorId, companyId, fine, amount, reason]);
    }

    async deleteMemberBill(id) {
        return this._query("DELETE FROM companies_bills WHERE id = ?;", [id]);
    }

    async payBill(bill, method) {
        return this._multiple(
            ["DELETE FROM companies_bills WHERE guild_id = ? AND id = ?;", [bill.guild_id, bill.id]],
            [`UPDATE companies SET money = money + ? WHERE id = ?;`, [bill.amount, bill?.company_id]],
            [`UPDATE ${method == "bank_money" ? "bank_accounts" : "members"} SET ${method} = ${method} - ? WHERE guild_id = ? AND user_id = ?;`, [bill.amount, bill.guild_id, bill.user_id]]
        );
    }

    //############################# RUNS ############################

    async getRuns(guildId) {
        return this._query("SELECT * FROM runs WHERE guild_id = ?;", [guildId]);
    }

    async getRun(id) {
        return this._queryOne("SELECT * FROM runs WHERE id = ?;", [id]);
    }

    async getRunByName(guildId, name) {
        return this._queryOne("SELECT * FROM runs WHERE guild_id = ? AND name = ?;", [guildId, name]);
    }

    //############################# POLICE COMPUTER ############################

    async getLogin(guildId, identifier, password) {
        return this._queryOne("SELECT * FROM police_computer WHERE guild_id = ? AND identifier = ? AND password = ?;", [guildId, identifier, password]);
    }

    async getFines(guildId) {
        return this._query("SELECT * FROM companies_bills WHERE guild_id = ? AND fine = 1;", [guildId]);
    }

    //############################# LE BON COIN ############################

    async addSale(guildId, userId, name, description, price, image = null, thumbnail = null) {
        await this.ensureGuild(guildId);
        return this._query("INSERT INTO leboncoin (guild_id, seller_id, name, description, price, image, thumbnail) VALUES (?, ?, ?, ?, ?, ?, ?);", [guildId, userId, name, description, price, image, thumbnail]);
    }

    async deleteSale(guildId, saleId) {
        await this._query("DELETE FROM leboncoin_likes WHERE guild_id = ? AND sale_id = ?;", [guildId, saleId]);
        return this._query("DELETE FROM leboncoin WHERE guild_id = ? AND id = ?;", [guildId, saleId]);
    }

    async editSale(guildId, saleId, name, price, description) {
        return this._query("UPDATE leboncoin SET name = ?, price = ?, description = ? WHERE guild_id = ? AND id = ?;", [name, price, description, guildId, saleId]);
    }

    async getSales(guildId) {
        return this._query("SELECT * FROM leboncoin WHERE guild_id = ?;", [guildId]);
    }

    async getSale(guildId, saleId) {
        const data = await this._queryOne("SELECT * FROM leboncoin WHERE guild_id = ? AND id = ?;", [guildId, saleId]);
        return data ?? null;
    }

    async getSaleByName(guildId, name) {
        const data = await this._queryOne("SELECT * FROM leboncoin WHERE guild_id = ? AND name = ?;", [guildId, name]);
        return data ?? null;
    }

    async getMemberSales(guildId, userId) {
        return this._query("SELECT * FROM leboncoin WHERE guild_id = ? AND seller_id = ?;", [guildId, userId]);
    }

    async getMemberLikes(guildId, userId) {
        return this._query("SELECT leboncoin_likes.sale_id, leboncoin.* FROM leboncoin_likes LEFT JOIN leboncoin ON leboncoin_likes.sale_id = leboncoin.id WHERE leboncoin_likes.guild_id = ? AND leboncoin_likes.user_id = ?;", [guildId, userId]);
    }

    async likeSale(guildId, userId, saleId) {
        await this.ensureGuild(guildId);
        return this._query("INSERT INTO leboncoin_likes (guild_id, user_id, sale_id) VALUES (?, ?, ?);", [guildId, userId, saleId]);
    }

    async unlikeSale(guildId, userId, saleId) {
        return this._query("DELETE FROM leboncoin_likes WHERE guild_id = ? AND user_id = ? AND sale_id = ?;", [guildId, userId, saleId]);
    }

    //############################# PROPERTIES ############################

    async createProperty(guildId, name, localisation, price, image) {
        await this.ensureGuild(guildId);
        return this._query("INSERT INTO estates (guild_id, name, localisation, price, image) VALUES (?, ?, ?, ?, ?);", [guildId, name, localisation, price, image]);
    }

    async deleteProperty(guildId, id) {
        return this._query("DELETE FROM estates WHERE guild_id = ? AND id = ?;", [guildId, id]);
    }

    async getProperties(guildId, realEstateId = null) {
        return this._query(`SELECT * FROM estates WHERE guild_id = ?${realEstateId ? " AND realestate_id = ?" : ""};`, realEstateId ? [guildId, realEstateId] : [guildId]);
    }

    async getProperty(guildId, id) {
        return this._queryOne("SELECT * FROM estates WHERE guild_id = ? AND id = ?;", [guildId, id]);
    }

    async getMemberProperties(guildId, userId) {
        return this._query(`SELECT * FROM estates WHERE guild_id = ? AND (owner_id = ? OR authorized_members LIKE '%${userId}%');`, [guildId, userId]);
    }

    async getMemberProperty(guildId, userId, id) {
        return this._queryOne(`SELECT * FROM estates WHERE guild_id = ? AND id = ? AND (owner_id = ? OR authorized_members LIKE '%${userId}%');`, [guildId, id, userId]);
    }

    async getAuthorizedMembers(guildId, id) {
        return this._queryOne("SELECT authorized_members FROM estates WHERE guild_id = ? AND id = ?;", [guildId, id]);
    }

    async getSafeProperty(id, drugs = false) {
        if(drugs) {

            return this._query(
            `SELECT estate_drugs.*, drugs.name, drugs.image FROM estate_drugs LEFT JOIN drugs ON estate_drugs.drug_id = drugs.id
            WHERE estate_drugs.estate_id = ?;`, [id]);

        } else {

            return this._query(
            `SELECT estate_inventory.*, shops_items.* FROM estate_inventory LEFT JOIN shops_items ON estate_inventory.item_id = shops_items.id
            WHERE estate_inventory.estate_id = ?;`, [id]);
        
        }
    }

    async resetMemberProperties(guildId, userId) {
        let memberEstates = await this.getMemberProperties(guildId, userId);
        if(!memberEstates.length) return;
        for(const estate of memberEstates) {
            if (estate.owner_id === userId) {
                let authorized_members = (estate.authorized_members ?? "").split(",");
                if(authorized_members.length) {
                    let newOwner = authorized_members.pop();
                    this._query("UPDATE estates SET owner_id = ?, authorized_members = ? WHERE guild_id = ? AND id = ?;", [newOwner == "" ? null : newOwner, authorized_members.length ? authorized_members.join(",") : null, guildId, estate.id]);
                } else this._query("UPDATE estates SET owner_id = NULL WHERE guild_id = ? AND id = ?;", [guildId, estate.id]);
            } else {
                let authorized_members = (estate.authorized_members ?? "").split(",");
                authorized_members = authorized_members.filter(m => m !== userId);
                this._query("UPDATE estates SET authorized_members = ? WHERE guild_id = ? AND id = ?;", [authorized_members.length ? authorized_members.join(",") : null, guildId, estate.id]);
            }
        }
    }

    async buyProperty(guildId, id, userId, price, realEstateCompanyId) {
        if(realEstateCompanyId) await this._query("UPDATE companies SET money = money + ? WHERE id = ?;", [price, realEstateCompanyId]);
        return this._query(`
        UPDATE bank_accounts, estates
        SET bank_accounts.bank_money = bank_accounts.bank_money - ?, estates.realestate_id = ?, estates.owner_id = ?, estates.sell_date = ?
        WHERE bank_accounts.guild_id = ? AND bank_accounts.user_id = ? AND estates.guild_id = ? AND estates.id = ?;`,
        [price, realEstateCompanyId, userId, new Date(), guildId, userId, guildId, id]);
    }

    async sellProperty(guildId, id, userId, price, realEstateCompanyId = false, reasonCompany = "", reasonUser = "") {
        
        console.log(guildId, id, userId, price, realEstateCompanyId, reasonCompany, reasonUser)
        if(realEstateCompanyId) {
            await this._multiple(
                ["UPDATE companies SET money = money - ? WHERE id = ?;", [price, realEstateCompanyId]],
                ["INSERT INTO transactions (guild_id, target_id, reason, amount) VALUES (?, ?, ?, ?);", [guildId, realEstateCompanyId, reasonCompany, -price]],
            );
        }

        return this._multiple(
            [`UPDATE bank_accounts SET bank_money = bank_money + ? WHERE guild_id = ? AND user_id = ?;`, [price, guildId, userId]],
            [`UPDATE estates SET owner_id = NULL, sell_date = NULL, authorized_members = NULL WHERE guild_id = ? AND id = ?;`, [guildId, id]],
            [`DELETE FROM estate_inventory WHERE guild_id = ? AND estate_id = ?;`, [guildId, id]],
            [`DELETE FROM estate_drugs WHERE guild_id = ? AND estate_id = ?;`, [guildId, id]],
            [`INSERT INTO transactions (guild_id, target_id, reason, amount) VALUES (?, ?, ?, ?);`, [guildId, userId, reasonUser, price]]
        )
    }

    async setPropertyOwner(guildId, id, userId) {
        return this._query("UPDATE estates SET owner_id = ? WHERE guild_id = ? AND id = ?;", [userId, guildId, id]);
    }

    async setDoubleKeys(guildId, id, table, authorizedMembers) {
        if(authorizedMembers == "") authorizedMembers = null;
        return this._query(`UPDATE ${table} SET authorized_members = ? WHERE guild_id = ? AND id = ?;`, [authorizedMembers, guildId, id]);
    }

    async addPlaceMoney(guildId, placeType, id, type, quantity) {
        return this._query(`UPDATE ${placeType} SET ${type} = ${type} + ? WHERE guild_id = ? AND id = ?;`, [quantity, guildId, id]);
    }

    async removePlaceMoney(guildId, placeType, id, type, quantity) {
        return this._query(`UPDATE ${placeType} SET ${type} = ${type} - ? WHERE guild_id = ? AND id = ?;`, [quantity, guildId, id]);
    }

    async isOwnerProperty(guildId, name, userId) {
        const data = await this._queryOne("SELECT owner_id FROM estates WHERE guild_id = ? AND name = ?;", [guildId, name]);
        return data.owner_id == userId;
    }

    //############################# BANK ACCOUNTS ############################

    async getGuildMoney(guildId) {
        return this._query("SELECT bank_accounts.*, members.* FROM bank_accounts LEFT JOIN members ON bank_accounts.guild_id = members.guild_id AND bank_accounts.user_id = members.user_id WHERE bank_accounts.guild_id = ? AND members.guild_id = ?;", [guildId, guildId]);
    }

    async getGuildBankAccounts(guildId) {
        return this._query("SELECT * FROM bank_accounts WHERE guild_id = ?", [guildId]);
    }

    async getBankAccount(guildId, userId) {
        return this._queryOne("SELECT * FROM bank_accounts WHERE guild_id = ? AND user_id = ?;", [guildId, userId]);
    }

    async getBankAccountWithIban(guildId, iban) {
        return this._queryOne("SELECT * FROM bank_accounts WHERE guild_id = ? AND iban = ?;", [guildId, iban]);
    }

    async getCashMoney(guildId, userId) {
        await this.ensureMember(guildId, userId);
        return this._queryOne("SELECT cash_money, hidden_cash_money FROM members WHERE guild_id = ? AND user_id = ?;", [guildId, userId]);
    }

    async getMoney(guildId, userId) {
        await this.ensureMember(guildId, userId);
        return this._queryOne("SELECT cash_money, dirty_money, bank_money, hidden_cash_money, hidden_dirty_money, blocked, frozen_date, frozen_reason FROM members LEFT JOIN bank_accounts ON members.guild_id = bank_accounts.guild_id AND members.user_id = bank_accounts.user_id WHERE members.guild_id = ? AND members.user_id = ?;", [guildId, userId]);
    }

    async hasBankAccount(guildId, userId) {
        return this._queryOne("SELECT count(*) FROM bank_accounts WHERE guild_id = ? AND user_id = ?;", [guildId, userId]).then((data) => data["count(*)"] > 0);
    }

    async isFreezeAccount(guildId, userId) {
        const data = await this._queryOne("SELECT frozen_date, frozen_reason FROM bank_accounts WHERE guild_id = ? AND user_id = ?;", [guildId, userId])
        return !data?.frozen_date || !data?.frozen_reason ? false : { frozen_date: data.frozen_date, frozen_reason: data.frozen_reason }
    }

    async checkIban(guildId, iban) {
        return this._queryOne("SELECT COUNT(*) FROM bank_accounts WHERE guild_id = ? AND iban = ?", [guildId, iban]).then((data) => data["COUNT(*)"] > 0)
    }

    async createBankAccount(guildId, userId, iban, secretCode, cardCode, startAmount) {
        await this.ensureMember(guildId, userId);
        return this._query("INSERT INTO bank_accounts (guild_id, user_id, iban, secret_code, card_code, bank_money) VALUES (?, ?, ?, ?, ?, ?);", [guildId, userId, iban, secretCode, cardCode, startAmount]);
    }

    async deleteBankAccount(guildId, userId) {
        await this._query("DELETE FROM transactions WHERE guild_id = ? AND target_id = ?;", [guildId, userId]);
        return this._query("DELETE FROM bank_accounts WHERE guild_id = ? AND user_id = ?;", [guildId, userId]);
    }

    async setBankCode(guildId, userId, type, cardCode) {
        return this._query(`UPDATE bank_accounts SET ${type}_code = ? WHERE guild_id = ? AND user_id = ?;`, [cardCode, guildId, userId]);
    }

    async setBankConnexionMethod(guildId, userId, method) {
        return this._query("UPDATE bank_accounts SET connexion_type = ? WHERE guild_id = ? AND user_id = ?;", [method, guildId, userId]);
    }

    async setBankAccountSecurityQuestion(guildId, userId, question, answer) {
        return this._query("UPDATE bank_accounts SET question = ?, answer = ? WHERE guild_id = ? AND user_id = ?;", [question, answer, guildId, userId]);
    }

    async blockBankCard(guildId, userId) {
        return this._query("UPDATE bank_accounts SET blocked = 1 WHERE guild_id = ? AND user_id = ?;", [guildId, userId]);
    }

    async unblockBankCard(guildId, userId) {
        return this._query("UPDATE bank_accounts SET blocked = 0 WHERE guild_id = ? AND user_id = ?;", [guildId, userId]);
    }

    async addLoan(guildId, userId, bankerId, bankId, amount, reason, dateLimit) {
        return this._multiple(
            ["UPDATE bank_accounts SET bank_money = bank_money + ? WHERE guild_id = ? AND user_id = ?;", [amount, guildId, userId]],
            ["INSERT INTO transactions (guild_id, target_id, reason, amount) VALUES (?, ?, ?, ?);", [guildId, userId, reason, amount]],
            ["INSERT INTO loans (guild_id, user_id, banker_id, bank_id, amount, reason, date_limit) VALUES (?, ?, ?, ?, ?, ?, ?);", [guildId, userId, bankerId, bankId, amount, reason, dateLimit]]
        );
    }

    async removeLoan(id) {
        return this._query("DELETE FROM loans WHERE id = ?;", [id]);
    }

    async getLoans(guildId, userId) {
        return this._query("SELECT * FROM loans WHERE guild_id = ? AND user_id = ?;", [guildId, userId]);
    }

    async payLoan(guildId, userId, id, amount, bankCompanyId, transactions, current, lang, all = false) {
        return this._multiple(
            all ? ["DELETE FROM loans WHERE id = ?;", [id]] : ["UPDATE loans SET payed = payed + ?, transactions = ? WHERE id = ?;", [amount, transactions, id]],
            ["UPDATE bank_accounts SET bank_money = bank_money - ? WHERE guild_id = ? AND user_id = ?;", [amount, guildId, userId]],
            ["INSERT INTO transactions (guild_id, target_id, reason, amount) VALUES (?, ?, ?, ?);", [guildId, userId, lang == "fr" ? `Remboursement du prêt n°${current}` : `Refund of loan n°${current}`, -amount]],
            ["UPDATE companies SET money = money + ? WHERE id = ?;", [amount, bankCompanyId]],
            bankCompanyId ? ["INSERT INTO transactions (guild_id, target_id, reason, amount) VALUES (?, ?, ?, ?);", [guildId, bankCompanyId, lang == "fr" ? `Remboursement du prêt n°${id}` : `Refund of loan n°${id}`, amount]] : ["SELECT 1+1;"],
        )
    }

    async depositMoney(guildId, userId, amount) {
        return this._multiple(
            ["UPDATE members SET cash_money = cash_money - ? WHERE guild_id = ? AND user_id = ?;", [amount, guildId, userId]],
            ["UPDATE bank_accounts SET bank_money = bank_money + ? WHERE guild_id = ? AND user_id = ?;", [amount, guildId, userId]],
        );
    }

    async withdrawMoney(guildId, userId, amount) {
        return this._multiple(
            ["UPDATE bank_accounts SET bank_money = bank_money - ? WHERE guild_id = ? AND user_id = ?;", [amount, guildId, userId]],
            ["UPDATE members SET cash_money = cash_money + ? WHERE guild_id = ? AND user_id = ?;", [amount, guildId, userId]],
        );
    }

    async setMoney(guildId, userId, type, amount) {
        return this._query(`UPDATE bank_accounts SET ${type} = ? WHERE guild_id = ? AND user_id = ?;`, [amount, guildId, userId]);
    }

    async addMoney(guildId, userId, type, amount) {
        return this._query(`UPDATE ${["bank_money", "crypto_wallet"].includes(type) ? "bank_accounts" : "members"} SET ${type} = ${type} + ? WHERE guild_id = ? AND user_id = ?;`, [amount, guildId, userId]);
    }

    async massAddMoney(guildId, userIdList, type, amount) {
        return this._query(`UPDATE ${["bank_money", "crypto_wallet"].includes(type) ? "bank_accounts" : "members"} SET ${type} = ${type} + ? WHERE guild_id = ? AND user_id IN (${userIdList.map(u => u)});`, [amount, guildId]);
    }

    async getTransactions(guildId, id) {
        return this._query("SELECT * FROM transactions WHERE guild_id = ? AND target_id = ? ORDER BY date DESC;", [guildId, id]);
    }

    async addTransactionLog(guildId, id, amount, reason) {
        const transactions = await this.getTransactions(guildId, id);
        if (transactions.length > 5) {
            
            for (let i = 0; i < transactions.length - 4; i++) {
                await this._query("DELETE FROM transactions WHERE guild_id = ? AND target_id = ? AND id = ?;", [guildId, id, transactions[i].id]);
            }

            return this._query("INSERT INTO transactions (guild_id, target_id, amount, reason) VALUES (?, ?, ?, ?);", [guildId, id, amount, reason]);
        
        } else if (transactions.length == 5) {

            await this._query("DELETE FROM transactions WHERE guild_id = ? AND target_id = ? AND id = ?;", [guildId, id, transactions[transactions.length - 1].id]);
            return this._query("INSERT INTO transactions (guild_id, target_id, amount, reason) VALUES (?, ?, ?, ?);", [guildId, id, amount, reason]);
        
        } else {

            return this._query("INSERT INTO transactions (guild_id, target_id, amount, reason) VALUES (?, ?, ?, ?);", [guildId, id, amount, reason]);
        
        }
    }

    async freezeAccount(guildId, userId, reason, unfreeze = false) {
        if(unfreeze) return this._query("UPDATE bank_accounts SET frozen_date = NULL, frozen_reason = NULL WHERE guild_id = ? AND user_id = ?;", [guildId, userId]);  
        return this._query("UPDATE bank_accounts SET frozen_date = ?, frozen_reason = ? WHERE guild_id = ? AND user_id = ?;", [new Date(), reason, guildId, userId]);
    }

    //############################# WEAPON LICENCES ############################

    async setWeaponLicense(guildId, userId, type, status) {
        await this.ensureMember(guildId, userId);
        const date = new Date();

        return this._query(
            `INSERT INTO weapon_licences (guild_id, user_id, type, date, status) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE date = ?, status = ?;`,
            [guildId, userId, type, date, status, date, status]
        );
    }

    async deleteWeaponLicense(guildId, userId, type) {
        return this._query("DELETE FROM weapon_licences WHERE guild_id = ? AND user_id = ? AND type = ?;", [guildId, userId, type]);
    }

    async getWeaponLicense(guildId, userId, type = null) {
        if (type) return this._queryOne(`SELECT * FROM weapon_licences WHERE guild_id = ? AND user_id = ? AND type = ?;`, [guildId, userId, type]);
        else return this._query(`SELECT * FROM weapon_licences WHERE guild_id = ? AND user_id = ?;`, [guildId, userId]);
    }

    async getWeaponLicenseStatus(guildId, userId, type) {
        const data = await this._queryOne(
            `SELECT status FROM weapon_licences WHERE guild_id = ? AND user_id = ? AND type = ?;`,
            [guildId, userId, type]
        );
        return data?.status;
    }

    //############################# DRIVER LICENCES ############################

    async setDriverLicense(guildId, userId, type, status) {
        await this.ensureMember(guildId, userId);
        const date = new Date();

        return this._query(
            `INSERT INTO driver_licences (guild_id, user_id, type, date, status) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE date = ?, status = ?;`,
            [guildId, userId, type, date, status, date, status]
        );
    }

    async deleteDriverLicense(guildId, userId, type) {
        return this._query("DELETE FROM driver_licences WHERE guild_id = ? AND user_id = ? AND type = ?;", [guildId, userId, type]);
    }

    async getDriverLicense(guildId, userId, type = null, status = null) {
        return this._query(`SELECT * FROM driver_licences WHERE guild_id = ? AND user_id = ?${type ? "AND type = ?" : ""}${status ? "AND status = ?" : ""};`, [guildId, userId, status && !type ? status : type, status]);
    }

    async getDriverLicenseStatus(guildId, userId, type) {
        const data = await this._queryOne(`SELECT status FROM driver_licences WHERE guild_id = ? AND user_id = ? AND type = ?;`,[guildId, userId, type]);
        return data?.status;
    }

    async setDriverLicensePoints(guildId, userId, type, points, deleteDL = false) {
        if(deleteDL) return this._query("DELETE FROM driver_licences WHERE guild_id = ? AND user_id = ? AND type = ?;", [guildId, userId, type]);
        else return this._query("UPDATE driver_licences SET points = ? WHERE guild_id = ? AND user_id = ? AND type = ?;", [points, guildId, userId, type]);
    }

    async getDriverLicensePoints(guildId, userId, type) {
        const data = await this._queryOne("SELECT points FROM driver_licences WHERE guild_id = ? AND user_id = ? AND type = ?;",[guildId, userId, type]);
        return data?.points;
    }

    async giveHighwayCode(guildId, userId) {
        await this.ensureMember(guildId, userId);
        return this._query("UPDATE members SET highway_code = 1 WHERE guild_id = ? AND user_id = ?", [guildId, userId]);
    }

    async removeHighwayCode(guildId, userId) {
        return this._query("UPDATE members SET highway_code = 0 WHERE guild_id = ? AND user_id = ?", [guildId, userId]);
    }

    async hasHighwayCode(guildId, userId) {
        const data = await this._queryOne("SELECT highway_code FROM members WHERE guild_id = ? AND user_id = ?;", [guildId, userId]);
        return data?.highway_code == 1;
    }

    //############################# ID CARDS ############################

    async createIDCard(guildId, userId, idData) {
        await this.ensureMember(guildId, userId);
        return this._query(
            `INSERT IGNORE INTO id_cards (guild_id, user_id, first_name, last_name, gender, birthdate, birthplace, fake, hidden, taken)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [guildId, userId, idData.first_name, idData.last_name, idData.gender, idData.birthdate, idData.birthplace, idData.fake, 0, 0, 0]
        );
    }

    async hasIDCard(guildId, userId, fake = false) {
        return this._queryOne(
            `SELECT count(*) FROM id_cards WHERE guild_id = ? AND user_id = ?${fake ? " AND fake = 1" : ""};`,
            [guildId, userId]
        ).then((data) => data["count(*)"] > 0);
    }

    async editIDCard(guildId, userId, idData) {
        return this._query(
            `UPDATE id_cards SET first_name = ?, last_name = ?, gender = ?, birthdate = ?, birthplace = ? WHERE guild_id = ? AND user_id = ? AND fake = ?;`,
            [idData.first_name, idData.last_name, idData.gender, idData.birthdate, idData.birthplace, guildId, userId, idData.fake]
        );
    }

    async deleteIDCard(guildId, userId, fake = false) {
        return this._query(`DELETE FROM id_cards WHERE guild_id = ? AND user_id = ?${fake ? " AND fake = 1" : ""};`, [guildId, userId]);
    }

    async takeIDCard(guildId, userId, fake = false) {
        return this._query(`UPDATE id_cards SET taken = 1 WHERE guild_id = ? AND user_id = ? AND fake = ${fake ? "1" : "0"};`, [guildId, userId]);
    }

    async returnIDCard(cardId) {
        return this._query(`UPDATE id_cards SET taken = 0 WHERE id = ?;`, [cardId]);
    }

    async getIDCard(guildId, userId, fake = false) {
        return this._queryOne(`SELECT * FROM id_cards WHERE guild_id = ? AND user_id = ? AND fake = ?;`, [guildId, userId, fake ? 1 : 0]);
    }

    async getIDCards(guildId) {
        return this._query(`SELECT * FROM id_cards WHERE guild_id = ? AND fake = 0;`, [guildId]);
    }

    async getIDCardByName(guildId, first_name, last_name, fake = false) {
        const data = await this._queryOne(`SELECT * FROM id_cards WHERE guild_id = ? AND first_name = ? AND last_name = ?${fake ? " AND fake = 1" : ""};`,
            [guildId, first_name, last_name]
        );
        return data ? data : null;
    }

    async getIDCardById(id) {
        return this._queryOne(`SELECT * FROM id_cards WHERE id = ?;`, [id]);
    }

    //############################# LICENSE PLATES ############################

    async getMemberCG(guildId, memberId, id = null) {
        if(id) {

            return this._queryOne(`
            SELECT member_cg.*, id_cards.first_name, id_cards.last_name FROM member_cg LEFT JOIN id_cards ON id_cards.user_id = member_cg.user_id AND id_cards.guild_id = member_cg.guild_id
            WHERE member_cg.guild_id = ? AND id_cards.fake = 0 AND member_cg.id = ?;`, [guildId, id]);

        } else {

            return this._query(`
            SELECT member_cg.*, id_cards.first_name, id_cards.last_name FROM member_cg LEFT JOIN id_cards ON id_cards.user_id = member_cg.user_id AND id_cards.guild_id = member_cg.guild_id
            WHERE member_cg.guild_id = ? AND id_cards.fake = 0 AND (member_cg.user_id = ? OR member_cg.authorized_members LIKE '%${memberId}%');`, [guildId, memberId]);
        
        }
    }

    async setCGOwner(guildId, id, userId) {
        return this._query(`UPDATE member_cg SET user_id = ? WHERE guild_id = ? AND id = ?;`, [userId, guildId, id]);
    }

    async getPlateCG(guildId, plate, type = "plate", name) {
        return this._queryOne(
            `SELECT member_cg.*, id_cards.first_name, id_cards.last_name FROM member_cg LEFT JOIN id_cards ON id_cards.id = member_cg.id_card AND id_cards.guild_id = member_cg.guild_id
            WHERE member_cg.guild_id = ? AND ${type == "both" ? "member_cg.license_plate = ? AND member_cg.vehicule_name = ?" : type == "plate" ? " member_cg.license_plate = ?" : "member_cg.vehicule_name = ?"}`,
        type == "both" ? [guildId, plate, name] : [guildId, type == "plate" ? plate : name]);
    }

    async createCG(user, guild, vehicule_name, plate, idCard, type, adress, image = null) {
        await this.ensureGuild(guild);
        return this._query(
            `INSERT INTO member_cg (user_id, guild_id, vehicule_name, license_plate, id_card, type, adress, image) VALUES(?, ?, ?, ?, ?, ?, ?, ?);`,
            [user, guild, vehicule_name, plate, idCard, type, adress, image]
        );
    }

    async deleteCG(guildId, plate) {
        return this._query(
            `DELETE FROM member_cg WHERE guild_id = ? AND license_plate = ?;`,
            [guildId, plate]
        );
    }

    async resetMemberVehicles(guildId, userId) {
        let memberCG = await this.getMemberCG(guildId, userId);
        if(!memberCG.length) return;
        for(const cg of memberCG) {
            if (cg.user_id === userId) {
                let authorized_members = (cg.authorized_members ?? "").split(",");
                if(authorized_members.length) {
                    let newOwner = authorized_members.pop();
                    this._query("UPDATE member_cg SET user_id = ?, authorized_members = ? WHERE guild_id = ? AND id = ?;", [newOwner, authorized_members.length ? authorized_members.join(",") : null, guildId, cg.id]);
                } else this._query("DELETE FROM member_cg WHERE guild_id = ? AND id = ?;", [guildId, cg.id]);
            } else {
                let authorized_members = (cg.authorized_members ?? "").split(",");
                authorized_members = authorized_members.filter(m => m !== userId);
                this._query("UPDATE member_cg SET authorized_members = ? WHERE guild_id = ? AND id = ?;", [authorized_members.length ? authorized_members.join(",") : null, guildId, cg.id]);
            }
        }
    }
    
    async giveCG(guildId, member, plate) {
        return this._query(
            `UPDATE member_cg SET user_id = ? WHERE license_plate = ? AND guild_id = ?`,
            [member, plate, guildId]
        );
    }

    async setIDCardtoCG(guildId, idCard, plate) {
        return this._query(`UPDATE member_cg SET id_card = ? WHERE guild_id = ? AND license_plate = ?`, [idCard, guildId, plate]);
    }

    async setStatusCG(guildId, officer, plate, status) {
        return this._query(
            `UPDATE member_cg SET status = ?, date_confiscation = ?, officer_confiscation = ? WHERE license_plate = ? AND guild_id = ?`,
            [status, status == 1 ? new Date() : null, status == 1 ? officer : null, plate, guildId]
        );
    }

    async editCG(guildId, userId, plateExist, newPlate) {
        return this._query(
            `UPDATE member_cg SET vehicule_name = ?, license_plate = ?, adress = ? WHERE license_plate = ? AND guild_id = ? AND user_id = ?`,
            [newPlate.newName, newPlate.newPlate, newPlate.newAdress, plateExist, guildId, userId]
        );
    }

    async getSafeVehicle(vehicleId, drugs = false) {
        if(drugs) {

            return this._query(
            `SELECT vehicle_drugs.*, drugs.name, drugs.image FROM vehicle_drugs LEFT JOIN drugs ON vehicle_drugs.drug_id = drugs.id
            WHERE vehicle_drugs.vehicle_id = ?;`, [vehicleId]);

        } else {

            return this._query(`
            SELECT vehicle_inventory.*, shops_items.* FROM vehicle_inventory LEFT JOIN shops_items ON shops_items.id = vehicle_inventory.item_id WHERE vehicle_inventory.vehicle_id = ?`,
            [vehicleId]);

        }
    }

    async isPounded(guildId, vehicleId) {
        const data = await this._queryOne(`SELECT status FROM member_cg WHERE guild_id = ? AND id = ? AND status = 1`, [guildId, vehicleId]);
        return data ? true : false;
    }

    async getPoundeds(guildId, plate, type = "plate", name) {
        return this._query(
            `SELECT member_cg.*, id_cards.first_name, id_cards.last_name FROM member_cg LEFT JOIN id_cards ON id_cards.id = member_cg.id_card AND id_cards.guild_id = member_cg.guild_id
            WHERE member_cg.guild_id = ? AND member_cg.status = 1 AND ${type == "both" ? "member_cg.license_plate = ? AND member_cg.vehicule_name = ?" : type == "plate" ? " member_cg.license_plate = ?" : "member_cg.vehicule_name = ?"}`,
        type == "both" ? [guildId, plate, name] : [guildId, type == "plate" ? plate : name]);
    }

    //############################# PERMISSIONS ############################

    async getPermissions(guildId) {
        const data = await this._query(
            "SELECT * FROM commands_permissions WHERE guild_id = ?;",
            [guildId]
        );
        return data ?? [];
    }

    async getPermissionsOfCommand(guildId, command) {
        const data = await this._queryOne("SELECT authorized_roles FROM commands_permissions WHERE guild_id = ? AND command = ?;",[guildId, command]);
        if (!data || ["", null].includes(data.authorized_roles)) return [];
        return data.authorized_roles.split(",") ?? [];
    }

    //############################# BLACKLIST ############################

    addBlacklist(id, reason, modId) {
        return this._query(
            `INSERT INTO blacklist_members (user_id, reason, moderator_id) VALUES (?, ?, ?);`,
            [id, reason, modId]
        );
    }

    removeBlacklist(id) {
        return this._query(
            `DELETE FROM blacklist_members WHERE user_id = ?`,
            [id]
        );
    }

    getBlacklist(id) {
        return this._queryOne("SELECT * FROM blacklist_members WHERE user_id = ?;", [id]);
    }

    
    async getBlacklistedUsers() {
        const data = await this._query("SELECT user_id FROM blacklist_members;");
        return data.map((d) => d.user_id);
    }

    //############################# CLASSEMENTS ############################

    async getClassement(guild, type, limit) {

        // 1 = dirty money, 2 = cash, 3 = bank
        if(type == 1) {
            const data_dirty_money = await this._query(`SELECT * FROM members WHERE guild_id = '${guild}' ORDER BY dirty_money DESC LIMIT ${Number(limit)};`);
            return data_dirty_money;
        }

        const data = await this._query(`SELECT bank_accounts.bank_money, members.cash_money, members.user_id FROM bank_accounts LEFT JOIN members ON members.guild_id = bank_accounts.guild_id AND members.user_id = bank_accounts.user_id WHERE members.guild_id = '${guild}' ORDER BY ${type == 2 ? 'members.cash_money' : 'bank_accounts.bank_money'} DESC LIMIT ${Number(limit)};`);
        return data;
    }

    //############################# CRIMINAL RECORDS ############################

    async getCriminalRecords(guildId, id = false, isCase = false) {
        // isCase = Avoir des infos sur une entrée en particulier
        if(isCase) return this._queryOne("SELECT criminal_records.*, id_cards.first_name, id_cards.last_name FROM criminal_records LEFT JOIN id_cards ON criminal_records.user_id = id_cards.user_id WHERE criminal_records.guild_id = ? AND criminal_records.id = ?;", [guildId, id]);
        else return this._query(`SELECT criminal_records.*, id_cards.first_name, id_cards.last_name FROM criminal_records LEFT JOIN id_cards ON criminal_records.user_id = id_cards.user_id WHERE criminal_records.status = 0 AND criminal_records.guild_id = ?${id ? "AND criminal_records.user_id = ?" : ""};`, id ? [guildId, id] : [guildId]);
        
    }

    async getCriminalRecordByName(guildId, firstName, lastName) {
        return this._query("SELECT criminal_records.*, id_cards.first_name, id_cards.last_name FROM criminal_records LEFT JOIN id_cards ON criminal_records.user_id = id_cards.user_id WHERE criminal_records.guild_id = ? AND id_cards.first_name = ? AND id_cards.last_name = ?;", [guildId, firstName, lastName]);
    }

    async insertCriminalRecords(guildId, memberId, reason, officer) {
        await this.ensureGuild(guildId);
        return this._query(`INSERT INTO criminal_records (guild_id, user_id, reason, officer) VALUES (?, ?, ?, ?);`, [guildId, memberId, reason, officer]);
    }

    async deleteCriminalRecords(guildId, idCase) {
        return this._query(`DELETE FROM criminal_records WHERE guild_id = ? AND id = ?;`, [guildId, idCase]);
    }

    //############################# STAFF ############################

    async getStaff(userId) {
        return this._queryOne("SELECT level FROM nisupport_public.niteam WHERE user_id = ?;", [userId]);
    }

    //############################# OPTIONS ############################

    async getOption(guildId, optionName) {
        const data = await this._queryOne(
            "SELECT opt.value, options_keys.default_value, options_keys.type FROM options_keys LEFT JOIN (SELECT value, name FROM options WHERE guild_id = ?) AS opt USING (name) WHERE name = ?;",
            [guildId, optionName]
        );

        if(!data) return null;
        return this._parseData(data);
    }

    async getOptions(guildId, optionsNames) {
        if (!Array.isArray(optionsNames) || !optionsNames.length) return {};
        const data = await this._query(
            `SELECT options_keys.name, opt.value, options_keys.default_value, options_keys.type FROM options_keys 
                LEFT JOIN (SELECT value, name FROM options WHERE guild_id = ?) AS opt USING (name) 
                WHERE name IN (${Array(optionsNames.length).fill("?").join(", ")});`,
            [guildId, ...optionsNames]
        );

        return data.reduce((acc, row) => {
            if (!row) return acc;
            acc[row.name] = this._parseData(row);
            return acc;
        }, {});
    }

    _parseData(row) {
        if (!row.value) row.value = row.default_value;
        switch (row.type) {
            case "int": return parseInt(row.value);
            case "float": return parseFloat(row.value);
            case "boolean": return row.value === "true";

            case "object":
            case "array":
            case "timestamp":
                return JSON.parse(row.value);

            case "date":
            case "datetime":
                return new Date(row.value);

            default: return row.value;
        }
    }

    async setOption(guildId, optionName, value) {
        await this.ensureGuild(guildId);

        const key = await this._queryOne("SELECT type FROM options_keys WHERE name = ?;", [optionName]);
        if (!key) throw Error(`Provided option name "${optionName}" was not found`);
        let parsedValue;

        switch (key.type) {
            case "date":
                if (!(value instanceof Date)) throw TypeError("Value must be of type Date");
                parsedValue = value.toISOString().split("T")[0];
                break;
            case "datetime":
                if (!(value instanceof Date)) throw TypeError("Value must be of type Date");
                parsedValue = value.toISOString();
                break;
            case "object":
            case "array":
                parsedValue = JSON.stringify(value);
            default:
                parsedValue = value.toString();
        }

        return this._query(
            "INSERT INTO options (guild_id, name, value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value=?;",
            [guildId, optionName, parsedValue, parsedValue]
        );
    }

    async addPublicationLog(guildId, user, type, data) {
        await this.ensureGuild(guildId);
        return this._query(
            "INSERT INTO publication_logs (guild_id, user, type, data) VALUES (?, ?, ?, ?);",
            [guildId, JSON.stringify(user), type, JSON.stringify(data)]
        );
    }
    
    //############################# ERRORS ############################

    async sendError(lang = "en", error, errorType = "Unhandled rejection error", interaction = null) {
    
        if (errorType === "Interaction error") {
            if (interaction) { errorType = "Interaction error" }
            else { errorType = "interactionCreate error : no interaction infos" };
        };
    
        this.client.logger.error(error, errorType.toUpperCase());

        if(this.client.config.sendErrorsInChannel) {
            const logsEmbed = new EmbedBuilder()
                .setTitle(`${this.client.constants.emojis.warns} ${errorType}`)
                .setDescription(codeBlock("js", error.stack))
                .setColor("Red")
                .setTimestamp();

            if (interaction) {
                logsEmbed.addFields([
                    { name: "Command :", value: `\`${interaction.commandName} ${interaction?.options?._subcommand ?? ""}${interaction?.options?._hoistedOptions?.map(o => `${o.value}`)?.join(" ")}\`` },
                    { name: "Author :", value: `${interaction.user.toString()} (*${interaction.user.id}*)`, inline: true },
                    { name: "Server :", value: `[${interaction.guild.name}](${interaction.guild.vanityURLCode ? `https://discord.gg/${interaction.guild.vanityURLCode}` : null}) (*${interaction.guildId}*)`, inline: true },
                    { name: "Shard :", value: `#${interaction.guild.shardId}`, inline: true },
                    { name: "Channel :", value: `${interaction.channel.name} (*${interaction.channelId}*)`, inline: true }
                ]);
            }
    
            if (error.sql) logsEmbed.addFields([ { name: "Query :", value: `\`${error.sql.substring(0, 1024)}\``, inline: true } ]);
    
            // if (error isn't in db ||OR|| !interaction infos) : send
            const webhook = new WebhookClient({ url: this.client.config.errorsLogsURL });
            if (!interaction) webhook.send({ embeds: [logsEmbed] }).catch(() => { });

        }
    }

};
