const { ShardClientUtil } = require("discord.js");
const { ApplicationCommandOptionType } = require("discord-api-types/v10");

const express = require("express");

module.exports = class APIServer {
    constructor(client) {
        this.client = client;

        this.app = express();
        this.app.use(express.json());

        this.app.get("/status", (req, res) => res.sendStatus(200));

        // Check authentication
        this.app.use((req, res, next) => {
            if (req.header("Authorization") !== this.client.config.api.checkToken) return res.status(401).json({ message: "Invalid 'Authorization' header. Must provide valid credentials." });
            this.client.logger.api(`${req.path} accessed`)
            next();
        });

        // Routes
        this.app.get("/guilds", this.getGuilds.bind(this));
        this.app.get("/guilds/:id", this.getGuild.bind(this));
        this.app.get("/guilds/:id/channels", this.getGuildChannels.bind(this));
        this.app.get("/guilds/:id/members", this.getGuildMembers.bind(this));
        this.app.get("/guilds/:id/commands", this.getCommands.bind(this));
        this.app.get("/guilds/:guildId/members/:memberId", this.getGuildMember.bind(this));
        this.app.get("/guilds/:guildId/members/:memberId/check", this.isMemberInGuild.bind(this));
        this.app.get("/guilds/:id/roles", this.getGuildRoles.bind(this));
        
        this.app.get("/add-premium-role/:userId", this.addPremiumRole.bind(this));
        this.app.get("/active-guilds/:guilds", this.getMultipleGuilds.bind(this));
        this.app.get("/client", this.getClient.bind(this));
        // this.app.get("/active-guilds", this.getActiveGuilds.bind(this));

        this.app.get("*", (req, res) =>
            res.status(404).json({
                message: "Not found",
            })
        );

        this.server = this.app.listen(this.client.config.api.port, () => {
            this.client.logger.api(`Successfully started on port ${this.client.config.api.port}`);
        });
    }

    async getGuild(req, res) {
        const guildId = req.params.id;
        try {
            const guild = await fetchGuild(this.client, guildId);
            if (guild) res.json({ ...guild, premium: await this.client.db.isPremium(guildId) });
            else res.status(404).json({ message: "Unknown guild" });
        } catch (e) {
            this.client.logger.api(`Error on ${req.path} : ${e.message}`)
            console.log(e);
            return res.status(500).json({ error: e.message });
        }
    }

    async getGuildChannels(req, res) {
        const guildId = req.params.id;
        try {
            const channels = await this.client.cluster.broadcastEval(async (client, { guildId }) => {
                const guild = await client.guilds.fetch(guildId);
                if (!guild) return null;
                return guild.channels.cache.map(c => ({ name: c.name, id: c.id, type: c.type, parent: c.parent?.id ?? null, position: c.position }));
            }, { shard: ShardClientUtil.shardIdForGuildId(guildId, this.client.cluster.count), context: { guildId } });

            if (channels) res.json(channels);
            else res.status(404).json({ message: "Unknown guild" });
        } catch (e) {
            this.client.logger.api(`Error on ${req.path} : ${e.message}`)
            return res.status(500).json({ error: e.message });
        }
    }

    async getGuildMembers(req, res) {
        const guildId = req.params.id;
        try {
            const members = await this.client.cluster.broadcastEval(async (client, { guildId }) => {
                const guild = await client.guilds.fetch(guildId);
                if (!guild) return null;
                await guild.members.fetch();
                return guild.members.cache.map(m => ({ id: m.user.id, username: m.user.username, nickname: m.displayName ?? null, discriminator: m.user.discriminator, avatar: m.user.displayAvatarURL(), bot: m.user.bot }));
            }, { shard: ShardClientUtil.shardIdForGuildId(guildId, this.client.cluster.count), context: { guildId } });

            const identityCards = await this.client.db.getIDCards(guildId);
            members.forEach(m => m.idCard = identityCards.find(i => i.user_id === m.id));

            if (members) res.json(members);
            else res.status(404).json({ message: "Unknown guild" });
        } catch (e) {
            this.client.logger.api(`Error on ${req.path} : ${e.message}`)
            return res.status(500).json({ error: e.message });
        }
    }

    async getGuildMember(req, res) {
        const { guildId, memberId } = req.params;
        this.client.cluster.broadcastEval(async (client, { guildId, memberId }) => {
            const guild = await client.guilds.fetch(guildId);
            if (!guild) return null;
            return await guild.members.fetch(memberId);
        }, { context: { guildId, memberId }, guildId: guildId }).then(async member => {
            member = member[0];
            if (member) {
                const IDCard = await this.client.db.getIDCard(guildId, memberId);
                res.json(IDCard ? { ...member, idCard: IDCard } : member);
            } else res.status(404).json({ message: "Unknown member" });
        }).catch(e => {
            this.client.logger.api(`Error on ${req.path} : ${e.message}`)
            return res.status(500).json({ error: e.message });
        });
    }

    async getGuildRoles(req, res) {
        const guildId = req.params.id;
        try {
            const roles = await this.client.cluster.broadcastEval(async (client, { guildId }) => {
                const guild = await client.guilds.fetch(guildId);
                if (!guild) return null;
                return guild.roles.cache.map(r => ({ name: r.name, id: r.id, color: r.color, position: r.position, permissions: r.permissions.bitfield.toString() }));
            }, { shard: ShardClientUtil.shardIdForGuildId(guildId, this.client.cluster.count), context: { guildId } });

            if (roles) res.json(roles);
            else res.status(404).json({ message: "Unknown guild" });
        } catch (e) {
            this.client.logger.api(`Error on ${req.path} : ${e.message}`)
            return res.status(500).json({ error: e.message });
        }
    }

    async getMultipleGuilds(req, res) {
        const { guilds } = req.params;
        if (!guilds) return res.status(400).json({ message: "Body must contain valid object 'guilds'" });
        if (!guilds.match(/^[0-9]{17,19}(,[0-9]{17,19})*$/)) return res.status(400).json({ message: "Invalid guilds parameters" });
        let guildsArray = guilds.split(",");

        this.client.functions.other.fetchGuilds(guildsArray).then(guilds => res.json(guilds));
    }


    async getClient(req, res) {
        const commands = this.client.commands.map(({ name, description, category, options }) => ({ name, description, category, options })) || [];
        const { username, id, avatar } = this.client.user;

        Promise.all([
            this.client.cluster.broadcastEval(c => c.guilds.cache.size),
            this.client.cluster.broadcastEval(c => c.channels.cache.size),
            this.client.cluster.broadcastEval(c => c.members.cache.size),
        ]).then(([guilds, channels, members]) => res.json({ commands, username, id, avatar, guilds: guilds.reduce((prev, val) => prev + val, 0), channels: channels.reduce((prev, val) => prev + val, 0), members: members.reduce((prev, val) => prev + val, 0), }));
    }

    async getGuilds(req, res) {
        try {
            const guilds = await this.client.cluster
                .broadcastEval((client) =>
                    client.guilds.cache.map((g) => ({
                        name: g.name,
                        id: g.id,
                        icon: g.icon,
                    }))
                )
                .then((guilds) => guilds.flat());

            res.json(guilds || []);
        } catch (e) {
            res.status(500).json({
                error: e.message,
            });
        }
    }

    async addPremiumRole(req, res) {
        const { userId } = req.params;
        if (!userId) return res.status(400).json({ message: "Body must contain valid object 'userId'" });
        if (!userId.match(/^[0-9]{17,19}$/)) return res.status(400).json({ message: "Invalid userId parameters" });
        this.client.cluster.broadcastEval(async (client, { userId }) => {
            const guild = await client.guilds.fetch('712311871536889937').catch(() => null);
            if (!guild) return client.logger.perso("red", `[PREMIUM] - Error while fetching support guild`);
            const member = await guild.members.fetch(userId).catch(() => null);
            if (!member) return client.logger.perso("red", `[PREMIUM] - Error while fetching member ${userId}`);
            if (!member.roles.cache.get('714911089363517530')) member.roles.add('714911089363517530', `[PREMIUM] - L'utilisateur a un abonnement Premium actif.`);
        }, { context: { userId }, guildId: '712311871536889937' });
        res.json({ message: "Premium role added" });
    }

    async getCommands(req, res) {
        const guildId = req.params.id;
        try {
            const permissions = await this.client.db.getPermissions(guildId);
            res.json(this.client.commands.filter((cmd) => cmd.category.en !== "admindev").map((cmd) => {
                let cmdpermission = permissions.find((p) => p.command === cmd.name)?.authorized_roles ?? "";
                if (!(cmd?.options ?? []).find((o) => [ApplicationCommandOptionType.Subcommand, ApplicationCommandOptionType.SubcommandGroup].includes(o.type))) {
                    return {
                        name: cmd.name,
                        category: cmd.category,
                        permissions: typeof cmdpermission == "undefined" ? [] : cmdpermission.split(","),
                    }
                } else {
                    return cmd.options.filter((o) => [ApplicationCommandOptionType.Subcommand, ApplicationCommandOptionType.SubcommandGroup].includes(o.type)).map((o) => {
                        if (o.type == ApplicationCommandOptionType.Subcommand) {
                            let subcmdpermission = permissions.find((p) => p.command === cmd.name + " " + o.name)?.authorized_roles ?? "";
                            return {
                                name: `${cmd.name} ${o.name}`,
                                category: cmd.category,
                                permissions: typeof subcmdpermission == "undefined" ? [] : subcmdpermission.split(","),
                            }
                        } else if (o.type == ApplicationCommandOptionType.SubcommandGroup) {
                            return o.options.filter((s) => s.type == ApplicationCommandOptionType.Subcommand).map((s) => {
                                let subcmdpermission = permissions.find((p) => p.command === cmd.name + " " + o.name + " " + s.name)?.authorized_roles ?? "";
                                return {
                                    name: `${cmd.name} ${o.name} ${s.name}`,
                                    category: cmd.category,
                                    permissions: typeof subcmdpermission == "undefined" ? [] : subcmdpermission.split(","),
                                }
                            })
                        }
                    }).flat();
                }
            }).flat());
        } catch (e) {
            console.error(e)
            res.status(500).json({
                error: e.message,
            });
        }
    }

    async isMemberInGuild(req, res) {
        try {
            const { guildId, userId } = req.params;
            const guild = await fetchGuild(this.client, guildId);
            const member = !!guild.members.find((m) => m.id == userId);

            if (member) res.json({ member: true });
            else res.status(404).json({ message: "Unknown member" });
        } catch (e) {
            res.status(500).json({
                error: e.message,
            });
        }
    }

    async close() {
        this.app.close();
    }
};

async function fetchGuild(client, guildId) {
    return (await client.cluster.broadcastEval(async (client, { guildId }) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) {
            await guild.fetch().catch(() => { });
            await guild.members.fetch().catch(() => { });
        }
        const idCards = await client.db.getIDCards(guildId);
        return !guild ? null : {
            name: guild.name,
            id: guild.id,
            icon: guild.icon,
            memberCount: guild.memberCount,
            channels: guild.channels.cache,
            roles: guild.roles.cache,
            members: guild.members.cache.map((m) => ({
                nickname: m.nickname,
                ...m.user,
                ...(idCards.find((c) => c.user_id == m.id) && { id_card: idCards.find((c) => c.user_id == m.id) }),
            })),
            bot: await guild.members.fetch(client.user.id).catch(() => null),
        };
    }, { context: { guildId }, guildId: guildId, }))[0];
}
