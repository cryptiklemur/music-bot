'use strict';

const BaseBot = require('discord-bot-base').Bot;
const _       = require('lodash');

class Bot extends BaseBot {
    onReady() {
        super.onReady();

        this.client.setStatus = _.throttle(this.client.setStatus, 500);
        this.client.reconnect = this.connect.bind(this);
        this.client.reconnect();
    }

    connect(callback) {
        let server = this.client.servers.get('id', this.container.getParameter('server_id'));
        if (!server) {
            throw new Error("Server with that ID not found.");
        }

        let channel = server.channels.get('name', this.container.getParameter('channel_name'));
        if (!channel) {
            throw new Error("Channel with that name not found in: " + server.name);
        }

        this.client.joinVoiceChannel(channel, callback);
    }
}

module.exports = Bot;