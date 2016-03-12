const AbstractCommand = require('../AbstractCommand');

class StopCommand extends AbstractCommand {
    static get name() {
        return 'stop';
    }

    static get description() {
        return 'Stops the playback from the bot';
    }

    static get adminCommand() {
        return true;
    }

    handle() {
        this.responds(/^stop$/, () => {
            if (!this.isDJ) {
                return;
            }

            if (!this.helper.isPlaying()) {
                return this.reply("I am not playing music!");
            }

            this.helper.queue   = undefined;
            this.helper.current = 0;
            this.helper.stopPlaying(() => {
                this.reply("Playback has been stopped.");
            });
        });
    }
}

module.exports = StopCommand;