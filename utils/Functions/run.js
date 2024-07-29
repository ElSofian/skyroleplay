/**
 * Returns the current run action message link, if any
 * @returns {null | string}
 */
module.exports = class Run {
    
    constructor(client, options) {
        this.client = client;
        this.options = options;

        this.client._currentRun = new Map();
    }
    
    getRunLink = (guildId, userId) => {
        const run = this.client._currentRun.get(`${guildId}-${userId}`);
        if (!run || run.end < Date.now()) return null;
        else return run.link;
    };

    /**
     * Creates a run timeout
     */
    setRun = (guildId, userId, link, time) => {
        this.client._currentRun.set(`${guildId}-${userId}`, { link: link, end: time + Date.now() });
    };

    /**
     * Deletes a run timeout
     */
    deleteRun = (guildId, userId) => {
        this.client._currentRun.delete(`${guildId}-${userId}`);
    };

}