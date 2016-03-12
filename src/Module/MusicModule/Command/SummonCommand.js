const AbstractCommand = require('../AbstractCommand');

class SummonCommand extends AbstractCommand {
    static get name() {
        return 'summon';
    }

    static get description() {
        return 'Summons the bot to the users channel';
    }

    static get adminCommand() {
        return true;
    }

    handle() {
        this.responds(/^summon$/, () => {
            if (!this.isDJ) {
                return;
            }

            this.client.joinVoiceChannel(this.message.author.voiceChannel, error => {
                if (error) {
                    this.reply("Couldn't join your channel.", 0, 5000);

                    return this.logger.error(error);
                }

                this.reply("I've joined your voice channel", 0, 5000)
            });
        });
    }
}

module.exports = SummonCommand;
