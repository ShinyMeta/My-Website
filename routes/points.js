

var express = require('express');
var router = express.Router();

var fs = require('fs');

module.exports = router;


router
  .get('/:mapName', function(req, res){
    var pointsArray = getPointsByMapName(req.params.mapName);

    //return points array in response
    res.send(pointsArray);
  })
  .post('/:mapName', function(req, res){
    //req.body has already been through body-parser.json(), and is a point array
    writePointsByMapName(req.body, req.params.mapName);
    res.send("ok");
  })
;





//////////////////////////////////////////////////
//             AUX Functions + Vars
//////////////////////////////////////////////////

var MAP_DATA_DIRECTORY = "root/pogomapp-data/Maps/";



// Checks for "ENOENT" error (means specified file does not exist)
// returns true/false to answer if file exists
function doesFileExist(path) {
  console.log("checking existance of " + path);
  try{
    fs.accessSync(path, function(err) {
      if (err && err.code === "ENOENT")
        return false;
      else
        return true;
    });
  } catch(err) {
    if (err.code === "ENOENT")
      return false;
    else
      throw err;
  }
  return true;
}


// returns array of points read from file at path specified.
// If file could not be found, returns empty array
function readPointsFromFile(path) {
  //if the file exists:
  if (doesFileExist(path)) {
    //find requested points file on the server
    var pointsArrayString = fs.readFileSync(path, 'utf8');
    //console.log(pointsArrayString);
    var pointsArray = JSON.parse(pointsArrayString);
    return pointsArray;
    
  //if the file does not exist:
  } else {
    return [];
  }
}

// returns array of points taking in just the map name
// if map has no points/doesn't exist yet, returns empty array
function getPointsByMapName(mapName) {
  var pointsFilePath = MAP_DATA_DIRECTORY + mapName + ".json";

  return readPointsFromFile(pointsFilePath);
}


//writes points array to specified filepath
//if file does not exist, creates the file
function writePointsToFile(points, path) {
  //if file exists:
  if (doesFileExist(path)){
    //open file and write points to file
    var stream = fs.createWriteStream(path);
    stream.once('open', function(fd) {
      stream.write(JSON.stringify(points));
      stream.end();
    });

  //if file does not exist:
  } else {
    //create file and write points
    fs.writeFile(path, JSON.stringify(points), function (err){
      if (err) throw err;
    });
  }
}

//writes points array taking in just the map name
function writePointsByMapName(points, mapName){
  var path = MAP_DATA_DIRECTORY + mapName + ".json";

  writePointsToFile(points, path);
}
