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
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var pins = require("./db");

var isGpioAvailable = false;
var Gpio;
var mainPin = 26;
var activeLights = 0;

try {
    Gpio = require("onoff").Gpio;
    isGpioAvailable = true;
} catch (e) {
    isGpioAvailable = false;
}

if (isGpioAvailable) {
    //initialize the pin-channels
    for (var i in pins) {
        var currentPin = new Gpio(pins[i].pinNumber, 'out');
        currentPin.writeSync(1);
        console.log('pin initialized');
    }

    //initialize main
    var currentPin = new Gpio(mainPin, 'out');
    currentPin.writeSync(1);
}

app.use('/', indexRoute);

app.post('/updateState', function (request, response) {
    var buttonID = (request.body.buttonID).replace("button", "");
    var state = request.body.state;

    //update the db and the pin state
    for (var i in pins) {
        if (pins[i].id == buttonID) {
            pins[i].state = state;
            console.log("pin" + buttonID + " is " + pins[i].state);


            if (pins[i].state == "off") {
                if (isGpioAvailable) {
                    var currentPin = new Gpio(pins[i].pinNumber, 'out');
                    currentPin.writeSync(1);
                    activeLights--;
                }
            } else if (pins[i].state == "on") {
                if (isGpioAvailable) {
                    var currentPin = new Gpio(pins[i].pinNumber, 'out');
                    currentPin.writeSync(0);
                    activeLights++;
                }
            }

            if(activeLights>0){
                if(isGpioAvailable) {
                    var currentPin = new Gpio(mainPin, 'out');
                    currentPin.writeSync(0);
                }
            }else{
                if(isGpioAvailable) {
                    var currentPin = new Gpio(mainPin, 'out');
                    currentPin.writeSync(1);
                }
            }

            response.sendStatus(200);
        }
    }
});

app.get('/updateState', function (request, response) {
    response.send(pins);
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
