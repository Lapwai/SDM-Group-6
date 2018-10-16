
var express = require('express'); 
var router = express.Router();
var admin_controller = require('../controllers/admincontroller'); 
var schedule_controller = require('../controllers/schedulecontroller')
var interactivity_controller = require('../controllers/interactivitycontroller')



// interactivity api - receive button response
router.post('/interactivity', interactivity_controller.interactivity);

// test post notification 
router.get('/postSurveyNotification', (req, res) => {
    schedule_controller.postSurveyNotification()
    res.status(200).send('Success');;
});


module.exports = router;
