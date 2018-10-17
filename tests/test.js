let chai = require('chai');
let expect = require("chai").expect;
const app = require('../app')
var http = require('http')
var request = require('supertest');
var happinessbot = require('../controllers/happinessbot')
var process_messageText =  require('../controllers/admincontroller').process_messageText;
var process_messageText_for_initCommand = require('../controllers/admincontroller').process_messageText_for_initCommand;
var process_postMessage_after_insertAdminTable = require('../controllers/admincontroller').process_postMessage_after_insertAdminTable;
var process_insertSql_for_adminTable = require('../controllers/admincontroller').process_insertSql_for_adminTable
var insertSurvey = require('../controllers/schedulecontroller').insertSurvey
const server_url = 'https://sdm-g6.herokuapp.com/'
var db=require('../routes/database')
db.createTables();



describe('Unit Test', function () {
  describe('#adminController_process_configuration_messageText()', function () {
      it('should return the result of process_messageText', function () {
          var message={"text":"conf"}
          var isConf = false;
          let texts = ['conf','Conf','configuration','Configuration'];
          isConf=process_messageText(isConf,texts,message);
        //   console.log(isConf)
          expect(isConf).to.be.ok;
      });
  });
  describe('#adminController_process_event_messageText()', function () {
        it('should return the result of event', function () {
            var message={"text":"event"}
            var isEvent = false;
            let texts = ['event','Event','eventlog','Eventlog']
            isEvent=process_messageText(isEvent,texts,message);
            // console.log(isEvent)
            expect(isEvent).to.be.ok;
        });
    });
    describe('#adminController_initCommand_process()', function () {
        it('should return the result of init command', function () {
            var message={"text":"init"}
            var isInit = false;
            isInit=process_messageText_for_initCommand(isInit,message);
            // console.log(isInit)
            expect(isInit).to.be.ok;
        });
        it('should return a correct message for init command', function () {
            var expect_msg = 'Worksapce\'s new app \' *Happiness Level* \' init success!'
            var msg= process_postMessage_after_insertAdminTable();
            // console.log(expect_msg)
            expect(msg).to.include(expect_msg);
        });
        it('should return return a Promise result for admin table', function(done) {
            var sqlPromise = process_insertSql_for_adminTable({'user':(new Date()).toISOString()})
            sqlPromise.then(value => {
                expect(value).to.be.equal('')
                done()
            })
        })
    });
    describe('#schedulecontroller_insertSurvey()', function () {
        it('should return a Promise result for servey insert', function (done) { 
            var insersqlPromise = insertSurvey('title','now','option','2','5')
            insersqlPromise.then(value => {
                expect(value).to.be.equal('')
                done()  
            })
        });
    });
    describe('Unit test for interactivity controller', function () {
        request = request(server_url);
        it('should return a interractive message', function(done) {
            request
            .post('/api/interactivity')
            .set("Connection", "keep alive")
            .set("Content-Type", "application/json")
            .send({"payload":{"type":"interactive_message"}})
            .expect(200)
            done();
        });
        it('should return a dialog_submission', function(done) {
          request
          .post('/api/interactivity')
          .set("Connection", "keep alive")
          .set("Content-Type", "application/json")
          .send({"payload":{"type":"dialog_submission"}})
          .expect(200)
          done();
        });
      
      });
      
    setTimeout(() => {
        happinessbot.endBot()
    }, 1000 * 10);
});


