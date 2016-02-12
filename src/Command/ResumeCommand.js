const AbstractCommand = require('discord-bot-base').AbstractCommand;

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

            this.helper.pause(() => {
                this.sendMssage(this.message.channel, "Playback has been paused.");
            });
        });
    }
}

module.exports = PauseCommand;