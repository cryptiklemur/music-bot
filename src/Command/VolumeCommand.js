const AbstractCommand = require('discord-bot-base').AbstractCommand;
const ytdl            = require('youtube-dl');

class VolumeCommand extends AbstractCommand {
    static get name() { return 'volume'; }

    static get description() { return 'Sets the volume of the bot'; }

    initialize() {
        this.helper = this.container.get('helper.playback');
    }

    handle() {
        this.responds(/^volume$/, () => {
            this.reply(`The current volume is **${this.helper.getVolume()} / 100**.`);
        });

        this.responds(/^volume (\d+)$/, (matches) => {
            let volume = parseInt(matches[1]);
            console.log(volume);
            if (volume > 100 || volume < 0) {
                return this.reply(`**${volume}** is not a valid volume. Pick a volume between 0 and 100.`);
            }

            this.helper.setVolume(volume);
        });
    }
}

module.exports = VolumeCommand;
