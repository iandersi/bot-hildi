import {CommandInteraction} from "discord.js";
import * as mariadb from "mariadb";
import {getFirstJoke, getJokeById, getJokeBySearchWord, getLatestJoke} from "../jokeDb";
import {getConfigurationParameter} from "../configDb";

export async function executeFindJoke(interaction: CommandInteraction, pool: mariadb.Pool): Promise<void> {

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

    const jokeId = interaction.options.getInteger('findbyid');
    const jokeSentence = interaction.options.getString('findbystring');
    const jokeIndexWord = interaction.options.getString('findbyindex');
    const isJokeIndexWord: boolean = jokeIndexWord === "first" || jokeIndexWord === "last";

    if (jokeId === null && jokeSentence === null && jokeIndexWord === null) return interaction.reply({content: 'Search conditions cannot be null.', ephemeral: true});
    if (jokeId != null && jokeId < 1 ) return interaction.reply({content: "ID cannot be less than 1.", ephemeral: true});
    if (jokeSentence && jokeSentence.length < 3) return interaction.reply({content: "Search word cannot be less than 3 letters.", ephemeral: true});
    if (jokeIndexWord && !isJokeIndexWord) return interaction.reply({content: "Search index by typing ***first*** or ***last***.", ephemeral: true});

    let conn: mariadb.PoolConnection | undefined;

    if (jokeId) {
        try {
            conn = await pool.getConnection();
            const joke = await getJokeById(conn, jokeId);
            if (!joke) return interaction.reply({content: 'Joke not found.', ephemeral: true});
            return interaction.reply(`**id:** "${joke.id}" \n**joke_text:** "${joke.joke_text}"`);
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
            const joke = await getJokeBySearchWord(conn, jokeSentence);

            let reply = "";

            for (let i = 0; i < joke.length; i++) {
                reply += `**id:** "${joke[i].id}" **joke_text:** "${joke[i].joke_text}"\n`;
            }
            console.log('About to reply with ', reply)
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
            const joke = await getFirstJoke(conn);
            await interaction.reply(`The first row is\n**id:** ${joke.id} **joke_text:** ${joke.joke_text}`);

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
            const joke = await getLatestJoke(conn);
            return await interaction.reply(`The last row is\n**id:** ${joke.id} **joke_text:** ${joke.joke_text}`);

        } catch (err) {
            console.log(err);
            await interaction.reply({content: "Something went wrong. Try again!", ephemeral: true});
        } finally {
            if (conn) await conn.end();
            console.log('Connection ended.');
        }
    }
}
