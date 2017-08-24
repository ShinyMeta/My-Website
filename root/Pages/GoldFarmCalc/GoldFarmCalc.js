

const logoutButton = document.getElementById('logoutButton');

const startButton = document.getElementById('startButton');
const endButton = document.getElementById('endButton');
const addButton = document.getElementById('addButton');
const deleteButton = document.getElementById('deleteButton');
const editButton = document.getElementById('editButton');

const methodSelect = document.getElementById('methodSelect');

const timerDisplay = document.getElementById('timerDisplay');



///////////////////////////////////////////
//          MAIN SCRIPT
///////////////////////////////////////////

let runResult = {}


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

logoutButton.addEventListener('click', logoutButtonListener);

function logoutButtonListener(e) {

  //send start run request and begin timer and stuff
  let logoutURL ='/goldFarm/logout';
  window.location.href = logoutURL
}



startButton.addEventListener('click', startButtonListener);

function startButtonListener(e) {

  resetRunResults()

  //send start run request and begin timer and stuff
  let startRunURL ='/goldFarm/startRun';

  getHttpRequest(startRunURL).then((response) => {
    //start timer
  });
}



endButton.addEventListener('click', endButtonListener);

function endButtonListener(e) {

  resetRunResults()

  let endRunURL ='/goldFarm/endRun';

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
    runResult = JSON.parse(response);
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

  let method = {name};
  addMethodRequest(method);
}



editButton.addEventListener('click', editButtonListener);

function editButtonListener(e){
  //if default or add button is selected, alert to select a method
  if (methodSelect.value == 'default'){
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

  const currencyTable = document.getElementById('currencyTable');
  for (let i = 0; i < wallet.length; i++){
    addRowToTable(wallet[i], currencyTable);
  }

  const itemTable = document.getElementById('itemTable');
  for (let i = 0; i < items.length; i++){
    addRowToTable(items[i], itemTable);
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

function resetRunResults (){
  runResult = {}

  const currencyTable = document.getElementById('currencyTable');
  currencyTable.innerHTML = ''
  const itemTable = document.getElementById('itemTable');
  itemTable.innerHTML = ''
}

function addRowToTable (element, table){
  let newRow = table.insertRow(table.rows.length);
  let idCell = newRow.insertCell(0);
  let nameCell = newRow.insertCell(1);
  let qtyCell = newRow.insertCell(2);

  idCell.innerHTML = element.currid || element.itemid;
  nameCell.innerHTML = element.name;
  qtyCell.innerHTML = element.qty;

  newRow.ondblclick = createEditRowListener(newRow, table)
}

function createEditRowListener(row, table) {

  return function () {
    let cells = row.getElementsByTagName('td')
    //get the qty cell and prompt to change it
    let qtycell = cells[2]

    let newqty = prompt('What should the quantity be?')
    if (isInteger(newqty)){
      //update shit
      qtycell.innerHTML = newqty

      let idcell = cells[0]
      if (table.id  == 'currencyTable') {
        //update teh results.wallet
        updateRunResult(runResult.wallet, 'currid', idcell.innerHTML, newqty)
      }
      else if (table.id  == 'itemTable') {
        //update teh results.items
        updateRunResult(runResult.items, 'itemid', idcell.innerHTML, newqty)
      }
      else alert('uh oh, shiny fucked up')
    }
    else {
      alert('There was an error. Please try again')
    }
  }
}


function updateRunResult(resultarray, idname, id, newqty){

  for (let i = 0; i < resultarray.length; i++) {
    if (resultarray[i][idname] == id){
      resultarray[i]['qty'] = parseInt(newqty)
      return true
    }
  }
  return false
}

function isInteger(arg){
  return !(isNaN(arg) || (arg != parseInt(arg, 10)))
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
  let methodToEdit = {name: methodSelect.value, newName: newName};
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
  let methodToDelete = {name: methodSelect.value};
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





// function receiveMethods(response) {
//   let methods = JSON.parse(response);
//   if (methods.length !== 0){
//     //set the selector to include all of the methods
//     for (let i = 0; i < methods.length; i++){
//       addMethodToSelect(methods[i].name, i+1);
//     }
//   }
// }
