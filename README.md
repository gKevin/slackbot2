# Slackbot2 🤖

Simple autoresponse bot for discord.

Slackbot2 is intended to emulate slack's slackbot for people who want to switch to discord.
As such it works on a trigger/response basis where some words can prompt automated responses. It also brings a couple of new feature such as user mentions and automated emoji reactions.

Slackbot2 runs on Node.js and uses the [discord.js](https://github.com/discordjs/discord.js) API.

## Setup

The following instructions are intended to help you get your own autoresponse bot participating on your server.

Before being able to run slackbot2 you first need to create your bot application on [discord's developer portal](https://discord.com/developers). I recommend following [the discord.js guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) on setting up bot applications for this step. Make sure that your bot has the permission to read and write messages from the server. Once you have created your bot application and invited it to your server you can download the repo for the next step.

Start by cloning the repo:

```
git clone https://github.com/gKevin/slackbot2.git
```

Install the required node modules using:

```
npm ci
```

Before you can get the bot running you'll have to configure it by editing the `botConfig.json` file. It will look like this:

```json
{
    "token": "<your-application-token-goes-here>",
    "respondToBots": false,
    "loadGuildMembersOnStart": false
}
```

* `"token"` is your application's authentication token, allowing your bot to connect to discord. You'll have to replace this by the token from your bot's application page.

* `"respondToBots"` lets slackbot2 respond to other bots, I recommend disabling this if you're running multiple autoresponse bots it may end up in an infinite loop of responses.

* `"loadGuildMembersOnStart"` lets slackbot2 access to the list of users on your server, it is recommended if you want to be able to mention random members in your responses. To be able to use this you will need to enable the server members intent on your bot's application page.

When all this is done you can finally run the bot using:

```
npm start
```

Enjoy!

## Customize responses

To get an idea on how to setup your own trigger/responses/reactions you can have a look at the examples in the `responses.json` file. This file can be edited to add your own custom responses.

Be sure to restart the bot whenever you modify the file to update its responses. I may add a feature to reload the file when it is changed in the future.

## Contributing

All bug fixes and feature proposals are welcomed, I'll try to look at them whenever I have some time to spare :-)