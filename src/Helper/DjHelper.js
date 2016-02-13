class DJHelper {
    constructor(client) {
        this.client = client;
    }

    isDJ(server, user) {
        if (!server) {
            return false;
        }

        let role = server.roles.get('name', 'DJ');

        return user.hasRole(role) || user.id === this.client.admin.id;
    }
}

module.exports = DJHelper;