const app = require('../app')
const db = require('../routes/database')
const request = require('request')
const textRes = require('./textresponse')



exports.history = function(req, res) {
    processSurveyById(req.body.user_id).then(value =>{
        textRes.textRes(res,false,value)
    }).catch(err => {
        textRes.textRes(res,true,err)
    })

}
function processSurveyById(id) {
    var output=''
    return new Promise(function(resolve, reject) {
        var results = db.pgQuery('SELECT * FROM feedbacks WHERE member_id = \''+ id +'\';')
        results.then( value => {
            if(value.rowCount === 0) {
                reject('Sorry, no survey created by you!')
            } else {
                for(var i=0;i<value.rowCount;i++){
                    output =output+[value.rows[i]['survey_id'],value.rows[i]['fb_id']]+'\n'
                } 
                resolve(output)
            }
        }).catch(error => {
            reject(error)
        })
    })
}