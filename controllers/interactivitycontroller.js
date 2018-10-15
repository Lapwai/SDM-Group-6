const app = require('../app')
const db = require('../routes/database')
const request = require('request')
const textRes = require('./textresponse')
const shchedule = require('./schedulecontroller')
const admin = require('./admincontroller')

exports.interactivity = function(req, res) {
    let payload = JSON.parse(req.body.payload)

    if(payload.type === 'interactive_message') {
        interButton(payload)
        textRes.successRes(res, 'Got the message!')
    } else if(payload.type === 'dialog_submission') {
        interDialog(res,payload)
        // textRes.successRes(res, 'Got the dialog!')
    } else {
        textRes.errorRes(req,res, req.body.payload)
    }
}
function interButton(payload) {
    let name = payload.actions[0].name
    let value = payload.actions[0].value
    
    if(name === 'conf') {
        if(value === 'yes') {
            postDialog(generateOptions(payload.trigger_id,confAtt()))
        }
    } else if(name === 'event') {
        if(value === 'yes') {
            postDialog(generateOptions(payload.trigger_id,eventAtt()))
        }
    } else if (anme === 'survey') {
        if(value === '') {

        } else {

        }
    }
}

function postDialog(options) {
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

function generateOptions(trigger_id,att) {
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

function confAtt() {
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
function eventAtt() {
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


function interDialog(res,payload) {
    if(payload.state === 'conf') {
        shchedule.updateSurvey(payload.submission)
        admin.publicCostEphemeral(textRes.successMes('Setup configuration success!'),payload.channel.id,payload.user.id)
    } else if (payload.state === 'event') {
        admin.publicCostEphemeral(textRes.successMes('Record event success!'),payload.channel.id,payload.user.id)
    }
}
function dialogResultAtt() {
    let attachments = [{
        'fallback' : 'You can not user this feature!',
        'mrkdwn_in' : ['pretext','text'],
        'pretext' : ':mag: *Event log*',
        'text': '',
        'color' : '#3AA3E3',
        'attachment_type' : 'default',
        'callback_id': 'adfafdadfafdadfasdf'
    }]
    return attachments
}
// {"type":"dialog_submission","token":"NoLDQeFvLs2uJmXkbrc1jlEv","action_ts":"1539539639.051180","team":{"id":"TCSEYGNKW","domain":"sdm-6"},"user":{"id":"UCSLXUNRG","name":"ioswpf"},"channel":{"id":"DCS415NQH","name":"directmessage"},"submission":{"title":"Test title","starttime":"13:00","option":"Very happy; happy; normal; unhappy; hha","timeinterval":"3","postpone":"5"},"callback_id":"conf-dialog","response_url":"https://hooks.slack.com/app/TCSEYGNKW/457285614646/qCeaAQRFq7XK9Nri05A9fMhK","state":"conf"}





// function generateSql(payload) {
//     return new Promise((resolve, reject) => {
//         let callback_id = payload.callback_id
//         db.pgQuery('SELECT * FROM survey WHERE hash = \'' + callback_id + '\';')
//         .then(survey_ids => {
//             if(survey_ids.rowCount === 0) {
//                 reject('Did not find the survey!')
//             }
//             let survey_id = survey_ids.rows[0]['id']
//             let member_id = payload.user.id
//             let channel_id = payload.channel.id
//             let channel_name = payload.channel.name
//             let ts = '\'now\''
//             let option = payload.actions[0].selected_options[0].value

//             let str = 'INSERT INTO feedbacks(survey_id,member_id,channel_id,channel_name,ts,option) VALUES (';
//             str = str.concat(survey_id,',\'',member_id,'\',\'',channel_id,'\',\'',channel_name,'\',',ts,',\'',option,'\');')
//             resolve(str)
//         }).catch(err => {
//             reject(err.message||err)
//         })
//     })
// }



// {
//     'type': 'interactive_message',
//     'actions': [
//       {
//         'name': 'recommend',
//         'value': 'recommend',
//         'type': 'button'
//       }
//     ],
//     'callback_id': 'comic_1234_xyz',
//     'team': {
//       'id': 'T47563693',
//       'domain': 'watermelonsugar'
//     },
//     'channel': {
//       'id': 'C065W1189',
//       'name': 'forgotten-works'
//     },
//     'user': {
//       'id': 'U045VRZFT',
//       'name': 'brautigan'
//     },
//     'action_ts': '1458170917.164398',
//     'message_ts': '1458170866.000004',
//     'attachment_id': '1',
//     'token': 'xAB3yVzGS4BQ3O9FACTa8Ho4',
//     'original_message': {'text':'New comic book alert!','attachments':[{'title':'The Further Adventures of Slackbot','fields':[{'title':'Volume','value':'1','short':true},{'title':'Issue','value':'3','short':true}],'author_name':'Stanford S. Strickland','author_icon':'https://api.slack.comhttps://a.slack-edge.com/bfaba/img/api/homepage_custom_integrations-2x.png','image_url':'http://i.imgur.com/OJkaVOI.jpg?1'},{'title':'Synopsis','text':'After @episod pushed exciting changes to a devious new branch back in Issue 1, Slackbot notifies @don about an unexpected deploy...'},{'fallback':'Would you recommend it to customers?','title':'Would you recommend it to customers?','callback_id':'comic_1234_xyz','color':'#3AA3E3','attachment_type':'default','actions':[{'name':'recommend','text':'Recommend','type':'button','value':'recommend'},{'name':'no','text':'No','type':'button','value':'bad'}]}]},
//     'response_url': 'https://hooks.slack.com/actions/T47563693/6204672533/x7ZLaiVMoECAW50Gw1ZYAXEM',
//     'trigger_id': '13345224609.738474920.8088930838d88f008e0'
//   }
