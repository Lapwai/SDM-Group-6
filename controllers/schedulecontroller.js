const app = require('../app')
const db = require('../routes/database')
const request = require('request')
const nodeSchedule = require('node-schedule')


/**
 * When admin init, system will add a schedule to check new configuration about survey and add the new configuration
 */
function systemAddDefaultSchedule() {
    let job = nodeSchedule.scheduleJob('* 0 0 * * 1-5', function() {
        checkLastSurveyConfiguration()
    });
}
/**
 * System check last survey configuration and add today schedule  
 * 
 */
function checkLastSurveyConfiguration() {
    let selectStr = 'SELECT * FROM survey WHERE id=(SELECT Max(id) from survey);'
    db.pgQuery(selectStr).then(value => {
        addTodaySurveyNotification(value.rows[0])
    }).catch(err => {
        console.log(err)
    })
}
/**
 * Add today schedule to post survey notification
 * @param {object} survey the last survey configuration.
 */
function addTodaySurveyNotification(survey) {
    var date = Date.now();
    date.setHours(survey.starttime.getHours())
    console.log('today date=' + date)
    var j = schedule.scheduleJob(date, function(){
        postSurveyNotification()
    });    
    
}

/**
 * Add a new survey configuration from admin
 * @param {object} submission submission from survey configuration dialog.
 */
function updateSurvey(submission) {
    let title = submission.title
    let starttime = submission.starttime
    let option = submission.option
    let timeinterval = submission.timeinterval
    let postpone = submission.postpone
    insertSurvey(title,starttime,option,timeinterval,postpone)
    .then(value => {
        return ''
    }).catch(err => {
        return err
    }) 
}
/**
 * Insert the survey to survey table of database
 * @param {string} title survey title,
 * @param {string} starttime survey starttime,
 * @param {string} option survey option,
 * @param {string} timeinterval survey ignore time interval,
 * @param {string} postpone survey postpone time interval.
 */
function insertSurvey(title, starttime, option, timeinterval, postpone) {
    return new Promise((resolve, reject) => {
        let insertSql = 'INSERT INTO survey(title, starttime, option, timeinterval, postpone) VALUES (\'' + title + '\', \'' + starttime + '\', \'' + option + '\', \'' + timeinterval + '\', \'' + postpone + '\');';
        db.pgQuery(insertSql).then(_ => {
            console.log(1)
            resolve('')
        }).catch(err => {
            reject('insert survey err='+(err.message || err))
        })
    })
}

/**
 * Post today survey notifcation to each member of general channel except amdin
 */
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

/**
 * Query each member id of general channel
 */
function queryGeneralMembers() {
    return new Promise((resolve, reject) => {
        let options = {url: 'https://slack.com/api/channels.info?token=xoxb-434508566676-433992928064-cHxo9Ahshc7WvBOQ7m3yn3Fc&channel=CCSEYGWQL&pretty=1'};
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

/**
 * Query admin id from admin table of db
 */
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

/**
 * Open a channel with slack api to send notification to user
 * @param {string} user user id,
 */
function openChannelWithUser(user) {
    queryMemberLastFeedback(user).then(have => {
        updateOrAddMemberFeedback(have,user).then(value => {
            defaultTimeIntervalSendSurvey(user)
            openSlackChannel(user).then(channel => {
                queryLastSurveyConguration().then(att => {
                    postNotificationToUser(att, channel)
                }).catch(err => {
                    console.log(err)
                })
            }).catch(err => {
                console.log(err)
            })
        }).catch(err => {
            console.log(err)
        })
    }).catch(err => {
        console.log(err)
    })
}

/**
 * Query member's today feedback from db.
 * @param {string} user user id.
 */
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
            reject("queryMemberLastFeedback error = " + err.message||err)
        })
    })
}

/**
 * Insert or update a new null member's feedback to db
 * @param {boolean} have whether user already have today feedback in database,
 * @param {string} user user id.
 */
function updateOrAddMemberFeedback(have,user) {
    return new Promise((resolve, reject) => {
        let sqlStr = 'INSERT INTO feedbacks(member_id,member_name,ts,option,postpone,interval) VALUES(\'' + user + '\',\'/\',\'now\',\'/\',-1, 2);';
        if(have === true) {
            sqlStr = 'UPDATE feedbacks SET postpone = -1, interval = 2 WHERE id = (select MAX(id) from feedbacks where member_id = \'' + user + '\');'
        }
        db.pgQuery(sqlStr).then(value => {
            resolve('')
        }).catch(err => {
            reject("updateOrAddMemberFeedback error = " + err)
        })
    })
}

/**
 * Open a channel with slack api with user id.
 * @param {string} user user id,
 */
function openSlackChannel(user) {
    return new Promise((resolve, reject) => {
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
                reject('open channel with user err='+(err || result['error']))
            } else {
                let channel = result.channel.id
                resolve(channel)
            }
        })
    })
}

/**
 * Query the last survey configuration about id, time and minutes.
 */ 
function queryLastSurveyConguration() {
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

/**
 * Query last survey configuration timeinterval for startting a timeout to check team member last feedback interval.
 * @param {string} user user id.
 */ 
function defaultTimeIntervalSendSurvey(user) {
    let selectStr = 'SELECT * FROM survey WHERE id=(SELECT Max(id) from survey);'
    db.pgQuery(selectStr).then(value => {
        setTimeout(function() {
            checkMemberLastFeedbackInterval(user)
        }, 1000 * value.rows[0].timeinterval.minutes * 60);
    }).catch(err => {
        console.log(err)
    })
}
/**
 * Check the lastest feedback interval from user decide whether system to send a new notification to the team member.
 * @param {string} user user id.
 */ 
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

/**
 * Generate attachment for next step to post a notification to team member.
 */ 
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

/**
 * Post a notification to team member.
 * @param {object} atts message attachment.
 * @param {string} channel channel id.
 */ 
function postNotificationToUser(atts, channel) {
    let bodyPara = {'channel':channel,'attachments':atts}
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

/**
 * Postpone a team member's notification.
 * @param {object} payload postpone buttion message payload.
 */ 
function postponeTeamMemberNotification(payload) {
    var second = 1000 * parseInt(payload.actions[0].value)*60
    setTimeout(function() {
        openChannelWithUser(payload.user.id)
    }, second);
    postponeUpdateTeamMemberStatus(payload.actions[0].value,payload.user.id)
}

/**
 * Update the team member's status 
 * @param {int} minutes postpone time.
 * @param {string} user user id.
 */ 
function postponeUpdateTeamMemberStatus(minutes, user) {
    let sqlStr = 'UPDATE feedbacks SET postpone = ' + minutes + ', interval = -1 WHERE id = (select MAX(id) from feedbacks where member_id = \'' + user + '\');'
    db.pgQuery(sqlStr).then(value => {
        console.log('postponeUpdateTeamMemberStatus success')
    }).catch(err => {
        console.log('postponeUpdateTeamMemberStatus err = ' + err)
    })
}

module.exports = {systemAddDefaultSchedule,updateSurvey,postSurveyNotification,postponeTeamMemberNotification,insertSurvey}

