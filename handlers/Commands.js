const { readdirSync } = require("node:fs");

module.exports = client => {

    readdirSync("./commands/").forEach(dir => {
        const commands = readdirSync(`./commands/${dir}/`).filter(file => file.endsWith(".js"));
    
        for (let file of commands) {
            let pull = require(`../commands/${dir}/${file}`);
    
            if (pull.name) {
                client.commands.set(pull.name, pull);
            } else {
                client.logger.error(`An error occured while loading the command : ${file}.`);
                continue;
            }
			
        }
    });

    client.logger.success(`${client.commands.size} commands loaded.`);

}