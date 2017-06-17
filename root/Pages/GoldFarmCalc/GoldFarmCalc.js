

var username = 'shinymeta';



var methodSelect = document.getElementById("methodSelect");

var startButton = document.getElementById('startButton');
var endButton = document.getElementById('endButton');


///////////////////////////////////////////
//          MAIN SCRIPT
///////////////////////////////////////////

//get all the methods for the current user and update the selector
var URL = '/goldFarm/methods/' + username;
getHttpRequest(URL, receiveMethods);




////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////












//////////////////////////////////////////
//           EVENT LISTENERS
//////////////////////////////////////////

//////////   SELECT LISTENER   ///////////

methodSelect.addEventListener("change", methodSelectListener);

function methodSelectListener(e) {
  //I don't think I need to put anything here? will prompt on start button click
}



//////////////   BUTTON LISTENERS   ////////////////

startButton.addEventListener('click', startButtonListener);

function startButtonListener(e) {

  //first check method selector
  if (methodSelect.value == 'default'){
    //if default, then do nothing
  } else if (methodSelect.value == 'add'){
    //if add new, then prompt for name and send server requeest to make new farm
  } else {
    //otherwise, send start run request and begin timer and stuff

  }

}












//////////////////////////////////
//     EVENT HELPER FUNCTIONS
/////////////////////////////////

//Generic "GET" HTTP Request function
function getHttpRequest(URL, responseFunction){
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", URL, true);
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      //response received, call response function now
      responseFunction(this.response);
    }
  };
  xmlhttp.send();
}






function receiveMethods(response) {
  var methods = JSON.parse(response);
  if (methods.length !== 0){
    //set the selector to include all of the methods
    for (var i = 0; i < methods.length; i++){
      var newOption = document.createElement('option');
      newOption.value = methods[i].name;
      newOption.innerHTML = methods[i].name;
      methodSelect.add(newOption, i+1);
    }
  }
}
