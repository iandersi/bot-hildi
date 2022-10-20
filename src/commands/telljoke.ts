import {CommandInteraction} from "discord.js";
import * as mariadb from "mariadb";
import {Joke} from "../joke";

export async function executeTelljoke(interaction: CommandInteraction, pool: mariadb.Pool): Promise<void> {
        let conn: mariadb.PoolConnection | undefined;
        try {
            conn = await pool.getConnection();
            const randomRow = await conn.query("SELECT id, joke_text FROM joke ORDER BY RAND() limit 1") as Joke[];
            console.log(randomRow[0].joke_text);
            await interaction.reply(randomRow[0].joke_text);
        } catch (err) {
            console.log('/telljoke failed', err);
            await interaction.reply('Something went wrong. Try again!');
        } finally {
            if (conn) await conn.end();
        }
}
