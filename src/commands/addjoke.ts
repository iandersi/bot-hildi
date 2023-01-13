import {CommandInteraction} from "discord.js";
import * as mariadb from "mariadb";
import {addJoke, getLatestJoke} from "../jokeDb";

export async function executeAddjoke(interaction: CommandInteraction, pool: mariadb.Pool): Promise<void> {

    const role = process.env.HILDIBOT_CONFIG_ROLE;
    const interactionUserId = interaction.user.id;
    const jokeText = interaction.options.getString('addjoke');

    if (jokeText === null) return interaction.reply({content: 'Joke text cannot be null.', ephemeral: true});
    if (jokeText && jokeText.length < 5) return interaction.reply({content: 'Joke text length has to be more than 5 characters.', ephemeral: true});
    if (interactionUserId != role) return interaction.reply({content: 'You do not have permission to use this command.', ephemeral: true});

    let conn: mariadb.PoolConnection | undefined;
    console.log(jokeText);

    if (interactionUserId === role) {
        try {
            conn = await pool.getConnection();
            const joke = await addJoke(conn, jokeText);
            console.log(joke);
            const latestJoke = await getLatestJoke(conn);
            await interaction.reply(`Following joke was added to the database: ${latestJoke.joke_text}`);
        }  catch (err) {
            console.log(err);
            await interaction.reply('Something went wrong. Try again!');
        } finally {
            if (conn) await conn.end();
        }
    }

}
