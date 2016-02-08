class MessageHelper {
    constructor(client, message) {
        this.client  = client;
        this.message = message;
    }

    isDJ() {
        if (this.message.isPm()) {
            return false;
        }

        let role = this.message.server.roles.get('name', 'DJ');

        return this.message.author.hasRole(role) || this.message.author.id === this.client.admin.id;
    }
}

module.exports = MessageHelper;