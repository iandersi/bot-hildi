import {CommandInteraction} from "discord.js";
import * as mariadb from "mariadb";
import {Joke} from "../joke";

export async function executeFindjoke(interaction: CommandInteraction, pool: mariadb.Pool): Promise<void> {
    let jokeId = interaction.options.getInteger('findbyid');
    let jokeSentence = interaction.options.getString('findbystring');
    let jokeIndexWord = interaction.options.getString('findbyindex');
    let isJokeIndexWord: boolean = jokeIndexWord === "first" || jokeIndexWord === "last";

    if (jokeId === null && jokeSentence === null && jokeIndexWord === null) return interaction.reply({content: 'Search conditions cannot be null.', ephemeral: true});
    if (jokeId != null && jokeId < 1 ) return interaction.reply({content: "ID cannot be less than 1.", ephemeral: true});
    if (jokeSentence && jokeSentence.length < 3) return interaction.reply({content: "Search word cannot be less than 3 letters.", ephemeral: true});
    if (jokeIndexWord && !isJokeIndexWord) return interaction.reply({content: "Search index by typing ***first*** or ***last***.", ephemeral: true});

    let conn: mariadb.PoolConnection | undefined;

    if (jokeId) {
        try {
            conn = await pool.getConnection();
            const joke = await conn.query("SELECT id, joke_text FROM joke WHERE id = ?",[jokeId]) as Joke[];
            return interaction.reply(`**id:** "${joke[0].id}" \n**joke_text:** "${joke[0].joke_text}"`);
        } catch (err) {
            console.log(err);
            await interaction.reply({content: "Something went wrong. Try again!", ephemeral: true});
        } finally {
            if (conn) await conn.end();
            console.log('Connection ended.');
        }
    }

    if (jokeSentence) {
        try {
            conn = await pool.getConnection();
            const joke = await conn.query("SELECT id, joke_text FROM joke WHERE joke_text LIKE ?",['%' + jokeSentence + '%']) as Joke[];

            let reply = "";

            for (let i = 0; i < joke.length; i++) {
                reply += `**id:** "${joke[i].id}" **joke_text:** "${joke[i].joke_text}"\n`;
            }
            console.log('about to reply with ', reply)
            return await interaction.reply(reply);

        } catch (err) {
            console.log(err);
            await interaction.reply({content: "Something went wrong. Try again!", ephemeral: true});
        } finally {
            if (conn) await conn.end();
            console.log('Connection ended.');
        }
    }

    if (jokeIndexWord === "first") {
        try {
            conn = await pool.getConnection();
            const joke = await conn.query("SELECT * FROM joke ORDER BY id ASC LIMIT 1");
            await interaction.reply(`The first row is\n**id:** ${joke[0].id} **joke_text:** ${joke[0].joke_text}`);

        } catch (err) {
            console.log(err);
            await interaction.reply({content: "Something went wrong. Try again!", ephemeral: true});
        } finally {
            if (conn) await conn.end();
            console.log('Connection ended.');
        }
    } else if (jokeIndexWord === "last") {
        try {
            conn = await pool.getConnection();
            const joke = await conn.query("SELECT * FROM joke ORDER BY id DESC LIMIT 1");
            await interaction.reply(`The last row is\n**id:** ${joke[0].id} **joke_text:** ${joke[0].joke_text}`);

        } catch (err) {
            console.log(err);
            await interaction.reply({content: "Something went wrong. Try again!", ephemeral: true});
        } finally {
            if (conn) await conn.end();
            console.log('Connection ended.');
        }
    }

}
