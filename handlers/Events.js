const { readdirSync } = require("node:fs");

module.exports = (client) => {

    try {
        let i = 0;
        readdirSync(`./events`).forEach(subdir => {
            readdirSync(`./events/${subdir}`).forEach(fileName => {
                if(!fileName.endsWith(".js")) return;
                i++;
                const evt = require(`../events/${subdir}/${fileName}`);
                client.on(fileName.split(".")[0], (...args) => {
                    evt.run(client, ...args)
                });
            });
        });

        client.logger.success(`${i} events loaded.`);
    } catch (err) {
        client.logger.error(err);
    }

};