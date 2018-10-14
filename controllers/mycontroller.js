const app = require('../app')
const db = require('../routes/database')
const request = require('request')
const textRes = require('./textresponse')



exports.history = function(req, res) {
    processSurveyById(req.body.user_id).then(value =>{
        textRes.successRes(res,value)
    }).catch(err => {
        textRes.errorRes(req,res,err)
    })
}
function processSurveyById(id) {
    var output=''
    return new Promise(function(resolve, reject) {
        var results = db.pgQuery('select feedbacks.option,survey.title,survey.message from feedbacks,survey  where feedbacks.survey_id = survey.id and feedbacks.member_id = \''+ id +'\';')
        results.then( value => {
            if(value.rowCount === 0) {
                reject('Sorry, no survey created by you!')
            } else {
                for(var i=0;i<value.rowCount;i++){
                    output =output+[value.rows[i]['title'],value.rows[i]['message'],value.rows[i]['option']]+'\n'
                } 
                resolve(output)
            }
        }).catch(error => {
            reject(error)
        })
    })
}