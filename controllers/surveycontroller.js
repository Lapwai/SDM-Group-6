const app = require('../app')
const db = require('../routes/database')
const request = require('request')
const textRes = require('./textresponse')


// add a new survey
exports.add = function(req, res) {
    let role = verifyAuth(req.body.user_id)
    role.then(value => {
        let params = req.body.text.split(';').map( str => { return str.trim() })
        let verify = addVerifyParams(params)
        if(verify[0] == false) {
            textRes.textRes(res,true,verify[1])
            return
        }
        let insertStr = addGenerateSql(req.body,value,params)
        let insert = db.pgQuery(insertStr)
        insert.then((insertValue) => {
            textRes.textRes(res,false,'Add success!')
        }).catch((err) => {
            textRes.textRes(res,true,err.message||err)
        })
    }).catch(err => {
        textRes.textRes(res,true,err.message||err)
    })
}
function addVerifyParams(params) {
    if(params.length !== 4) {
        return [false, 'Please input correct command! \n _/survey_add name; time; title; message [separated by semicolon] _']
    }
    let regExp = new RegExp(/^((2[0-3])|[0-1]\d):[0-5]\d$/)
    if(!regExp.test(params[1])) {
        return [false, 'Please input correct time such as 09:13 or 13:09!']
    }
    let temp = ['name','time', 'title', 'message']
    params.forEach((e, i) => {
        if(e.trim().length === 0) {
            return [false, 'Please input survey ' + temp[i] +'! \n _/survey_add name; time; title; message [separated by semicolon] _']
        }
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
            textRes.textRes(res,false,value)
        }).catch(err => {
            textRes.textRes(res,true,err)
        })
    }).catch(err => {
        textRes.textRes(res,true,err)
    })
}
function processSqlwithRole(user_id,role){
    if(role == 'manager'){
        return 'SELECT * FROM survey WHERE user_id = \''+ user_id +'\';'
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
        output =output+[value.rows[i]['survey_id'],value.rows[i]['survey_name'],active]+'\n'
    } 
    return output
}




// view all feedbacks in terms of the survey
exports.view = function(req, res) {
    let role = verifyRole(req.body.user_id)
    role.then(value => {
        let param = req.body.text.trim()
        viewGenerateSql(req.body.user_id,param).then(value => {
            let view = db.pgQuery(value)
            view.then(viewValue => {
                if(viewValue.rowCount === 0) {
                    textRes.textRes(res,true,'There is no feedback of your survey!')
                } else {
                    var str = 'To do ...'
                    viewValue.rows.forEach(e => {
                        
                    })
                    textRes.textRes(res,false,str)
                }
            }).catch(err => {
                textRes.textRes(res,true,err.message||err)
            })
        })
    }).catch(err => {
        textRes.textRes(res,true,err.message||err)
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
                   str = str + '\'' + e['survey_id'] + '\','
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
        let sqlStr = 'SELECT survey_id FROM survey where user_id = \'' + user_id + '\'';
        let sql = db.pgQuery(sqlStr)
        sql.then(sqlValue => {
            if(sqlValue.rowCount === 0) {
                reject('There is no survey created by you!')
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
        var results = db.pgQuery('SELECT * FROM roles WHERE user_id = \''+ user_id +'\';')
        results.then( value => {
            if(value.rowCount === 0) {
                // reject('You do not have permission to handle survey!')
                // reject('Sorry, only researcher and manager could list all their survey results.\n Use /my_history to check your history, please.')
                reject('Sorry, only researcher and manager could handle survey.\n Use _/my_history_ to check your history, please!')
            } else {
                resolve(value.rows[0]['role'])  
            }
        }).catch(error => {
            reject(error)
        })
    })
}
