const app = require('../app')
const db = require('../routes/database')
const request = require('request')
const schedule = require('node-schedule')

function addDefault(param) {

    let insertSql = 'INSERT INTO survey(title, starttime, option, timeinterval, postpone) VALUES (\'' + title + '\', \'' + starttime + '\', \'' + option + '\', \'' +  + interval + '\', \'' +  + postpone + '\');';
    db.pgQuery(insertSql).then(_ => {
        console.log('survey set default success!')
    }).catch(err => {
        console.log(err)
    })
}

function update() {
    addDefault()

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



function gengerateAttachment(title,option) {

    let attachments = [{
        "fallback" : "You can not user this feature!",
        "mrkdwn_in" : ["pretext","text"],
        "pretext" : ":mag: *Survey*",
        'text': title,
        "color" : "#3AA3E3",
        "attachment_type" : "default",
        'callback_id': hash,
        "actions" : [{
            "name" : "happiness",
            "text" : "Pick a happiness level...",
            "type" : "select"
            }]
        }
    ]
    return attachments
}


// run 
function runloop() {

}





module.exports = {addDefault, update, post, runloop}