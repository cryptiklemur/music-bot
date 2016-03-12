const AbstractCommand = require('../AbstractCommand');

class ShuffleCommand extends AbstractCommand {
    static get name() {
        return 'DJ';
    }

    static get description() {
        return 'Toggles the DJ role on the given user';
    }

    static get adminCommand() {
        return true;
    }

    static get noHelp() {
        return true;
    }

    handle() {
        this.responds(/^DJ <@(\d+)>$/i, (matches) => {
            if (!this.isDJ) {
                return;
            }

            if (this.isPm()) {
                return false;
            }

            let role = this.server.roles.get('name', 'DJ'),
                user = this.server.members.get('id', matches[1]);

            if (!role || !user) {
                return this.reply("Role or User not found.");
            }

            if (user.hasRole(role)) {
                return this.client.removeMemberFromRole(user, role, (error) => {
                    if (error) {
                        this.logger.error(error);
                        return this.reply("Could not remove user from DJs");
                    }

                    return this.reply("Removed user from DJs");
                })
            }

            this.client.addMemberToRole(user, role, (error) => {
                if (error) {
                    this.logger.error(error);

                    return this.reply("Could not add user to DJs");
                }

                return this.reply("Added user to DJs");
            })
        });
    }
}

module.exports = ShuffleCommand;
