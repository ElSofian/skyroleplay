/**
 * Returns the current illegal action message link, if any
 * @returns {null | string}
 */
module.exports = class Illegal {
    
    constructor(client, options) {
        this.client = client;
        this.options = options;

        this.client._currentIllegal = new Map();
    }
    
    getIllegalLink = (guildId, userId) => {
        const illegal = this.client._currentIllegal.get(`${guildId}-${userId}`);
        if(!illegal || illegal.end < Date.now()) return null;
        else return illegal.link;
    };

    /**
     * Creates an illegal timeout
     */
    setIllegal = (guildId, userId, link, time) => {
        this.client._currentIllegal.set(`${guildId}-${userId}`, { link, end: time + Date.now() });
    };

    /**
     * Deletes an illegal timeout
     */
    deleteIllegal = (guildId, userId) => {
        this.client._currentIllegal.delete(`${guildId}-${userId}`);
    };

}