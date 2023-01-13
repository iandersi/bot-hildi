import {CommandInteraction} from "discord.js";
import * as mariadb from "mariadb";
import {getLatestJoke} from "../jokeDb";

export async function executeAddjoke(interaction: CommandInteraction, pool: mariadb.Pool): Promise<void> {

    let role = process.env.HILDIBOT_CONFIG_ROLE;
    let interactionUserId = interaction.user.id;
    let jokeText = interaction.options.getString('addjoke');

    if (jokeText === null) return interaction.reply({content: 'Joke text cannot be null.', ephemeral: true});
    if (jokeText && jokeText.length < 5) return interaction.reply({content: 'Joke text length has to be more than 5 characters.', ephemeral: true});
    if (interactionUserId != role) return interaction.reply({content: 'You do not have permission to use this command.', ephemeral: true});

    let conn: mariadb.PoolConnection | undefined;

    if (interactionUserId === role) {
        try {
            conn = await pool.getConnection();
            const joke = await conn.query("INSERT INTO joke (joke_text) VALUES(?)", jokeText);
            console.log(joke);
            await interaction.reply('Done');
        }  catch (err) {
            console.log(err);
            await interaction.reply('Something went wrong. Try again!');
        } finally {
            if (conn) await conn.end();
        }
    }

}
