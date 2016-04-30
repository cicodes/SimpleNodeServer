var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var indexRoute = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//var favicon = require('serve-favicon');
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var pins = require("./db");
var mainPin = 26;
var activeLights = 0;

var isGpioAvailable = false;
var Gpio;
try {
    Gpio = require("onoff").Gpio;
    isGpioAvailable = true;
} catch (e) {
    isGpioAvailable = false;
}

var isSerialPortAvailable = false;
var SerialPort;
try {
    SerialPort = require("serialport").SerialPort;

    isSerialPortAvailable = true;
} catch (e) {
    isSerialPortAvailable = false;
}

function test() {
    if (isSerialPortAvailable) {

        var serialPort = new SerialPort("/dev/ttyAMA0", {
            baudrate: 9600,
            parser: SerialPort.parsers.readline("\n")
        }, false);

        serialPort.on('error', function(err) {
            console.log("lib error: "+err);
        });

        //write data
        serialPort.open(function (err) {
            if (err){
                console.log(err);
                return;
            }
            console.log('open');

            serialPort.write("StatusPinOn\n", function(err, results) {
                console.log('err ' + err);
                console.log('results ' + results);
            });
        });

        //receive data
        serialPort.on('data', function(data) {
            console.log(data);
        });

    }else{
        console.log("Serial Port is not available");
    }
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
}else{
    console.log("Gpio is not available");
}

app.use('/', indexRoute);


function updateLight(light, state){
    //update the db and the pin state
    for (var i in pins) {
        if (pins[i].id == light) {
            pins[i].state = state;
            console.log("pin" + light + " is " + pins[i].state);


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
            return;
        }
    }
}

app.post('/updateState', function (request, response) {
    var buttonID = (request.body.buttonID).replace("button", "");
    var state = request.body.state;

    updateLight(buttonID, state);

    response.sendStatus(200);

});

app.get('/updateState', function (request, response) {
    response.send(pins);
});

app.get('/allOn', function (request, response) {
    lightsAllOn();
    console.log("All on mate!");
    response.sendStatus(200);
});

function lightsAllOn(){
    for (var i in pins) {
        pins[i].state = "on";

        if (isGpioAvailable) {
            var currentPin = new Gpio(pins[i].pinNumber, 'out');
            currentPin.writeSync(0);
        }
    }

    if(isGpioAvailable) {
        var currentPin = new Gpio(mainPin, 'out');
        currentPin.writeSync(0);
    }
}

app.get('/allOff', function (request, response) {
    lightsAllOff();
    console.log("All off mate!");
    response.sendStatus(200);
});

app.get('/houseAlarm', function (request, response) {
    sendMessageToFamily();

    response.sendStatus(200);
});

function sendMessageToFamily(){
    var accountSid = 'ACadfc5bfab3576990454f63b6bc65b36c';
    var authToken = '32beeb695d47ed56fa3f3b26f95c8023';

    var client = require('twilio')(accountSid, authToken);

    client.messages.create({
        to: "+306946551335",
        from: "+447481339485",
        body: "Kleftes Sto Spiti"
    }, function(err, message) {
        if(err){
            console.log(err);
            return;
        }
        console.log(message.sid);
    });
}

function lightsAllOff(){
    if(isGpioAvailable) {
        var currentPin = new Gpio(mainPin, 'out');
        currentPin.writeSync(1);
    }

    for (var i in pins) {
        pins[i].state = "off";

        if (isGpioAvailable) {
            var currentPin = new Gpio(pins[i].pinNumber, 'out');
            currentPin.writeSync(1);
        }
    }
}

app.post('/voiceRecognition', function (request, response) {

    console.log(request.body.phrase);
    console.log(request.body.language);
    controlWithSpeech(request.body.phrase, request.body.language);

    response.sendStatus(200);
});


function controlWithSpeech(result, language){
    //console.log(result);
    if(language === "en-US"){

        var houseName = "Jarvis";
        if (result.indexOf(houseName) > -1) {
            console.log(houseName + "detected");

            if (result.indexOf("open") > -1) {
                console.log("will open");
                if (result.indexOf("all the lights") > -1) {
                    console.log("all the lights");
                    lightsAllOn();
                }
            } else if (result.indexOf("close") > -1) {
                if (result.indexOf("all the lights") > -1) {
                    console.log("all the lights");
                    lightsAllOff();
                }
            }
        }
        console.log("Will Do Sir");
    }else if(language === "el-GR") {
        var houseName = "βαγγέλη";
        if (result.indexOf(houseName) > -1) {
            console.log(houseName + "detected");

            if (result.indexOf("άνοιξε") > -1) {
                console.log("will open");
                if (result.indexOf("όλα τα φώτα") > -1) {
                    console.log("all the lights");
                    lightsAllOn();
                }
            } else if (result.indexOf("κλείσε") > -1) {
                if (result.indexOf("όλα τα φώτα") > -1) {
                    console.log("all the lights");
                    lightsAllOff();
                }
            }
        }
        console.log("Egine man!");
    }
}


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

keepTheServerOpen();

function keepTheServerOpen(){
    //poke the server every 30 minutes to keep it open!
    setInterval(function(){

        var http = require('http');

        var options = {
            host: 'www.google.com',
            path: ''
        };

        callback = function(response) {
            var str = '';

            //another chunk of data has been received, so append it to `str`
            response.on('data', function (chunk) {
                str += chunk;
            });

            //the whole response has been received, so we just print it out here
            response.on('end', function () {
                console.log(str);
            });
        }

        http.request(options, callback).end();

    }, 1000*60*30);
}

module.exports = app;