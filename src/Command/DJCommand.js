const AbstractCommand = require('discord-bot-base').AbstractCommand;

class ShuffleCommand extends AbstractCommand {
    static get name() {
        return 'DJ';
    }

    static get description() {
        return 'Toggles the DJ role on the given user';
    }

    handle() {
        if (!this.container.get('helper.dj').isDJ(this.message.server, this.message.author)) {
            return;
        }

        this.responds(/^DJ <@(\d+)>$/i, (matches) => {
            if (this.message.isPm()) {
                return false;
            }

            let role = this.message.server.roles.get('name', 'DJ'),
                user = this.message.server.members.get('id', matches[1]);

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
