var app = require('../app')

function textRes(res,error,text) {
    var responseObject = {
        'attachments': [{
            'fallback': 'Required plain-text summary of the attachment.',
            'color': (error == true) ? 'danger' : 'good',          
            'pretext': (error == true) ? ':hankey:  *Error*' : ':tada: *Success*',
            'text': text,
            'attachment_type': 'default',
            'mrkdwn_in': ['text','pretext'],
        }]
    }
    res.setHeader('content-type', 'application/json');
    res.send(JSON.stringify(responseObject));
}

function buttonRes(res,error) {

}

module.exports = {textRes,buttonRes};
