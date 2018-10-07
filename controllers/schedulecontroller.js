const app = require('../app')
const db = require('../routes/database')
const request = require('request')
const schedule = require('node-schedule')

// add schedule for researcher
function add(hash,params,channelID) {
    let survey_name = params[0]
    let survey_range = params[1]
    let survey_time = params[2].split(':')
    let survey_title = params[3]
    let survey_message = params[4]

    // schedule.scheduleJob({hour: survey_time[0], minute: survey_time[1], dayOfWeek: 1-5}, function(){
    schedule.scheduleJob({second: 30}, function(){
        console.log('scheduleCronstyle:' + new Date());
    })
}

// post survey
function post(hash,params,channelID) {
    let attachments = gengerateAttachment(hash,params)
    let bodyParams = {'scope':'chat:write',
                'channel': channelID,
                'text': '',
                'response_type' : 'in_channel',
                'attachments': attachments}
    let options = {
        url: 'https://slack.com/api/chat.postMessage',
        method:'POST',
        headers: {
            'User-Agent': 'SDM Test',
            'content-type': 'application/json; charset=utf-8',
            'Authorization' : 'Bearer xoxa-2-434508566676-445609127334-444065434292-a41d63c89c65b7a2a9bacc9bfe61faa4'
        },
        body: JSON.stringify(bodyParams)
    };

    function callBack(error, _, _) {
        if(error) {
            console.log(error)
        } else {
            console.log('post survey success')
        }
    }
    request(options, callBack)
}
function queryChannelID(name) {
    return new Promise(function(resolve, reject) {
        let options = {
            url: 'https://slack.com/api/conversations.list?token=xoxa-2-434508566676-445609127334-444065434292-a41d63c89c65b7a2a9bacc9bfe61faa4&scope=conversations:read',
            headers: {'User-Agent': 'SDM Test'}
        };
        request(options, (err, _, body) => {
            let result = {}
            if((typeof body) === 'string') {
                result = JSON.parse(body)
            } else {
                result = body
            }            
            if(err || result['error']) {
                reject(err || result['error'])
            }
            let channelID = ''
            result['channels'].forEach(e => {
                if(name.substring(1) == e['name']) {
                    channelID = e['id']
                }
            })
            if(channelID.length === 0){
                reject('Did not find the channel!')
            } else {
                resolve(channelID)
            }
        }) 
    })
}

function gengerateAttachment(hash,params) {
    let survey_title = params[3]
    let survey_message = params[4]
    let attachments = [{
        "fallback" : "You can not user this feature!",
        "mrkdwn_in" : ["pretext","text"],
        "pretext" : ":mag: *Survey*",
        'text': '*' + survey_title + '* \n' + survey_message,
        "color" : "#3AA3E3",
        "attachment_type" : "default",
        'callback_id': hash,
        "actions" : [{
            "name" : "happy list",
            "text" : "Pick a happiness level...",
            "type" : "select",
            "options" : [{
                    "text" : "Very unhappy",
                    "value" : "1"
                },{
                    "text" : "Unhappy",
                    "value" : "2"
                },{
                    "text" : "General",
                    "value" : "3"
                },{
                    "text" : "Happy",
                    "value" : "4"
                },{
                    "text" : "Very happy",
                    "value" : "5"
                }]
            }]
        },{
            "fallback" : "You can not user this feature!",
            "color" : "#DDDDDD",
            "attachment_type" : "default",
            'callback_id': hash,
            "actions" : [{
                "name" : "reminder",
                "text" : "Reminder me later",
                "type" : "button",
                "style" : "#DDDDDD",
                "value" : "1",
                "confirm" : {
                    "text" : "Are you sure?",
                    "ok_text" : "Yes",
                    "dismiss_text" : "No"
                }
            }]
        }
    ]
    return attachments
}


// run 
function runloop() {

}





module.exports = {add, post, runloop}