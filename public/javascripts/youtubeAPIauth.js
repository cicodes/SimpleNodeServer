var youtubeAPIkey = "AIzaSyBYtThC1uqMZUVMSe6eRVDxxJiIPUUJWcI";

function googleApiClientReady() {
    gapi.client.setApiKey(youtubeAPIkey);
    gapi.client.load("youtube", "v3", function() {
        console.log("youtube API is ready");
    });
}

function playYoutubeVideo(videoTitle){

    var request = gapi.client.youtube.search.list({
        part: "snippet",
        type: "video",
        q: videoTitle,
        maxResults: 3,
        order: "viewCount",
        publishedAfter: "2015-01-01T00:00:00Z"
    });

    // execute the request
    request.execute(function(response) {
        var results = response.result;
        var url = "https://www.youtube.com/v/"+results.items[0].id.videoId;//+"?autoplay=1";

        $("#youtubePlayer").attr("src",url);


    });

    function search() {
        var q = videoTitle;
        var request = gapi.client.youtube.search.list({
            q: q,
            part: 'snippet'
        });

        request.execute(function(response) {
            var str = JSON.stringify(response.result);
            $('#search-container').html('<pre>' + str + '</pre>');
        });
    }
}




function playSound(songName) {
    var soundcloudAPIkey = "eb9ab7b42c58299a0113b9de304fbe9e";


    function get(url, callback) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState === 4 && request.status === 200) {
                callback(request.responseText);
            }
        }

        request.open("GET", url, true);
        request.send(null);
    }

    var trackPermalinkUrl = "https://soundcloud.com/steveaoki/steve-aoki-headhunterz-feel-the-power-of-now";

    get("http://api.soundcloud.com/resolve.json?url=" + trackPermalinkUrl + "&" + soundcloudAPIkey, function (response) {
        var trackInfo = JSON.parse(response);
        //audio.src = trackPermalinkUrl/*trackInfo.stream_url+ "?" + soundcloudAPIkey;
    });

    SC.stream('/tracks/251364070').then(function(player){
        $("#track_url").play();
    });

    //audio.src = trackPermalinkUrl/*trackInfo.stream_url*/+ "?" + soundcloudAPIkey;
    $("#track_url").attr('src', trackPermalinkUrl/*trackInfo.stream_url*/+ "?client_id=" + soundcloudAPIkey);
}



var SoundCloudAudioSource = function() {
    var player = document.getElementById(soundcloudPlayer);
    var self = this;
    var analyser;
    var audioCtx = new (window.AudioContext || window.webkitAudioContext); // this is because it's not been standardised accross browsers yet.
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256; // see - there is that 'fft' thing.
    var source = audioCtx.createMediaElementSource(player); // this is where we hook up the <audio> element
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    var sampleAudioStream = function() {
        // This closure is where the magic happens. Because it gets called with setInterval below, it continuously samples the audio data
        // and updates the streamData and volume properties. This the SoundCouldAudioSource function can be passed to a visualization routine and
        // continue to give real-time data on the audio stream.
        analyser.getByteFrequencyData(self.streamData);
        // calculate an overall volume value
        var total = 0;
        for (var i = 0; i < 80; i++) { // get the volume from the first 80 bins, else it gets too loud with treble
            total += self.streamData[i];
        }
        self.volume = total;
    };
    setInterval(sampleAudioStream, 20); //
    // public properties and methods
    this.volume = 0;
    this.streamData = new Uint8Array(128); // This just means we will have 128 "bins" (always half the analyzer.fftsize value), each containing a number between 0 and 255.
    this.playStream = function(streamUrl) {
        // get the input stream from the audio element
        player.setAttribute('src', streamUrl);
        player.play();
    }
};

