var app = require('../app')

function successMes(text) {
    var responseObject = [{
        'fallback': 'Required plain-text summary of the attachment.',
        'color': 'good',          
        'pretext': ':tada: *Success*',
        'text': text,
        'attachment_type': 'default',
        'mrkdwn_in': ['text','pretext'],
        'callback_id': 'success'
    }]
    return responseObject
}
function errorMes(text) {
    var responseObject = [{
        'fallback': 'Required plain-text summary of the attachment.',
        'color': 'danger',
        'pretext': ':hankey: *Error*',
        'text': text,
        'attachment_type': 'default',
        'mrkdwn_in': ['text','pretext'],
        'callback_id': 'error'
    }]
    return responseObject
}

function successRes(res,text) {
    var responseObject = {
        'attachments': [{
            'fallback': 'Required plain-text summary of the attachment.',
            'color': 'good',          
            'pretext': ':tada: *Success*',
            'text': text,
            'attachment_type': 'default',
            'mrkdwn_in': ['text','pretext']
        }]
    }
    res.setHeader('content-type', 'application/json');
    res.send(JSON.stringify(responseObject));
}

function errorRes(req,res,text) {
    let command = '\n\nYour previous command: \n_'
    if(req.body.command){
        command = command + req.body.command + ' ' + req.body.text +'_' 
    } else {
        command = ''
    }
    var responseObject = {
        'attachments': [{
            'fallback': 'Required plain-text summary of the attachment.',
            'color': 'danger',
            'pretext': ':hankey: *Error*',
            'text': text + command,
            'attachment_type': 'default',
            'mrkdwn_in': ['text','pretext']
        }]
    }
    res.setHeader('content-type', 'application/json');
    res.send(JSON.stringify(responseObject));
}

module.exports = {successMes, errorMes, successRes, errorRes};