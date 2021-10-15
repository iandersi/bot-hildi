import * as dotenv from "dotenv";
import {Client, Intents, Permissions, TextChannel} from "discord.js";
dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

client.once('ready', () => {
    console.log('Ready!');
});

//New member greeting
//New member role add
client.on("guildMemberAdd", (guildMember) => {
    let guildChannel = guildMember.guild.channels.cache.get('860896985045401630');
    let newMemberID = guildMember.id;
    if (guildChannel?.isText()) {
        (guildChannel as unknown as TextChannel).send(`Welcome, <@${newMemberID}>!`);
    }

    let role = guildMember.guild.roles.cache.get('898216423078363188');
    if (role) {
        guildMember.roles.add(role);
    }

});



client.login(process.env.BOT_TOKEN);