import {CommandInteraction} from "discord.js";
import * as mariadb from "mariadb";
import {deleteJokeById, getJokeById} from "../jokeDb";
import {getConfigurationParameter} from "../configDb";


export async function executeDeleteJoke(interaction: CommandInteraction, pool: mariadb.Pool): Promise<void> {

    if (!interaction.guildId) {
        console.log('Guild ID error.')
        return interaction.reply({content: 'Internal error.', ephemeral: true});
    }

    const configRole = await getConfigurationParameter(pool, interaction.guildId, "hildibot_config_role");
    if (!configRole) return  interaction.reply({
        content: 'This command has not been configured for this server.',
        ephemeral: true
    });

    if (!interaction.guild) {
        console.log('Guild error.')
        return interaction.reply({content: 'Internal error.', ephemeral: true});
    }

    const guildMember = interaction.guild.members.cache.get(interaction.user.id);
    if (!guildMember) return interaction.reply({content: 'Member not found.', ephemeral: true});

    if (!guildMember.roles.cache.get(configRole)) return interaction.reply({
        content: 'You do not have permissions to use this command.',
        ephemeral: true
    });

    const jokeId = interaction.options.getInteger('deletebyid');

    if (jokeId === null) return interaction.reply({content: 'Joke ID cannot be null.', ephemeral: true});

    let conn: mariadb.PoolConnection | undefined;
    console.log(jokeId);

    try {
        conn = await pool.getConnection();
        const jokeToBeDeleted = await getJokeById(conn, jokeId);
        if (!jokeToBeDeleted) return interaction.reply({content: 'Joke not found.', ephemeral: true});
        const joke = await deleteJokeById(conn, jokeId);
        console.log(joke);
        console.log(`${interaction.user.username} deleted following joke from the database: ${jokeToBeDeleted.joke_text}`);
        await interaction.reply(`Following joke was deleted from the database: ${jokeToBeDeleted.joke_text}`);
    } catch (err) {
        console.log(err);
        await interaction.reply('Something went wrong. Try again!');
    } finally {
        if (conn) await conn.end();
    }

}
