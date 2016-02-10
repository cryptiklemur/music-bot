const AbstractCommand = require('discord-bot-base').AbstractCommand;
const Request         = require('../Model/Request');
const Song            = require('../Model/Song');
const Playlist        = require('../Model/Playlist');
const MessageHelper   = require('../Helper/MessageHelper');

class ApproveRequestCommand extends AbstractCommand {
    static get name() { return 'requests'; }

    static get description() { return 'List all requests'; }

    initialize() {
        this.helper = new MessageHelper(this.client, this.message);
    }

    handle() {
        if (!this.helper.isDJ()) {
            return false;
        }

        this.responds(/^approve ([A-Za-f\d]{24}) ([\w\d_\-]+)/, matches => {
            let id       = matches[1],
                playlist = matches[2];

            Request.findOne({_id: id}, (error, request) => {
                if (error) {
                    this.reply("I couldn't find that request.");

                    return this.logger.error(error);
                }

                Playlist.findOne({name: playlist}, (error, playlist) => {
                    if (error) {
                        this.reply("I couldn't find that playlist.");

                        return this.logger.error(error);
                    }

                    playlist.songs.push({
                        name:      request.name,
                        author:    request.author,
                        thumbnail: request.thumbnail,
                        link:      request.link,
                        user:      request.user
                    });

                    playlist.save(error => {
                        if (error) {
                            this.reply('Playlist could not be saved.');
                            return this.logger.error(error);
                        }

                        console.log(error);
                        console.log(playlist);

                        request.remove();
                        this.sendMessage(
                            this.message.channel,
                            `**${request.name}** has been approved, and added to the **${playlist.name}** playlist.`
                        );
                    });
                })
            })
        })
    }
}

module.exports = ApproveRequestCommand;
