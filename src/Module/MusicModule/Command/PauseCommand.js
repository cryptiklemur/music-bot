const AbstractCommand = require('../AbstractCommand');

class PauseCommand extends AbstractCommand {
    static get name() {
        return 'pause';
    }

    static get description() {
        return 'Pauses the playback from the bot';
    }

    static get adminCommand() {
        return true;
    }

    handle() {
        this.responds(/^pause$/, () => {
            if (!this.isDJ) {
                return;
            }

            if (!this.helper.isPlaying()) {
                return this.reply("I am not playing music!");
            }

            this.helper.pause(() => {
                this.reply("Playback has been paused.");
            });
        });
    }
}

module.exports = PauseCommand;