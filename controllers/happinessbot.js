
const botkit = require('botkit')
const admin = require('./admincontroller')

function startBot() {
    var controller = botkit.slackbot({debug: false})
    controller.spawn({
           token: 'xoxb-434508566676-433992928064-cHxo9Ahshc7WvBOQ7m3yn3Fc' // Edit this line!
    }).startRTM(function (err) {
        if (err) {
            throw new Error(err)
        }
    })
    controller.hears(['hello', 'hi'], ['direct_message', 'direct_mention', 'mention'],
        function (bot, message) { 
            bot.reply(message, 'Meow. :smile_cat:') 
    })

    controller.hears(['init','Init'], 
    ['direct_message', 'direct_mention', 'mention'], admin.init)

    controller.hears(['conf','Conf','configuration','Configuration'], 
    ['direct_message', 'direct_mention', 'mention'], admin.configuration)

    controller.hears(['event','Event','eventlog','Eventlog'], 
    ['direct_message', 'direct_mention', 'mention'], admin.eventlog)
    
}



module.exports = { startBot };


