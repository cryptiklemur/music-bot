const AbstractCommand = require('discord-bot-base').AbstractCommand;

class ResumeCommand extends AbstractCommand {
    static get name() { return 'resume'; }

    static get description() { return 'Resume the playback from the bot'; }

    initialize() {
        this.helper = this.container.get('helper.playback');
    }

    handle() {
        this.responds(/^resume$/, () => {
            if (!this.container.get('helper.dj').isDJ(this.message.server, this.message.author)) {
                return;
            }

            if (this.helper.isPlaying()) {
                return this.reply("I am already playing music!");
            }

            this.helper.resume(() => {
                this.sendMessage(this.message.channel, "Playback has been resumed.");
            });
        });
    }
}

module.exports = ResumeCommand;