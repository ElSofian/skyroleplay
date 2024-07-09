const { Interaction, EmbedBuilder, InteractionType } = require("discord.js");   

/**
 * @typedef {object} HasPermissionsOptions
 * @property {boolean} [advanced=false] If the result is false, the function will return advanced informations
 * @property {string[]} [authorizedRoles] A list of authorized roles
 */

/**
 * Checks permissions for an user and a command
 * @param {Interaction} interaction The interaction containing the user to check permissions
 * @param {string} command The full command name, or permission Id (see database)
 * @param {HasPermissionsOptions} [options={}] If the result is false, the function will return advanced informations
 * @returns {Promise<boolean|object>} If the user has permissions
 */
module.exports = class Permissions {
    
    constructor(client, options) {
        this.client = client;
        this.options = options;
    }
    
    hasPermissions = async (interaction, command, { advanced = false, authorizedRoles } = {}) => {
        // If the user has ADMINISTRATOR permissions within the server
        if(interaction.member.permissions.has("Administrator")) return true;

        const commandAuthorizedRoles = (
            authorizedRoles ?? (await this.client.db.getPermissionsOfCommand(interaction.guildId, command))
        ).filter((role) => interaction.guild.roles.cache.has(role));

        // If there are no authorized roles (so @everyone can run the command)
        if(!commandAuthorizedRoles.length) return true;

        // If the user has any of the authorized roles
        if(commandAuthorizedRoles.some((role) => interaction.member.roles.cache.has(role))) return true;

        // If the user is a moderator
        const moderatorRole = await this.client.db.getOption(interaction.guildId, "roles.moderator");
        if(interaction.member.roles.cache.has(moderatorRole)) return true;

        return advanced ? { result: false, commandAuthorizedRoles } : false;
    };

    /**
     * Identical to `hasPermissions`, except that it will send a message if the user is missing permissions
     * @param {Interaction} interaction The interaction containing the user to check permissions
     * @param {string} command The full command name, or permission Id (see database)
     * @returns {Promise<boolean>} If the user has permissions
     */
    checkPermissions = async (interaction, command) => {
        const lang = await this.client.db.getOption(interaction.guildId, "guild.lang");
        const hasPermissions = await this.hasPermissions(interaction, command, { advanced: true });
        
        if(!interaction.isCommand()) return hasPermissions;
        if(hasPermissions !== true) {
            // At this point, the user is missing permissions
            await interaction.reply({ embeds: [new EmbedBuilder().setColor("Red").setDescription(
                `${this.client.translate.t(lang, "interactionCreate.permissions.role", false, "events", interaction)} ${this.client.functions.other.stringifyList(
                    hasPermissions.commandAuthorizedRoles.map((id) => `<@&${id}>`),
                    this.client.translate.t(lang, "interactionCreate.permissions.or", false, "events", interaction)
                )}`
            )]}).catch(() => {})
        }

        return hasPermissions;
    };

    configModerator = async (interaction, commandName, moderation = false, reply = true, replyType = "reply") => {

        if(interaction.type !== InteractionType.ApplicationCommand) return true;

        var role = await this.client.db.getPermissionsOfCommand(interaction.guildId, commandName);
        if(!role.length && !moderation) return true;
        
        const lang = await this.client.db.getOption(interaction.guildId, "guild.lang");
        const modRole = await this.client.db.getOption(interaction.guildId, "roles.moderator");
        if (!role.length && !modRole && !interaction.member.permissions.has("Administrator")) {
            
            // not role and not administrator user
            await interaction[replyType]({
                embeds: [new EmbedBuilder().setColor("Red").setDescription(
                    this.client.translate.t(lang, "interactionCreate.permissions.configuration_error1", { cmd: commandName, url: this.client.constants.links.dashboard }, "events", interaction)
                )],
                components: [],
                content: null,
                files: []
            }).catch(() => {});
            return false;
        };

        const hasRole = role.some(r => interaction.member.roles.cache.has(r))
        if (hasRole || (modRole && interaction.member.roles.cache.has(modRole)) || interaction.member.permissions.has("Administrator")) return true;
        else if (reply && ["reply", "editReply", "update"].includes(replyType)) {
            if (replyType === "reply" && interaction.replied) replyType = "editReply";
            await interaction[replyType]({
                content: null,
                embeds: [new EmbedBuilder().setColor("Red").setDescription(
                    this.client.translate.t(lang, "interactionCreate.permissions.configuration_error2", { cmd: commandName, url: this.client.constants.links.dashboard, role: `<@&${modRole}>, ${role.map(r => `<@&${parseInt(r)}>`).join(", ")}` }, "events", interaction)
                )],
                components: [],
                files: []
            }).catch(() => {});
            return false;
        }
    };

    /**
     * Checks is a member is considered as a Moderator
     * @param {Interaction} interaction The interaction containing the user to check
     * @param {Member} member The member to check
     * @param {HasCheckOptions} [options={}] If the result is false, the function will return advanced informations
     * @returns {Promise<boolean|object>} If the user is moderator
     */
    isModerator = async (interaction, member, { advanced = false } = {}) => {
        // configuration of moderator role
        var role = ((await this.client.db.getOption(interaction.guildId, "roles.moderator")) ?? "no_role").split(",");
        // member is administrator
        if(member.permissions.has("Administrator")) return advanced ? { result: true, existing_role: role ?? false } : true;
        // configured moderator role and member has role
        if(role.length > 0 && role[0] !== "no_role") {
            for (const r of role) {
                if(member.roles.cache.has(r)) return advanced ? { result: true, existing_role: role ?? false } : true;
            }
        }
        // else
        return advanced ? { result: false, existing_role: role[0] == "no_role" ? false : true } : false;
    };
}
