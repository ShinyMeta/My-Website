/*jshint esversion: 6 */

// setup canvas and map background
var canvas = document.getElementById("map");
canvas.width = 1000;
canvas.height = 685;
var ctx = canvas.getContext("2d");

//vars for points
const POINT_RADIUS = 4;
const NORMAL_POINT_COLOR = "#FF0000";
const HIGHLIGHTED_POINT_COLOR = "#00FF00";
var pointArray = [];
var selectedPoint = null;
var undoPoint = null;

//vars for map select
//const APP_DIRECTORY = "PoGo mApp";
const MAP_DIRECTORY = "http://zacharyswalberg.com/pogomapp-data/Maps";
var mapSelect = document.getElementById("mapSelect");
var mapName = mapSelect.value;
var mapImage = new Image();


//vars for buttons
var deleteAllButton  = document.getElementById("deleteAllButton");
var editSpawnTimeButton = document.getElementById("editSpawnTimeButton");
var deleteSpawnPointButton = document.getElementById("deleteSpawnPointButton");






//////////////////////////////////////////
//           EVENT LISTENERS
//////////////////////////////////////////



//////////////   CANVAS CLICK LISTENER   ////////////////
//////////////    (ADD/SELECT POINT)     ////////////////

document.addEventListener("click", clickListener, false);

function clickListener(e) {
  //get cursor location
  var mapX = e.clientX - canvas.offsetLeft;
  var mapY = e.clientY - canvas.offsetTop;
  //check if it's on the map
  var insideMap = (mapX >= 0 && mapX < canvas.width) &&
                  (mapY >= 0 && mapY < canvas.height);

  if (insideMap){
    //check if selecting a point
    if (checkPointSelect(mapX, mapY)){
      //do nothing, function already updated selectedPoint
    }
    else {
      //no point selected, so can proceed with add point code
      addSpawnPoint(mapX, mapY);
    }
  }
}

/////////////   SELECT LISTENER   //////////////////

mapSelect.addEventListener("change", mapSelectListener);

function mapSelectListener(e) {
  //only fires when selection actually changes
  //mapSelect.value is the value in the option tag, not the text between tags

  //need to change the map name, image, point array, select point and undo point
    //shouldn't have to save anything because each change request updates server

  //update map vars
  mapName = mapSelect.value;
  loadMapImage();

  //update pointArray, selectedpoint
  loadXMLDoc();
  undoPoint = null;

}



//////////////   BUTTON LISTENERS   ////////////////


deleteAllButton.addEventListener("click", deleteAllButtonListener);

function deleteAllButtonListener(e) {
  if (confirm("Are you sure you want to delete?")){
    pointArray = [];
    postXML();
    //redraw  based on new status
    draw();
  }
}

editSpawnTimeButton.addEventListener("click", editSpawnTimeButtonListener);

function editSpawnTimeButtonListener(e) {
  //confirm there is a point selected

  if (selectedPoint !== null){
    //prompt for new time and update selectec
    var newSpawnTime = promptSpawnTime();
    setSelectedPointSpawnTime(newSpawnTime);

    //update other places: XML, re-draw map, selected point data
    postXML();
    //redraw  based on new status
    draw();
    selectPoint(selectedPoint);
  }
}

deleteSpawnPointButton.addEventListener("click", deleteSpawnTimeButtonListener);

function deleteSpawnTimeButtonListener(e) {

  if (confirm("Are you sure you want to delete the selected point?")){
    //first, store deleted button before deletion in case we need to undo
    undoPoint = {x: selectedPoint.x, y: selectedPoint.y, spawnTime: selectedPoint.spawnTime};

    //now remove the selected point from the array, and clear selection
    removeFromArray(selectedPoint);
    unselectPoint();

    //update XML on server
    postXML();
  }
}




/////////////////////////////////////////
//          ON-LOAD 'N' SHIT
/////////////////////////////////////////
window.onload = function(e){
  loadXMLDoc();
  loadMapImage();

  //canvas.style.background = "url('" + getMapImageURL() + "')";
  // no longer using background for map image
};







///////////////////////////////////////////////////////
//    FUNCTIONS FOR XML (REQUESTING AND READING)
///////////////////////////////////////////////////////

//Uses global var mapName to request the xml file containing point data for that map
//calls: loadPointsFromXML()
function loadXMLDoc() {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", getMapXMLURL(), true);
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200){
      loadPointsFromXML(this);
    }
  };
  xmlhttp.send();
}

