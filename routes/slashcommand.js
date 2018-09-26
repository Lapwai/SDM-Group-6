
var express = require('express'); 
var router = express.Router();

var admin_controller = require('../controllers/admincontroller'); 

router.get('/test', (req, res) => {
    res.send("slash command get test response!");
});


router.post('/admin/init', admin_controller.init);

router.post('/admin/add', admin_controller.add);

router.post('/admin/delete', admin_controller.delete);

router.post('/admin/list', admin_controller.list);


module.exports = router;
