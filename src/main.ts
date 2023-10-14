import * as dotenv from "dotenv";

let envPath = "./.env";

//.env.test
if (process.argv[2]) {
    envPath += "." + process.argv[2];
}
dotenv.config({path: envPath});

import * as mariadb from 'mariadb';
import {Client, Intents, TextChannel} from "discord.js";
import raidInfo from "./raidInfo.json";
import reminders from "./reminders.json"
import {scheduleJob} from "node-schedule";
import {executeTellJoke} from "./commands/tellJoke";
import {executeRollDice} from "./commands/rollDice";
import {executeFindJoke} from "./commands/findJoke";
import {executeAddJoke} from "./commands/addJoke";
import {executeManageRole} from "./commands/executeManageRole";
import {executeDeleteJoke} from "./commands/deleteJoke";
import {getConfigurationParameter} from "./configDb";



const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES]});

client.once('ready', () => {
    console.log('Ready!');
});

const pool = mariadb.createPool({
    host: `${process.env.HOST}`,
    user: `${process.env.USER}`,
    password: `${process.env.PASSWORD}`,
    database: `${process.env.DATABASE}`,
    connectionLimit: 5
});


let scheduledJobsRaids = raidInfo.map(raidDay => scheduleJob(raidDay.jobSchedule, () => raidDayReminder(raidDay.image, raidDay.message)));
let scheduledJobsReminders = reminders.map(reminders => scheduleJob(reminders.jobSchedule, () => fcReminders(reminders.message)));

function raidDayReminder(imageToPost: string, messageToPost: string) {
    client.guilds.cache.forEach(async guild => {
        const staticChannelId= await getConfigurationParameter(pool, guild.id, 'static_channel');
        if (!staticChannelId) return console.log(`Cannot post raid day reminder for guild ${guild.name} (${guild.id})`);
        let staticChannel = guild.channels.cache.get(staticChannelId);
        if (staticChannel?.isText()) {
            staticChannel.send({files: [imageToPost], content: `@everyone ${messageToPost}`})
                .then(() => console.log("Reminder done.")).catch(reason => console.log(`Failed to post reminder. Reason: ${reason}`));
        }
    })
}

 function fcReminders(messageToPost: string) {
    client.guilds.cache.forEach(async guild => {
        const chatChannelId = await getConfigurationParameter(pool, guild.id, 'chat_channel')
        const role = await getConfigurationParameter(pool, guild.id, 'cactpot_role');
        if (!chatChannelId) return console.log(`Cannot post reminder for guild ${guild.name} (${guild.id})`);
        if (!role) return console.log(`Cannot post reminder for guild ${guild.name} (${guild.id})`);
        let generalChatChannel = guild.channels.cache.get(chatChannelId);
        if (generalChatChannel?.isText()) {
            generalChatChannel.send({content: `${messageToPost}`}).then(() => console.log("Reminder done."));
        }
    })
}


const kickJob = scheduleJob(`${process.env.SCHEDULE_GUEST_KICK_JOB}`, function () {
    client.guilds.cache.forEach(async function (guild) {
        const guestRoleId = await getConfigurationParameter(pool, guild.id, 'guest_role')
        if (!guestRoleId) return console.log(`Cannot get guest role for guild ${guild.name} (${guild.id})`);
        let role = guild.roles.cache.get(guestRoleId);
        if (role) {
            if (role.members.size === 0) {
                console.log('No guests.')
                return;
            }

            role.members.forEach((guildMember) => {
                guild.members.kick(guildMember, 'guest').then(() => {
                    console.log(`Kicked ${guildMember.displayName}`);
                }).catch(reason => console.error(`Failed to kick member ${guildMember.displayName}: ${reason}`));
            });
        }
    });
});


client.on("guildMemberAdd", async (guildMember) => {
    console.log('user joined', guildMember);
    const welcomeChannelId = await getConfigurationParameter(pool, guildMember.guild.id, 'welcome_channel')
    if (!welcomeChannelId) return console.log(`Cannot get guest role for guild ${guildMember.guild.name} (${guildMember.guild.id})`);

    let guildChannel = guildMember.guild.channels.cache.get(welcomeChannelId);
    let newMemberID = guildMember.id;
    if (guildChannel?.isText()) {
        await (guildChannel as unknown as TextChannel).send(`Welcome, <@${newMemberID}>!`);
    }

    const botLogChannelId = await getConfigurationParameter(pool, guildMember.guild.id, 'bot_log_channel')
    if (!botLogChannelId) return console.log(`Cannot get guest role for guild ${guildMember.guild.name} (${guildMember.guild.id})`);

    let guildBotLogChannel = guildMember.guild.channels.cache.get(botLogChannelId);

    if (guildBotLogChannel?.isText()) {
        await (guildBotLogChannel as unknown as TextChannel).send(`New member joined the server!\nMember nickname: <@${newMemberID}>`)
    }

    const guestRoleId = await getConfigurationParameter(pool, guildMember.guild.id, 'guest_role')
    if (!guestRoleId) return console.log(`Cannot get guest role for guild ${guildMember.guild.name} (${guildMember.guild.id})`);
    let role = guildMember.guild.roles.cache.get(guestRoleId);

    if (role) {
        await guildMember.roles.add(role);
    }

});

client.on("guildMemberRemove", async (guildMember) => {

    const botLogChannelId = await getConfigurationParameter(pool, guildMember.guild.id, 'bot_log_channel')
    if (!botLogChannelId) return console.log(`Cannot get guest role for guild ${guildMember.guild.name} (${guildMember.guild.id})`);

    let memberDisplayName = guildMember.displayName;
    let guildBotLogChannel = guildMember.guild.channels.cache.get(botLogChannelId);

    if (guildBotLogChannel?.isText()) {
        await (guildBotLogChannel as unknown as TextChannel).send(`Member has left/been kicked from the server!\nMember nickname: **${memberDisplayName}**`);
    }
});

client.on('interactionCreate', async interaction => {
    //check interaction type
    if (!interaction.isCommand()) return;
    if (interaction.commandName === 'role') return await executeManageRole(interaction, pool);
    if (interaction.commandName === 'telljoke') return await executeTellJoke(interaction, pool);
    if (interaction.commandName === 'rolldice') return await executeRollDice(interaction);
    if (interaction.commandName === 'config') {
        if (interaction.options.getSubcommand() === 'findjoke') {
            return await executeFindJoke(interaction, pool);
        } else if (interaction.options.getSubcommand() === 'addjoke') {
            return await executeAddJoke(interaction, pool);
        } else if (interaction.options.getSubcommand() === 'deletejoke') {
            return await executeDeleteJoke(interaction, pool);
        }
    }
    console.log('command not recognized ', interaction.commandName)
});


client.login(process.env.BOT_TOKEN).then(function () {
    console.log('Logged in.');
});

function shutdown() {
    scheduledJobsRaids.forEach(job => job.cancel());
    console.log("Raid reminder jobs canceled.")
    scheduledJobsReminders.forEach(job => job.cancel());
    console.log("FC reminder jobs canceled.")
    kickJob.cancel();
    console.log("Kick job canceled.")
    client.destroy();
    console.log("Discord client destroyed!");
    process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

process.on("exit", () => {
    console.log("Goodbye!");
})