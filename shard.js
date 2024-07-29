const { Client, Collection, GatewayIntentBits, Partials, ActivityType } = require("discord.js");
const { ClusterClient, getInfo } = require('discord-hybrid-sharding');

const fs = require("node:fs");   
const dayjs = require('dayjs');
require('dayjs/locale/fr');
require('dayjs/locale/en');
dayjs.extend(require("dayjs/plugin/customParseFormat"));
dayjs.extend(require("dayjs/plugin/relativeTime"));
dayjs.extend(require("dayjs/plugin/duration"));

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.Reaction, Partials.User],
    presence: {
        activities: [
            {
                name: "i'm reborn",
                type: ActivityType.Watching,
            },
        ],
    },
    shards: getInfo().SHARD_LIST,
    shardCount: getInfo().TOTAL_SHARDS,
});

client.config = require("./config.js");
client.logger = new (require("./structures/Logger"))();

client.cluster = new ClusterClient(client);
client.cluster.on('error', (error) => {
    client.logger.error("Cluster Error: " + error)
});

client.cryptos = [];
client.cluster.on("message", (message) => {
    if (message.content == "cryptos_update") client.cryptos = message.data;
});

client.dayjs = dayjs;
client.db = new (require("./structures/Database"))(client);
client.translate = new (require("./structures/Translate"))(client);
client.constants = require(`./utils/Constants`);

client.functions = {};
fs.readdirSync("./utils/Functions/").forEach((file) => {
    client.functions[file.replace(".js", "")] = new (require(`./utils/Functions/${file}`))(client)
});

client.commands = new Collection();
require(`./handlers/Commands`)(client);
require(`./handlers/Events`)(client);

client.login(client.config.token);

// process.on("unhandledRejection", (err) => {
//     if (err.code == "InteractionCollectorError") return;
//     console.error(err);
// });