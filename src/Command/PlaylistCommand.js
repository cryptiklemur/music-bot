const AbstractCommand = require('discord-bot-base').AbstractCommand;
const Playlist        = require('../Model/Playlist');

class PlaylistCommand extends AbstractCommand {
    static get name() { return 'playlist'; }

    static get description() { return 'Shows information on the given playlists'; }

    static get help() { return 'Run this with a playlist name to get information about the playlist'; }

    initialize() {
        this.brain = this.container.get('brain.mongo');
    }

    handle() {
        this.responds(/^playlist$/, () => {
            this.reply(PlaylistCommand.help);
        });

        this.responds(/^playlist ([\w\d_\-]+)$/, matches => {
            let name = matches[1];
            Playlist.findOne({name: name}, (err, playlist) => {
                if (err) { this.logger.error(err); }

                if (!playlist) {
                    return this.reply("Could not find playlist with that name.");
                }

                let message = `There are currently ${playlist.songs.length} songs in this playlist: \n\n`;
                playlist.songs.forEach((song, index) => {
                    let user = this.client.users.get('id', song.user);

                    if (message.length >= 1800) {
                        this.sendMessage(this.message.channel, message);
                        message = '';
                    }

                    message += `\`${index + 1}.\` **${song.name}** added by **${user.name}**\n`;
                });

                this.sendMessage(this.message.channel, message);
            });
        })
    }
}

module.exports = PlaylistCommand;
