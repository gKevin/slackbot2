const autoResponses = require('./responses.json').autoresponses;
const config = require('./botConfig.json')

const token = config.token;

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

    let members = Array.from(channel.members.values());
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

    let botResponse = reply.replace(userTag, message.author.username);

    if(botResponse.includes(randomUserTag)){
        const randomUser = pickRandomUsername(message.channel);

        if(randomUser !== '') {
            botResponse = botResponse.replace(randomUserTag, randomUser);
        }
        else {
            botResponse = '';
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
        let botResponse = pickRandomArrayElt(responses);
        botResponse = expandResponseVariables(message, botResponse);

        if(botResponse !== '') {
            message.channel.send(botResponse);
        }
    }
}

function react(message, triggerIndex) {
    const reactions = autoResponses[triggerIndex].reactions;
    if(reactions !== undefined && reactions.length > 0) {
        reactions.forEach(botReaction => {
            if(botReaction.spawnRate >= 1 || Math.random() < botReaction.spawnRate) {
                const isCustomEmoji = /\w+/.test(botReaction.reaction);
                if(isCustomEmoji) {
                    const emoji = bot.emojis.cache.find(emoji => emoji.name === botReaction.reaction);
                    if(emoji) {
                        message.react(emoji);
                    }
                }
                else { // Unicode emoji.
                    message.react(botReaction.reaction);
                }
            }
        }); 
    }
}

bot.on('message', async message => {
    const author  = message.author.username;
    const botName = bot.user.username;

    if (author !== botName && (!message.author.bot || config.respondToBots)) {
        const triggerIndex = findTriggerIndex(message.content);

        if(triggerIndex > -1) {
            respond(message, triggerIndex);
            react(message, triggerIndex);
        }
    }
});

bot.on('ready', () => {
    // Loading all guild members requires the developer to enable the server members intent 
    // inside the bot tab of the developer portal page.
    if(config.loadGuildMembersOnStart) { 
        for(const guild of Array.from(bot.guilds.cache.values())) {
            bot.guilds.cache.
            get(guild.id)
            .members.fetch()
            .then(console.log)
            .catch(console.error);
        }
    }
});

bot.login(token);