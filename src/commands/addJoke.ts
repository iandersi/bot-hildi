import {CommandInteraction} from "discord.js";
import * as mariadb from "mariadb";
import {addJoke, getLatestJoke} from "../jokeDb";
import {getConfigurationParameter} from "../configDb";

export async function executeAddJoke(interaction: CommandInteraction, pool: mariadb.Pool): Promise<void> {



    if (!interaction.guildId) {
        console.log('Guild ID error.')
        return interaction.reply({content: 'Internal error.', ephemeral: true});
    }

    const configRole = await getConfigurationParameter(pool, interaction.guildId, "hildibot_config_role");
    if (!configRole) return;

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

    const jokeText = interaction.options.getString('addjoke');

    if (jokeText === null) return interaction.reply({content: 'Joke text cannot be null.', ephemeral: true});
    if (jokeText && jokeText.length < 5) return interaction.reply({
        content: 'Joke text length has to be more than 5 characters.',
        ephemeral: true
    });

    let conn: mariadb.PoolConnection | undefined;
    console.log(jokeText);

    try {
        conn = await pool.getConnection();
        const joke = await addJoke(conn, jokeText);
        console.log(joke);
        const latestJoke = await getLatestJoke(conn);
        console.log(`${interaction.user.username} Added following joke to the database: ${latestJoke.joke_text}`);
        await interaction.reply(`Following joke was added to the database: ${latestJoke.joke_text}`);
    } catch (err) {
        console.log(err);
        await interaction.reply('Something went wrong. Try again!');
    } finally {
        if (conn) await conn.end();
    }

}
