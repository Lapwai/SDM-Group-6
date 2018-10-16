var express = require('express');
var router = express.Router();
var db = require('./database')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/csv', (req, res) => {
  queryfeedbacks(res)
<<<<<<< HEAD
=======
});

function queryfeedbacks(res) {
  let selectSql = 'select * from feedbacks where option <> \'-1\';'
  db.pgQuery(selectSql).then(results => {
    res.render('feedbacks', {results:results.rows})
  })
}

router.post('/para', (req, res) => {
  res.send(JSON.stringify(req.body))
>>>>>>> 06ca5cada34c6f86e2659c1a54dd5f4a21deea84
});

function queryfeedbacks(res) {
  let selectSql = 'select * from feedbacks where option <> \'-1\';'
  db.pgQuery(selectSql).then(results => {
    res.render('feedbacks', {results:results.rows})
  })
}


module.exports = router;
