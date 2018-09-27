var Botkit = require('botkit');

function chatbot() {
    var controller = Botkit.slackbot({debug: false})
    controller
    .spawn({
           token: 'xoxb-434508566676-433992928064-cHxo9Ahshc7WvBOQ7m3yn3Fc'
           })
    .startRTM(function (err) {
              if (err) {
              throw new Error(err)
              }
              })

    controller.hears(
                     ['hello', 'hi'], ['direct_message', 'direct_mention', 'mention'],
                     function (bot, message) { bot.reply(message, 'Meow. :smile_cat:') })
}


module.exports= { chatbot };