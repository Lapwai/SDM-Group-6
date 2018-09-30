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
        })
    })
}



var adminStr = 'CREATE TABLE IF NOT EXISTS admin ( \
    user_id    TEXT PRIMARY KEY    NOT NULL, \
    user_name  TEXT                NOT NULL \
    ); '

var roleStr = 'CREATE TABLE IF NOT EXISTS roles ( \
    user_id    TEXT PRIMARY KEY    NOT NULL, \
    user_name  TEXT                NOT NULL, \
    real_name  TEXT                NOT NULL, \
    role       TEXT                NOT NULL \
    ); '

var surveyStr = 'CREATE TABLE IF NOT EXISTS survey ( \
    survey_id   INT PRIMARY KEY     NOT NULL, \
    user_id     TEXT                NOT NULL, \
    user_role   TEXT                NOT NULL, \
    survey_name TEXT                NOT NULL, \
    time        TEXT                NOT NULL, \
    title       TEXT                NOT NULL, \
    message     TEXT                NOT NULL, \
    active      BOOL                NOT NULL    DEFAULT  FALSE, \
    remark      TEXT \
    ); '   

var feedbackStr = 'CREATE TABLE IF NOT EXISTS feedbacks ( \
    fb_id      INT PRIMARY KEY     NOT NULL, \
    user_id    TEXT                NOT NULL, \
    ts         timestamp           NOT NULL, \
    option     TEXT                NOT NULL, \
    remark     TEXT \
    ); '   

async function createTables() { 

    client = await pool.connect();

    var strArr = [adminStr, roleStr, surveyStr, feedbackStr]
    
    strArr.forEach(async function(v,i,_) {
       var results = await client.query(v)
    })
}


module.exports = {pgQuery, createTables};

