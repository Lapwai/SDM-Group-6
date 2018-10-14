const app = require('../app')
const db = require('../routes/database')
const request = require('request')
const textRes = require('./textresponse')

exports.interactivity = function(req, res) {
    let payload = JSON.parse(req.body.payload)

    if(payload.type === 'interactive_message') {
        interButton(payload)
        textRes.successRes(res, 'Got the message!')
    } else if(payload.type === 'dialog_submission') {
        interDialog(payload)
        textRes.successRes(res, 'Got the dialog!')
    } else {
        textRes.errorRes(req,res, req.body.payload)
    }
}
function interButton(payload) {
    let name = payload.actions[0].name
    let value = payload.actions[0].value
    if(value === 'no') {
        return
    }
    if(name === 'conf') {
        postConfDialog(payload.trigger_id)
        console.log('post conf')
    } else if(name === 'event' ) {
        postEventDialog(payload.trigger_id)
        console.log('post event')
    }
}


function postConfDialog(trigger_id) {
    let bodyPara = {
                // 'response_type' : 'in_channel',
                'trigger_id':trigger_id,
                'dialog':confAtt()}
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
    console.log('conf' + JSON.stringify(options))
    request(options, (err, _, body) => {
        let result = {}
        if((typeof body) === 'string') {
            result = JSON.parse(body)
        } else {
            result = body
        }
        if(err || result['error']) {
            console.log('post dialog error')
            console.log(err)
            console.log(result)
            console.log( err || result['error'])
        } else {
            console.log('success')
        }
    })
}
function confAtt() {
    let attachments ={
        "callback_id": "conf-dialog",
        "title": "Notification configuration",
        "state": "conf",
        "elements": [
            {
                "label": "Title",
                "name": "title",
                "type": "text",
                "placeholder": "Just remind it is your time to submit your happiness information. Choose a button to click."
            },
            {
                "label": "Start time",
                "type": "select",
                "name": "starttime",
                "options": [
                  {
                    "label": "9:00",
                    "value": "9"
                  },
                  {
                    "label": "11:00",
                    "value": "11"
                  },
                  {
                    "label": "13",
                    "value": "13:00"
                  },
                  {
                    "label": "15:00",
                    "value": "15"
                  }
                ]
            },
            {
                "label": "Option 1",
                "name": "option 1",
                "type": "text",
                "placeholder": "Very Happy"
            },
            {
                "label": "Option 2",
                "name": "option 2",
                "type": "text",
                "placeholder": "Happy"
            },
            {
                "label": "Option 3",
                "name": "option 3",
                "type": "text",
                "placeholder": "Normal"
            },
            {
                "label": "Option 4",
                "name": "option 4",
                "type": "text",
                "placeholder": "Unhappy"
            },
            {
                "label": "Option 5",
                "name": "option 5",
                "type": "text",
                "placeholder": "Very Unhappy"
            },
            {
                "label": "Time interval",
                "type": "select",
                "name": "timeinterval",
                "options": [
                    {
                      "label": "2 Minutes",
                      "value": "2"
                    },
                    {
                      "label": "3 Minutes",
                      "value": "3"
                    },
                    {
                      "label": "4 Minutes",
                      "value": "4"
                    },
                    {
                      "label": "5 Minutes",
                      "value": "5"
                    }
                ]
            },
            {
                "label": "Postpone time",
                "type": "select",
                "name": "postpone",
                "options": [
                    {
                      "label": "5 Minutes",
                      "value": "5"
                    },
                    {
                      "label": "10 Minutes",
                      "value": "10"
                    },
                    {
                      "label": "15 Minutes",
                      "value": "15"
                    }
                ]
            }
        ]
    }
    return attachments
}

function postEventDialog(trigger_id) {

}





function interDialog(payload) {
    console.log(payload)
    console.log(JSON.stringify(payload))
}






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
//     "type": "interactive_message",
//     "actions": [
//       {
//         "name": "recommend",
//         "value": "recommend",
//         "type": "button"
//       }
//     ],
//     "callback_id": "comic_1234_xyz",
//     "team": {
//       "id": "T47563693",
//       "domain": "watermelonsugar"
//     },
//     "channel": {
//       "id": "C065W1189",
//       "name": "forgotten-works"
//     },
//     "user": {
//       "id": "U045VRZFT",
//       "name": "brautigan"
//     },
//     "action_ts": "1458170917.164398",
//     "message_ts": "1458170866.000004",
//     "attachment_id": "1",
//     "token": "xAB3yVzGS4BQ3O9FACTa8Ho4",
//     "original_message": {"text":"New comic book alert!","attachments":[{"title":"The Further Adventures of Slackbot","fields":[{"title":"Volume","value":"1","short":true},{"title":"Issue","value":"3","short":true}],"author_name":"Stanford S. Strickland","author_icon":"https://api.slack.comhttps://a.slack-edge.com/bfaba/img/api/homepage_custom_integrations-2x.png","image_url":"http://i.imgur.com/OJkaVOI.jpg?1"},{"title":"Synopsis","text":"After @episod pushed exciting changes to a devious new branch back in Issue 1, Slackbot notifies @don about an unexpected deploy..."},{"fallback":"Would you recommend it to customers?","title":"Would you recommend it to customers?","callback_id":"comic_1234_xyz","color":"#3AA3E3","attachment_type":"default","actions":[{"name":"recommend","text":"Recommend","type":"button","value":"recommend"},{"name":"no","text":"No","type":"button","value":"bad"}]}]},
//     "response_url": "https://hooks.slack.com/actions/T47563693/6204672533/x7ZLaiVMoECAW50Gw1ZYAXEM",
//     "trigger_id": "13345224609.738474920.8088930838d88f008e0"
//   }
