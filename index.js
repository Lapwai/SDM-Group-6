const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
var kittenbot=require('./kittenbot');
//const DATABASE_URL = "/Users/eleven/Library/Application Support/Postgres/var-10"

const { Pool } = require('pg');
const pool = new Pool({
                      connectionString: process.env.DATABASE_URL,
                      ssl: false
                      });

//kittenbot();

const testStr = {versionName : '1.0.0', versionCode : 200};

express()
.use(express.static(path.join(__dirname, 'public')))
.set('views', path.join(__dirname, 'views'))
.set('view engine', 'ejs')
.get('/', (req, res) => res.render('pages/index'))
.get('/cool', (req, res) => res.send(cool()))
.get('/db1', async (req, res) => {
     try {
     const client = await pool.connect()
     const results = await client.query('SELECT * FROM test_table');
     console.log(results.rows)
     res.render('pages/db1', {results:results.rows})
     client.release();
     } catch (err) {
     console.error(err);
     res.send("Error " + err);
     }
     })
.get('/test', function(req,res) {
    res.send(JSON.stringify(testStr));
})
.listen(PORT, () => console.log(`Listening on ${ PORT }`))




