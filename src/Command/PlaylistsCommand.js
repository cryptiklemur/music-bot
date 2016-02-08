const AbstractCommand = require('discord-bot-base').AbstractCommand;
const Playlist = require('../Model/Playlist');

class PlaylistsCommand extends AbstractCommand {
    static get name() { return 'playlists'; }

    static get description() { return 'Shows information on all of the playlists'; }

    initialize() {
        this.brain = this.container.get('brain.mongo');
    }

    handle() {
        this.responds(/^playlists$/, () => {
            Playlist.find({}, (err, playlists) => {
                if (err) { this.logger.error(err); }

                if (playlists.length === 0) {
                    return this.reply("There are currently no playlists.");
                }

                let message = `There are currently ${playlists.length} playlists: \n\n`;
                playlists.forEach((playlist, index) => {
                    let user = this.client.users.get('id', playlist.user);

                    if (message.length >= 1800) {
                        this.sendMessage(this.message.channel, message);
                        message = '';
                    }

                    message += `\`${index+1}.\` **${playlist.name}** by **${user.name}**\n`;
                });

                this.sendMessage(this.message.channel, message);
            });
        })
    }
}

module.exports = PlaylistsCommand;
