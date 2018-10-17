var app = require('../app')

/**
 * Generate success attachment message with text
 * @param {string} text text.
 */ 
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

/**
 * Generate error attachment message with text
 * @param {string} text text.
 */ 
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

/**
 * Response success message with attachment
 * @param {object} res response.
 * @param {string} text text.
 */ 
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
    res.status(200)
    res.setHeader('content-type', 'application/json');
    res.send(JSON.stringify(responseObject));
}

/**
 * Response error message with attachment
 * @param {object} req original request.
 * @param {object} res response.
 * @param {string} text text.
 */
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
    res.status(500)
    res.setHeader('content-type', 'application/json');
    res.send(JSON.stringify(responseObject));
}

module.exports = {successMes, errorMes, successRes, errorRes};




