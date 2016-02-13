'use strict';

const walk           = require('walk');
const GoogleUrl      = require('google-url');
const pkg            = require('../package');
const Bot            = require('./Bot');
const env            = process.env;
const Commands       = require('require-all')(__dirname + '/Command/');
const PlaybackHelper = require('./Helper/PlaybackHelper');
const DJHelper       = require('./Helper/DJHelper');

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
    version:   pkg.version,
    author:    pkg.author,
    commands:  commands,
    prefix:    "!",
    redis_url: env.DISCORD_REDIS_URL,
    mongo_url: env.DISCORD_MONGO_URL,
    queue:     {
        host: env.DISCORD_RABBIT_HOST
    },
    container: (Bot) => {
        return {
            parameters: {
                download_dir:       env.DISCORD_DOWNLOAD_DIR,
                server_id:          env.DISCORD_SERVER_ID,
                channel_name:       env.DISCORD_CHANNEL_NAME,
                skip_count:         3,
                remove_after_skips: 5,
                volume:             parseFloat(env.DISCORD_VOLUME)
            },
            services:   {
                urlShortener:      {module: shortener, args: [env.DISCORD_GOOGLE_KEY]},
                'helper.dj':       {module: DJHelper, args: [{$ref: 'client'}]},
                'helper.playback': {
                    module: PlaybackHelper,
                    args:   [
                        {$ref: 'dispatcher'},
                        {$ref: 'client'},
                        {$ref: 'logger'},
                        {$ref: 'brain.redis'},
                        {$ref: 'brain.memory'},
                        '%download_dir%',
                        '%volume%',
                        '%remove_after_skips%'
                    ]
                }
            }
        };
    }
};

let environment = 'prod';
if (env.DISCORD_ENV !== undefined) {
    environment = env.DISCORD_ENV;
}

new Bot(environment, false && environment === 'dev', options);
