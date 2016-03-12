const AbstractCommand = require('../AbstractCommand');

class VolumeCommand extends AbstractCommand {
    static get name() {
        return 'volume';
    }

    static get description() {
        return 'Sets the volume of the bot';
    }

    static get adminCommand() {
        return true;
    }

    handle() {
        this.responds(/^volume$/, () => {
            this.reply(`The current volume is **${this.helper.getVolume()} / 100**.`);
        });

        this.responds(/^volume (\d+)$/, (matches) => {
            if (!this.isDJ) {
                return;
            }

            let volume = parseInt(matches[1]);
            if (volume > 100 || volume < 0) {
                return this.reply(`**${volume}** is not a valid volume. Pick a volume between 0 and 100.`);
            }

            this.helper.setVolume(volume);
            this.reply(`The current volume is **${this.helper.getVolume()} / 100**.`);
        });
    }
}

module.exports = VolumeCommand;
