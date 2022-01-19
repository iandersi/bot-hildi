import * as dotenv from "dotenv";
import {Client, Intents, Permissions, TextChannel} from "discord.js";
dotenv.config();
import {scheduleJob} from "node-schedule";

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES] });

client.once('ready', () => {
    console.log('Ready!');
});


//Kick member at certain time
//Loops through servers, checks if there is a guest role, if role has members > kick
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
                    let guildBotLogChannel = guild.channels.cache.get(`${process.env.BOT_LOG_CHANNEL}`);
                    if (guildBotLogChannel?.isText()) {
                        (guildBotLogChannel as unknown as TextChannel).send(`Member kicked ${guildMember}\nReason: Guest`);
                    }
                    console.log(`Kicked ${guildMember.nickname}`);
                });
            });
        }
    });
});


//New member greeting
//New member role add
client.on("guildMemberAdd", (guildMember) => {
    let guildChannel = guildMember.guild.channels.cache.get(`${process.env.GUILD_CHANNEL}`);
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



client.login(process.env.BOT_TOKEN).then(function (){
    console.log('Logged in.');
});