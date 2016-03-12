const AbstractCommand = require('../AbstractCommand'),
      Request         = require('../Model/Request');

// Taken from: https://gist.github.com/dperini/729294
const urlRegex = /^request ((?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*))?$/i;

class RequestCommand extends AbstractCommand {
    static get name() {
        return 'request';
    }

    static get description() {
        return 'Request a song to be added to a playlist';
    }

    static get help() {
        return 'Run this command with a link to request it.';
    }

    handle() {
        this.responds(/^request$/, () => {
            this.reply(RequestCommand.help);
        });

        this.responds(urlRegex, matches => {
            let url = matches[1];

            this.reply(
                "Fetching information. If this is a playlist, it could take a bit.", (error, message) => {
                    this.fetchingMessage = message;
                }
            );

            this.helper.download(url, this.requestSongs.bind(this));
        })
    }

    requestSongs(songs) {
        let requests = songs.map(this.requestSong.bind(this));
        Promise.all(requests).then((values) => {
            this.client.deleteMessage(this.fetchingMessage);

            let errors = values.filter(err => err !== undefined);
            if (errors) {
                this.reply(errors.join("\n"));

                if (errors.length === songs.length) {
                    return;
                }
            }

            let added = songs.length - errors.length;
            this.reply(
                `You have requested **${added}** song${added == 1 ? 's' : ''}.`
            );
        }).catch(this.logger.error);
    }

    requestSong(song) {
        return new Promise(resolve => {
            Request.findOne({name: song.title}, (err, result) => {
                if (result) {
                    return resolve(`**${song.title}** already added/requested.`);
                }

                let request = new Request({
                    name:      song.title,
                    thumbnail: song.thumbnail,
                    link:      song.webpage_url,
                    duration:  song.duration,
                    user:      this.author.id
                });

                this.shortener.shorten(song.webpage_url, (error, shortUrl) => {
                    request.link = shortUrl;
                    request.save(error => {
                        if (error) {
                            return resolve(`There was an issue requesting **${song.title}**.`);
                        }

                        resolve();
                    });
                });
            });
        });
    }
}

module.exports = RequestCommand;
