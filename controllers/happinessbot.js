const botkit = require('botkit')
const admin = require('./admincontroller')

// connect to slack robot and mornitoring the command comes from slack user interface
function startBot() {
    var controller = botkit.slackbot({debug: false})
    controller.spawn({
           token: 'xoxb-434508566676-433992928064-cHxo9Ahshc7WvBOQ7m3yn3Fc' // token could be generated from slack api page, could see detail in https://blackboard.aut.ac.nz/bbcswebdav/internal/courses/INFS809_2018_02/wikis/group/e8ad08818891494abb2c8ca106ef9e87/c75d8c573408455eb16ce55b96ef2a15/Ass2-tools.pdf
    }).startRTM(function (err) {
        if (err) {
            throw new Error(err)
        }
    })
    controller.hears(['hello', 'hi'], ['direct_message'],
        function (bot, message) { 
            bot.reply(message, 'Meow. :smile_cat:') 
    })
//monitoring commmand of initlisation from slack user interface
    controller.hears(['init','Init'], 
    ['direct_message'], admin.init)
//monitoring commmand of configration from slack user interface
    controller.hears(['conf','Conf','configuration','Configuration'], 
    ['direct_message'], admin.configuration)
//monitoring commmand of event from slack user interface
    controller.hears(['event','Event','eventlog','Eventlog'], 
    ['direct_message'], admin.eventlog)
//monitoring commmand of view from slack user interface
    controller.hears(['view','View'], 
    ['direct_message'], admin.view)
    
}



module.exports = { startBot };


