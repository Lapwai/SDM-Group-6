let chai = require('chai');
let expect = require("chai").expect;
const app = require('../app')
var http = require('http')
var request = require('supertest');
var happinessbot = require('../controllers/happinessbot')
var process_messageText =  require('../controllers/admincontroller').process_messageText;
var process_messageText_for_initCommand = require('../controllers/admincontroller').process_messageText_for_initCommand;
var process_postMessage_after_insertAdminTable = require('../controllers/admincontroller').process_postMessage_after_insertAdminTable;


describe('Unit Test For Admin controller ', function () {
  describe('#process_configuration_messageText()', function () {
      it('should return the result of process_messageText', function () {
          var message={"text":"conf"}
          var isConf = false;
          let texts = ['conf','Conf','configuration','Configuration'];
          isConf=process_messageText(isConf,texts,message);
          console.log(isConf)
          expect(isConf).to.be.ok;
      });
  });
  describe('#process_event_messageText()', function () {
        it('should return the result of event', function () {
            var message={"text":"event"}
            var isEvent = false;
            let texts = ['event','Event','eventlog','Eventlog']
            isEvent=process_messageText(isEvent,texts,message);
            console.log(isEvent)
            expect(isEvent).to.be.ok;
        });
    });
    describe('#initCommand_process()', function () {
        it('should return the result of init command', function () {
            var message={"text":"init"}
            var isInit = false;
            isInit=process_messageText_for_initCommand(isInit,message);
            console.log(isInit)
            expect(isInit).to.be.ok;
        });
        it('should return a correct message for init command', function () {
            var expect_msg = 'Worksapce\'s new app \' *Happiness Level* \' init success!'
            var msg= process_postMessage_after_insertAdminTable();
            console.log(expect_msg)
            expect(msg).to.include(expect_msg);
        });
    });
    console.log('test end log 0')
    setTimeout(() => {
        console.log('test bot end 0')
        happinessbot.endBot()
    }, 1000 * 10);
    console.log('test end log 1')
});




// "test": "./node_modules/mocha/bin/mocha ./tests/test.js"
/** 
describe('#Manager and Researcher list the survey cereated by current people.',function(){
    request = request(server_url);
    it('#Manager should list all survey that come from current manager', function(done) {
        request
        .post('/slashcommand/survey/list')
        .set("Connection", "keep alive")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .type("form")
        .send({"user_name":"ioswpf","text":"researcher","user_id":"UCSLXUNRG"})
        .expect(200)
        .end(function(err, res) {
          if (err) done(err);
          res.body.should.have.property('text');
          res.body.participant.should.have.property('8', 'test8');
           });
        done();
    });
  });

*/