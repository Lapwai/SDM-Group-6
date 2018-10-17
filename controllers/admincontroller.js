const app = require('../app')
const db = require('../routes/database')
const request = require('request')
const textRes = require('./textresponse')
const schedule = require('./schedulecontroller')
const botkit = require('botkit')


//init chatbot for one workspace in slack, the one who exec 'init' command will be the administrator
function init(bot, message) {
    let isInit = false
    isInit = process_messageText_for_initCommand(isInit,message) //verify the command content (message.text)
    if(isInit == false ) { return } // if command is incorrect, return directly
    check_process_initStatus(message) // check init status for current bot
    
}

// check init status for current bot
function check_process_initStatus(message){
    let results = db.pgQuery('SELECT * FROM admin;')//query admin table, check if admin have been assigned.
    results.then(queryValue => {
        process_adminQueryResult(queryValue,message)//query Result Process
    }).catch(err => { //try catch err message 
        postMessage(textRes.errorMes(err.message||err),message.channel)
    });
}
//process the result of the admin table query, if admin table no record, means never init, could insert into admin table with current user
function process_adminQueryResult(queryValue,message){
    if(queryValue.rowCount == 0) { //if admin is null, this bot have not been inited, need inserted in to admin table
        // when init the workspace, system should add a default schedule to check notification setting of notification everyday
        schedule.systemAddDefaultSchedule()
        let insert=process_insertSql_for_adminTable(message) //process current insert sql for admin table and insert into admin table
        insert.then(_ => {
            let msg = process_postMessage_after_insertAdminTable(message) //return post message after init bot with insert current user into admin
            postMessage(textRes.successMes(msg),message.channel)
        }).catch(err => {  //try catch err message 
            postMessage(textRes.errorMes(err.message||err),message.channel)
        })
    } else {  //return current bot have been init to user
        postMessage(textRes.errorMes('Workspace already init!'),message.channel)
    }    
}

//process post message after init for current bot
function process_postMessage_after_insertAdminTable(){
    let msg = 'Worksapce\'s new app \' *Happiness Level* \' init success!'
    return msg
}

//process current insert sql for admin table and insert into admin table
function process_insertSql_for_adminTable(message){
    return new Promise((resolve, reject) => {
        let id = '\'' + message.user + '\''
        let insertStr = 'INSERT INTO admin (id) VALUES('+ id + ')'
        console.log(insertStr)
        db.pgQuery(insertStr).then(value => {
            console.log('insert admin success')
            resolve('')
        }).catch(err => {
            console.log('insert admin err='+err)
            reject(err.message || err)
        })
    })
}

//process message.text for init commanc, return judgment result with isInin parameter
function process_messageText_for_initCommand(isInit,message){
    if('init' === message.text || 'Init' === message.text) { isInit = true }
    return isInit
}
//Process configration command and display a correct page for admin. when the auth is right, show configrationPage, or give a message. 
function configuration(bot, message) {
    let texts = ['conf','Conf','configuration','Configuration']
    isConf = false
    isConf=process_messageText(isConf,texts,message)//process admin's command
    if(isConf == false ) { return }  // if not configration command, return directly.
    configuration_verifyAdmin_auth(message)//verify admin auth and post correct page
}

//process admin's command
function process_messageText(isConf,texts,message){
    texts.forEach(e => {
        if(e === message.text) { isConf = true }  
    }); 
    return isConf;
}

//verify admin auth and post correct page
function configuration_verifyAdmin_auth(message){
    verifyAdmin(message.user).then(_ => {
        postMessage(confAtt(),message.channel) //confAtt() is when admin auth is right, post this slack page to admin
    }).catch(err => {
        postMessage(textRes.errorMes(err.message||err),message.channel)
    })
}

//When admin auth is correct, post this string to api function
function confAtt() {
    let attachments = [{
        'fallback' : 'This is Happiness Level.',
        'mrkdwn_in' : ['pretext','text'],
        'pretext' : ':mag: *Configuration*',
        'text': 'Do you want to setup the configuration of notification?',
        'color' : '#3AA3E3',
        'attachment_type'  : 'default',
        'callback_id': 'conf',
        'actions': [{
            'name': 'conf',
            'text': 'Yes',
            'type': 'button',
            'value': 'yes'
        },{
            'name': 'conf',
            'text': 'No',
            'type': 'button',
            'value': 'no'
        }]
    }]
    return attachments
}

//Process logger command and display a correct page for admin. when the auth is right, show event, or give a message. 
function eventlog(bot, message) {
    let texts = ['event','Event','eventlog','Eventlog']
    let isEvent = false
    isEvent=process_messageText(isEvent,texts,message)
    if(isEvent == false ) { return }
    event_verifyAdmin_auth(message);
}

//verify logger auth and post correct page
function event_verifyAdmin_auth(message){
    verifyAdmin(message.user).then(_ => {
        postMessage(eventAtt(),message.channel) //confAtt() is when admin auth is right, post this slack page to admin
    }).catch(err => {
        postMessage(textRes.errorMes(err.message||err),message.channel)
    })
}
//When logger auth is correct, post this String to api function
function eventAtt() {
    let attachments = [{
        'fallback' : 'This is Happiness Level.',
        'mrkdwn_in' : ['pretext','text'],
        'pretext' : ':mag: *Event log*',
        'text': 'Do you want to record an event?',
        'color' : '#3AA3E3',
        'attachment_type' : 'default',
        'callback_id': 'event',
        'actions': [{
            'name': 'event',
            'text': 'Yes',
            'type': 'button',
            'value': 'yes'
        },{
            'name': 'event',
            'text': 'No',
            'type': 'button',
            'value': 'no'
        }]
    }]
    return attachments
}

//Process view command and return a web page to admin. when the auth is right, show event, or give a message. 
function view(bot, message) {
    let texts = ['view','View']
    let isView = false
    texts.forEach(e => {
        if(e === message.text) { isView = true }
    });
    if(isView == false ) { return }
    verifyAdmin(message.user).then(_ => {
        postMessage(viewAtt(),message.channel)
    }).catch(err => {
        postMessage(textRes.errorMes(err.message||err),message.channel)
    })
}
//When logger auth is correct, post this String to api function
function viewAtt() {
    let attachments = [{
        'fallback' : 'This is Happiness Level.',
        'mrkdwn_in' : ['pretext','text'],
        'pretext' : '*View*',
        'text': 'Please click the link:\nhttps://sdm-g6.herokuapp.com/csv',
        'color' : 'good',
        'attachment_type' : 'default',
        'callback_id': 'view'
    }]
    return attachments
}

//post interface data to slack api
function postMessage(atts, channel) {
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

function publicPostMsg(atts, channel) {
    postMessage(atts,channel)
}

//query database to verift user auth
function verifyAdmin(user_id) {
    return new Promise((resolve, reject) => {
        let results = db.pgQuery('SELECT id FROM admin;')
        results.then(value => {
            if(value.rowCount === 0) {
                reject('Workspace needs init first!')
            } else {
                if(user_id !== value.rows[0]['id']) {
                    reject('Only Admin can use this command!')
                } else {
                    resolve('')
                }
            }
        }).catch(err => {
            reject(err.message||err)
        })
    })
}



module.exports = {init, process_postMessage_after_insertAdminTable, process_insertSql_for_adminTable, process_messageText_for_initCommand, configuration, process_messageText, eventlog, view, publicPostMsg, verifyAdmin}
