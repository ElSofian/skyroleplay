module.exports = class Translate {

    constructor(client) {
        this.client = client;
    }
    
    t = (lang, key, params = false, type, interaction = null) => {
    
        const file = require(`../traductions/${type}.json`)
        const keys = key.split(".");
        let translation = ["errors", "global", "events"].includes(type) ? file : file[interaction.commandName.replaceAll("-", "_")];

        for(let key of keys) {
            translation = translation[key] ?? key;
        }

        translation = translation[lang] ?? key;
    
        if (params) {
            for(const param in params) {
                translation = translation?.replaceAll(`{{${param}}}`, params[param]);
            }
        }
    
        return translation?.replaceAll("&lt;", "<")?.replaceAll("&gt;", ">")?.replaceAll("&#x2F;", "/") ?? translation;
    }

}