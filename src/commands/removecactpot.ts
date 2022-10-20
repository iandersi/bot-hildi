import {CommandInteraction} from "discord.js";

export async function executeRemoveCactpot(interaction: CommandInteraction): Promise<void> {
        if (!process.env.CACTPOT_ROLE) {
            console.log('Cactpot role error.');
            return interaction.reply({content: 'Internal error.', ephemeral: true});
        }

        if (!interaction.guild) {
            console.log('Guild error.')
            return interaction.reply({content: 'Internal error.', ephemeral: true});
        }

        let guildMember = interaction.guild.members.cache.get(interaction.user.id);

        if (!guildMember) {
            console.log('Member not found.');
            return interaction.reply({content:'Member not found.', ephemeral: true});
        }

        if (guildMember.roles.cache.get(process.env.CACTPOT_ROLE)) {
            let role = guildMember.guild.roles.cache.get(`${process.env.CACTPOT_ROLE}`)
            if (role) {
                await guildMember.roles.remove(role);
                await interaction.reply({content:'You no longer have the Cactpot role!', ephemeral: true});
            } else {
                return interaction.reply({content:'Role not found.', ephemeral: true});
            }
        } else {
            return interaction.reply({content:'Could not remove role.', ephemeral: true});
        }
}
