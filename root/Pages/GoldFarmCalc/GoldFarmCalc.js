

let username = 'shinymeta';




const startButton = document.getElementById('startButton');
const endButton = document.getElementById('endButton');
const addButton = document.getElementById('addButton');
const deleteButton = document.getElementById('deleteButton');
const editButton = document.getElementById('editButton');

const methodSelect = document.getElementById('methodSelect');

const timerDisplay = document.getElementById('timerDisplay');

const resultsTable = document.getElementById('resultsTable');


///////////////////////////////////////////
//          MAIN SCRIPT
///////////////////////////////////////////

//get all the methods for the current user and update the selector
getHttpRequest('/goldFarm/methods/' + username).then((result) => { receiveMethods(result) });




////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////












//////////////////////////////////////////
//           EVENT LISTENERS
//////////////////////////////////////////

//////////   SELECT LISTENER   ///////////

methodSelect.addEventListener('change', methodSelectListener);

function methodSelectListener(e) {
  //I don't think I need to put anything here? will prompt on start button click
}



//////////////   BUTTON LISTENERS   ////////////////

startButton.addEventListener('click', startButtonListener);

function startButtonListener(e) {

  //send start run request and begin timer and stuff
  let startRunURL ='/goldFarm/startRun?username=' + username;

  getHttpRequest(startRunURL).then((response) => {
    //start timer
  });
}



endButton.addEventListener('click', endButtonListener);

function endButtonListener(e) {
  //otherwise, send start run request and begin timer and stuff
  let endRunURL ='/goldFarm/endRun?username=' + username;

  //response = {
  //  time(in seconds),
  //  wallet [
  //    { name,
  //    currid,
  //    qty },
  //    {... ],
  //  items [
  //    { name,
  //    itemid,
  //    qty },
  //    {... ],
  //}

  getHttpRequest(endRunURL).then((response) => {
    let runResult = JSON.parse(response);
    displayRunToTable (runResult);
  });
}



addButton.addEventListener('click', addButtonListener);

function addButtonListener(e) {
  //if add new, then prompt for name and send server requeest to make new farm
  let name = prompt ('What is the name of this method?');
  if (name === null || name === ''){
    alert ('You gotta put something there, silly. Try again');
    return;
  }

  let method = {name, username};
  addMethodRequest(method);
}



editButton.addEventListener('click', editButtonListener);

function editButtonListener(e){
  //if default or add button is selected, alert to select a method
  if (methodSelect.value == 'default' || methodSelect.value == 'add'){
    alert('You have not selected a method to edit.  Please select a method first.');
  }
  //if a method is selected, prompt for new name.
  else {
    let newName = prompt('What would you like the new name for "' +
      methodSelect.value + '" to be?:');

    if (newName === null || newName === ''){
      alert ('You gotta put something there, silly. Try again');
      return;
    }

    //make an edit request to rename the method
    if (newName != methodSelect.value){
      editMethodRequest(newName);
    }
  }
}



deleteButton.addEventListener('click', deleteButtonListener);

function deleteButtonListener(e){

  //if default or add button is selected, alert to select a method
  if (methodSelect.value == 'default' || methodSelect.value == 'add'){
    alert('You have not selected a method to delete.  Please select a method first.');
  }
  //if a method is selected, double confirm that all data will be lost.
  else {
    let areTheySureTheyWantToDelete = confirm('Are you sure you want to delete the method ' + methodSelect.value +
      ' from the server?  All data relating to this method will be lost.');
    if (areTheySureTheyWantToDelete){
      //make a delete request
      deleteMethodRequest();
    }
  }
}





//////////////////////////////////
//     HTTP HELPER FUNCTIONS
/////////////////////////////////

//Generic "GET" HTTP Request function
function getHttpRequest(URL){
  return new Promise((resolve, reject) => {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', URL, true);
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        //response received, call response function now
        resolve(this.response);
      }
    };
    xmlhttp.send();
  });
}


