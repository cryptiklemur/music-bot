const AbstractCommand = require('../AbstractCommand'),
      Playlist        = require('../Model/Playlist'),
      PER_PAGE        = 15;

class PlaylistCommand extends AbstractCommand {
    static get name() {
        return 'playlist';
    }

    static get description() {
        return 'Shows information on the given playlists';
    }

    static get help() {
        return 'Run this with a playlist name to get information about the playlist';
    }

    handle() {
        this.responds(/^playlist$/, () => {
            this.reply(PlaylistCommand.help);
        });

        this.responds(/^playlist ([\w\d_\-]+)\s?(\d+)?$/, matches => {
            let name = matches[1],
                page = matches[2] !== undefined ? parseInt(matches[2]) : 1;

            Playlist.findOne({name: name}, (err, playlist) => {
                if (err) {
                    this.logger.error(err);
                }

                if (!playlist) {
                    return this.reply("Could not find playlist with that name.");
                }

                let message = `There are currently ${playlist.songs.length} songs in this playlist: \n`,
                    pages   = playlist.songs.length % PER_PAGE === 0
                        ? playlist.songs.length / PER_PAGE
                        : Math.floor(playlist.songs.length / PER_PAGE) + 1;

                if (pages > 1) {
                    message += `Page **${page} / ${pages}**:\n`;
                }

                message += "\n";

                let delay = 0;
                for (let index = PER_PAGE * (page - 1); index < (PER_PAGE * page); index++) {
                    let song = playlist.songs[index], user;
                    if (song === undefined) {
                        break;
                    }

                    user = this.client.users.get('id', song.user);

                    if (message.length >= 1800) {
                        delay += 50;
                        this.reply(message, delay);
                        message = '';
                    }

                    message += `\`${index + 1}.\` **${song.name}** added by **${user.name}**\n`;
                }

                if (pages > 1) {
                    message += "\n";
                    if (page < pages) {
                        message += `To show the next page, type \`${this.prefix}playlist ${playlist.name} ${page + 1}\``;
                    }
                    if (page < pages && page > 1) {
                        message += "\n";
                    }
                    if (page > 1) {
                        message += `To show the previous page, type \`${this.prefix}playlist ${playlist.name} ${page - 1}\``;
                    }
                }
                message += "\n";

                this.reply(message, delay + 50);
            });
        })
    }
}

module.exports = PlaylistCommand;
