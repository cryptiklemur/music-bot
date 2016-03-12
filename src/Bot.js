'use strict';

const BaseBot = require('discord-bot-base').Bot;
const _       = require('lodash');

class Bot extends BaseBot {
    onReady() {
        super.onReady();

        this.client = this.container.get('client');
        this.client.setStatus = _.throttle(this.client.setStatus, 500);
        this.client.reconnect = this.connect.bind(this);
        this.client.reconnect();
    }

    connect(callback) {
        callback = callback === undefined ? function() {} : callback;

        let joined = 0;
        this.client.servers.forEach(server => {
            let channel = server.channels.get('name', this.container.getParameter('channel_name'));
            if (channel) {
                this.client.joinVoiceChannel(channel, () => joined++);
            } else {
                joined++;
            }
        });

        let interval = setInterval(() => {
            if (joined >= this.client.servers.length) {
                clearInterval(interval);
                this.logger.info("Connected to voice channels");
                callback();
            }
        }, 100);
    }
}

module.exports = Bot;