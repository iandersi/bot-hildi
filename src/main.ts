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
import {executeTelljoke} from "./commands/telljoke";
import {executeRolldice} from "./commands/rolldice";
import {executeFindjoke} from "./commands/findjoke";
import {executeAddjoke} from "./commands/addjoke";
import {executeManageRole} from "./commands/executeManageRole";



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
    client.guilds.cache.forEach(guild => {
        let staticChannel = guild.channels.cache.get(`${process.env.STATIC_CHANNEL}`);
        if (staticChannel?.isText()) {
            staticChannel.send({files: [imageToPost], content: `@everyone ${messageToPost}`})
                .then(() => console.log("Reminder done.")).catch(reason => console.log(`Failed to post reminder. Reason: ${reason}`));
        }
    })
}

function fcReminders(messageToPost: string) {
    client.guilds.cache.forEach(guild => {
        let generalChatChannel = guild.channels.cache.get(`${process.env.CHAT_CHANNEL}`);
        if (generalChatChannel?.isText()) {
            generalChatChannel.send({content: `${messageToPost}`}).then(() => console.log("Reminder done."));
        }
    })
}


const kickJob = scheduleJob(`${process.env.SCHEDULE_GUEST_KICK_JOB}`, function () {
    client.guilds.cache.forEach(function (guild) {
        let role = guild.roles.cache.get(`${process.env.GUEST_ROLE}`);
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


client.on("guildMemberAdd", (guildMember) => {
    let guildChannel = guildMember.guild.channels.cache.get(`${process.env.WELCOME_CHANNEL}`);
    let newMemberID = guildMember.id;
    if (guildChannel?.isText()) {
        (guildChannel as unknown as TextChannel).send(`Welcome, <@${newMemberID}>!`);
    }

    let guildBotLogChannel = guildMember.guild.channels.cache.get(`${process.env.BOT_LOG_CHANNEL}`);
    if (guildBotLogChannel?.isText()) {
        (guildBotLogChannel as unknown as TextChannel).send(`New member joined the server!\nMember nickname: <@${newMemberID}>`)
    }

    let role = guildMember.guild.roles.cache.get(`${process.env.GUEST_ROLE}`);
    if (role) {
        guildMember.roles.add(role);
    }

});

client.on("guildMemberRemove", (guildMember) => {
    let memberDisplayName = guildMember.displayName;
    let guildBotLogChannel = guildMember.guild.channels.cache.get(`${process.env.BOT_LOG_CHANNEL}`);
    if (guildBotLogChannel?.isText()) {
        (guildBotLogChannel as unknown as TextChannel).send(`Member has left/been kicked from the server!\nMember nickname: **${memberDisplayName}**`);
    }
});

client.on('interactionCreate', async interaction => {
    //check interaction type
    if (!interaction.isCommand()) return;
    if (interaction.commandName === 'role') await executeManageRole(interaction);
    if (interaction.commandName === 'telljoke') await executeTelljoke(interaction, pool);
    if (interaction.commandName === 'rolldice') await executeRolldice(interaction);
    if (interaction.commandName === 'config') {
        if (interaction.options.getSubcommand() === 'findjoke') {
            await executeFindjoke(interaction, pool);
        } else if (interaction.options.getSubcommand() === 'addjoke') {
            await executeAddjoke(interaction, pool);
        }
    }
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