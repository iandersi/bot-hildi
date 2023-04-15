import * as mariadb from "mariadb";
import {Config} from "./config";


//Functions related to database config
async function getParameter(conn: mariadb.PoolConnection, guildId: string, columnName: keyof Config){
    const config = await conn.query("SELECT * FROM config WHERE guild_id = ?", [guildId]) as Config[];
    if (config.length === 0) return null;
    if (config[0][columnName] === null) return null;
    return config[0][columnName].toString();
}

export async function getConfigurationParameter(pool: mariadb.Pool, guildId: string, columnName: keyof Config){
    let conn: mariadb.PoolConnection | undefined;

    try {
        conn = await pool.getConnection();
        return getParameter(conn, guildId, columnName);
    } catch (err) {
        console.log(err);
        return null;
    } finally {
        if (conn) await conn.end();
    }
}