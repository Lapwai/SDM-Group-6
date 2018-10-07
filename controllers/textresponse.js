var app = require('../app')

function successRes(res,text) {
    var responseObject = {
        'attachments': [{
            'fallback': 'Required plain-text summary of the attachment.',
            'color': 'good',          
            'pretext': ':tada: *Success*',
            'text': text,
            'attachment_type': 'default',
            'mrkdwn_in': ['text','pretext'],
        }]
    }
    res.setHeader('content-type', 'application/json');
    res.send(JSON.stringify(responseObject));
}

function errorRes(req,res,text) {
    let command = '\n\nYour previous command: \n_'
    command = command + req.body.command + ' ' + req.body.text +'_' 
    var responseObject = {
        'attachments': [{
            'fallback': 'Required plain-text summary of the attachment.',
            'color': 'danger',
            'pretext': ':hankey: *Error*',
            'text': text + command,
            'attachment_type': 'default',
            'mrkdwn_in': ['text','pretext'],
        }]
    }
    res.setHeader('content-type', 'application/json');
    res.send(JSON.stringify(responseObject));
}



function buttonRes(res,error) {
    var responseObject = {
        'attachments': [{
                'fallback': 'Required plain-text summary of the attachment.',
                'callback_id': 'admin_delete',
                'color': '#3AA3E3',
                'pretext': ':bangbang: *Alert*',
                'text': 'Are you sure to delete \nasdasda\n asdad \n?',
                'mrkdwn_in': ['text','pretext'],
                'attachment_type': 'default',
                'actions': [{
                    'name': 'admin_delete',
                    'text': 'Delete',
                    'style': 'danger',
                    'type': 'button',
                    'value': 'delete'
                },{
                    'name': 'admin_delete',
                    'text': 'Cancel',
                    'type': 'button',
                    'value': 'cancel'
                }]
        }]
    }

}

module.exports = {successRes, errorRes, buttonRes};