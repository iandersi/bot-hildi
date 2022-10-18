import * as dotenv from "dotenv";
import * as mariadb from 'mariadb';
import {Client, Intents, TextChannel} from "discord.js";
import raidInfo from "./raidInfo.json";
import reminders from "./reminders.json"
import {scheduleJob} from "node-schedule";
import {Joke} from "./joke";

let envPath = "./.env";

//.env.test
if (process.argv[2]) {
    envPath += "." + process.argv[2];
}
dotenv.config({path: envPath});

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
                .then(() => console.log("Reminder done."));
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

    if (interaction.commandName === 'addcactpot') {
        if (!process.env.CACTPOT_ROLE) {
            console.log('Cactpot role error.');
            return interaction.reply('Internal error.');
        }
        if (!interaction.guild) {
            console.log('Guild error.')
            return interaction.reply('Internal error.');
        }

        let guildMember = interaction.guild.members.cache.get(interaction.user.id);

        if (!guildMember) {
            console.log('Member not found.');
            return interaction.reply('Member not found.');
        }

        if (!guildMember.roles.cache.get(process.env.CACTPOT_ROLE)) {
            let role = guildMember.guild.roles.cache.get(`${process.env.CACTPOT_ROLE}`)
            if (role) {
                await guildMember.roles.add(role);
                await interaction.reply({content: 'You now have the Cactpot role!', ephemeral: true});
            } else {
                return interaction.reply({content: 'Role not found.', ephemeral: true});
            }
        } else {
            return interaction.reply({content:'You already have the Cactpot role.', ephemeral: true});
        }
    }

    if (interaction.commandName === "removecactpot") {
        if (!process.env.CACTPOT_ROLE) {
            console.log('Cactpot role error.');
            return interaction.reply({content: 'Internal error.', ephemeral: true});
        }

        if (!interaction.guild) {
            console.log('Guild error.')
            return interaction.reply({content: 'Internal error.', ephemeral: true});
        }

        let guildMember = interaction.guild.members.cache.get(interaction.user.id);

        if (!guildMember) {
            console.log('Member not found.');
            return interaction.reply({content:'Member not found.', ephemeral: true});
        }

        if (guildMember.roles.cache.get(process.env.CACTPOT_ROLE)) {
            let role = guildMember.guild.roles.cache.get(`${process.env.CACTPOT_ROLE}`)
            if (role) {
                await guildMember.roles.remove(role);
                await interaction.reply({content:'You no longer have the Cactpot role!', ephemeral: true});
            } else {
                return interaction.reply({content:'Role not found.', ephemeral: true});
            }
        } else {
            return interaction.reply({content:'Could not remove role.', ephemeral: true});
        }
    }

    if (interaction.commandName === 'addcraftingupdates') {
        if (!process.env.CRAFTINGUPDATES_ROLE) {
            console.log('CraftingUpdates role error.');
            return interaction.reply({content:'Internal error.', ephemeral: true});
        }
        if (!interaction.guild) {
            console.log('Guild error.')
            return interaction.reply({content:'Internal error.', ephemeral: true});
        }

        let guildMember = interaction.guild.members.cache.get(interaction.user.id);

        if (!guildMember) {
            console.log('Member not found.');
            return interaction.reply({content:'Member not found.', ephemeral: true});
        }

        if (!guildMember.roles.cache.get(process.env.CRAFTINGUPDATES_ROLE)) {
            let role = guildMember.guild.roles.cache.get(`${process.env.CRAFTINGUPDATES_ROLE}`)
            if (role) {
                await guildMember.roles.add(role);
                await interaction.reply({content:'You now have the CraftingUpdates role!', ephemeral: true});
            } else {
                return interaction.reply({content:'Role not found.', ephemeral: true});
            }
        } else {
            return interaction.reply({content:'You already have the CraftingUpdates role.', ephemeral: true});
        }
    }

    if (interaction.commandName === "removecraftingupdates") {
        if (!process.env.CRAFTINGUPDATES_ROLE) {
            console.log('CraftingUpdates role error.');
            return interaction.reply({content:'Internal error.', ephemeral: true});
        }

        if (!interaction.guild) {
            console.log('Guild error.')
            return interaction.reply({content:'Internal error.', ephemeral: true});
        }

        let guildMember = interaction.guild.members.cache.get(interaction.user.id);

        if (!guildMember) {
            console.log('Member not found.');
            return interaction.reply({content:'Member not found.', ephemeral: true});
        }

        if (guildMember.roles.cache.get(process.env.CRAFTINGUPDATES_ROLE)) {
            let role = guildMember.guild.roles.cache.get(`${process.env.CRAFTINGUPDATES_ROLE}`)
            if (role) {
                await guildMember.roles.remove(role);
                await interaction.reply({content:'You no longer have the CraftingUpdates role!', ephemeral: true});
            } else {
                return interaction.reply({content:'Role not found.', ephemeral: true});
            }
        } else {
            return interaction.reply({content:'Could not remove role.', ephemeral: true});
        }
    }

    if (interaction.commandName === "telljoke") {
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