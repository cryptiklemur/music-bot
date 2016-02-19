const AbstractCommand = require('discord-bot-base').AbstractCommand;
const Parser          = require('../Parser');

class PlayingCommand extends AbstractCommand {
    static get name() {
        return 'Seek';
    }

    static get description() {
        return 'Seek in the current song';
    }

    initialize() {
        this.helper = this.container.get('helper.playback');
    }

    handle() {
        this.responds(/^seek ((?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d))$/, (matches) => {
            if (!this.container.get('helper.dj').isDJ(this.message.server, this.message.author)) {
                return;
            }

            if (!this.helper.isPlaying()) {
                return this.reply("No songs playing right now.");
            }

            let input   = matches[1],
                hours   = parseInt(matches[2] || 0),
                minutes = parseInt(matches[3] || 0),
                seconds = parseInt(matches[4]),
                total   = (hours * 60 * 60) + (minutes * 60) + seconds;

            this.helper.seek(total, () => {
                this.client.sendMessage(
                    this.message.channel,
                    `Seeking ${total} seconds ahead to: ${Parser.parseSeconds(total)}`
                );
            });
        });
    }
}

module.exports = PlayingCommand;
