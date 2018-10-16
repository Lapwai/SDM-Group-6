
const botkit = require('botkit')
const admin = require('./admincontroller')

var controller = botkit.slackbot({debug: false})
let bot = controller.spawn({
    token: 'xoxb-434508566676-433992928064-cHxo9Ahshc7WvBOQ7m3yn3Fc' // Edit this line!
})
function startBot() {
    bot.startRTM(function (err) {
        if (err) {
            throw new Error(err)
        }
    })
    controller.hears(['hello', 'hi'], ['direct_message'],
        function (bot, message) { 
            bot.reply(message, 'Meow. :smile_cat:') 
    })

    controller.hears(['init','Init'], 
    ['direct_message'], admin.init)

    controller.hears(['conf','Conf','configuration','Configuration'], 
    ['direct_message'], admin.configuration)

    controller.hears(['event','Event','eventlog','Eventlog'], 
    ['direct_message'], admin.eventlog)

    controller.hears(['view','View'], 
    ['direct_message'], admin.view)
    

    setTimeout(() => {
        endBot()
    }, 1000 * 10);
}

function endBot() {
    bot.closeRTM()
}



module.exports = { startBot };


