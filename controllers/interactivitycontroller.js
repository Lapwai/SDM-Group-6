const db = require('../routes/database')
const request = require('request')
const textRes = require('./textresponse')
const shchedule = require('./schedulecontroller')
const admin = require('./admincontroller')

/**
 * Receive request from slack actions such as buttons and dialogs.
 * interactive_message means button,
 * dialog_submission means dialog.
 */
function interactivity(req, res) {
    let payload = JSON.parse(req.body.payload)
    if(payload.type === 'interactive_message') {
        interactivityReceivedButtonReq(payload)
        textRes.successRes(res, 'Got it!')
    } else if(payload.type === 'dialog_submission') {
        interactivityReceivedDialogReq(payload)
        res.status(200)
        res.send();
    } else {
        textRes.errorRes(req,res, req.body.payload)
    }
}

/**
 * Receive request from slack buttons submission.
 * @param {object} payload three different type of slack buttion submit(configuration, eventlog from  admin and survey from team member).
 */
function interactivityReceivedButtonReq(payload) {
    let name = payload.actions[0].name
    let value = payload.actions[0].value
    if(name === 'conf') {
        if(value === 'yes') {
            postDialogToSlack(generateRequestOptions(payload.trigger_id,configurationResponseAttachments()))
        }
    } else if(name === 'event') {
        if(value === 'yes') {
            postDialogToSlack(generateRequestOptions(payload.trigger_id,eventlogResponseAttachments()))
        }
    } else if(name === 'survey') {
        if(value === 'now') {
            surveyResponseAttachments().then(att => {
                postDialogToSlack(generateRequestOptions(payload.trigger_id,att))
            }).catch(err => {
                console.log('post survey err='+err)
            })
        } else {
            shchedule.postponeTeamMemberNotification(payload)
        }
    } else {
        console.log('interactivity button ' + name )
    }
}

/**
 * When system receive a button submission from slack, system will post back a dialog immediately.
 * @param {object} options request option includes request basic data such as url, body, method, heraders.
 */
function postDialogToSlack(options) {
    request(options, (err, _, body) => {
        let result = {}
        if((typeof body) === 'string') {
            result = JSON.parse(body)
        } else {
            result = body
        }
        if(err || result['error']) {
            console.log( err || result['error'])
        } else {
            console.log('success')
        }
    })
}

/**
 * When bot system receive a button submission from slack, system will post back a dialog immediately
 * @param {string} trigger_id buttion submission trigger id,
 * @param {object} att slack message attachments.
 */
function generateRequestOptions(trigger_id,att) {
    let bodyPara = {'trigger_id':trigger_id,
                'dialog':att}
    let options = {
        url: 'https://slack.com/api/dialog.open',
        method:'POST',
        headers: {
            'User-Agent': 'SDM Test',
            'content-type': 'application/json; charset=utf-8',
            'Authorization' : 'Bearer xoxb-434508566676-433992928064-cHxo9Ahshc7WvBOQ7m3yn3Fc'
        },
        body: JSON.stringify(bodyPara)
    };
    return options
}

/**
 * Static attachments about configuration dialog UI which shows admin setup configuration
 */
