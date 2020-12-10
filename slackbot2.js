let autoResponses = require('./responses.json').autoresponses;
let token = require('./token.json').token

const Discord = require('discord.js');
const bot = new Discord.Client();

const botName = 'SlackBot2';

bot.on('message', async message => {

    const author = message.author.username;

    if (author !== botName) {
        const respIndex = autoResponses.findIndex(autoresp => 
            autoresp.triggers.find(trigger => 
                message.content.toLowerCase().includes(trigger.toLowerCase())));

        if(respIndex > -1) {
            const responses = autoResponses[respIndex].responses;
            if(responses.length > 0)
            {
                var botResponse = responses[Math.floor(Math.random() * responses.length)];
                botResponse = botResponse.replace('\{user\}', author);

                message.channel.send(botResponse);
            }
        }
    }
});

bot.login(token);