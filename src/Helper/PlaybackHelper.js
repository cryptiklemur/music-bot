const slug      = require('slug');
const fs        = require('fs');
const youtubedl = require('youtube-dl');

class PlaybackHelper {
    get playing() { return this._playing || false; }

    set playing(value) { this._playing = value; }

    get channel() { return this._channel; }

    set channel(value) { this._channel = value; }

    constructor(client, logger, brain, dir) {
        this.client = client;
        this.logger = logger;
        this.brain  = brain;
        this.dir    = dir;

        this.current = -1;
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
                return this.play(filename);
            }

            let video = youtubedl(song.link, ['--format=bestaudio'], {cwd: this.dir});
            video.pipe(fs.createWriteStream(filename));

            video.on('info', () => {
                console.log("Song started downloading");
                this.logger.info("Song started downloading");
            });

            video.on('complete', () => {
                console.log("Song finished downloading");
                this.logger.info("Song finished downloading");
                this.play(filename);
            });
        })
    }

    play(filename) {
        console.log("Playing " + filename);
        this.logger.info("Playing " + filename);

        this.client.voiceConnection.playFile(filename, {}, (error, stream) => {
            if (error) {
                console.log(error);

                return this.client.sendMessage(this.channel, "There was an issue playing the current song.");
            }

            stream.on('end', (error) => {
                console.log(error);

                this.nextInQueue();
            })
        });
    }
}

module.exports = PlaybackHelper;