

var username = 'shinymeta';



var methodSelect = document.getElementById("methodSelect");

var startButton = document.getElementById('startButton');
var endButton = document.getElementById('endButton');
var deleteButton = document.getElementById('deleteButton');
var editButton = document.getElementById('editButton');


///////////////////////////////////////////
//          MAIN SCRIPT
///////////////////////////////////////////

//get all the methods for the current user and update the selector
getHttpRequest('/goldFarm/methods/' + username, receiveMethods);




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
  if (methodSelect.value != 'default') {

    //otherwise, send start run request and begin timer and stuff
    var startRunURL ="/goldFarm/startRun?username=" + username + "&methodName=" + methodSelect.value;

    getHttpRequest(startRunURL, function(response){});
  }
}



endButton.addEventListener('click', endButtonListener);

function endButtonListener(e) {

  //first check method selector
  if (methodSelect.value == 'default' || methodSelect.value == 'add'){
    //if default or add, do nothing

  } else {

    //otherwise, send start run request and begin timer and stuff
    var endRunURL ="/goldFarm/endRun?username=" + username;

    getHttpRequest(endRunURL, function(response){});
  }
}



addButton.addEventListener('click', addButtonListener);

function addButtonListener(e) {
  //if add new, then prompt for name and send server requeest to make new farm
  var name = prompt ("What is the name of this method?");
  if (name === null || name === ''){
    alert ('You gotta put something there, silly. Try again');
    return;
  }

  var method = {name: name, username: username};

  postHttpRequest('/goldFarm/newmethod', method, function(response){
    var wasAdded = JSON.parse(response);
    if (wasAdded){
      addMethodToSelect(name, methodSelect.length-1);
    }
    else {
      alert ('There was an error adding the method to the server.  Please try again.');
    }
  });
}



deleteButton.addEventListener('click', deleteButtonListener);

function deleteButtonListener(e){

  //if default or add button is selected, alert to select a method
  if (methodSelect.value == 'default' || methodSelect.value == 'add'){
    alert('You have not selected a method to delete.  Please select a method first.');
  }
  //if a method is selected, double confirm that all data will be lost.
  else {
    var areTheySureTheyWantToDelete = confirm('Are you sure you want to delete the method ' + methodSelect.value +
      ' from the server?  All data relating to this method will be lost.');
    if (areTheySureTheyWantToDelete){
      //make a delete request
      makeDeleteRequest();
    }
  }
}



editButton.addEventListener('click', editButtonListener);

function editButtonListener(e){
  //if default or add button is selected, alert to select a method
  if (methodSelect.value == 'default' || methodSelect.value == 'add'){
    alert('You have not selected a method to edit.  Please select a method first.');
  }
  //if a method is selected, prompt for new name.
  else {
    var newName = prompt("What would you like the new name for '" +
      methodSelect.value + '" to be?:');

    if (newName === null || newName === ''){
      alert ('You gotta put something there, silly. Try again');
      return;
    }

    //make an edit request to rename the method
    if (newName != methodSelect.value){
      makeEditRequest(newName);
    }
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


//generic "POST" sending a JSON encoded object
function postHttpRequest(URL, object, responseFunction){
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST", URL, true);
  xmlhttp.setRequestHeader("Content-Type", "application/json");

  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      //response received, call response function now
      responseFunction(this.response);
    }
  };
  xmlhttp.send(JSON.stringify(object));
}




function makeEditRequest(newName){
  var methodToEdit = {name: methodSelect.value, newName: newName, username: username};
  var indexToEdit = methodSelect.selectedIndex;

  postHttpRequest('/goldFarm/editmethod', methodToEdit, function(response){
    var wasEdited = JSON.parse(response);
    if (wasEdited){
      //need to update the select by deleting and adding again
      deleteMethodFromSelect(indexToEdit);
      addMethodToSelect(newName, indexToEdit);
    }
    else {
      alert('There was an error editing the method on the server. Please try again.');
    }
  });
}



function makeDeleteRequest() {
  var methodToDelete = {name: methodSelect.value, username: username};
  var methodIndex = methodSelect.selectedIndex;

  postHttpRequest('/goldFarm/deletemethod', methodToDelete, function(response){
    var wasDeleted = JSON.parse(response);
    if (wasDeleted){
      //alert ('The method was successfully deleted');
      deleteMethodFromSelect(methodIndex);
    }
    else {
      alert('There was an error deleting the method from the server. Please try again.');
    }
  });
}

function receiveMethods(response) {
  var methods = JSON.parse(response);
  if (methods.length !== 0){
    //set the selector to include all of the methods
    for (var i = 0; i < methods.length; i++){
      addMethodToSelect(methods[i].name, i+1);
    }
  }
}

function addMethodToSelect(name, index){
  var newOption = document.createElement('option');
  newOption.value = name;
  newOption.innerHTML = name;
  methodSelect.add(newOption, index);
}

function deleteMethodFromSelect(index){
  methodSelect.remove(index);
}
