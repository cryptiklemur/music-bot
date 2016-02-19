const AbstractCommand = require('discord-bot-base').AbstractCommand;
const Playlist        = require('../Model/Playlist');

class ClearPlaylistCommand extends AbstractCommand {
    static get name() { return 'clear'; }

    static get description() { return 'Clears a playlist with the given name.'; }

    static get help() { return 'Run this command with a name, to clear a playlist. e.g. `clear awesome_playlist`'}

    handle() {

        this.responds(/^clear$/, () => {
            this.reply(ClearPlaylistCommand.help);
        });

        this.responds(/^clear ([\w\d_\-]+)$/, (matches) => {
            if (!this.container.get('helper.dj').isDJ(this.message.server, this.message.author)) {
                return;
            }

            let name = matches[1];

            Playlist.findOne({name: name}, (err, playlist) => {
                if (err) { this.logger.error(err); }

                if (!playlist) {
                    return this.reply("A playlist with that name doesn't exists.");
                }

                playlist.songs = [];
                playlist.save(error => {
                    if (error) {
                        this.reply("There was an error saving this playlist. Check the console.");
                        this.logger.error(error);

                        return;
                    }

                    this.reply(`The playlist \`${name}\` has been cleared.`);
                });
            });
        })
    }
}

module.exports = ClearPlaylistCommand;
