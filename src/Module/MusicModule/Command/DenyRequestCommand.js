const AbstractCommand = require('../AbstractCommand'),
      Request         = require('../Model/Request'),
      Song            = require('../Model/Song');

class ApproveRequestCommand extends AbstractCommand {
    static get name() {
        return 'deny';
    }

    static get description() {
        return 'Denies the given request';
    }

    static get adminCommand() {
        return true;
    }

    handle() {
        this.responds(/^deny ([A-Za-f\d]{24})/, matches => {
            if (!this.isDJ) {
                return;
            }

            let id = matches[1];

            Request.findOne({_id: id}, (error, request) => {
                if (error) {
                    this.reply("I couldn't find that request.");

                    return this.logger.error(error);
                }


                let user = this.client.users.get('id', request.user);
                if (!user) {
                    user = this.client.admin;
                }

                this.sendMessage(user, `**${request.name}** has been denied.`);
                request.remove();
            })
        })
    }
}

module.exports = ApproveRequestCommand;
