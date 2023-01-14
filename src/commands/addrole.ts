import {CommandInteraction} from "discord.js";

export async function executeAddRole(interaction: CommandInteraction): Promise<void> {
    if (!process.env.GUEST_ROLE) return;
    if (!process.env.CACTPOT_ROLE) return;

    if (!interaction.guild) {
        console.log('Guild error.')
        return interaction.reply('Internal error.');
    }

    const requestedRole = interaction.options.getString('role');
    const guildMember = interaction.guild.members.cache.get(interaction.user.id);

    if (!requestedRole) return;
    if (!guildMember) return interaction.reply('Member not found.');
    if (guildMember.roles.cache.get(process.env.GUEST_ROLE)) return interaction.reply({
        content: 'You do not have permissions to use this command.',
        ephemeral: true
    });

    const roleMap = {
        cactpot: process.env.CACTPOT_ROLE,
        craftingupdates: process.env.CRAFTINGUPDATES_ROLE,
        raid:process.env.RAID_ROLE,
        spoiler: process.env.SPOILER_ROLE
    } as any;

    const roleId = roleMap[requestedRole];

    if (!roleId) return interaction.reply({content: 'Role not found.', ephemeral: true});
    if (guildMember.roles.cache.get(roleId)) return interaction.reply({content: 'You already have role.', ephemeral: true});

    let role = guildMember.guild.roles.cache.get(roleId);
    if (role) {
        await guildMember.roles.add(role);
        return interaction.reply({content: `You now have the ${requestedRole} role!`, ephemeral: true});
    }
}
