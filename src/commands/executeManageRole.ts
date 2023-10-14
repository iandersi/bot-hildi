import {CommandInteraction, GuildMember} from "discord.js";
import {getConfigurationParameter} from "../configDb";
import * as mariadb from "mariadb";


export async function executeManageRole(interaction: CommandInteraction, pool: mariadb.Pool): Promise<void> {

    if (!interaction.guildId) return;
    console.log(interaction.user.username, 'used', `Add role: ${interaction.options.getString('addrole')}`, "||", `Remove role: ${interaction.options.getString('removerole')}`);

    if (!interaction.guild) {
        console.log('Guild error.')
        return interaction.reply({content: 'Internal error.', ephemeral: true});
    }

    const guildMember = interaction.guild.members.cache.get(interaction.user.id);

    if (!guildMember) return interaction.reply('Member not found.');

    const guestRole = await getConfigurationParameter(pool, interaction.guildId, "guest_role");
    if (!guestRole) return interaction.reply({
        content: 'This command has not been configured for this server.',
        ephemeral: true
    });

    if (guildMember.roles.cache.get(guestRole)) return interaction.reply({
        content: 'You do not have permissions to use this command.',
        ephemeral: true
    });


    const guestCactpotRole = await getConfigurationParameter(pool, interaction.guildId, "cactpot_role");
    const craftingUpdatesRole = await getConfigurationParameter(pool, interaction.guildId, "craftingupdates_role");
    const raidRole = await getConfigurationParameter(pool, interaction.guildId, "raid_role");
    const spoilerRole = await getConfigurationParameter(pool, interaction.guildId, "spoiler_role");
    const eventRole = await getConfigurationParameter(pool, interaction.guildId, "event_role");

    const roleMap = {
        cactpot: guestCactpotRole,
        craftingupdates: craftingUpdatesRole,
        raid: raidRole,
        spoiler: spoilerRole,
        event: eventRole
    } as any;


    const requestedRoleToAdd = interaction.options.getString('addrole');
    const requestedRoleToRemove = interaction.options.getString('removerole');

    if (requestedRoleToAdd) {
        if (roleMap[requestedRoleToAdd]) {
            return addRole(interaction, roleMap[requestedRoleToAdd], guildMember);
        } else {
            console.log(`This role has not been configured for this server: ${requestedRoleToAdd}`);
            return interaction.reply({content: 'This command has not been configured for this server.', ephemeral: true});
        }
    }

    if(requestedRoleToRemove){
        if (roleMap[requestedRoleToRemove]) {
            return removeRole(interaction, roleMap[requestedRoleToRemove], guildMember);
        } else {
            console.log(`This role has not been configured for this server: ${requestedRoleToAdd}`);
            return interaction.reply({content: 'This command has not been configured for this server.', ephemeral: true});
        }
    }

    return interaction.reply({content: 'Please specify role to add or role to remove.', ephemeral: true});
}

async function addRole(interaction: CommandInteraction, roleToAddId: string, guildMember: GuildMember) {
    if (guildMember.roles.cache.get(roleToAddId)) return interaction.reply({
        content: 'You already have that role.',
        ephemeral: true
    });

    const role = guildMember.guild.roles.cache.get(roleToAddId);
    if (role) {
        await guildMember.roles.add(role);
        return interaction.reply({content: `You now have the role!`, ephemeral: true});
    }
}

async function removeRole(interaction: CommandInteraction, roleToRemoveId: string, guildMember: GuildMember) {
    if (!guildMember.roles.cache.get(roleToRemoveId)) return interaction.reply({
        content: 'Cannot remove role that you do not have.',
        ephemeral: true
    });

    const role = guildMember.guild.roles.cache.get(roleToRemoveId);
    if (role) {
        await guildMember.roles.remove(role);
        return interaction.reply({content: `You successfully removed your role!`, ephemeral: true});
    }
}