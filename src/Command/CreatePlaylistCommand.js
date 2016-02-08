const AbstractCommand = require('discord-bot-base').AbstractCommand;
const Playlist        = require('../Model/Playlist');
const MessageHelper   = require('../Helper/MessageHelper');

class CreatePlaylistCommand extends AbstractCommand {
    static get name() { return 'create'; }

    static get description() { return 'Creates a playlist with the given name.'; }

    static get help() { return 'Run this command with a name, to create a playlist. e.g. `create awesome_playlist`'}

    initialize() {
        this.helper = new MessageHelper(this.client, this.message);
        this.brain  = this.container.get('brain.mongo');
    }

    handle() {
        if (!this.helper.isDJ()) {
            return false;
        }

        this.responds(/^create$/, () => {
            this.reply(CreatePlaylistCommand.help);
        });

        this.responds(/^create ([\w\d_\-\s]+)$/, (matches) => {
            let name = matches[1];

            if (name.indexOf(' ') >= 0 || name.indexOf("\t") >= 0) {
                return this.reply("Playlist names cannot have a whitespace in them.");
            }

            Playlist.find({name: name}, (err, playlists) => {
                if (err) { this.logger.error(err); }

                if (playlists.length > 0) {
                    return this.reply("A playlist with that name already exists.");
                }

                let playlist = (new Playlist({name: name, user: this.message.author.id})).save();

                this.reply(`The playlist \`${name}\` has been created.`);
            });
        })
    }
}

module.exports = CreatePlaylistCommand;
