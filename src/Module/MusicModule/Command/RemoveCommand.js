const AbstractCommand = require('../AbstractCommand'),
      Playlist        = require('../Model/Playlist');

class RemoveCommand extends AbstractCommand {
    static get name() {
        return 'remove';
    }

    static get description() {
        return 'Removes a playlist, or a song from a playlist';
    }

    static get help() {
        return 'Pass a playlist name to remove a playlist, or a playlist name and a song index to remove a song.';
    }

    static get adminCommand() {
        return true;
    }

    handle() {
        this.responds(/^remove$/, () => {
            this.reply(RemoveCommand.help);
        });

        this.responds(/^remove ([\w\d_\-]+)$/, (matches) => {
            if (!this.isDJ) {
                return;
            }

            let name = matches[1];

            Playlist.findOne({name: name}, (err, playlist) => {
                if (err) {
                    this.logger.error(err);
                }

                if (!playlist) {
                    return this.reply("A playlist with that name doesn't exists.");
                }

                playlist.remove();

                this.reply(`The playlist **${name}** has been deleted.`);
            });
        });

        this.responds(/^remove ([\w\d_\-]+) (\d+)$/, (matches) => {
            if (!this.isDJ) {
                return;
            }

            let name  = matches[1],
                index = matches[2] - 1;

            Playlist.findOne({name: name}, (err, playlist) => {
                if (err) {
                    this.logger.error(err);
                }

                if (!playlist) {
                    return this.reply("A playlist with that name doesn't exists.");
                }

                if (playlist.songs[index] === undefined) {
                    return this.reply("No song with that index exists")
                }

                let song = playlist.songs[index];
                playlist.songs.splice(index, 1);
                playlist.save();

                this.reply(`The song **${song.name}** has been deleted from **${playlist.name}**.`);
            });
        });
    }
}

module.exports = RemoveCommand;
