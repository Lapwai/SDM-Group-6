const app = require('../app')
const db = require('../routes/database')
const request = require('request')
const textRes = require('./textresponse')
const shcedule = require('./schedulecontroller')
const crypto = require('crypto');


// add a new survey
exports.add = function(req, res) {
    let role = verifyAuth(req.body.user_id)
    role.then(value => {
        let params = req.body.text.split(';').map( str => { return str.trim() })
        let verify = addVerifyParams(params)
        if(verify[0] == false) {
            textRes.errorRes(req,res,verify[1])  
            return
        }
        let hash = crypto.createHash('md5').update(new Date().toString()).digest('hex')
        let insertStr = addGenerateSql(hash,req.body.user_id,value,params)
        let insert = db.pgQuery(insertStr)
        insert.then(_ => {
            if(value == 'researcher') {
                shcedule.add(hash,params)
                textRes.successRes(res,'Add survey success!')
            } else {
                shcedule.post(hash,params)
                textRes.successRes(res,'Add survey success!')
            }
        }).catch((err) => {
            textRes.errorRes(req,res,err.message||err)
        })
    }).catch(err => {
        textRes.errorRes(req,res,err.message||err)
    })
}
function addVerifyParams(params) {
    let command = `/survey_add survey name; survey range[@channel]; survey time[13:09]; survey title; survey message [separated by semicolon]`

    if(params.length !== 5) {
        return [false, 'Please input correct command! \n' + command]
    }
    let regExp = new RegExp(/^((2[0-3])|[0-1]\d):[0-5]\d$/)
    let survey_time = params[2]
    if(!regExp.test(survey_time)) {
        return [false, 'Please input correct time such as 09:13 or 13:09!']
    }
    let temp = ['survey name', 'survey range', 'survey time', 'survey title', 'survey message']
        params.forEach((e, i) => {
        if(e.trim().length === 0) {
            return [false, 'Please input survey ' + temp[i] +'! \n' + command]        }
    });
    return [true,'']
}
function addGenerateSql(hash, user_id, part, params) {
    return new Promise(function(resolve, reject) {

        let survey_name = params[0]
        let survey_range = params[1]
        let survey_time = params[2]
        let survey_title = params[3]
        let survey_message = params[4]

        let str = 'INSERT INTO survey(hash, role_id, role_part, name, range, time, title, message, active) VALUES (\'' + hash + '\',\'' + user_id + '\',\'' + part + '\',\'' + survey_name + '\',\'' +  survey_range + '\',\'' +  survey_time + '\',\'' +  survey_title + '\',\'' +  survey_message + '\',' + 'false' + ');'
        resolve(str)
    })


}




// update survey status, isActive = 1/0
exports.set = function(req, res) {


}

// list all surveies which added by the researcher/manager
exports.surveylistForResearcherOrManager = function(req, res) {
    verifyAuth(req.body.user_id).then(value => {
        var sql=processSqlwithRole(req.body.user_id,value)
        queryAllSurveyWithId(sql).then(value =>{
            textRes.successRes(res,value)
        }).catch(err => {
            textRes.errorRes(req,res,err)
        })
    }).catch(err => {
        textRes.errorRes(req,res,err)
    })
}
function processSqlwithRole(user_id,role){
    if(role == 'manager'){
        return 'SELECT * FROM survey WHERE role_id = \''+ user_id +'\';'
    }else{
        return 'SELECT * FROM survey'
    }
}
// module.exports={processSqlwithRole}
//query all research from this person
function queryAllSurveyWithId(sql) {
    return new Promise(function(resolve, reject) {
        var results = db.pgQuery(sql)
        results.then( value => {
            if(value.rowCount === 0) {
                reject('Sorry, no survey record for you.\n')
            } else {
                resolve(listSurveyOnebyOne(value))
            }
        }).catch(error => {
            reject(error)
        })
    })
}
function listSurveyOnebyOne(value){//List all survey one by one 
    var output=''
    var active=''
    for(var i=0;i<value.rowCount;i++){
        if(value.rows[i]['active']==true){
             active = 'Active'
        }else{
             active='Not Active'
        }
        output =output+[value.rows[i]['id'],value.rows[i]['name'],active]+'\n'
    } 
    return output
}




// view all feedbacks in terms of the survey
exports.view = function(req, res) {
    let role = verifyAuth(req.body.user_id)
    role.then(_ => {
        let param = req.body.text.trim()
        viewGenerateSql(req.body.user_id,param).then(value => {
            let view = db.pgQuery(value)
            view.then(viewValue => {
                if(viewValue.rowCount === 0) {
                    textRes.errorRes(req,res,'There is no feedback of your survey!')
                } else {
                    var str = 'To do ...'
                    viewValue.rows.forEach(e => {
                        
                    })
                    textRes.successRes(res,str)
                }
            }).catch(err => {
                textRes.errorRes(req,res,err.message||err)
            })
        })
    }).catch(err => {
        textRes.errorRes(req,res,err.message||err)
    })
}
function viewGenerateSql(user_id,param) {
    return new Promise(function(resolve, reject) {
        if(param !== 'all') {
            resolve('SELECT * FROM feedbacks WHERE survey_id = \'' + param + '\'')
       } else {
           let all = viewGetAllID(user_id)
           all.then(ids => {
               var str = 'SELECT * FROM feedbacks WHERE survey_id IN ('
               ids.forEach( e => {
                   str = str + '\'' + e['id'] + '\','
               });
               str = str.substring(0, str.length-1) + ');'
               resolve(str)
           }).catch(err => {
               reject(err.message||err)
           })
       }
    })
}
function viewGetAllID(user_id) {
    return new Promise(function(resolve, reject) {
        let sqlStr = 'SELECT id FROM survey where role_id = \'' + user_id + '\'';
        let sql = db.pgQuery(sqlStr)
        sql.then(sqlValue => {
            if(sqlValue.rowCount === 0) {
                reject('There is no survey added by you!')
            } else {
                resolve(sqlValue.rows)
            }
        }).catch(err => {
            reject(err.message||err)
        })
    })
}
   



// verify role
function verifyAuth(user_id) {
    return new Promise(function(resolve, reject) {
        var results = db.pgQuery('SELECT * FROM role WHERE id = \''+ user_id +'\';')
        results.then( value => {
            if(value.rowCount === 0) {
                reject('Sorry, only researcher and manager could handle survey.')
            } else {
                resolve(value.rows[0]['role'])  
            }
        }).catch(error => {
            reject(error)
        })
    })
}
