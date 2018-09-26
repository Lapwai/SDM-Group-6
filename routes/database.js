
const { Pool } = require('pg');
const pool = new Pool({
                      connectionString: process.env.DATABASE_URL ,
                      ssl: false
                      });


async function pgQuery(queryStr) {
    //console.log(queryStr)
    const client = await pool.connect();
    //console.log(1)
    const results = await client.query(queryStr);
    //console.log(2)
    return results
}





var adminStr = 'CREATE TABLE IF NOT EXISTS admin ( \
    user_id    TEXT PRIMARY KEY    NOT NULL, \
    user_name  TEXT                NOT NULL \
    ); '

var userStr = 'CREATE TABLE IF NOT EXISTS roles ( \
    user_id    TEXT PRIMARY KEY    NOT NULL, \
    user_name  TEXT                NOT NULL, \
    role       TEXT                NOT NULL \
    ); '

var notificationStr = 'CREATE TABLE IF NOT EXISTS notifications ( \
    not_id     INT PRIMARY KEY     NOT NULL, \
    user_name  TEXT                NOT NULL, \
    time       TEXT                NOT NULL, \
    title      TEXT                , \
    message    TEXT                NOT NULL, \
    options    TEXT                NOT NULL, \
    remark     TEXT \
    ); '   

//todo
var feedbackStr = 'CREATE TABLE IF NOT EXISTS feedbacks ( \
    id         INT PRIMARY KEY     NOT NULL, \
    user_name  TEXT                NOT NULL, \
    time       TEXT                NOT NULL, \
    title      TEXT                , \
    message    TEXT                NOT NULL, \
    options    TEXT                NOT NULL, \
    remark     TEXT \
    ); '   



async function createTables() { 

    client = await pool.connect();

    var strArr = [adminStr, userStr]
    
    strArr.forEach(async function(v,i,_) {
       var results = await client.query(v)
    })

}



module.exports = {pgQuery, createTables};

