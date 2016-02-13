const AbstractCommand = require('discord-bot-base').AbstractCommand;

class SummonCommand extends AbstractCommand {
    static get name() { return 'summon'; }

    static get description() { return 'Summons the bot to the users channel'; }

    handle() {
        if (!this.container.get('helper.dj').isDJ(this.message.server, this.message.author)) {
            return;
        }

        this.responds(/^summon$/, () => {
            this.client.joinVoiceChannel(this.message.author.voiceChannel, error => {
                if (error) {
                    this.reply("Couldn't join your channel.");
                    console.log(error);
                    this.logger.error(error);
                }
            });
        });
    }
}

module.exports = SummonCommand;
