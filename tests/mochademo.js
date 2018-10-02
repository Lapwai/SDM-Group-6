
'use strict';

const User = require('./mochatest')
const expect = require('chai').expect

describe('#mochatest.js', () => {
  describe('#mtest()', () => {
    it('should export a function', () => {
      expect(User.mtest).to.be.a('function')
    })
  })
})