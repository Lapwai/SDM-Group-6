
var express = require('express'); 
var router = express.Router();

var admin_controller = require('../controllers/admincontroller'); 
var survey_controller = require('../controllers/surveycontroller');

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
router.post('/my_history', survey_controller.myHistory);


module.exports = router;



