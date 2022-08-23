import { SlashCommandBuilder} from '@discordjs/builders';
import {Routes } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';
import * as dotenv from "dotenv";

let envPath = "./.env";

if (process.argv[2]) {
    envPath += "." + process.argv[2];
}
dotenv.config({path: envPath});

const commands = [
    new SlashCommandBuilder().setName('addcactpot').setDescription('Adds Cactpot role to user.'),
    new SlashCommandBuilder().setName('removecactpot').setDescription('Removes Cactpot role from user.')
]
    .map(command => command.toJSON());

if (!process.env.BOT_TOKEN) {
    console.log("Bot token missing.");
    process.exit(1);
}
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

if (!process.env.CLIENT_ID) {
    console.log("Client ID missing.");
    process.exit(1);
}

if (!process.env.GUILD_ID) {
    console.log("Guild ID missing.");
    process.exit(1);
}

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);