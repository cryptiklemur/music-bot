const AbstractCommand = require('../AbstractCommand');

class QueueCommand extends AbstractCommand {
    static get name() {
        return 'queuechannel';
    }

    static get description() {
        return 'Marks the given channel as the queue channel';
    }

    static get adminCommand() {
        return true;
    }

    handle() {
        if (!this.isDJ) {
            return;
        }

        this.responds(/^queue(?: )?channel$/, () => {
            this.redis.get('music-bot-queue', (err, id) => {
                if (err || !id) {
                    this.reply("There was an error fetching the queue channel. Might not be one.");
                    console.log(err, id);

                    return;
                }

                let channel = this.server.channels.get('id', id);

                this.reply(`The current queue channel is: ` + channel.mention());
            });
        });

        this.responds(/^queue(?: )?channel <#(\d+)>$/, (matches) => {
            let channel = this.server.channels.get('id', matches[1]);

            if (!channel) {
                return this.reply('Couldn\'t find that channel, for some reason.');
            }

            this.helper.setQueueChannel(channel.id);
            this.reply('Queue channel has been set to ' + channel.mention());
        });
    }
}

module.exports = QueueCommand;
