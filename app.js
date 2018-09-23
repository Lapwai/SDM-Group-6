var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');


var index = require('./routes/index');
var chatbot = require('./routes/chatbot')
var slashcommand = require('./routes/slashcommand');
var helmet = require('helmet');


var app = express();

app.use(helmet());

// Set up pg connection
var pg = require("pg");
var pg_config = {
  user:"kaudovrsryjbbf" || "postgres",
  database:"d7g85u8il65m68" || "postgres",
  password:"e5dc8bc6ec1f43c0cc1b2fd4673f1386b019ab61dd0d7f5ceb84e25a48b98c20" || "123456",
  port:5432,
  max:20, // 连接池最大连接数
  idleTimeoutMillis:3000, // 连接最大空闲时间 3s
}
var pgPool = pg.Pool(pg_config);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// 允许所有的请求形式
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
next();
});
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/slashcommand', slashcommand)
chatbot.chatbot();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
