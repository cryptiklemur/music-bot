const AbstractCommand = require('../AbstractCommand');

class PlayingCommand extends AbstractCommand {
    static get name() {
        return 'skip';
    }

    static get description() {
        return 'Votes to skip the current song';
    }

    handle() {
        this.responds(/^(skip|next)$/, (matches) => {
            if (!this.helper.isPlaying()) {
                return this.reply("No songs playing right now.");
            }

            if (this.container.get('helper.dj').isDJ(this.message.server, this.message.author)) {
                this.sendMessage(this.message.channel, "Skipped the current song.");
                setTimeout(this.helper.skip.bind(this.helper, matches[1] === 'next'), 500);
            } else {
                this.memory.get('skip.' + this.helper.playlist.name, (err, results) => {
                    let skips = !results ? [] : results;
                    if (skips.find(id => this.message.author.id == id)) {
                        return;
                    }

                    skips.push(this.message.author.id);
                    console.log(skips);
                    this.memory.set('skip.' + this.helper.playlist.name, skips);

                    let count        = skips.length,
                        currentUsers = this.client.voiceConnection.voiceChannel.members.length - 1;

                    if (count < this.container.getParameter('skip_count') && count < currentUsers / 2) {
                        let required = this.container.getParameter('skip_count');

                        return this.reply(`Your skip for **${this.helper.playing.name}** was acknowledged.
**${required - count}** more vote is required to skip this song.`);
                    }

                    this.reply("Skipped the current song.");
                    setTimeout(this.helper.skip, 500);
                })
            }
        });
    }
}

module.exports = PlayingCommand;
