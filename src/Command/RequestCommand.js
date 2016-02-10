const AbstractCommand = require('discord-bot-base').AbstractCommand;
const Request         = require('../Model/Request');
const ytdl            = require('youtube-dl');

// Taken from: https://gist.github.com/dperini/729294
const urlRegex = /^request ((?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*))?$/i;

class RequestCommand extends AbstractCommand {
    static get name() { return 'request'; }

    static get description() { return 'Request a song to be added to a playlist'; }

    static get help() { return 'Run this command with a link to request it.'; }

    initialize() {
        this.shortener = this.container.get('urlShortener');
    }

    handle() {
        this.responds(/^request$/, () => {
            this.reply(RequestCommand.help);
        });

        this.responds(urlRegex, matches => {
            let url = matches[1];

            this.client.sendMessage(
                this.message.channel,
                "Fetching information. If this is a playlist, it could take a bit.", (error, message) => {
                    this.fetchingMessage = message;
                }
            );

            ytdl.getInfo(url, [], {maxBuffer: 1000 * 1024}, (err, info) => {
                let songs = Array.isArray(info) ? info : [info];

                this.client.deleteMessage(this.fetchingMessage, (err) => {
                    console.log(err);
                });

                songs.forEach(this.requestSong.bind(this, songs.length));

                if (songs.length > 1) {
                    this.sendMessage(
                        this.message.channel,
                        `You have requested to play ${songs.length} songs. A DJ will look at them shortly.`
                    );
                }
            });
        })
    }

    requestSong(count, song, index) {
        Request.findOne({name: song.title}, (err, result) => {
            if (result) {
                if (count === 1) {
                    this.sendMessage(
                        this.message.channel,
                        `**${song.title}** already added/requested.`
                    );
                }

                return false;
            }

            let request = new Request({
                name:      song.title,
                thumbnail: song.thumbnail,
                link:      song.webpage_url,
                duration:  song.duration,
                user:      this.message.author.id
            });

            request.save(error => {
                if (error) {
                    if (count === 1) {
                        this.sendMessage(
                            this.message.channel,
                            `There was an issue requesting **${song.title}**.`
                        );
                    }
                    this.logger.error(error);
                    console.log(error);

                    return false;
                }

                this.shortener.shorten(song.webpage_url, (error, shortUrl) => {
                    if (error) {
                        return this.logger.error(error);
                    }

                    request.link = shortUrl;
                    request.save(error => {
                        if (error) {
                            this.logger.error(error);
                            console.log(error);
                        }
                    });
                });


                if (count === 1) {
                    this.sendMessage(
                        this.message.channel,
                        "You have requested to play **" + song.title + "**. A DJ will look at it shortly."
                    );
                }
            });
        });
    }
}

module.exports = RequestCommand;
