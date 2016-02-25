const slug         = require('slug');
const fs           = require('fs');
const youtubedl    = require('youtube-dl');
const _            = require('lodash');
const Playlist     = require('../Model/Playlist');
const child        = require('child_process');
const Parser       = require('../Parser');

class PlaybackHelper {
    get playing() {
        return this._playing || false;
    }

    set playing(value) {
        this._playing = value;
    }

    get channel() {
        return this._channel;
    }

    set channel(value) {
        this._channel = value;
    }

    constructor(dispatcher, client, logger, redis, brain, dir, volume, removeAfterSkips) {
        this.dispatcher       = dispatcher;
        this.client           = client;
        this.logger           = logger;
        this.redis            = redis;
        this.brain            = brain;
        this.dir              = dir;
        this.current          = -1;
        this.volume           = volume;
        this.removeAfterSkips = removeAfterSkips;

        this.stream = null;

        this.skip               = this.skip.bind(this);
        this.nextInQueue        = this.nextInQueue.bind(this);
        this.setQueueChannel    = this.setQueueChannel.bind(this);
        this.updateQueueChannel = this.updateQueueChannel.bind(this);

        this.dispatcher.on('play', this.updateQueueChannel);
    }

    setQueueChannel(id) {
        this.redis.set('music-bot-queue', id);
        this.dispatcher.removeListener('play', this.updateQueueChannel);
        this.dispatcher.on('play', this.updateQueueChannel);
        this.updateQueueChannel();
    }

    updateQueueChannel() {
        this.redis.get('music-bot-queue', (err, id) => {
            if (err || !id) {
                clearTimeout(this.queueTimeout);
                this.queueTimeout = setTimeout(this.updateQueueChannel, 5000);

                return this.logger.error('updateQueueChannel error: ', err, id);
            }
            let channel = this.channel.server.channels.get('id', id);

            this.client.getChannelLogs(channel, 50, {}, (error, messages) => {
                if (messages.length > 1) {
                    for (let i = 1; i < messages.length; i++) {
                        this.client.deleteMessage(messages[i]);
                    }
                }

                if (messages.length > 0) {
                    this.client.updateMessage(messages[0], this.getQueueText());
                } else {
                    this.client.sendMessage(channel, this.getQueueText());
                }
                clearTimeout(this.queueTimeout);
                this.queueTimeout = setTimeout(this.updateQueueChannel, 5000);
            });
        });
    }

    getQueueText() {
        let time    = Parser.parseMilliseconds(this.getCurrentTime(true)),
            current = this.playing,
            message = `Playing the **${this.playlist.name}** playlist.\n\nNow Playing: **${current.name}**\n\`[${time} / ${Parser.parseSeconds(current.duration)}]\` - *${current.link}*\n\n`;

        let added = 0;
        for (let index = this.current + 1; index < this.queue.length; index++) {
            if (message.length > 1800) {
                break;
            }

            if (index >= this.queue.length) {
                index = 0;
            }

            let song = this.queue[index],
                user = this.client.users.get('id', song.user);

            message += `\`${added + 1}.\` **${song.name}** added by **${user.username}**\n`;
            added++;
        }

        if (added < this.queue.length - 1) {
            message += `\nAnd *${this.queue.length - added}* more songs.`;
        }

        return message;
    }

    isPlaying() {
        return this.playing !== false;
    }

    buildQueue(playlist) {
        this.playlist = playlist;
        this.brain.get('queue.' + playlist.name, (error, results) => {
            if (error) {
                this.reply("There was an error building the queue.");

                return this.logger.error(error);
            }

            this.queue = results === null || results === undefined ? playlist.songs : JSON.parse(results);

            this.nextInQueue();
        })
    }

    skip(track) {
        if (track === undefined) {
            track = true;
        }

        if (track) {
            Playlist.findOne({name: this.playlist.name}, (err, playlist) => {
                let index = playlist.songs.findIndex(song => song.name == this.queue[this.current].name);
                if (!playlist.songs[index].skips) {
                    playlist.songs[index].skips = 0;
                }

                playlist.songs[index].skips++;

                if (playlist.songs[index].skips > this.removeAfterSkips) {
                    playlist.songs.splice(index, 1);
                    this.queue.splice(this.current, 1);

                    this.client.sendMessage(this.channel, 'This song has been removed after being skipped too many times.');
                }

                playlist.save();
            });
        }

        this.stopPlaying(this.nextInQueue);
    }

    nextInQueue() {
        if (this.isPlaying()) {
            this.stopPlaying();
        }

        this.current++;
        if (!this.running) {
            this.current = 0;
            return;
        }

        if (this.queue[this.current] === undefined) {
            this.current = 0;
        }

        let song     = this.getCurrentSong(),
            name     = slug(song.name.toLowerCase()),
            filename = this.dir + '/' + name + '.cache';


        fs.stat(filename, error => {
            if (error === null) {
                return this.play(song);
            }

            this.download(song.link, songs => this.play(song));
        });
    }

