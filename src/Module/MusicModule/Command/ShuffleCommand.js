const AbstractCommand = require('../AbstractCommand');

class ShuffleCommand extends AbstractCommand {
    static get name() {
        return 'shuffle';
    }

    static get description() {
        return 'Shuffles the queue';
    }

    static get adminCommand() {
        return true;
    }


    handle() {
        this.responds(/^shuffle$/, () => {
            if (!this.isDJ) {
                return;
            }

            if (!this.helper.isPlaying()) {
                return this.reply("No playlist is playing right now.");
            }

            this.shuffle(this.helper.queue);

            this.helper.updateQueueChannel();
            this.reply("Queue has been shuffled");
        });
    }

    shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue      = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex]  = temporaryValue;
        }

        return array;
    }
}

module.exports = ShuffleCommand;
