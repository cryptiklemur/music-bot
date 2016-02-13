const AbstractCommand = require('discord-bot-base').AbstractCommand;
const Request         = require('../Model/Request');
const Song            = require('../Model/Song');
const Playlist        = require('../Model/Playlist');

class ApproveRequestCommand extends AbstractCommand {
    static get name() { return 'deny'; }

    static get description() { return 'Denies the given request'; }

    handle() {
        if (!this.container.get('helper.dj').isDJ(this.message.server, this.message.author)) {
            return;
        }

        this.responds(/^deny ([A-Za-f\d]{24})/, matches => {
            let id       = matches[1];

            Request.findOne({_id: id}, (error, request) => {
                if (error) {
                    this.reply("I couldn't find that request.");

                    return this.logger.error(error);
                }


                let user = this.client.users.get('id', request.user);

                this.sendMessage(user, `**${request.name}** has been denied.`);
                request.remove();
            })
        })
    }
}

module.exports = ApproveRequestCommand;
