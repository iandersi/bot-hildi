## About Hildibot

Hildibot is a discord bot that I made for my FFXIV guild. It's a simple bot that greets new members, auto-assigns new members a guest role and auto-kicks members who have the guest role at scheduled time (for example I scheduled it to be everyday at 4AM) unless the members have been assigned another role on the server. Hildibot also posts raid day reminders on our static channel.

### In short

Hildibot can:

- Greet new members

    ![img_1.png](img_1.png)
- Assign new members a "guest role"

    ![img_2.png](img_2.png)
- Kick members with "guest role" at scheduled time

    ![img_3.png](img_3.png)
- Post raid reminders at scheduled time

    ![img.png](img.png)

- Has slash commands: Add/Remove Cactpot role

  ![img_4.png](img_4.png)

- Cactpot role tagged in specific reminder

  ![img_5.png](img_5.png)

### Future plans if I have time

- ~~Slash commands and event handling~~ done
- Requested: Updating raid reminders via dm's
- Callout rare FATE spawns
- Callout rare hunt spawns

## How to setup Hildibot for development

>Note 1: Hildibot does not support multiple servers at the same time!
>
>Note 2: You have to set up your own bot at https://discord.com/developers/applications

After you've cloned this repository you need to configure the following files with your own settings:

- .env
- raidInfo.json

#### .env template:   
```
BOT_TOKEN= Your bot token
CLIENT_ID=Client ID found in devtools portal
GUILD_ID=Server ID found in Discord
WELCOME_CHANNEL= Server channel ID for welcome messages
GUEST_ROLE= Role ID for role that gets kicked 
BOT_LOG_CHANNEL= Server channel where bot sends notificatons of joined/kicked members
SCHEDULE_GUEST_KICK_JOB= Cron schedule expression for kicking members 
STATIC_CHANNEL= Server channel ID for channel with raiding members
CACTPOT_ROLE=Role to be tagged for the cactpot ticket reminder
EVENT_CHANNEL=Channel where the cactpot reminder goes (you can change this to anything you like that suits your needs better)
```

#### raidInfo.json template:
```
[
  {
    "day": "day",
    "jobSchedule": "* * * * *",
    "image": "/imagePath/image.png",
    "message": "Your message"
  },
  {
    "day": "day",
    "jobSchedule": "* * * * *",
    "image": "/imagePath/image.png",
    "message": "Your message"
  }
]

//For example
[
  {
    "day": "sunday", //Dev reminder for what day, not used anywhere
    "jobSchedule": "0 21 * * 7", //At 21:00 on every Sunday
    "image": "/imagePath/image.png", //Path to image embedded in message, can be url
    "message": "Reminder! Prog tomorrow!" //Message sent to channel
  }
]
```

#### Slash commands
```
For the slash commands to work you have to create a deploy-commands.ts file for running a script and a reminders.json file for reminders for the specific Cactpot role only.

//Reminders JSON example
[
  {
    "day": "saturday (cactpot reminder)", //Dev reminder, not used anywhere
    "jobSchedule": "0 19 * * 6", //At 19:00 every Saturday
    "image": "", //Can use image if you want to, not used in my example
    "message": "<@&ROLE_ID> Greetings, friends! Remember to get your Jumbo Cactpot tickets. :cactus:"
  }
]
```

## Build

You can create distributable build with:
```
> npm run build
```
I run mine on a Raspberry Pi with Docker.

It is upto you in which way you configure the variables for the distributable version, you can create a separate .env file for the dist folder, or you can configure the variables in another way. Anyway you choose, you can then start the bot with the following command:
```
> node main.js
```