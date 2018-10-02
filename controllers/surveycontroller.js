var app = require('../app')
var db = require('../routes/database')
var request = require('request')
var textRes = require('./textresponse')


// add a new survey
exports.add = function(req, res) {
    let role = verifyAuth(req.body.user_id)
    role.then(value => {
        textRes.textRes(res,false,value)
    }).catch(err => {
        textRes.textRes(res,true,err)
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

// view all feedbacks in terms of the survey
exports.view = function(req, res) {
   
}
exports.myHistory = function(req, res) {
   
}

function processSqlwithRole(user_id,role){
    if(role == 'manager'){
        return 'SELECT * FROM survey WHERE user_id = \''+ user_id +'\';'
    }else{
        return 'SELECT * FROM survey'
    }
}
module.exports={processSqlwithRole}
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
    for(var i=0;i<value.rowCount;i++){
        output =output+[value.rows[i]['survey_id'],value.rows[i]['survey_name']]+'\n'
    } 
    return output
}



// verify role
function verifyAuth(user_id) {
    return new Promise(function(resolve, reject) {
        var results = db.pgQuery('SELECT * FROM roles WHERE user_id = \''+ user_id +'\';')
        results.then( value => {
            if(value.rowCount === 0) {
                reject('Sorry, only researcher and manager could list all their survey results.\n Use /my_history to check your history, please.')
            } else {
                resolve(value.rows[0]['role'])  
            }
        }).catch(error => {
            reject(error)
        })
    })
}
