const responseFile = require('./responses.json');
const config = require('./botConfig.json');

const autoResponses = responseFile.autoresponses;
const greetings     = responseFile.greetings;

const token = config.token;

const Discord = require('discord.js');
const bot = new Discord.Client();

const randomUserMacro = '\{randomUser\}';
const userMacro       = '\{user\}'
const guildMacro      = '\{server\}';

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

function expandResponseMacros(authorUsername, guildName, channel, reply) {

    let botResponse = reply.replace(userMacro, authorUsername);
    botResponse     = botResponse.replace(guildMacro, guildName);

    if(botResponse.includes(randomUserMacro)){
        const randomUser = pickRandomUsername(channel);

        if(randomUser !== '') {
            botResponse = botResponse.replace(randomUserMacro, randomUser);
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

function filterValidResponses(responses, message) {
    return responses.filter(response => 
        // Responses requiring a guildMacro or a randomUserMacro can not be sent
        // in direct messages so we need to remove them.
        (!response.includes(randomUserMacro) || message.channel) && 
        (!response.includes(guildMacro) || message.guild)
    );
}

function respond(message, triggerIndex) {
    const responses = autoResponses[triggerIndex].responses;
    if(responses.length > 0) {
        const validResponses = filterValidResponses(responses, message);
        if(validResponses !== []) {
            let botResponse = pickRandomArrayElt(validResponses);
            let guildName = message.guild ? message.guild.name : '';
    
            botResponse = expandResponseMacros(message.author.username, 
                                               guildName,
                                               message.channel, 
                                               botResponse);
                    
            if(botResponse !== '') {
                message.channel.send(botResponse).catch(console.error);
            }
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
                        message.react(emoji).catch(console.error);
                    }
                }
                else { // Unicode emoji.
                    message.react(botReaction.reaction).catch(console.error);
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

bot.on('guildMemberAdd', guildMember => {
    if(greetings !== []) {
        let guild = guildMember.guild;
        let systemChannel = guild.systemChannel;

        const greeting = expandResponseMacros(guildMember.user.username,
                                              guild.name,
                                              systemChannel,
                                              pickRandomArrayElt(greetings));
        systemChannel.send(greeting);
    }
});

bot.on('ready', () => {
    // Loading all guild members requires the developer to enable the server members intent 
    // inside the bot tab of the developer portal page.
    if(config.loadGuildMembersOnStart) { 
        for(const guild of Array.from(bot.guilds.cache.values())) {
            bot.guilds.cache.get(guild.id)
                            .members.fetch()
                            .catch(console.error);
        }
    }
});

bot.login(token);