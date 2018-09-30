var app = require('../app')
var db = require('../routes/database')
var request = require('request')


// add a new survey
exports.add = function(req, res) {


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
        var results = db.pgQuery('SELECT role FROM roles WHERE role = \''+ user_id +'\';')
        results.then( value => {
            if(value.rowCount === 0) {
                reject('')
            } else {
                resolve(value.rowCount)
            }
        }).catch(err => {
            reject(err)
        })
    })
}
