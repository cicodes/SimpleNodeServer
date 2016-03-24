$(document).ready(function(){
    var baseURL = "";

    //GET the current state from the server
    function updateView() {
        $.get(baseURL + "/updateState", function (data, status) {
            var pins = data;
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

});