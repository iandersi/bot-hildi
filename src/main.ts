import * as dotenv from "dotenv";
import {Client, Intents, Permissions, TextChannel} from "discord.js";
dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

client.once('ready', () => {
    console.log('Ready!');
});

//New member greeting
client.on("guildMemberAdd", (guildMember) => {
    let guildChannel = guildMember.guild.channels.cache.get('860896985045401630');
    let newMemberID = guildMember.id;
    if (guildChannel?.isText()) {
        (guildChannel as unknown as TextChannel).send(`Welcome, <@${newMemberID}>!`);
    }


});



client.login(process.env.BOT_TOKEN);