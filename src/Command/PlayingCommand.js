const AbstractCommand = require('discord-bot-base').AbstractCommand;
const Playlist        = require('../Model/Playlist');
const slug            = require('slug');
const fs              = require('fs');
const youtubedl       = require('youtube-dl');

function parseMillisecondsIntoReadableTime(milliseconds) {
    //Get hours from milliseconds
    var hours           = milliseconds / (1000 * 60 * 60),
        absoluteHours   = Math.floor(hours),
        h               = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours,

        minutes         = (hours - absoluteHours) * 60,
        absoluteMinutes = Math.floor(minutes),
        m               = absoluteMinutes > 9 ? absoluteMinutes : '0' + absoluteMinutes,

        seconds         = (minutes - absoluteMinutes) * 60,
        absoluteSeconds = Math.floor(seconds),
        s               = absoluteSeconds > 9 ? absoluteSeconds : '0' + absoluteSeconds,
        time            = m + ':' + s;


    return (h != '00' ? h + ':' : '') + time;
}

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

            let time = parseMillisecondsIntoReadableTime(voice.streamTime),
                song = this.helper.playing;
            this.reply(`Now Playing: **${song.name}** \`[${time} / ${song.duration}]\` - ${song.link}`);
        });
    }
}

module.exports = PlayingCommand;
