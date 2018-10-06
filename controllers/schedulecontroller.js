const app = require('../app')
const db = require('../routes/database')
const request = require('request')
const schedule = require('node-schedule')

// add schedule for researcher
function add(params) {
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
function post(hash,params) {
    let survey_range = params[1]
    let survey_title = params[3]
    let survey_message = params[4]
    
    let attachments = [{
        'fallback': 'Required plain-text summary of the attachment.',
        'callback_id': hash,
        'color': '#539BD8',          
        'pretext': ':mag: *Survey*',
        'text': '*' + survey_title + '* \n' + survey_message,
        'attachment_type': 'default',
        'actions':[
            {
                'name': 'schedule-researcher',
                'text': '1',
                'type': 'button',
                'value': '1'
            },{
                'name': 'schedule-researcher',
                'text': '2',
                'type': 'button',
                'value': '2'
            },{
                'name': 'schedule-researcher',
                'text': '3',
                'type': 'button',
                'value': '3'
            },{
                'name': 'schedule-researcher',
                'text': '4',
                'type': 'button',
                'value': '4'
            },{
                'name': 'schedule-researcher',
                'text': '5',
                'type': 'button',
                'value': '5'
            }],
        'mrkdwn_in': ['text','pretext'],
    }]

    let bodyParams = {'scope':'chat:write',
                'channel': survey_range.substring(1),
                'text': '',
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

    function callBack(error, response, body) {
        if(error) {
            console.log('error = ')
            console.log(error)
        } else {
            console.log('body')
            console.log(body)
        }
    }

    request(options, callBack)
}

// run 
function runloop() {

}





module.exports = {add, post, runloop}