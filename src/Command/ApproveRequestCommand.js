const AbstractCommand = require('discord-bot-base').AbstractCommand;
const Request         = require('../Model/Request');
const Song            = require('../Model/Song');
const Playlist        = require('../Model/Playlist');

class ApproveRequestCommand extends AbstractCommand {
    static get name() { return 'approve'; }

    static get description() { return 'Approves the given request'; }

    handle() {
        this.responds(/^approve ([A-Za-f\d]{24}) ([\w\d_\-]+)/, matches => {
            if (!this.container.get('helper.dj').isDJ(this.message.server, this.message.author)) {
                return;
            }

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

                        request.remove();

                        let user = this.client.users.get('id', request.user);
                        if (!user) {
                            user = this.client.admin;
                        }

                        this.sendMessage(user, `**${request.name}** has been accepted into **${playlist.name}**.`);
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
