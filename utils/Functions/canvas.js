const  axios = require("axios")

module.exports = class Canvas {

    constructor(client, options = {}) {
        this.client = client;
        this.options = options;
    }

    async get(url, body = {}) {
        return new Promise(async (resolve, reject) => {
            if (!url) return reject('No url provided');
            if (!this.client.config.public_api.url || !this.client.config.public_api.key) return reject('No public api url or key provided');
            if (!url.startsWith('/')) url = `/${url}`;

            axios({
                method: 'post',
                responseType: 'arraybuffer',
                url: `${this.client.config.public_api.url}/canvas${url}`,
                headers: {
                    'Authorization': `ApiKey ${this.client.config.public_api.key}`
                },
                ...(body && { data: body }),
            }).then(async (res) => {
                if (res.headers['content-type'] !== 'image/png') return reject('The response is not a png');
                resolve(Buffer.from(res.data, 'binary'))
            }).catch(async (err) => reject(err))
        });
    }

}