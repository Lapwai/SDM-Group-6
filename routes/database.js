const { Pool } = require('pg');
const pool = new Pool({
                      connectionString: process.env.DATABASE_URL ,
                      ssl: false
                      });

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

async function pgQuery(queryStr) {
    return new Promise(function(resolve, reject) {
        pool.connect()
        .then(client => {
            return client.query(queryStr)
            .then(res => {
                client.release()
                resolve(res)
            })
            .catch(e => {
                client.release()
                reject(e.message)
            })
        }).catch(e => {
            reject(e.message)
        })
    })
}

var adminStr = 'CREATE TABLE IF NOT EXISTS admin ( \
    id                TEXT PRIMARY KEY    NOT NULL\
    ); '

var surveyStr = 'CREATE TABLE IF NOT EXISTS survey ( \
    id                SERIAL              PRIMARY KEY, \
    title             TEXT                NOT NULL, \
    starttime         TIME                NOT NULL, \
    option            TEXT                NOT NULL, \
    timeinterval      INTERVAL            NOT NULL, \
    postpone          INTERVAL            NOT NULL \
    ); '   

var feedbacksStr = 'CREATE TABLE IF NOT EXISTS feedbacks ( \
    id                SERIAL              PRIMARY KEY, \
    member_id         mTEXT                NOT NULL, \
    member_name       TEXT                NOT NULL, \
    ts                TIMESTAMP           NOT NULL, \
    option            TEXT                NOT NULL, \
    postpone          Int4                NOT NULL, \
    interval          Int4                NOT NULL, \
    comment           TEXT \
    ); '   

function addDefault() {
    checkDefault().then(value => {
        console.log(value)
    }).catch(_ => {
        let title = 'Just remind it is your time to submit your happiness information. Choose a button to click.'
        let starttime = '15:00'
        let option = 'Very happy;Happy;Normal;Unhappy;Very unhappy'
        let interval = '2 minutes'
        let postpone = '5 minutes'

        let insertStr = 'INSERT INTO survey(title, starttime, option, timeinterval, postpone) VALUES (\'' + title + '\', \'' + starttime + '\', \'' + option + '\', \'' + interval + '\', \'' +  postpone + '\');';
        pgQuery(insertStr)
    })

}
function checkDefault() {
    return new Promise((resolve, reject) => {
        pgQuery("SELECT * FROM survey;").then(value => {
            if(value.rowCount !== 0){
                resolve('Already has default survey')
            } else {
                reject('')
            }
        }).catch(err => {
            reject(err.message, err)
        })
    })
}

function addEvent(payload) {
    let member_id = payload.user.id
    let member_name = payload.user.name
    let theme = payload.submission.theme
    let date = payload.submission.date
    let time = payload.submission.time
    insertEvent(member_id,member_name,theme,date,time)
    .then(value => {
        console.log(value)
    }).catch(err => {
        console.log('insert event err')
        console.log(err)
    }) 
}
function insertEvent(member_id, member_name, theme, date, time) {
    return new Promise((resolve, reject) => {
        let comment = theme + ';' + date + ';' + time
        let insertSql = 'INSERT INTO feedbacks(member_id, member_name, ts, option, comment) VALUES (\'' + member_id + '\', \'' + member_name + '\', \'now\', \'-1\', \'' + comment + '\');';
        console.log('insert event sql='+insertSql)
        pgQuery(insertSql).then(_ => {
            resolve('insert new event success!')
        }).catch(err => {
            reject(err.message || err)
        })
    })
}

function addFeedback(payload) {
    let member_id = payload.user.id
    let member_name = payload.user.name
    let level = payload.submission.level
    let comment = payload.submission.comment
    insertFeedback(member_id, member_name, level, comment)
    .then(value => {
        console.log(value)
    }).catch(err => {
        console.log('insert event err')
        console.log(err)
    }) 
}
function insertFeedback(member_id, member_name, level, comment) {
    return new Promise((resolve, reject) => {
        let insertSql = 'INSERT INTO feedbacks(member_id, member_name, ts, option, comment, postpone, interval) VALUES (\'' + member_id + '\', \'' + member_name + '\', \'now\', \'' + level + '\', \'' + comment + '\', -1, -1);';
        console.log('insert feedback sql='+insertSql)
        pgQuery(insertSql).then(_ => {
            resolve('insert new feedback success!')
        }).catch(err => {
            reject(err.message || err)
        })
    })
}

async function createTables() { 
    pgQuery(adminStr)
    pgQuery(surveyStr).then(_ => {
        addDefault()
    })
    pgQuery(feedbacksStr)
}

module.exports = {pgQuery, createTables, addEvent, addFeedback};

