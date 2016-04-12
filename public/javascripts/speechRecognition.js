var recognition = new webkitSpeechRecognition() || new SpeechRecognition();
//recognition.lang = "en-US";

var recognizing = false;
var ignore_onend;
var final_transcript = '';

recognition.continuous = true;
recognition.interimResults = true;

recognition.onstart = function() {
    recognizing = true;
    console.log('info_speak_now');
};

recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
        console.log('info_no_speech');
        ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
        console.log('info_no_microphone');
        ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
        console.log('info_blocked');
        ignore_onend = true;
    }
};

recognition.onend = function() {
    recognizing = false;
    if (ignore_onend) {
        return;
    }

    if (!final_transcript) {
        //console.log('info_start');
        return;
    }
};

recognition.onresult = function(event) {
    var interim_transcript = '';
    if (typeof(event.results) == 'undefined') {
        recognition.onend = null;
        recognition.stop();
        upgrade();
        return;
    }

    var result = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            result = event.results[i][0].transcript;
            break;
        }

    }

    if(result != ""){
        executePhrase(result);
        console.log("Recognized: "+result);
    }

};