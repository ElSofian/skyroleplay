const { ClusterManager, HeartbeatManager } = require('discord-hybrid-sharding');
const dotenv = require('dotenv');
dotenv.config();
const { shardsNumber } = require("./config");
const axios = require('axios');
const Logger = new (require('./structures/Logger.js'))
// const webhook = new WebhookClient({ url: 'https://discord.com/api/webhooks/1047573615819903096/PB3YZY1gYQLzJiMeOIFFq0IWqPkdLVouLkl6CUi-LbzezVpdaYpNL_r4colGljJQXNWj' });

const manager = new ClusterManager(`${__dirname}/shard.js`, {
    totalShards: shardsNumber ?? "auto",
    shardsPerClusters: 2,
    mode: 'process',
    token: process.env.token,
    restarts: {
        max: 1,
        interval: 60000 * 60,
    },
});

manager.extend(
    new HeartbeatManager({
        interval: 10000,
        maxMissedHeartbeats: 10,
    }),
)

let cryptos = [];
updateCryptos();
setInterval(() => updateCryptos(), 120000);

manager.on('clusterCreate', cluster => {

    Logger.info(`Creating cluster ${cluster.id+1}/${manager.totalClusters}...`)

    setTimeout(() => cluster.send({ content: "cryptos_update", data: cryptos }), 3000);
    setInterval(() => cluster.send({ content: "cryptos_update", data: cryptos }), 120000);

    cluster.on('death', (cluster, thread) => {
        console.log('');
        console.log(`Cluster ${cluster.id} dead`);
        // webhook.send(`Cluster ${cluster.id} dead`);
    });
    cluster.on('error', (error) => {
        console.log(`Cluster ${cluster.id} errored with ${error}`)
        // webhook.send(`Cluster ${cluster.id} errored with ${error}`)
    });

});

manager.spawn({ timeout: -1 });


function updateCryptos() {
    axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&ids=bitcoin,ethereum,dogecoin,cardano,polkadot,binancecoin,ripple,tether,uniswap,solana%2Cether').then(request => {
        if (request instanceof Error && request.data.length <= 0) return;
        request.data.find(crypto => crypto.id == "binancecoin").id = "b.coin";
        request.data.find(crypto => crypto.id == "ripple").id = "xrp";
        cryptos = request.data;
        Logger.perso("yellow", "[GEKO]", `Updated ${request.data.length} cryptocurrencies in cache`)
    }).catch(err => console.log(err));
}