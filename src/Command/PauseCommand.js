const AbstractCommand = require('discord-bot-base').AbstractCommand;

class PauseCommand extends AbstractCommand {
    static get name() { return 'pause'; }

    static get description() { return 'Pauses the playback from the bot'; }

    initialize() {
        this.helper = this.container.get('helper.playback');
    }

    handle() {
        if (!this.container.get('helper.dj').isDJ(this.message.server, this.message.author)) {
            return;
        }

        this.responds(/^pause$/, () => {
            if (!this.helper.isPlaying()) {
                return this.reply("I am not playing music!");
            }

            this.helper.pause(() => {
                this.sendMessage(this.message.channel, "Playback has been paused.");
            });
        });
    }
}

module.exports = PauseCommand;