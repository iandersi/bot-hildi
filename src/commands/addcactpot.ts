import {CommandInteraction} from "discord.js";

export async function executeAddcactpot(interaction: CommandInteraction): Promise<void> {
        if (!process.env.CACTPOT_ROLE) {
            console.log('Cactpot role error.');
            return interaction.reply('Internal error.');
        }
        if (!interaction.guild) {
            console.log('Guild error.')
            return interaction.reply('Internal error.');
        }

        let guildMember = interaction.guild.members.cache.get(interaction.user.id);

        if (!guildMember) {
            console.log('Member not found.');
            return interaction.reply('Member not found.');
        }

        if (!guildMember.roles.cache.get(process.env.CACTPOT_ROLE)) {
            let role = guildMember.guild.roles.cache.get(`${process.env.CACTPOT_ROLE}`)
            if (role) {
                await guildMember.roles.add(role);
                return interaction.reply({content: 'You now have the Cactpot role!', ephemeral: true});
            } else {
                return interaction.reply({content: 'Role not found.', ephemeral: true});
            }
        } else {
            return interaction.reply({content: 'You already have the Cactpot role.', ephemeral: true});
        }
}
