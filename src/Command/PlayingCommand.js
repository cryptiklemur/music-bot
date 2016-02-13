const AbstractCommand = require('discord-bot-base').AbstractCommand;
const Parser          = require('../Parser');

class PlayingCommand extends AbstractCommand {
    static get name() { return 'playing'; }

    static get description() { return 'Shows the current playing song'; }

    initialize() {
        this.helper = this.container.get('helper.playback');
    }

    handle() {
        this.responds(/^playing$/, () => {
            if (!this.helper.isPlaying()) {
                return this.reply("No songs playing right now.");
            }

            let voice = this.client.voiceConnection;
            if (!voice) {
                return this.reply("I'm not connected to a voice channel. Summon me first.");
            }

            let time = Parser.parseMilliseconds(this.helper.getCurrentTime(true)),
                song = this.helper.playing;

            console.log(song.duration, Parser.parseSeconds(song.duration));
            this.reply(`Now Playing: **${song.name}** \`[${time} / ${Parser.parseSeconds(song.duration)}]\` - ${song.link}`);
        });
    }
}

module.exports = PlayingCommand;
