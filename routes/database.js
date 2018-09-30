
const { Pool } = require('pg');
const pool = new Pool({
                      connectionString: process.env.DATABASE_URL ,
                      ssl: false
                      });

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

// // async/await - check out a client
// (async () => {
//   const client = await pool.connect()
//   try {
//     const res = await client.query('SELECT * FROM users WHERE id = $1', [1])
//     console.log(res.rows[0])
//   } finally {
//     client.release()
//   }
// })().catch(e => console.log(e.stack))



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


    // const client = await pool.connect();
    // const results = client.query(queryStr);
    // return results
}





var adminStr = 'CREATE TABLE IF NOT EXISTS admin ( \
    user_id    TEXT PRIMARY KEY    NOT NULL, \
    user_name  TEXT                NOT NULL \
    ); '

var userStr = 'CREATE TABLE IF NOT EXISTS roles ( \
    user_id    TEXT PRIMARY KEY    NOT NULL, \
    user_name  TEXT                NOT NULL, \
    real_name  TEXT                NOT NULL, \
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

