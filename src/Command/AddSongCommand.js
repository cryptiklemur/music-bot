const AbstractCommand = require('discord-bot-base').AbstractCommand;
const Playlist        = require('../Model/Playlist');
const Song            = require('../Model/Song');

// Taken from: https://gist.github.com/dperini/729294
const regex = /^add ([\w\d_\-]+) ((?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*))?$/i;

class AddSongCommand extends AbstractCommand {
    static get name() {
        return 'add';
    }

    static get description() {
        return 'Adds the given song, to the given playlist';
    }

    static get help() {
        return 'Run this with a playlist name to and a song link, to add the song to the playlist';
    }

    initialize() {
        this.helper    = this.container.get('helper.playback');
        this.shortener = this.container.get('urlShortener');
    }

    handle() {
        if (!this.container.get('helper.dj').isDJ(this.message.server, this.message.author)) {
            return;
        }

        this.responds(/^add$/, () => {
            this.reply(AddSongCommand.help);
        });

        this.responds(regex, matches => {
            let name = matches[1],
                url  = matches[2];

            Playlist.findOne({name: name}, (err, playlist) => {
                if (err) {
                    this.logger.error(err);
                }

                if (!playlist) {
                    return this.reply("Could not find playlist with that name.");
                }

                this.client.sendMessage(
                    this.message.channel,
                    "Fetching information. If this is a playlist, it could take a bit.", (error, message) => {
                        this.fetchingMessage = message;
                    }
                );

                this.helper.download(url, this.addSongs.bind(this, playlist));
            });
        });
    }

    addSongs(playlist, songs) {
        let requests = songs.map(this.addSong.bind(this, playlist));
        Promise.all(requests).then((values) => {
            this.client.deleteMessage(this.fetchingMessage);

            let errors = values.filter(err => err !== undefined);
            if (errors) {
                this.client.sendMessage(this.message.channel, errors.join("\n"));

                if (errors.length === songs.length) {
                    return;
                }
            }

            playlist.save(error => {
                if (error) {
                    this.client.sendMessage(this.message.channel, 'There was an issue adding your songs.');
                    this.logger.error(error);

                    return false;
                }

                let added = songs.length - errors.length;
                this.client.sendMessage(
                    this.message.channel,
                    `You have added **${added}** song${added == 1 ? 's' : ''} to **${playlist.name}**,`
                );
            })
        }).catch(this.logger.error);
    }


    addSong(playlist, info) {
        return new Promise(resolve => {
            if (!info) {
                resolve();
            }

            this.logger.debug(`Adding ${info.title} to ${playlist.name}`);

            if (playlist.songs.find(song => song.link === info.webpage_url)) {
                this.logger.debug(`Song already added: **${info.title}**`);

                return resolve(`Song already added: **${info.title}**`);
            }

            playlist.songs.push({
                name:      info.title,
                thumbnail: info.thumbnail,
                link:      info.webpage_url,
                duration:  info.duration,
                user:      this.message.author.id
            });

            this.shortener.shorten(info.webpage_url, (error, shortUrl) => {
                if (error) {
                    resolve();

                    return this.logger.error(error);
                }

                let index                  = playlist.songs.findIndex(song => song.name === info.title);
                playlist.songs[index].link = shortUrl;

                resolve();
            });
        });
    }
}

module.exports = AddSongCommand;
