## About Hildibot

Hildibot is a discord bot that I made for my FFXIV guild. It's a simple bot that greets new members, auto-assigns new members a guest role and auto-kicks members who have the guest role at 4AM everyday unless the members have been assigned another role on the server. Hildibot also posts raid day reminders on our static channel.

### In short

Hildibot can:

- Greet new members
- Assign new members a "guest role"
- Kick members with "guest role" at 4 AM everyday
- Post raid reminder one day before raid day
- Post raid reminder on raid day

### Future plans if I have time

- Slash commands and event handling
- Callout rare FATE spawns
- Callout rare hunt spawns

## How to setup Hildibot

>Note 1: Hildibot does not support multiple servers at the same time!
>
>Note 2: You have to set up your own bot at https://discord.com/developers/applications

After you've cloned this repository you need to configure the following files with your own settings:

- .env
- raidInfo.json

#### .env template:   
```
BOT_TOKEN= Your bot token
WELCOME_CHANNEL= Server channel ID for welcome messages
GUEST_ROLE= Role ID for role that gets kicked at 4AM
BOT_LOG_CHANNEL= Server channel where bot sends notificatons of joined/kicked members
SCHEDULE_GUEST_KICK_JOB= Cron schedule expression for kicking members 
STATIC_CHANNEL= Server channel ID for channel with raiding members
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
    "jobSchedule": "0 21 * * 7", //At 21:00 on Sunday
    "image": "/imagePath/image.png", //Path to image embedded in message, can be url
    "message": "Reminder! Prog tomorrow!" //Message sent to channel
  }
]
```
