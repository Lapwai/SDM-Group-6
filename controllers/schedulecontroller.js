const app = require('../app')
const db = require('../routes/database')
const request = require('request')
const nodeSchedule = require('node-schedule')


// default schedule -  eveyday 0am the system will check the lastest survey confuguration
function defaultSchedule() {
    let job = nodeSchedule.scheduleJob('* 0 0 * * 1-5', function() {
        checkSurvey()
    });
}
function checkSurvey() {
    let selectStr = 'SELECT * FROM survey WHERE id=(SELECT Max(id) from survey);'
    db.pgQuery(selectStr).then(value => {
        addTodaySurvey(value.rows[0])
    }).catch(err => {
        console.log(err)
    })
}

function addTodaySurvey(value) {
    var date = Date.now();
    date.setHours(value.starttime.getHours())
    console.log('today date=' + date)
    var j = schedule.scheduleJob(date, function(){
        postSurveyNotification()
    });    
    
}
// when admin submit new configuration will invoke this method
function updateSurvey(submission) {
    let title = submission.title
    let starttime = submission.starttime
    let option = submission.option
    let timeinterval = submission.timeinterval
    let postpone = submission.postpone

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
        let insertSql = 'INSERT INTO survey(title, starttime, option, timeinterval, postpone) VALUES (\'' + title + '\', \'' + starttime + '\', \'' + option + '\', \'' + timeinterval + '\', \'' + postpone + '\');';
        console.log('insert survey sql='+insertSql)
        db.pgQuery(insertSql).then(_ => {
            resolve('')
            console.log('insert new survey success!')
        }).catch(err => {
            reject(err.message || err)
        })
    })
}

// post survey notifcation to a channel
function postSurveyNotification() {    
    queryGeneralMembers().then(members => {
        queryAdminID().then(admin => {
            members.forEach(e => {
                if(e !== admin.id) {
                    openChannelWithUser(e)
                }
            });
        })
    }).catch(err => {
        console.log('post survey notification error =' + err)
    })
}
// query all member id from genernal channel
function queryGeneralMembers() {
    return new Promise((resolve, reject) => {
        let options = {
            url: 'https://slack.com/api/channels.info?token=xoxb-434508566676-433992928064-cHxo9Ahshc7WvBOQ7m3yn3Fc&channel=CCSEYGWQL&pretty=1'   
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
            } else {
                let members = result.channel.members
                resolve(members)
            }            
        })
    })
}
// query admin id from db
function queryAdminID() {
    return new Promise((resolve, reject) => {
        let sqlStr = 'select * from admin;'
        db.pgQuery(sqlStr).then(value => {
            resolve(value.rows[0])
        }).catch(err => {
            reject(err.message||err)
        })
    })
}
// ********** open a channel to send notification to user **********
function openChannelWithUser(user) {
    queryMemberLastFeedback(user).then(have => {
        updateOrAddMemberFeedback(have,user).then(value => {
            defaultTimeIntervalSendSurvey(user)
            let bodyPara = {'users':user}
            let options = {
                url: '	https://slack.com/api/conversations.open',
                method:'POST',
                headers: {
                    'scope':'bot',
                    'User-Agent': 'SDM Test',
                    'content-type': 'application/json; charset=utf-8',
                    'Authorization' : 'Bearer xoxb-434508566676-433992928064-cHxo9Ahshc7WvBOQ7m3yn3Fc'
                },
                body: JSON.stringify(bodyPara)
            };
            request(options, (err, _, body) => {
                let result = {}
                if((typeof body) === 'string') {
                    result = JSON.parse(body)
                } else {
                    result = body
                }
                if(err || result['error']) {
                    console.log('open channel with user err='+(err || result['error']))
                } else {
                    let channel = result.channel.id
                    querySurveyContent().then(att => {
                        postNotificationToUser(att, channel)
                    }).catch(err => {
        
                    })
                }
            })
        }).catch(err => {
            console.log("updateOrAddMemberFeedback error = " + err)
        })
    }).catch(err => {
        console.log("queryMemberLastFeedback error = " + err)
    })
}
// if a team member ignore the notification 
function defaultTimeIntervalSendSurvey(user) {
    let selectStr = 'SELECT * FROM survey WHERE id=(SELECT Max(id) from survey);'
    db.pgQuery(selectStr).then(value => {
        // ignore action
        setTimeout(function() {
            checkMemberLastFeedbackInterval(user)
        }, 1000 * value.rows[0].timeinterval.minutes * 60);
    }).catch(err => {
        console.log(err)
    })
}

// query member's last feedback from db
function queryMemberLastFeedback(user) {
    return new Promise((resolve, reject) => {
        let sqlStr = 'select * from feedbacks where id = (select MAX(id) from feedbacks where member_id = \'' + user + '\') and member_id = \'' + user + '\' and ts > now() - interval \'23 hours\';'
        db.pgQuery(sqlStr).then(value => {
            if(value.rows.length > 0) {
                resolve(true)
            } else {
                resolve(false)
            }
        }).catch(err => {
            reject(err.message||err)
        })
    })
}

