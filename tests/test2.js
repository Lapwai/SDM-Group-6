let chai = require('chai');
let expect = require("chai").expect;
const app = require('../app')
var http = require('http')
var request = require('supertest');

const server_url = 'https://sdm-g6.herokuapp.com/'

// "test": "./node_modules/mocha/bin/mocha ./tests/test.js"

describe('#Manager and Researcher list the survey cereated by current people.',function(){
  describe('#User should list survey list with different auth', function () {
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
    it('#Researcher should list all survey that come from current manager', function(done) {
      request
        .post('/slashcommand/survey/list')
        .set("Connection", "keep alive")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .type("form")
        .send({"user_name":"Alex","text":"researcher","user_id":"UCV7GM6BM"})
        .expect(200)
        .end(function(err, res) {
          if (err) done(err);
          res.body.should.have.property('text');
          // res.body.participant.should.have.property('1', 'test123');
          res.body.participant.should.have.property('1,test123,Active\n2,test123,Active\n3,test3,Active\n4,test3,Not Active\n5,test8,Not Active\n');
           });
        done();
    });
    it('#No survey manager should receive feedback as no survey created by you.', function(done) {
      request
        .post('/slashcommand/survey/list')
        .set("Connection", "keep alive")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .type("form")
        .send({"user_name":"Alex","text":"researcher","user_id":"UCV7GMBM1"})
        .expect(200)
        .end(function(err, res) {
          if (err) done(err);
          res.body.should.have.property('text');
          // res.body.participant.should.have.property('1', 'test123');
          res.body.participant.should.contain.property('Sorry, no survey');
           });
        done();
    });
   
  });
});


module.exports = { server_url }