const AbstractCommand = require('discord-bot-base').AbstractCommand;
const Playlist        = require('../Model/Playlist');
const json            = require('prettyjson');

class PauseCommand extends AbstractCommand {
    static get name() { return 'pause'; }

    static get description() { return 'Pauses the playback from the bot'; }

    initialize() {
        this.helper = this.container.get('helper.playback');
    }

    handle() {
        this.responds(/^pause$/, () => {
            if (!this.helper.isPlaying()) {
                return this.reply("I am not playing music!");
            }

            let proc = this.client.voiceConnection.streamProc;
        });
    }
}

module.exports = PauseCommand;
