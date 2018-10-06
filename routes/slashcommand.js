
var express = require('express'); 
var router = express.Router();

var admin_controller = require('../controllers/admincontroller'); 
var survey_controller = require('../controllers/surveycontroller');
var my_controller = require('../controllers/mycontroller')
var schedule_controller = require('../controllers/schedulecontroller')
var interactivity_controller = require('../controllers/interactivitycontroller')

router.get('/test', (req, res) => {
    res.send("slash command get test response!");
});

// Admin
router.post('/admin/init', admin_controller.init);

router.post('/admin/add', admin_controller.add);

router.post('/admin/delete', admin_controller.delete);

router.post('/admin/list', admin_controller.list);


// Survey
router.post('/survey/add', survey_controller.add);

router.post('/survey/set', survey_controller.set);

router.post('/survey/list', survey_controller.surveylistForResearcherOrManager);

router.post('/survey/view', survey_controller.view);


//Personal suervey records
router.post('/my/history', my_controller.history);


// interactivity
router.post('/interactivity', interactivity_controller.interactivity);


module.exports = router;
