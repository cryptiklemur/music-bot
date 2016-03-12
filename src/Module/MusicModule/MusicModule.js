const AbstractModule = require('discord-bot-base').AbstractModule;

class MusicModule extends AbstractModule {
    get commandsDir() {
        return __dirname + '/Command';
    }
}

module.exports = MusicModule;