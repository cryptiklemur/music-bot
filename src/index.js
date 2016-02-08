'use strict';

const walk           = require('walk');
const GoogleUrl      = require('google-url');
const pkg            = require('../package');
const Bot            = require('./Bot');
const env            = process.env;
const Commands       = require('require-all')(__dirname + '/Command/');
const PlaybackHelper = require('./Helper/PlaybackHelper');

let commands = [];
for (let name in Commands) {
    if (Commands.hasOwnProperty(name)) {
        if (name !== 'AbstractCommand') {
            commands.push(Commands[name]);
        }
    }
}

function shortener(key) {
    return new GoogleUrl({key: key});
}

let options = {
    admin_id:  env.DISCORD_ADMIN_ID,
    email:     env.DISCORD_EMAIL,
    password:  env.DISCORD_PASSWORD,
    name:      pkg.name,
    log_dir:   '/var/log/discord_bots',
    version:   pkg.version,
    author:    pkg.author,
    commands:  commands,
    prefix:    "!",
    container: (Bot) => {
        return {
            parameters: {
                redis_url:    env.DISCORD_REDIS_URL,
                mongo_url:    env.DISCORD_MONGO_URL,
                download_dir: env.DISCORD_DOWNLOAD_DIR
            },
            services:   {
                urlShortener:      {module: shortener, args: [env.DISCORD_GOOGLE_KEY]},
                'helper.playback': {
                    module: PlaybackHelper,
                    args:   [{$ref: 'client'}, {$ref: 'logger'}, {$ref: 'brain.memory'}, '%download_dir%']
                }
            }
        };
    }
};

let environment = 'prod';
if (env.DISCORD_ENV !== undefined) {
    environment = env.DISCORD_ENV;
}

process.on('uncaughtException', function(exception) {
    console.log(exception.stack);
});

new Bot('dev', true, options);
