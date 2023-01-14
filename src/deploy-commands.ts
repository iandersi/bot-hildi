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
    new SlashCommandBuilder().setName('role').setDescription('Manage roles.')
        .addStringOption(option => option.setName('addrole').setDescription('Add role')
            .setChoices({name: "Cactpot Reminder", value: "cactpot"},{name: "Crafting Updates", value: "craftingupdates"}, {name: "Raid Notifications", value: "raid"}, {name: "Spoiler Channel", value: "spoiler"}))
        .addStringOption(option => option.setName('removerole').setDescription('Remove role')
            .setChoices({name: "Cactpot Reminder", value: "cactpot"},{name: "Crafting Updates", value: "craftingupdates"}, {name: "Raid Notifications", value: "raid"}, {name: "Spoiler Channel", value: "spoiler"})),
    new SlashCommandBuilder().setName('telljoke').setDescription('I\'m fun at parties, I swear!'),
    new SlashCommandBuilder().setName('rolldice').setDescription('Roll a dice and hope for the best.')
        .addIntegerOption(option => option.setName('amount').setDescription('Amount of dice rolled').setRequired(true))
        .addIntegerOption(option => option.setName('variant').setDescription('Dice variant').setRequired(true)),
    new SlashCommandBuilder().setName('config').setDescription('Add or delete something')
        .addSubcommand(subcommand => subcommand.setName('addjoke').setDescription('Add joke to database')
            .addStringOption(option => option.setName('addjoke').setDescription('Add joke')))
        .addSubcommand(subcommand => subcommand.setName('findjoke').setDescription('Find joke in database')
            .addIntegerOption(option => option.setName('findbyid').setDescription('Find by ID'))
            .addStringOption(option => option.setName('findbystring').setDescription('Find by sentence'))
            .addStringOption(option => option.setName('findbyindex').setDescription('Find by first or last index').setChoices({name: "First", value: "first"}, {name: "Last", value:"last"})))
        .addSubcommand(subcommand => subcommand.setName('deletejoke').setDescription('Delete joke from database')
            .addIntegerOption(option => option.setName('deletebyid').setDescription('Delete joke by ID')))
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