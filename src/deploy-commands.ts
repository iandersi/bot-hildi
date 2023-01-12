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
    new SlashCommandBuilder().setName('removecactpot').setDescription('Removes Cactpot role from user.'),
    new SlashCommandBuilder().setName('addcraftingupdates').setDescription('Adds CraftingUpdates role to user.'),
    new SlashCommandBuilder().setName('removecraftingupdates').setDescription('Removes CraftingUpdates role from user.'),
    new SlashCommandBuilder().setName('telljoke').setDescription('I\'m fun at parties, I swear!'),
    new SlashCommandBuilder().setName('rolldice').setDescription('Roll a dice and hope for the best.')
        .addIntegerOption(option => option.setName('amount').setDescription('Amount of dice rolled').setRequired(true))
        .addIntegerOption(option => option.setName('variant').setDescription('Dice variant').setRequired(true)),
    new SlashCommandBuilder().setName('config').setDescription('Add or delete something')
        .addSubcommand(subcommand => subcommand.setName('addjoke').setDescription('Add joke'))
        .addSubcommand(subcommand => subcommand.setName('findjoke').setDescription('Find joke').addIntegerOption(option => option.setName('id').setDescription('Find by ID')).addStringOption(option => option.setName('string').setDescription('Find by sentence')))
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