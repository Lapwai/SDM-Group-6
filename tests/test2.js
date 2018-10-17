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
describe('Unit Test', function () {
  
  
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


