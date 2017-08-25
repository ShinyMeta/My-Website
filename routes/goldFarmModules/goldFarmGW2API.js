

const https = require('https');


//let API_KEY = '58468D10-F7BA-234C-963E-A854D0001EC150A288B8-F8F2-4611-A664-C526CE446B20';

const API_KEY_PARAM = 'access_token=';

const API_HOSTNAME = 'api.guildwars2.com';

const WALLET_PATH = '/v2/account/wallet';
const MAT_STORAGE_PATH = '/v2/account/materials';
const BANK_PATH = '/v2/account/bank';
const CHARACTERS_PATH = '/v2/characters?page=0';
const SHARED_PATH = '/v2/account/inventory';


let GW2API = {};
module.exports = GW2API;


///////////////////////////////////////////
//     HTTP/API CALL HELPER FUNCTIONS
///////////////////////////////////////////

//wrapper for sending http request, then returning the response string
function getHttpsRequest(hostname, path) {
  return sendGetHttpsRequest(hostname, path)
    .then(getResponseString)
}


//generic httpS requester for API calls
function sendGetHttpsRequest(hostname, path){

  return new Promise((resolve, reject) => {
  //console.log('making request to ' + hostname + path);
    let options = {
      protocol: 'https:',
      hostname: hostname,
      path: path,
      method: 'GET'
    };
    https.request(options, resolve)
      .on('error', reject)
      .end();
  });
}

//generic parse data
function getResponseString(response){
  return new Promise((resolve, reject) => {
    //start a string to hold the data
    let dataString = '';
    response
      .on('data', function(data) {
        dataString += data;
      })
      .on('error', reject)
      .on('end', function(){
        resolve(dataString);
      })
  });
}


//////////////////////////////////////////
//////////////////////////////////////////



//gets all currencies from user's wallet and stores them in the run start table
GW2API.getWallet = function(user){
  let hostname = API_HOSTNAME;
  let path = WALLET_PATH + '?' + API_KEY_PARAM + user.apikey;
  return getHttpsRequest(hostname, path)
    .then((endData) => JSON.parse(endData))
}


//gets all the materials from material storage of the user and tries to add adds them to items object
GW2API.getMats = function(user){
  let hostname = API_HOSTNAME;
  let path = MAT_STORAGE_PATH + '?' + API_KEY_PARAM + user.apikey;
  return getHttpsRequest(hostname, path)
    .then ((endData) => JSON.parse(endData))
}


//gets all the materials from material storage of the user and adds them to items object
GW2API.getBank = function(user){
  let hostname = API_HOSTNAME;
  let path = BANK_PATH + '?' + API_KEY_PARAM + user.apikey;
  return getHttpsRequest(hostname, path)
    .then ((endData) => JSON.parse(endData))
}

//gets all the materials from material storage of the user and adds them to items object
GW2API.getInventories = function(user){
  const hostname = API_HOSTNAME;
  const path = CHARACTERS_PATH + '&' + API_KEY_PARAM + user.apikey;
  return getHttpsRequest(hostname, path)
    .then ((endData) => charactersToInventoryItems(JSON.parse(endData)) )
}

//helper function to take the triple nested loop out of context
function charactersToInventoryItems(characters){
  console.log (characters)
  let inventoryItems = []
  // i = each character
  for (let i = 0; i < characters.length; i++){
    let bags = characters[i].bags;
    // j = each bag on the character
    for (let j = 0; j < bags.length; j++){
      let inventory = bags[j].inventory;
      // k = each item slot in the bag
      for (let k = 0; k < inventory.length; k++){
        //NOW WE GOT ITEMS YO
        if (inventory[k] !== null){
          inventoryItems.push(inventory[k]);
        }
      }
    }
  }// end triple nested loop... and if statement @_@
  return inventoryItems;
}


//gets the items in shared inventory slots from the API
GW2API.getShared = function(user){
  let hostname = API_HOSTNAME;
  let path = SHARED_PATH + '?' + API_KEY_PARAM + user.apikey;
  return getHttpsRequest(hostname, path)
    .then ((endData) => JSON.parse(endData))
}
