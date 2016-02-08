const AbstractCommand = require('discord-bot-base').AbstractCommand;
const Request         = require('../Model/Request');
const MessageHelper   = require('../Helper/MessageHelper');

class RequestsCommand extends AbstractCommand {
    static get name() { return 'requests'; }

    static get description() { return 'List all requests'; }

    initialize() {
        this.prefix = this.container.getParameter('prefix');
        this.helper = new MessageHelper(this.client, this.message);
        this.brain  = this.container.get('brain.mongo');
    }

    handle() {
        if (!this.helper.isDJ()) {
            return false;
        }

        this.responds(/^requests$/, () => {
            Request.find({request: true}, (err, requests) => {
                if (!requests) {
                    return this.reply("There are no requests");
                }

                let message = `There are currently ${requests.length} request(s): \n\n`;
                requests.forEach((request, index) => {
                    let user = this.client.users.get('id', request.user);

                    if (message.length >= 1800) {
                        this.sendMessage(this.message.channel, message);
                        message = '';
                    }

                    message += `
\`${index + 1}.\` **${user.name}** requested: **${request.link}**
\t\t**${request.name}** by **${request.author}**
\t\t\`${this.prefix}approve ${request.id} <playlist name>\`
`;
                });

                this.sendMessage(this.message.channel, message);
            });
        });
    }
}

module.exports = RequestsCommand;
