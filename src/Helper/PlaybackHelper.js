const slug      = require('slug');
const fs        = require('fs');
const youtubedl = require('youtube-dl');
const _         = require('lodash');

class PlaybackHelper {
    get playing() { return this._playing || false; }

    set playing(value) { this._playing = value; }

    get channel() { return this._channel; }

    set channel(value) { this._channel = value; }

    constructor(client, logger, brain, dir, volume) {
        this.client  = client;
        this.logger  = logger;
        this.brain   = brain;
        this.dir     = dir;
        this.current = -1;
        this.volume  = volume;

        this.stream = null;
    }

    isPlaying() {
        return this.playing !== false;
    }

    buildQueue(playlist) {
        this.brain.get('queue.' + playlist.name, (error, results) => {
            if (error) {
                this.reply("There was an error building the queue.");

                return this.logger.error(error);
            }

            this.queue = results === null || results === undefined ? playlist.songs : JSON.parse(results);

            this.nextInQueue();
        })
    }

    nextInQueue() {
        this.playing = false;

        this.current++;
        if (!this.running) {
            this.current = 0;
            return;
        }

        if (this.queue[this.current] === undefined) {
            this.current = 0;
        }

        this.downloadAndPlay(this.current);
    }

    downloadAndPlay(index) {
        let song     = this.queue[index],
            name     = slug(song.name.toLowerCase()),
            filename = this.dir + '/' + name + '.cache';

        let user = this.client.users.get('id', song.user);

        this.client.setStatus('online', song.name);
        this.client.sendMessage(this.channel, `Now playing **${song.name}**. Requested by **${user.name}**`);
        this.playing = song;

        this.queue[index].playing = true;
        fs.stat(filename, error => {
            if (error === null) {
                return this.play(song, filename);
            }

            let video = youtubedl(song.link, ['--format=bestaudio'], {cwd: this.dir});
            video.pipe(fs.createWriteStream(filename));

            let size = 0, pos = 0;
            video.on('info', (info) => {
                size = info.size;
                this.logger.info("Song started downloading");
                this.client.setStatus('idle', "Downloading: \n" + song.name);
            });

            video.on('data', (chunk) => {
                pos += chunk.length;

                if (size) {
                    let percent = (pos / size * 100).toFixed(2);
                    this.logger.debug("Download status: " + percent + "%");
                }
            });

            video.on('end', () => {
                this.logger.info("Song finished downloading");
                this.play(song, filename);
            });
        })
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

    play(song, filename) {
        if (this.client.voiceConnection === null) {
            return this.client.reconnect(this.play.bind(this, filename));
        }

        this.client.voiceConnection.playFile(filename, {}, (error, stream) => {
            this.client.setStatus('online', song.name);
            this.logger.info("Playing " + filename);

            if (error) {
                this.logger.error(error);

                return this.client.sendMessage(this.channel, "There was an issue playing the current song.");
            }

            stream.on('end', (error) => {
                this.logger.log(error);

                this.nextInQueue();
            })
        });
    }
}

module.exports = PlaybackHelper;