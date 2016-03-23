var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var indexRoute = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//initialize the pin-channels

var pins = require("./db");
/*
var gpio = require('rpi-gpio');
for(var i in pins){
  gpio.setup(pins[i].pinNumber, gpio.DIR_OUT, function(){
    gpio.write(pins[i].pinNumber, true, function(err) {
      if (err) throw err;
      console.log("Written to pin:"+pins[i].pinNumber);
    });
  });
}
console.log()
*/

app.use('/', indexRoute);
app.post('/updateState', function(request, response){
  var buttonID = (request.body.buttonID).replace("button", "");
  var state = request.body.state;

  //update the db and the pins
  for(var i in pins){
    if((pins[i].id)== buttonID ){
      pins[i].state = state;
      console.log("PinState of: "+"pin"+buttonID+" is "+pins[i].state);

      gpio.write(pins[i].pinNumber, !state, function (err) {
        if (err) throw err;
        console.log("Written to pin:" + pins[i].pinNumber);
      });

    }
  }

});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
