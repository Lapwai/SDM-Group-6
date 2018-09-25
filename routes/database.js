
// Set up pg connection
// var pg = require("pg");

// var pg_config = {
//   user:"kaudovrsryjbbf" || "postgres",
//   database:"d7g85u8il65m68" || "postgres",
//   password:"e5dc8bc6ec1f43c0cc1b2fd4673f1386b019ab61dd0d7f5ceb84e25a48b98c20" || "123456",
//   port:5432,
//   max:20, // 连接池最大连接数
//   idleTimeoutMillis:3000, // 连接最大空闲时间 3s
// }
// var pgPool = pg.Pool(pg_config);

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

module.exports = {pgQuery};

