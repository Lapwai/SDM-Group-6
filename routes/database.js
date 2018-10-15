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

// var roleStr = 'CREATE TABLE IF NOT EXISTS role ( \
//     id                TEXT PRIMARY KEY    NOT NULL, \
//     name              TEXT                NOT NULL, \
//     real_name         TEXT                NOT NULL, \
//     part              TEXT                NOT NULL \
//     ); '

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
    member_id         TEXT                NOT NULL, \
    member_name       TEXT                NOT NULL, \
    ts                TIMESTAMP           NOT NULL, \
    option            TEXT                NOT NULL, \
    commentc          TEXT \
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
                resolve('already has default')
            } else {
                reject('')
            }
        }).catch(err => {
            reject(err.message, err)
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

module.exports = {pgQuery, createTables};

