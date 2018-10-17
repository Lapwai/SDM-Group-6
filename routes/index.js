var express = require('express');
var router = express.Router();
var db = require('./database')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/csv', (req, res) => {
  queryfeedbacks(res)
});

// query all feedbacks from db except event and the line which was not submit.
function queryfeedbacks(res) {
  let selectSql = 'select * from feedbacks where option <> \'-1\' and option <> \'/\' order by id;'
  db.pgQuery(selectSql).then(temp => {
    let results = []
    temp.rows.forEach(e => {
      let comment = '  / '
      if(e.comment){
        comment = e.comment
      }
      results.push({'time':e.ts.toISOString().replace(/T/, ' ').replace(/\..+/, ''),'option':e.option,'comment':comment})
    });
    res.render('feedbacks', {results:results})
  })
}

router.post('/para', (req, res) => {
  res.send(JSON.stringify(req.body))
});

module.exports = router;
