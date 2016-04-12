$(document).ready(function(){
    var baseURL = "";
    var pins;

    updateView();

    //GET the current state from the server
    function updateView() {
        $.get(baseURL + "/updateState", function (data, status) {
            pins = data;
            for (var i in pins) {
                var currentItem = $("#button" + pins[i].id);

                //Dynamically add elements
                /*
                 var currentFloor = (currentItem.parent()).parent().parent().attr('id');
                 if(currentFloor == "pano_orofos" ){
                 }else if(currentFloor == "kato_orofos"){
                 }
                 */

                //update the state of the buttons from the db
                currentItem.prop(((pins[i].state == "on") ? ("checked") : ("unchecked")), true);
                //update the text of the label from the db
                (currentItem.parent()).children("label").text(pins[i].name)
            }
        });
    }


    //POST the new state to the server
    $(".button_item").unbind('click').bind('click', function (e) {
        var id = e.target.id;
        var state = e.target.checked;
        if(id != "" && state != "undefined"){
            console.log("Button clicked with id: "+id+" with status: "+state);

            $.post(baseURL+"updateState",{
                    buttonID : id,
                    state : ((state == true) ? ("on") : ("off"))
                },
                function(data, status){
                    updateView();
                }
            );
        }
    });


    $("#All_On_Button").bind('click', function (e) {
        console.log("Open all lights!");
        //playSound("Alex Adair - Make Me Feel Better (Don Diablo & CID Remix)");

        $.get(baseURL + "/allOn", function (data, status) {

        });


    });

    $("#All_Off_Button").bind('click', function (e) {
        console.log("Close all lights!");

        var activeLights = [];
        for (var i in pins) {
            activeLights.push(pins[i].id);
        }

        $.get(baseURL + "/allOff", function (data, status) {

        });
    });

    $("#voice_control_Button-en").mousedown(function(event) {
        console.log("Starting English voice recognition!");

        if (recognizing) {
            recognition.stop();
            return;
        }
        recognition.lang = "en-US";
        recognition.start();

    }).mouseup(function(){
        console.log("Stopping voice recognition!");

        recognition.stop();
    });

    $("#voice_control_Button-gr").mousedown(function(event) {
        console.log("Starting Greek voice recognition!");

        if (recognizing) {
            recognition.stop();
            return;
        }
        recognition.lang = "el-GR";
        recognition.start();

    }).mouseup(function(){
        console.log("Stopping voice recognition!");

        recognition.stop();
    });
});