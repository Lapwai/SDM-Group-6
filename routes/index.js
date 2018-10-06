var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/para', (req, res) => {
  res.send(JSON.stringify(req.body))
});

module.exports = router;
