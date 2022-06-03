import * as dotenv from "dotenv";
import {Client, Intents, TextChannel} from "discord.js";
import raidInfo from "./raidInfo.json";
import {scheduleJob} from "node-schedule";

let envPath = "./.env";

//.env.test
if (process.argv[2]) {
    envPath += "." + process.argv[2];
}
dotenv.config({path: envPath});
console.log(process.env);

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES] });

client.once('ready', () => {
    console.log('Ready!');
});

raidInfo.forEach(raidDay => scheduleJob(raidDay.jobSchedule, ()=> raidDayReminder(raidDay.image, raidDay.message)));


function raidDayReminder(imageToPost: string, messageToPost: string){
    client.guilds.cache.forEach(guild => {
        let staticChannel = guild.channels.cache.get(`${process.env.STATIC_CHANNEL}`);
        if (staticChannel?.isText()) {
            staticChannel.send({files: [imageToPost], content: `@everyone ${messageToPost}`})
                .then(()=> console.log("Reminder done."));
        }
    })
}


const job = scheduleJob(`${process.env.SCHEDULE_GUEST_KICK_JOB}`, function (){
    client.guilds.cache.forEach(function(guild){
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

client.on("guildMemberRemove", (guildMember)=>{
    let memberDisplayName = guildMember.displayName;
    let guildBotLogChannel = guildMember.guild.channels.cache.get(`${process.env.BOT_LOG_CHANNEL}`);
    if (guildBotLogChannel?.isText()) {
        (guildBotLogChannel as unknown as TextChannel).send(`Member has left/been kicked from the server!\nMember nickname: **${memberDisplayName}**`);
    }
});



client.login(process.env.BOT_TOKEN).then(function (){
    console.log('Logged in.');
});