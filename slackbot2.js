let autoResponses = require('./responses.json').autoresponses;
let token = require('./token.json').token

const Discord = require('discord.js');
const bot = new Discord.Client();

function pickRandomArrayElt(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function pickRandomUsername(channel) {
    const botName = bot.user.username;

    if(channel.members == undefined) {
        return '';
    }

    var members = Array.from(channel.members.values());
    members = members.filter(member => member.user.username !== botName);

    const randMember = pickRandomArrayElt(members);

    if(randMember != undefined) {
        return randMember.user.username;
    }

    return '';
}

function expandResponseVariables(message, reply) {
    const randomUserTag = '\{randomUser\}';
    const userTag       = '\{user\}'

    var botResponse = reply.replace(userTag, message.author.username);

    if(botResponse.includes(randomUserTag)){
        const randomUser = pickRandomUsername(message.channel);

        if(randomUser !== '') {
            botResponse = botResponse.replace(randomUserTag, randomUser);
        }
        else {
            botResponse = ''
        }
    }

    return botResponse;
}

function isPunctuation(char) {
    return /[\s\W\d]/.test(char);
}

function matchesTrigger(messageContent, trigger) {
    const subStrIndex = messageContent.toLowerCase().indexOf(trigger.toLowerCase());

    if(subStrIndex >= 0) {
        const precededBySpace = (subStrIndex === 0 
            || isPunctuation(messageContent.charAt(subStrIndex - 1)));
        const followedBySpace = (subStrIndex + trigger.length === messageContent.length) 
            || isPunctuation(messageContent.charAt(subStrIndex + trigger.length));

        return precededBySpace && followedBySpace;
    }

    return false;
}

function findTriggerIndex(messageContent) {
    return autoResponses.findIndex(autoresp => 
        autoresp.triggers.find(trigger => matchesTrigger(messageContent, trigger)));
}

function respond(message, triggerIndex) {
    const responses = autoResponses[triggerIndex].responses;
    if(responses.length > 0) {
        var botResponse = pickRandomArrayElt(responses);
        botResponse = expandResponseVariables(message, botResponse);

        if(botResponse !== '') {
            message.channel.send(botResponse);
        }
    }
}

bot.on('message', async message => {
    const author  = message.author.username;
    const botName = bot.user.username;

    if (author !== botName) {
        const triggerIndex = findTriggerIndex(message.content);

        if(triggerIndex > -1) {
            respond(message, triggerIndex);
        }
    }
});

bot.login(token);