    getCurrentSong() {
        return this.queue[this.current];
    }

    getLinks(link, callback) {
        child.execFile(
            __dirname + '/../../node_modules/youtube-dl/bin/youtube-dl',
            ['--format=bestaudio', '-i', '-J', '--yes-playlist', link],
            {maxBuffer: 10000 * 1024},
            (err, stdout, stderr) => {
                callback(JSON.parse(stdout));
            }
        );
    }

    download(link, callback) {
        this.logger.info("Fetching link info for " + link);
        this.getLinks(link, (json) => {
            let items = Array.isArray(json.entries) ? json.entries : [json];

            this.logger.info(`Downloading ${items.length} songs`);
            let requests = items.map(song => {
                if (!song) {
                    return;
                }

                this.logger.info("Creating promise for " + song.title);

                return new Promise(resolve => {
                    let video    = youtubedl(song.webpage_url, ['--format=bestaudio'], {
                            maxBuffer: 10000 * 1024,
                            cwd:       this.dir
                        }),
                        filename = this.dir + '/' + slug(song.title.toLowerCase()) + '.cache';
                    video.pipe(fs.createWriteStream(filename));
                    this.logger.info("Song started downloading: " + filename);
                    this.client.setStatus('online', "Downloading: " + song.title);

                    video.on('error', error => {
                        this.client.sendMessage(
                            this.channel,
                            `There was an error downloading **${song.title}** from the link provided.`
                        );

                        this.logger.error(error);
                        resolve(null);
                    });

                    video.on('end', () => {
                        this.logger.info("Song finished downloading");
                        resolve(song);
                    });
                })
            });

            Promise.all(requests).then(songs => {
                songs = songs.filter(song => song !== null);

                this.logger.log(`Downloaded ${songs.length} songs`);
                callback(songs);
            }).catch(this.logger.error)
        });
    }

    play(song, seek, callback) {
        let name     = slug(song.name.toLowerCase()),
            filename = this.dir + '/' + name + '.cache';

        seek = seek || 0;
        this.client.voiceConnection.playFile(filename, {volume: this.volume, seek: seek}, (error, stream) => {
            this.dispatcher.emit('play', song);

            this.seekVal = seek > 0 ? seek : false;

            let user = this.client.users.get('id', song.user);

            let playMessage;
            this.client.sendMessage(
                this.channel,
                `Now playing **${song.name}**. Requested by **${user.name}**`,
                (error, message) => {
                    playMessage = message;
                }
            );

            this.client.setStatus('online', song.name);
            this.logger.info("Playing " + song.name + ' - ' + filename);

            this.stream  = stream;
            this.playing = song;

            if (error) {
                this.logger.error(error);

                return this.client.sendMessage(this.channel, "There was an issue playing the current song.");
            }

            this.stream.on('end', this.nextInQueue);
            this.stream.on('end', () => this.client.deleteMessage(playMessage));

            callback();
        });
    }

    setVolume(volume) {
        if (!this.isPlaying()) {
            throw new Error("Not playing a song.");
        }
        volume = volume / 100;

        if (volume > 1) {
            volume = 1;
        }
        if (volume < 0) {
            volume = 0;
        }

        this.client.voiceConnection.setVolume(volume);
    }

    getVolume() {
        if (!this.isPlaying()) {
            throw new Error("Not playing a song.");
        }

        return this.client.voiceConnection.getVolume() * 100;
    }

    getCurrentTime(inMs) {
        inMs     = inMs === undefined ? false : inMs;
        let time = parseInt(this.client.voiceConnection.streamTime / 1000);

        if (this.seekVal !== false) {
            time += parseInt(this.seekVal);
        }

        return time * (inMs ? 1000 : 1);
    }

    seek(seconds, callback) {
        if (this.isPlaying()) {
            this.stopPlaying();
        }

        let song     = this.queue[this.current],
            name     = slug(song.name.toLowerCase()),
            filename = this.dir + '/' + name + '.cache';

        this.play(song, filename, seconds, callback);
    }

    pause(callback) {
        this.lastPlaytime = this.getCurrentTime();
        this.stopPlaying(callback);
    }

    resume(callback) {
        this.seek(this.lastPlaytime, callback);
    }

    stopPlaying(callback) {
        this.playing = false;
        this.stream.removeListener('end', this.nextInQueue);
        this.client.setStatus('online', null);
        if (this.client.voiceConnection !== null) {
            this.client.voiceConnection.stopPlaying();
        }

        if (callback !== undefined) {
            callback();
        }
    }
}

module.exports = PlaybackHelper;