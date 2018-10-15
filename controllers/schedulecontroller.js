const app = require('../app')
const db = require('../routes/database')
const request = require('request')
const nodeSchedule = require('node-schedule')


// default schedule -  eveyday 0am to check the new survey setting
function defaultSchedule() {
    let job = nodeSchedule.scheduleJob('* * 0 * * 1-5', function() {
        checkSurvey()
    });
}
function checkSurvey() {
    let selectStr = 'SELECT * from survey WHERE id=(SELECT Max(id) from survey);'
    db.pgQuery(selectStr).then(value => {
        addTodaySurvey(value.rows[0])
    }).catch(err => {
        console.log(err)
    })
}

function addTodaySurvey(value) {
    // let starttime = value['starttime']
    // let job = nodeSchedule.scheduleJob()
}


function updateSurvey(submission) {
    let title = submission.title
    let starttime = submission.starttime
    let option = submission.option
    let timeinterval = submission.timeinterval
    let postpone = submission.postpone

    console.log('updateSurvey 0')
    console.log(submission)
    console.log(title)
    console.log(starttime)
    console.log(option)
    console.log(timeinterval)
    console.log(postpone)
    console.log('updateSurvey 1')

    insertSurvey(title,starttime,option,timeinterval,postpone)
    .then(_ => {
        console.log('insert survey success')
    }).catch(err => {
        console.log('insert survey err')
        console.log(err)
    }) 
}
function insertSurvey(title, starttime, option, timeinterval, postpone) {
    return new Promise((resolve, reject) => {
        let insertSql = 'INSERT INTO survey(title, starttime, option, timeinterval, postpone) VALUES (\'' + title + '\', \'' + starttime + '\', \'' + option + '\', \'' +  + timeinterval + '\', \'' +  + postpone + '\');';
        console.log('sql='+insertSql)
        db.pgQuery(insertSql).then(_ => {
            resolve('')
            console.log('insert new survey success!')
        }).catch(err => {
            reject(err.message || err)
        })
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





module.exports = {updateSurvey}