import * as mariadb from "mariadb";
import {Joke} from "./joke";


//Functions related to config-command

export async function addJoke(conn: mariadb.PoolConnection, jokeText: string) {
        return conn.query("INSERT INTO joke (joke_text) VALUES(?)", jokeText.replace(/\\n/g, "\n"));
}

export async function getLatestJoke(conn: mariadb.PoolConnection) {
        const jokes = await conn.query("SELECT * FROM joke ORDER BY id DESC LIMIT 1") as Joke[];
        return jokes[0];
}

export async function getFirstJoke(conn: mariadb.PoolConnection) {
        const jokes = await conn.query("SELECT * FROM joke ORDER BY id ASC LIMIT 1") as Joke[];
        return jokes[0];
}

export async function getJokeById(conn: mariadb.PoolConnection, jokeId: number) {
        const jokes = await conn.query("SELECT id, joke_text FROM joke WHERE id = ?",[jokeId]) as Joke[];
        if (jokes.length === 0) return null;
        return jokes[0];
}

export async function getJokeBySearchWord(conn: mariadb.PoolConnection, jokeSentence: string) {
        return await conn.query("SELECT id, joke_text FROM joke WHERE joke_text LIKE ?",['%' + jokeSentence + '%']) as Joke[];
}

export async function deleteJokeById(conn: mariadb.PoolConnection, jokeId: number) {
        return await conn.query("DELETE FROM joke WHERE id = ?", jokeId);
}