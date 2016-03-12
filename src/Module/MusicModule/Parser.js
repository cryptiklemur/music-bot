function parseSecondsIntoReadableTime(seconds) {
    //Get hours from seconds
    var hours           = seconds / (60 * 60),
        absoluteHours   = Math.floor(hours),
        h               = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours,

        minutes         = (hours - absoluteHours) * 60,
        absoluteMinutes = Math.floor(minutes),
        m               = absoluteMinutes > 9 ? absoluteMinutes : '0' + absoluteMinutes,

        seconds         = (minutes - absoluteMinutes) * 60,
        absoluteSeconds = Math.round(seconds),
        s               = absoluteSeconds > 9 ? absoluteSeconds : '0' + absoluteSeconds,
        time            = m + ':' + s;


    return (h != '00' ? h + ':' : '') + time;
}

function parseMillisecondsIntoReadableTime(milliseconds) {
    //Get hours from milliseconds
    var hours           = milliseconds / (1000 * 60 * 60),
        absoluteHours   = Math.floor(hours),
        h               = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours,

        minutes         = (hours - absoluteHours) * 60,
        absoluteMinutes = Math.floor(minutes),
        m               = absoluteMinutes > 9 ? absoluteMinutes : '0' + absoluteMinutes,

        seconds         = (minutes - absoluteMinutes) * 60,
        absoluteSeconds = Math.floor(seconds),
        s               = absoluteSeconds > 9 ? absoluteSeconds : '0' + absoluteSeconds,
        time            = m + ':' + s;


    return (h != '00' ? h + ':' : '') + time;
}

module.exports = {
    parseSeconds:      parseSecondsIntoReadableTime,
    parseMilliseconds: parseMillisecondsIntoReadableTime
};