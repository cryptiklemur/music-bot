const AbstractCommand = require('../AbstractCommand');

class ResumeCommand extends AbstractCommand {
    static get name() {
        return 'resume';
    }

    static get description() {
        return 'Resume the playback from the bot';
    }

    static get adminCommand() {
        return true;
    }

    handle() {
        this.responds(/^resume$/, () => {
            if (!this.isDJ) {
                return;
            }

            if (this.helper.isPlaying()) {
                return this.reply("I am already playing music!");
            }

            this.helper.resume(() => {
                this.reply("Playback has been resumed.");
            });
        });
    }
}

module.exports = ResumeCommand;