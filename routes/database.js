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
    id                TEXT PRIMARY KEY    NOT NULL, \
    name              TEXT                NOT NULL \
    ); '

var roleStr = 'CREATE TABLE IF NOT EXISTS role ( \
    id                TEXT PRIMARY KEY    NOT NULL, \
    name              TEXT                NOT NULL, \
    real_name         TEXT                NOT NULL, \
    part              TEXT                NOT NULL \
    ); '

var surveyStr = 'CREATE TABLE IF NOT EXISTS survey ( \
    id                SERIAL              PRIMARY KEY, \
    hash              TEXT                NOT NULL, \
    role_id           TEXT                NOT NULL, \
    role_part         TEXT                NOT NULL, \
    name              TEXT                NOT NULL, \
    range             TEXT                NOT NULL, \
    time              TEXT                NOT NULL, \
    title             TEXT                NOT NULL, \
    message           TEXT                NOT NULL, \
    active            BOOL                NOT NULL    DEFAULT  FALSE, \
    remark            TEXT \
    ); '   

var feedbackStr = 'CREATE TABLE IF NOT EXISTS feedbacks ( \
    id                TEXT PRIMARY KEY     NOT NULL, \
    survey_id         INT4                NOT NULL, \
    member_id         TEXT                NOT NULL, \
    ts                timestamp           NOT NULL, \
    option            TEXT                NOT NULL, \
    remark            TEXT \
    ); '   

async function createTables() { 
    client = await pool.connect();

    var strArr = [adminStr, roleStr, surveyStr, feedbackStr]
    
    strArr.forEach(async function(v,i,_) {
       var results = await client.query(v)
    })
}


module.exports = {pgQuery, createTables};

