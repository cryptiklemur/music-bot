const AbstractCommand = require('../AbstractCommand');

class QueueCommand extends AbstractCommand {
    static get name() {
        return 'queue';
    }

    static get description() {
        return 'Shows the current queue';
    }

    handle() {
        this.responds(/^queue$/, () => {
            if (!this.helper.isPlaying()) {
                return this.reply("No playlist is playing right now.");
            }

            this.reply(this.helper.getQueueText());
        });
    }
}

module.exports = QueueCommand;