//parses XML response, overwrites PointArray with XML data, and selects last point in array when done
function loadPointsFromXML(xml) {
  var xmlDoc = xml.responseXML;
  var xmlPoints = xmlDoc.getElementsByTagName("POINT");

  //make pointArray empty
  pointArray = [];

  //translate xml response to local data type, pointArray
  for (i = 0; i < xmlPoints.length; i++){
    var pointX          = xmlPoints[i].getElementsByTagName("X")[0].childNodes[0].nodeValue;
    var pointY          = xmlPoints[i].getElementsByTagName("Y")[0].childNodes[0].nodeValue;
    var pointSpawnTime  = xmlPoints[i].getElementsByTagName("SPAWNTIME")[0].childNodes[0].nodeValue;
    pointArray[i] = {x: pointX, y: pointY, spawnTime: pointSpawnTime};
  }

  //after storing points in array, select last point in array
  if (pointArray.length > 0){
    selectPoint(pointArray[pointArray.length-1]);
  }
}






////////////////////////////////////////////////////
//        XML (WRITING AND SUBMITTING)
////////////////////////////////////////////////////

//creating XML String
function generatePointsXML(){
  var XMLString = "";
  XMLString += '<LISTOFPOINTS>\n';
  for (i = 0; i < pointArray.length; i++){
    XMLString += '\t<POINT>\n';
    XMLString += '\t\t<X>' + pointArray[i].x + '</X>\n';
    XMLString += '\t\t<Y>' + pointArray[i].y + '</Y>\n';
    XMLString += '\t\t<SPAWNTIME>' + pointArray[i].spawnTime + '</SPAWNTIME>\n';
    XMLString += '\t</POINT>\n';
  }
  XMLString += '</LISTOFPOINTS>\n';

  //console.log(XMLString);
  return XMLString;
}

function postXML(){
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST", "/XML/"+mapName, true);
  xmlhttp.send(generatePointsXML());
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200){
      console.log(xmlhttp.responseText);
    }
  };
}




//////////////////////////////////////////////
//      HELPER FUNCTIONS FOR RANDOM SHIT
//////////////////////////////////////////////


////////////////   MAP SELECTION   ////////////////

function getMapImageURL() {
  return MAP_DIRECTORY + "/" + mapName + ".PNG";
}

function getMapXMLURL() {
  return MAP_DIRECTORY + "/" + mapName + ".xml";
}

function loadMapImage() {
  mapImage = new Image();
  mapImage.onload = function() {
    draw();
  };
  mapImage.src = getMapImageURL();
}



////////////   DELETING POINTS   ////////////

//function deleteds parameter point from pointArray
function removeFromArray(point) {
  var pointIndex = pointArray.indexOf(point);
  if (pointIndex>=0){
    pointArray.splice(pointIndex, 1);
  }
  else {
    alert("You done f***ed up, A-A-ron.");
  }
}





////////////   ADDING POINTS   /////////////

//basic click and add function
function addSpawnPoint(pointX, pointY){
  //prompt for Time, allowing null response to cancel point add
  var submittedTime = promptSpawnTime();

  //is time is valid, add point
  if (submittedTime !== null){
    //draw spawn at the location
    var point = {x: pointX, y: pointY, spawnTime:submittedTime};
    drawSpawn(point);

    //add to Point Array and select it
    pointArray[pointArray.length] = point;
    selectPoint(point);

    //update XML on the server
    postXML();
  }
}




/////////////   SPAWN TIMES   /////////////

//prompts for spawn time and returns it
function promptSpawnTime(){
  var submittedTime = prompt("Spawn Time?");

  if (!isValidTime(submittedTime)){
    submittedTime = null;
  }

  return submittedTime;
}

//checks all conditions for invalid time and displays error messages
function isValidTime(submittedTime){

  if (!isNull(submittedTime) && !isEmptyString(submittedTime) &&
        isInteger(submittedTime) && isValidMinute(submittedTime)){
    return true;
  }
  else {
    return false;
  }
}

function isNull(submittedTime) {
  if (submittedTime === null){
    alert("Cancelling point entry.");
    return true;
  }
  else {
    return false;
  }
}

function isEmptyString(submittedTime){
  if (submittedTime === ""){
    alert("No entry made, cancelling point entry");
    return true;
  }
  else {
    return false;
  }
}

function isInteger(submittedTime){
  if (isNaN(submittedTime) || (submittedTime != parseInt(submittedTime, 10))){
    alert("That's not even an integer, silly.\nTry again--point not added to map.");
    return false;
  }
  else {
    return true;
  }
}

