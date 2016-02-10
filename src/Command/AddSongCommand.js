const AbstractCommand = require('discord-bot-base').AbstractCommand;
const Playlist        = require('../Model/Playlist');
const Song            = require('../Model/Song');
const ytdl            = require('youtube-dl');

// Taken from: https://gist.github.com/dperini/729294
const regex = /^add ([\w\d_\-]+) ((?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*))?$/i;

class AddSongCommand extends AbstractCommand {
    static get name() { return 'add'; }

    static get description() { return 'Adds the given song, to the given playlist'; }

    static get help() { return 'Run this with a playlist name to and a song link, to add the song to the playlist'; }

    initialize() {
        this.shortener = this.container.get('urlShortener');
    }

    handle() {
        this.responds(/^add$/, () => {
            this.reply(AddSongCommand.help);
        });

        this.responds(regex, matches => {
            let name = matches[1],
                url  = matches[2];



            Playlist.findOne({name: name}, (err, playlist) => {
                if (err) { this.logger.error(err); }

                if (!playlist) {
                    return this.reply("Could not find playlist with that name.");
                }

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

                    for (let index in songs) {
                        if (!songs.hasOwnProperty(index)) {
                            continue;
                        }

                        this.addSong(songs.length, name, songs[index]);
                    }

                    if (songs.length > 1) {
                        this.sendMessage(
                            this.message.channel,
                            `You have added **${songs.length}** songs to **${name}**.`
                        );
                    }
                });
            });
        })
    }

    addSong(count, playlistName, info) {
        Playlist.findOne({name: playlistName}, (err, playlist) => {
            if (err || !playlist) { this.logger.error(err); return }

            Playlist.findOne({name: playlist.name, 'songs.name': info.title}, (err, song) => {
                if (song) {
                    if (count === 1) {
                        this.sendMessage(this.message.channel, "Song already added.");
                    }

                    return false;
                }

                playlist.songs.push({
                    name:      info.title,
                    thumbnail: info.thumbnail,
                    link:      info.webpage_url,
                    duration:  info.duration,
                    user:      this.message.author.id
                });

                playlist.save(error => {
                    if (error) {
                        if (count === 1) {
                            this.sendMessage(this.message.channel, "There was an issue adding that song.");
                        }

                        this.logger.error(error);
                        console.trace(error);

                        return false;
                    }

                    this.shortener.shorten(info.webpage_url, (error, shortUrl) => {
                        if (error) {
                            console.trace(error);
                            return this.logger.error(error);
                        }

                        let index                  = playlist.songs.findIndex(song => song.name === info.title);
                        playlist.songs[index].link = shortUrl;
                        playlist.save(error => {
                            if (error) {
                                this.logger.error(error);
                                console.log(error);
                            }
                        });
                    });

                    if (count == 1) {
                        this.sendMessage(
                            this.message.channel,
                            `You have added **${info.title}** to **${playlist.name}**.`
                        );
                    }
                });
            });
        });
    }
}

module.exports = AddSongCommand;