//generic "POST" sending a JSON encoded object
function postHttpRequest(URL, object){
  return new Promise((resolve, reject) => {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', URL, true);
    xmlhttp.setRequestHeader('Content-Type', 'application/json');

    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        //response received, call response function now
        resolve(this.response);
      }
    };
    xmlhttp.send(JSON.stringify(object));
  })
}

///////////////////////////////////////
///////////////////////////////////////








///////////////////////////////////////////////
//////////  START AND END BUTTONS  ////////////
///////////////////////////////////////////////


//takes in a results object from the end run response, and makes a table to add to the DOM
function displayRunToTable (runResult){
  const { time,
        wallet,
        items } = runResult;

  setTimerBySeconds(time);


  for (let i = 0; i < wallet.length; i++){
    addRowToTable(wallet[i], resultsTable.rows.length);
  }

  for (let i = 0; i < items.length; i++){
    addRowToTable(items[i], resultsTable.rows.length);
  }

  //runResult = {
  //  time(in seconds),
  //  wallet [
  //    { name,
  //    currid,
  //    qty },
  //    {... ],
  //  items [
  //    { name,
  //    itemid,
  //    qty },
  //    {... ],
  //}
}

//sets timer to correct time based on number of seconds
function setTimerBySeconds(totalSeconds){
  let seconds = totalSeconds % 60;
  let minutes = Math.floor(totalSeconds/60) % 60;
  let hours = Math.floor(totalSeconds/3600);

  timerDisplay.innerHTML = `${hours}:${minutes}:${seconds}`;
}

function addRowToTable (element, index){
  let newRow = resultsTable.insertRow(index);
  let nameCell = newRow.insertCell(0);
  let qtyCell = newRow.insertCell(1);

  nameCell.innerHTML = element.name;
  qtyCell.innerHTML = element.qty;
}






///////////////////////////////////////////////
////////  ADD, EDIT, DELETE BUTTONS  //////////
///////////////////////////////////////////////

//method = {name, username};
function addMethodRequest(method){
  postHttpRequest('/goldFarm/newmethod', method).then((response) =>{
    let wasAdded = JSON.parse(response);
    if (wasAdded){
      addMethodToSelect(method.name, methodSelect.length);
    }
    else {
      alert ('There was an error adding the method to the server.  Please try again.');
    }
  });
}

function addMethodToSelect(name, index){
  let newOption = document.createElement('option');
  newOption.value = name;
  newOption.innerHTML = name;
  methodSelect.add(newOption, index);
}


function editMethodRequest(newName){
  let methodToEdit = {name: methodSelect.value, newName: newName, username: username};
  let indexToEdit = methodSelect.selectedIndex;

  postHttpRequest('/goldFarm/editmethod', methodToEdit).then((response) =>{
    let wasEdited = JSON.parse(response);
    if (wasEdited){
      editMethodInSelect(newName, indexToEdit);
    }
    else {
      alert('There was an error editing the method on the server. Please try again.');
    }
  });
}

function editMethodInSelect(newName, indexToEdit){
    //need to update the select by deleting and adding again
    deleteMethodFromSelect(indexToEdit);
    addMethodToSelect(newName, indexToEdit);
}


function deleteMethodRequest() {
  let methodToDelete = {name: methodSelect.value, username: username};
  let methodIndex = methodSelect.selectedIndex;

  postHttpRequest('/goldFarm/deletemethod', methodToDelete).then((response) =>{
    let wasDeleted = JSON.parse(response);
    if (wasDeleted){
      //alert ('The method was successfully deleted');
      deleteMethodFromSelect(methodIndex);
    }
    else {
      alert('There was an error deleting the method from the server. Please try again.');
    }
  });
}

function deleteMethodFromSelect(index){
  methodSelect.remove(index);
}





function receiveMethods(response) {
  let methods = JSON.parse(response);
  if (methods.length !== 0){
    //set the selector to include all of the methods
    for (let i = 0; i < methods.length; i++){
      addMethodToSelect(methods[i].name, i+1);
    }
  }
}