function isValidMinute(submittedTime){
  if (submittedTime < 0 || submittedTime > 59) {
    alert("How many minutes are there where you live?\nTry again--point not added to map.");
    return false;
  }
  else {
    return true;
  }
}





////////////   GETTERS/SETTERS   //////////////

//spawnTime should always be either null or a valid time
function setSelectedPointSpawnTime(spawnTime){
  if (spawnTime !== null){
    selectedPoint.spawnTime = spawnTime;
  }
}

//update selectedPoint
function setSelectedPoint(point){
  selectedPoint = point;
}




///////////   TO STRING FUNCTIONS   ////////////

//creates a time string from th spawntime data
function spawnTimeToString(spawnTime){
  var result = ":";
  if (spawnTime < 10) {
    result += "0";
  }
  result += parseInt(spawnTime,10);

  return result;
}

//quick to string function for the display
function pointToString(point){
  var result = "(X: " + point.x + ", Y: " + point.y + ", Spawn Time: X" +
                spawnTimeToString(point.spawnTime) + ")";
  return result;
}







////////////////////////////////////////////////////
//        FUNCTIONS FOR SELECTING A POINT
////////////////////////////////////////////////////


//sets selected point variable and updates display to this point
function selectPoint(point) {
  //first unselect previous point
  unselectPoint();

  setSelectedPoint(point);
  //redraw  based on new status
  draw();
  //update HTML for new point data
  var selectedPointDataDisplay = document.getElementById("selectedPointData");
  var newText = "Selected Point:" + pointToString(point);
  selectedPointDataDisplay.innerHTML = newText;
}

//function makes sure current point is null, and no point is highlighted
function unselectPoint(){
  if (selectedPoint !== null){
    //now set point to null
    setSelectedPoint(null);
    //redraw  based on new status
    draw();
  }
}

//check if x,y pair is on an existing point, and update selected point
function checkPointSelect(clickX, clickY){

  //loop through point array, and check if the point was clicked
  for (i = 0; i < pointArray.length; i++){
    //check distance to point.  treat as selected if distance <= point drawing radius
    var point = pointArray[i];
    var distanceToPoint = distance(clickX, clickY, point.x, point.y);
    var isPointClicked = distanceToPoint <= POINT_RADIUS*2;
    if (isPointClicked) {
      //his point is clicked, return true and update selected point
      selectPoint(point);
      return true;
    }
  }
  return false;
}

function distance(x1, y1, x2, y2){
  var dx = x1-x2;
  var dy = y1-y2;
  return Math.sqrt(dx*dx + dy*dy);
}






////////////////////////////////////////////
//      FUNCTIONS FOR DRAWING SHIT
////////////////////////////////////////////

//clears the canvas completely
function clearMap(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
}

//draws the entire canvas based on current state, assumes image already loaded
function draw(){

  //draw the map image
  canvas.width = mapImage.width;
  canvas.height = mapImage.height;
  ctx.drawImage(mapImage,0,0);

  //now that map is loaded, draw points
  drawPointArray();
  //now, highlight selected point
  highlightPoint(selectedPoint);


}

//recolor the selected point
function highlightPoint(point){
  //check for null point
  if (point !== null){
    //basically draw the circle for the point, but in green
    var color = "#00FF00";
    drawCircle(point.x, point.y, POINT_RADIUS, HIGHLIGHTED_POINT_COLOR);
  }
}


function drawRect(x, y, width, height, color){
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

//draw both the time and dot for a spawn point
function drawSpawn(point) {
  drawSpawnTime(point);
  drawPoint(point.x, point.y);
}

//draw the time above a point
function drawSpawnTime (point) {
  var timeX = point.x - 8;
  var timeY = point.y - 7;
  var pointSpawnTime = point.spawnTime;

  ctx.font = "10px Arial";
  ctx.fillStyle = "#000000";
  ctx.fillText(spawnTimeToString(pointSpawnTime), timeX, timeY);
}

//draws just the dot
function drawPoint(pointX, pointY){
  //draw point in normal point color, red
  drawCircle(pointX, pointY, POINT_RADIUS, NORMAL_POINT_COLOR);
}

function drawCircle(x, y, r, color){
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI*2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

//draws all of the points in the array
function drawPointArray(){
  //start by clearing the screen by drawing the map
  //clearMap(); // no longer need because updating map before drawing array

  for (i = 0; i < pointArray.length; i++){
    var point = pointArray[i];
    drawSpawn(point);
  }
}
