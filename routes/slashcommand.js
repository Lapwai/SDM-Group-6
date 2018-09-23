
var express = require('express'); 
var router = express.Router();

var admin_controller = require('../controllers/admincontroller'); 


router.post('/admin/init', admin_controller.init);



module.exports = router;
