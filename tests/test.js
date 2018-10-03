console.log("test begin");


// var survey_controller = require('../controllers/surveycontroller');
const expect = require('chai').expect

describe('#surveycontroller.js', function() {
  describe('#verifyAuth()', function() {
    it('should return a researcher role', function() {
        // return surveylistForResearcherOrManager('UCV7G6BM1')//UCV7G6BM1 is a manager;
        //     .then(function(res) {
        //     return res.json();
        //     }).then(function(json) {
        //     expect(json).to.be.an('object');
        //   });  
    })
  })
})

// it('异步请求应该返回一个对象', function() {
//     return fetch('https://api.github.com')
//       .then(function(res) {
//         return res.json();
//       }).then(function(json) {
//         expect(json).to.be.an('object');
//       });
//   });

// const expect = require('chai').expect;
// const multiplyNumbers = require('../index.js').multiplyNumbers;
 
// describe('Index', function () {
//     describe('#multiplyNumbers()', function () {
//         it('should return the result of multiplication', function () {
//             let result = multiplyNumbers(4, 6);
//             expect(result).to.equal(24);
//         });
//     });
// });


// function multiplyNumbers(x, y) {
//     return x * y;
// }
 
// module.exports = {
//     multiplyNumbers : multiplyNumbers
// }