const AbstractCommand = require('../AbstractCommand'),
      Parser          = require('../Parser');

class SeekCommand extends AbstractCommand {
    static get name() {
        return 'seek';
    }

    static get description() {
        return 'Seek in the current song';
    }

    static get adminCommand() {
        return true;
    }

    handle() {
        this.responds(/^seek ((?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d))$/, (matches) => {
            if (!this.isDJ) {
                return;
            }

            if (!this.helper.isPlaying()) {
                return this.reply("No songs playing right now.");
            }

            let hours   = parseInt(matches[2] || 0),
                minutes = parseInt(matches[3] || 0),
                seconds = parseInt(matches[4]),
                total   = (hours * 60 * 60) + (minutes * 60) + seconds;

            this.helper.seek(total, () => {
                this.reply(`Seeking ${total} seconds ahead to: ${Parser.parseSeconds(total)}`);
            });
        });
    }
}

module.exports = SeekCommand;
