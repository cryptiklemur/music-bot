const AbstractCommand = require('discord-bot-base').AbstractCommand;
const Playlist        = require('../Model/Playlist');

class PlayCommand extends AbstractCommand {
    static get name() { return 'play'; }

    static get description() { return 'Plays the given playlost'; }

    static get help() { return 'Run this with a playlist name to get play the playlist'; }

    initialize() {
        this.helper = this.container.get('helper.playback');
    }

    handle() {
        if (!this.container.get('helper.dj').isDJ(this.message.server, this.message.author)) {
            return;
        }

        this.responds(/^play$/, () => {
            this.reply(PlayCommand.help);
        });

        this.responds(/^play ([\w\d_\-]+)$/, matches => {
            if (this.helper.isPlaying()) {
                return this.reply("I am already playing music!");
            }

            this.helper.running = true;
            this.helper.channel = this.message.channel;

            let name = matches[1];
            Playlist.findOne({name: name}, (err, playlist) => {
                if (err) { this.logger.error(err); }

                if (!playlist) {
                    return this.reply("Could not find playlist with that name.");
                }

                this.voice = this.client.voiceConnection;
                if (!this.voice) {
                    return this.reply("I'm not connected to a voice channel. Summon me first.");
                }

                this.helper.buildQueue(playlist);
            });
        })
    }
}

module.exports = PlayCommand;
