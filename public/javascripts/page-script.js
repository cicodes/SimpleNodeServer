$(document).ready(function(){
    var baseURL = "";

    //GET the current state from the server
    /*
     $.get(baseURL+"/currentState", function(data, status){
     alert("Data: " + data + "\nStatus: " + status);
     $("#button2").prop('checked', true);
     });
     */

    //POST the new state to the server
    $(".button_item").unbind('click').bind('click', function (e) {
        var id = e.target.id;
        var state = e.target.checked;
        if(id != "" && state != "undefined"){
            console.log("Button clicked with id: "+id+" with status: "+state);

            $.post(baseURL+"updateState",{
                    buttonID: id,
                    state: ((state == true) ? ("on") : ("off"))
                },
                function(data, status){
                    //alert("Data: " + data + "\nStatus: " + status);
                }
            );
        }
    });

});