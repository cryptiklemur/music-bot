const AbstractCommand = require('discord-bot-base').AbstractCommand;

class StopCommand extends AbstractCommand {
    static get name() {
        return 'stop';
    }

    static get description() {
        return 'Stops the playback from the bot';
    }

    initialize() {
        this.helper = this.container.get('helper.playback');
    }

    handle() {
        this.responds(/^stop$/, () => {
            if (!this.container.get('helper.dj').isDJ(this.message.server, this.message.author)) {
                return;
            }

            if (!this.helper.isPlaying()) {
                return this.reply("I am not playing music!");
            }

            this.helper.queue   = undefined;
            this.helper.current = 0;
            this.helper.stopPlaying(() => {
                this.sendMessage(this.message.channel, "Playback has been stopped.");
            });
        });
    }
}

module.exports = StopCommand;