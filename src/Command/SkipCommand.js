const AbstractCommand = require('discord-bot-base').AbstractCommand;
const MessageHelper   = require('../Helper/MessageHelper');

class PlayingCommand extends AbstractCommand {
    static get name() { return 'skip'; }

    static get description() { return 'Votes to skip the current song'; }

    initialize() {
        this.helper = this.container.get('helper.playback');
    }

    handle() {
        this.responds(/^skip$/, () => {
            if (!this.helper.isPlaying()) {
                return this.reply("No songs playing right now.");
            }

            if ((new MessageHelper(this.client, this.message)).isDJ()) {
                if (this.client.voiceConnection.playing) {
                    this.sendMessage(this.message.channel, "Skipped the current song.");
                    setTimeout(this.client.voiceConnection.stopPlaying(), 500);
                }
            }
        });
    }
}

module.exports = PlayingCommand;
