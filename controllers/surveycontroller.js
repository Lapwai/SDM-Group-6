const app = require('../app')
const db = require('../routes/database')
const request = require('request')
const textRes = require('./textresponse')
const crypto = require('crypto');


// add a new survey
exports.add = function(req, res) {
    let role = verifyRole(req.body.user_id)
    role.then(value => {
        let params = req.body.text.split(';').map( str => { return str.trim() })
        let verify = addVerifyParams(params)
        if(verify[0] == false) {
            textRes.textRes(res,true,verify[1])
            return
        }

        let insertStr = addGenerateSql(req.body,value,params)
        let insert = db.pgQuery(insertStr)
        console.log(insert)
        insert.then((insertValue) => {
            textRes.textRes(res,false,'Add success!')
        }).catch((err) => {
            textRes.textRes(res,true,err)
        })
    }).catch(err => {
        textRes.textRes(res,true,err||err.message)
    })
}
function addVerifyParams(params) {
    if(params.length !== 4) {
        return [false, 'Please input correct command! \n _/survey_add name; time; title; message [separated by semicolon] _']
    }
    let temp = ['name','time', 'title', 'message']
    params.forEach((e, i) => {
        if(e.trim().length === 0) {
            return [false, 'Please input survey ' + temp[i] +'! \n _/survey_add name; time; title; message [separated by semicolon] _']
        }
    });
    return [true,'']
}
function addGenerateSql(body, role, params) {
    let temp =  body.text + new Date().getTime()
    let surveyID = crypto.createHash('md5').update(temp).digest('hex')
    let time 
    let str = 'INSERT INTO survey(survey_id, user_id, user_role, survey_name, time, title, message, active) VALUES (\'' + surveyID + '\',\'' + body.user_id + '\',\'' + role + '\',\'' + params[0] + '\',\'' +  params[1] + '\',\'' +  params[2] + '\',\'' +  params[3] + '\',' + 'false' + ');'
    return str
}


// update survey status, isActive = 1/0
exports.set = function(req, res) {


}

// list all surveies which added by the researcher/manager
exports.list = function(req, res) {


}

// view all feedbacks in terms of the survey
exports.view = function(req, res) {


}

// verify role
function verifyRole(user_id) {
    return new Promise(function(resolve, reject) {
        let results = db.pgQuery('SELECT role FROM roles WHERE user_id = \''+ user_id +'\';')
        results.then( value => {
            if(value.rowCount === 0) {
                reject('You do not have permission to add survey!')
            } else {
                resolve(value.rows[0]['role'])
            }
        }).catch(err => {
            reject(err)
        })
    })
}
