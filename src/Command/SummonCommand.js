const AbstractCommand = require('discord-bot-base').AbstractCommand;
const Playlist        = require('../Model/Playlist');

class SummonCommand extends AbstractCommand {
    static get name() { return 'summon'; }

    static get description() { return 'Summons the bot to the users channel'; }

    handle() {
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
