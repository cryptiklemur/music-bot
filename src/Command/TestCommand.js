const AbstractCommand = require('discord-bot-base').AbstractCommand;
const ytdl            = require('youtube-dl');

class SummonCommand extends AbstractCommand {
    static get name() { return 'test'; }

    static get description() { return 'test'; }

    handle() {
        this.responds(/^test$/, () => {
            this.reply("Fetching information. If this is a playlist, it could take a bit.", (error, message) => {
                this.message = message;
            });

            ytdl.getInfo(
                'https://www.youtube.com/playlist?list=PLF452510B37CE975F',
                [],
                {maxBuffer: 1000 * 1024},
                (err, info) => {
                    info = JSON.stringify(info);
                    console.log(err, info);
                    this.reply("Check console.");
                    this.client.deleteMessage(this.message);
                    this.sendMessage(this.message.channel, `\`\`\`\n${info}\n\`\`\``);
                }
            );
        });
    }
}

module.exports = SummonCommand;
