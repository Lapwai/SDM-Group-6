var app = require('../app')
var db = require('../routes/database')
var request = require('request')
var textRes = require('./textresponse')


// add a new survey
exports.add = function(req, res) {
    let role = verifyRole(req.body.user_id)
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
exports.list = function(req, res) {


}

// view all feedbacks in terms of the survey
exports.view = function(req, res) {


}

// verify role
function verifyRole(user_id) {
    return new Promise(function(resolve, reject) {
        var results = db.pgQuery('SELECT role FROM roles WHERE user_id = \''+ user_id +'\';')
        results.then( value => {
            if(value.rowCount === 0) {
                reject('Does not find the member!')
            } else {
                resolve(value.rows[0]['role'])
            }
        }).catch(err => {
            reject(err)
        })
    })
}
