const BaseAbstractCommand = require('discord-bot-base').AbstractCommand;

class AbstractCommand extends BaseAbstractCommand {
    initialize() {
        super.initialize();

        this.helper    = this.container.get('helper.playback');
        this.shortener = this.container.get('urlShortener');
        this.djHelper  = this.container.get('helper.dj');
        this.memory    = this.container.get('brain.memory');
        this.redis     = this.container.get('brain.redis');
    }

    isDJ() {
        return this.djHelper.isDJ(this.server, this.author)
    }
}

module.exports = AbstractCommand;
