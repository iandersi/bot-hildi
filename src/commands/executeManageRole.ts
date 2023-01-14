import {CommandInteraction, GuildMember} from "discord.js";

const roleMap = {
    cactpot: process.env.CACTPOT_ROLE,
    craftingupdates: process.env.CRAFTINGUPDATES_ROLE,
    raid:process.env.RAID_ROLE,
    spoiler: process.env.SPOILER_ROLE
} as any;

export async function executeManageRole(interaction: CommandInteraction): Promise<void> {
    if (!process.env.GUEST_ROLE) return;
    if (!process.env.CACTPOT_ROLE) return;
    if (!process.env.CRAFTINGUPDATES_ROLE) return;
    if (!process.env.RAID_ROLE) return;
    if (!process.env.SPOILER_ROLE) return;

    if (!interaction.guild) {
        console.log('Guild error.')
        return interaction.reply({content: 'Internal error.', ephemeral: true});
    }

    const requestedRoleToAdd = interaction.options.getString('addrole');
    const requestedRoleToRemove = interaction.options.getString('removerole');

    const guildMember = interaction.guild.members.cache.get(interaction.user.id);

    if (!guildMember) return interaction.reply('Member not found.');
    if (guildMember.roles.cache.get(process.env.GUEST_ROLE)) return interaction.reply({
        content: 'You do not have permissions to use this command.',
        ephemeral: true
    });

    if (requestedRoleToAdd) {
        return addRole(interaction, requestedRoleToAdd, guildMember);
    }

    if (requestedRoleToRemove) {
        return removeRole(interaction, requestedRoleToRemove, guildMember);
    }

}

async function addRole(interaction: CommandInteraction, roleMapKey: string, guildMember: GuildMember){
    const roleToAddId = roleMap[roleMapKey];
    if (!roleToAddId) return interaction.reply({content: 'Role not found.', ephemeral: true});
    if (guildMember.roles.cache.get(roleToAddId)) return interaction.reply({content: 'You already have that role.', ephemeral: true});

    const role = guildMember.guild.roles.cache.get(roleToAddId);
    if (role) {
        await guildMember.roles.add(role);
        return interaction.reply({content: `You now have the ${roleMapKey} role!`, ephemeral: true});
    }
}

async function removeRole(interaction: CommandInteraction, roleMapKey: string, guildMember: GuildMember){
    const roleToRemoveId = roleMap[roleMapKey];
    console.log(roleToRemoveId, roleMapKey, roleMap);
    if (!roleToRemoveId) return interaction.reply({content: 'Role not found.', ephemeral: true});
    if (!guildMember.roles.cache.get(roleToRemoveId)) return interaction.reply({content: 'Cannot remove role that you do not have.', ephemeral: true});

    const role = guildMember.guild.roles.cache.get(roleToRemoveId);
    if (role) {
        await guildMember.roles.remove(role);
        return interaction.reply({content: `You successfully removed your ${roleMapKey} role!`, ephemeral: true});
    }
}