function configurationResponseAttachments() {
    let attachments ={
        'callback_id': 'conf',
        'title': 'Configuration',
        'state': 'conf',
        'elements': [
            {
                'label': 'Title',
                'name': 'title',
                'type': 'text',
                'placeholder': 'Just remind it is your time to submit your happiness information. Choose a button to click.'
            },
            {
                'label': 'Start time',
                'type': 'select',
                'name': 'starttime',
                'options': [
                  {
                    'label': '9:00',
                    'value': '9:00'
                  },
                  {
                    'label': '11:00',
                    'value': '11:00'
                  },
                  {
                    'label': '13:00',
                    'value': '13:00'
                  },
                  {
                    'label': '15:00',
                    'value': '15:00'
                  }
                ]
            },
            {
                'label': 'Option',
                'name': 'option',
                'type': 'text',
                'placeholder': 'Please input 5 levels such as \"Very Happy;Happy;Normal;Unhappy;Very Unhappy\" (separted by semicolon)'
            },
            {
                'label': 'Time interval',
                'type': 'select',
                'name': 'timeinterval',
                'options': [
                    {
                      'label': '2 Minutes',
                      'value': '2 minutes'
                    },
                    {
                      'label': '3 Minutes',
                      'value': '3 minutes'
                    },
                    {
                      'label': '4 Minutes',
                      'value': '4 minutes'
                    },
                    {
                      'label': '5 Minutes',
                      'value': '5 minutes'
                    }
                ]
            },
            {
                'label': 'Postpone time',
                'type': 'select',
                'name': 'postpone',
                'options': [
                    {
                      'label': '5 Minutes',
                      'value': '5 minutes'
                    },
                    {
                      'label': '10 Minutes',
                      'value': '10 minutes'
                    },
                    {
                      'label': '15 Minutes',
                      'value': '15 minutes'
                    }
                ]
            }
        ]
    }
    return attachments
}
/**
 * Static attachments about eventlog dialog UI which shows admin record an event
 */
function eventlogResponseAttachments() {
    let attachments ={
        'callback_id': 'event',
        'title': 'Event log',
        'state': 'event',
        'elements': [
            {
                'label': 'Meeting Theme',
                'name': 'theme',
                'type': 'text',
                'placeholder': 'Please input the meeting theme'
            },
            {
                'label': 'Meeting date',
                'name': 'date',
                'type': 'text',
                'placeholder': 'Please input the meeting date such as \"12 Aug 2018\"'
            },
            {
                'label': 'Meeting time',
                'name': 'time',
                'type': 'text',
                'placeholder': 'Please input the meeting time such as \"14:20\"'
            }
        ]
    }
    return attachments
}
/**
 * Static attachments about dialog UI which shows team member can submit a survey  
 */
function surveyResponseAttachments() {
    return new Promise((resolve, reject) => {
        let selectStr = 'SELECT * FROM survey WHERE id=(SELECT Max(id) from survey);'
        db.pgQuery(selectStr).then(value => {
            let temp = value.rows[0].option.split(';').map( str => {
                return str.trim()
            })
            let options = []
            temp.forEach(e => {
                options.push({'label':e, 'value':e})           
            })
            let att = generateSurveyResAtt(options)
            resolve(att)
        }).catch(err => {
            reject(err.message||err)
        })
    })
}

/**
 * Retrun a full attachment about survey response
 * @param {object} options survey options in dialog
 */
function generateSurveyResAtt(options) {
    let attachments ={
        'callback_id': 'survey',
        'title': 'Survey',
        'state': 'survey',
        'elements': [
            {
                'label': 'Happiness Level',
                'type': 'select',
                'name': 'level',
                'options': options
            },
            {
                'label': 'Comment',
                'name': 'comment',
                'type': 'textarea',
                'optional': 'true',
                'placeholder': 'Provide additional information if needed.'
            }
        ]
    }
    return attachments
}


/**
 * Receive request from slack buttons submission.
 * @param {object} payload three different type of slack dialog submit(configuration, eventlog from  admin and survey from team member).
 */
function interactivityReceivedDialogReq(payload) {
    if(payload.state === 'conf') {
        shchedule.updateSurvey(payload.submission)
        admin.publicPostMsg(textRes.successMes('Setup configuration success!'),payload.channel.id)    
    } else if (payload.state === 'event') {
        db.addEvent(payload)
        admin.publicPostMsg(textRes.successMes('Record event success!'),payload.channel.id)
    } else if (payload.state === 'survey') {
        db.addFeedback(payload)
        admin.publicPostMsg(textRes.successMes('Thanks for your assistance, your submission has saved.'),payload.channel.id)
    }
}


module.exports = {interactivity}