// update or add a new null member's feedback to db
function updateOrAddMemberFeedback(have,user) {
    return new Promise((resolve, reject) => {
        let sqlStr = 'INSERT INTO feedbacks(member_id,member_name,ts,option,comment,postpone,interval) VALUES(\'' + user + '\',\'/\',\'now\',\'/\', \'/\',-1, 2);';
        if(have === true) {
            sqlStr = 'UPDATE feedbacks SET postpone = -1, interval = 2 WHERE id = (select MAX(id) from feedbacks where member_id = \'' + user + '\');'
        }
        db.pgQuery(sqlStr).then(value => {
            resolve('')
        }).catch(err => {
            reject(err.members)
        })
    })
}
// check whether the lastest feedbacks inteval == 2 
function checkMemberLastFeedbackInterval(user){
    let sqlStr = 'SELECT interval FROM feedbacks WHERE id = (select MAX(id) from feedbacks where member_id = \'' + user + '\');'
    db.pgQuery(sqlStr).then(value => {
        if(value.rows.length > 0) {
            if(value.rows[0].interval > 0) {
                openChannelWithUser(user)
            }
        } else {
            console.log('checkMemberLastFeedbackInterval err = rows.length=0')
        }
    }).catch(err => {
        console.log('checkMemberLastFeedbackInterval err = ' + err)
    })
} 
// query the lastest survey content
function querySurveyContent() {
    return new Promise((resolve, reject) => {
        let selectStr = 'SELECT * FROM survey WHERE id=(SELECT Max(id) from survey);'
        db.pgQuery(selectStr).then(value => {
            let id = value.rows[0].id
            let title = value.rows[0].title
            let minutes = value.rows[0].postpone.minutes
            let att = gengerateAttachment(id,title,minutes)
            resolve(att)
        }).catch(err => {
            reject(err.message||err)
        })
    })   
}
function gengerateAttachment(id,title,minutes) {
    let attachments = [{
        "fallback" : "Just remind it is your time to submit your happiness information.",
        "mrkdwn_in" : ["pretext","text"],
        "pretext" : ":mag: *Survey*",
        'text': title + '\nDo you want to do it now?',
        "color" : "#3AA3E3",
        "attachment_type" : "default",
        'callback_id': id,
        "actions" : [{
                "name": "survey",
                "text": "Now",
                "type": "button",
                "value": "now"
            },{
                "name": "survey",
                "text": minutes + " minutes later",
                "type": "button",
                "style": "danger",
                "value": "" + minutes
            }]
        }
    ]
    return attachments
}
function postNotificationToUser(atts, channel) {
    let bodyPara = {
                'channel':channel,
                'attachments':atts}
    let options = {
        url: 'https://slack.com/api/chat.postMessage',
        method:'POST',
        headers: {
            'scope':'bot',
            'User-Agent': 'SDM Test',
            'content-type': 'application/json; charset=utf-8',
            'Authorization' : 'Bearer xoxb-434508566676-433992928064-cHxo9Ahshc7WvBOQ7m3yn3Fc'
        },
        body: JSON.stringify(bodyPara)
    };
    request(options, (err, _, body) => {
        let result = {}
        if((typeof body) === 'string') {
            result = JSON.parse(body)
        } else {
            result = body
        }
        if(err || result['error']) {
            console.log('post error'+(err || result['error']))
        } else {
            console.log('post success')
        }
    })
}


// postpone - send survey again 
function postponeSurvey(payload) {
    var second = 1000 * parseInt(payload.actions[0].value)*60
    setTimeout(function() {
        openChannelWithUser(payload.user.id)
    }, second);
    postponeUpdateFeedback(payload.actions[0].value,payload.user.id)
}
function postponeUpdateFeedback(minutes, user) {
    let sqlStr = 'UPDATE feedbacks SET postpone = ' + minutes + ', interval = -1 WHERE id = (select MAX(id) from feedbacks where member_id = \'' + user + '\');'
    db.pgQuery(sqlStr).then(value => {
        console.log('postponeUpdateFeedback success')
    }).catch(err => {
        console.log('postponeUpdateFeedback err = ' + err)
    })
}

/*
{"actions":[{"name":"recommend","value":"recommend","type":"button"}],"callback_id":"comic_1234_xyz","channel":{"id":"C065W1189","name":"forgotten-works"},"message_ts":"1458170866.000004","response_url":"https://hooks.slack.com/actions/T47563693/6204672533/x7ZLaiVMoECAW50Gw1ZYAXEM","type":"interactive_message","team":{"id":"T47563693","domain":"watermelonsugar"},"action_ts":"1458170917.164398","token":"xAB3yVzGS4BQ3O9FACTa8Ho4","trigger_id":"13345224609.738474920.8088930838d88f008e0","user":{"id":"U045VRZFT","name":"brautigan"},"attachment_id":"1"}
*/



module.exports = {defaultSchedule,updateSurvey,postSurveyNotification,postponeSurvey}