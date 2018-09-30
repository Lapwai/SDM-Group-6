var app = require('../app')

function textRes(res,error,text) {
    var responseObject = {
        'attachments': [{
            "fallback": "Required plain-text summary of the attachment.",
            "color": (error == true) ? 'danger' : "good",          
            "title": (error == true) ? '*Error*' : '*Success*',
            "text": text,
            "attachment_type": "default",
            "mrkdwn_in": ["title", "text"],
        }]
    }
    res.setHeader('content-type', 'application/json');
    res.send(JSON.stringify(responseObject));
}

function buttonRes(res,error) {

}

module.exports = {textRes,buttonRes};
