import {CommandInteraction} from "discord.js";

export async function executeAddCraftingupdates(interaction: CommandInteraction): Promise<void> {
    if (!process.env.CRAFTINGUPDATES_ROLE) {
        console.log('CraftingUpdates role error.');
        return interaction.reply({content: 'Internal error.', ephemeral: true});
    }
    if (!interaction.guild) {
        console.log('Guild error.')
        return interaction.reply({content: 'Internal error.', ephemeral: true});
    }

    let guildMember = interaction.guild.members.cache.get(interaction.user.id);

    if (!guildMember) {
        console.log('Member not found.');
        return interaction.reply({content: 'Member not found.', ephemeral: true});
    }

    if (!guildMember.roles.cache.get(process.env.CRAFTINGUPDATES_ROLE)) {
        let role = guildMember.guild.roles.cache.get(`${process.env.CRAFTINGUPDATES_ROLE}`)
        if (role) {
            await guildMember.roles.add(role);
            await interaction.reply({content: 'You now have the CraftingUpdates role!', ephemeral: true});
        } else {
            return interaction.reply({content: 'Role not found.', ephemeral: true});
        }
    } else {
        return interaction.reply({content: 'You already have the CraftingUpdates role.', ephemeral: true});
    }
}