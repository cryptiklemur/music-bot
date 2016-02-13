const AbstractCommand = require('discord-bot-base').AbstractCommand;
const Parser          = require('../Parser');

class QueueCommand extends AbstractCommand {
    static get name() {
        return 'queue';
    }

    static get description() {
        return 'Shows the current queue';
    }

    initialize() {
        this.helper = this.container.get('helper.playback');
    }

    handle() {
        this.responds(/^queue$/, () => {
            if (!this.helper.isPlaying()) {
                return this.reply("No playlist is playing right now.");
            }

            let message = this.helper.getQueueText();

            this.client.sendMessage(this.message.channel, message);
        });
    }
}

module.exports = QueueCommand;
