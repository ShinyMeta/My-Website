

////////////////////////////////////////
//       GLOBAL VARS
///////////////////////////////////////


var APIURL = "https://api.guildwars2.com/v2/commerce/prices";
var IDParameters = "?ids=46738,46736,46741,46739,19976,19721,24275,24293,24281,24345,24349,24355,24287,24363,24277,24295,24283,24358,24351,24357,24289,24300";

var text = document.getElementById("Text");

///////////////////////////////////////////
//       ITEM CLASS AND VARS
///////////////////////////////////////////

/*
Item ID Table

--ID--/----Name----
46738-Deldrimor-Steel-Ingot
46736-Spiritwood-Plank
46741-Bolt-of-Damask
46739-Elonian-Leather-Square

19976-Mystic-Coin
19721-Glob-of-Ectoplasm

24275-Pile-of-Luminous-Dust
24293-Vial-of-Thick-Blood
24281-Full-Venom-Sac
24345-Heavy-Bone
24349-Sharp-Claw
24355-Sharp-Fang
24287-Smooth-Scale
24363-Engraved-Totem

24277-Pile-of-Crystalline-Dust
24295-Vial-of-Powerful-Blood
24283-Powerful-Venom-Sac
24358-Ancient-Bone
24351-Vicious-Claw
24357-Vicious-Fang
24289-Armored-Scale
24300-Elaborate-Totem
//*/

function Item(name){
  this.name = name;
  this.sellPrice = 0;

  this.setSellPrice = function(sellPrice){
    this.sellPrice = sellPrice;
  };
}

var items = [
  new Item("Deldrimor Steel Ingot"),
  new Item("Spiritwood Plank"),
  new Item("Bolt of Damask"),
  new Item("Elonian Leather Square"),

  new Item("Mystic Coin"),
  new Item("Glob of Ectoplasm"),

  new Item("Pile of Luminous Dust"),
  new Item("Vial of Thick Blood"),
  new Item("Full Venom Sac"),
  new Item("Heavy Bone"),
  new Item("Sharp Claw"),
  new Item("Sharp Fang"),
  new Item("Smooth Scale"),
  new Item("Engraved Totem"),

  new Item("Pile of Crystalline Dust"),
  new Item("Vial of Powerful Blood"),
  new Item("Powerful Venom Sac"),
  new Item("Ancient Bone"),
  new Item("Vicious Claw"),
  new Item("Vicious Fang"),
  new Item("Armored Scale"),
  new Item("Elaborate Totem")
];

function itemToString(item){
  return "The item named " + item.name + " is worth " +
   (item.sellPrice/10000).toFixed(4) + " gold.";
}

function findItemByName(name){
  for (var i = 0; i < items.length; i++){
    if (items[i].name == name)
      return items[i];
  }
  return null;
}

var chests = [
  new Item ("Ascended Chest"),
  new Item ("Legendary Chest"),
  new Item ("Laurels Chest (Heavy Crafting Bags)"),
  new Item ("Laurels Chest (Medium Crafting Bags)")
];

function findChestByName(name){
  for (var i = 0; i < chests.length; i++){
    if (chests[i].name == name)
      return chests[i];
  }
}

var checkBoxStatus = [];




/////////////////////////////////////////
//        MAIN SCRIPT EXECUTION
////////////////////////////////////////


//make a call to API
requestItemAPIData(refreshAll);


////////////////////////////////////////












///////////////////////////////
//     BUTTON FUNCTIONS
///////////////////////////////

var recalculateButton = document.getElementById("recalculateButton");

recalculateButton.addEventListener("click", recalculateButtonListener);

function recalculateButtonListener(e) {
  //make a call to API
  requestItemAPIData(refreshAll);
}


////////////////////////////////
//    CHECKLIST FUNCTIONS
////////////////////////////////

function toggleAllCheckbox(source) {
  var checkboxes = document.getElementsByName(source.value);
  for (var i = 0; i < checkboxes.length; i++){
    checkboxes[i].checked = source.checked;
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



//Make API request and store in local item array
function requestItemAPIData(responseFunction){
  getHttpRequest(APIURL + IDParameters, responseFunction);
}


//default refresh of all data, calculations, and display
function refreshAll(response){
    //store data from API
    storeItemData(response);
    //run the calculation functions
    calcChests();
    //update the display
    updateDisplay();
}


//function receives response object from http request
function storeItemData(response){
  itemInfo = JSON.parse(response);

  for (var i = 0; i < itemInfo.length; i++){
    //extracts sellprice from request
    items[i].setSellPrice(itemInfo[i].sells.unit_price);
  }
}

//function calculates all chests and stores their values based on local data
function calcChests(){
  chests[0].setSellPrice(calcAscendedChestValue());
  chests[1].setSellPrice(calcLegendaryChestValue());
  chests[2].setSellPrice(calcLaurelChestHeavyBagValue());
  chests[3].setSellPrice(calcLaurelChestMediumBagValue());
}

//this function updates the display based on local data
function updateDisplay() {
  var newText = "";

  // //quick print of the TP item data
  // for (var i = 0; i < items.length; i++){
  //   newText += itemToString(items[i]) + "<br>";
  // }
  //
  // newText += "<br><br>";

  //quick print of the chest values
  for (var i = 0; i < chests.length; i++){
    newText += itemToString(chests[i]) + "<br>";
  }

  text.innerHTML = newText;

}





///////////////////////////////////
//    CHEST CALC FUNCTIONS
//////////////////////////////////

function calcAscendedChestValue() {
  var deld = findItemByName("Deldrimor Steel Ingot");
  var spirit = findItemByName("Spiritwood Plank");
  var damask = findItemByName("Bolt of Damask");
  var elonian = findItemByName("Elonian Leather Square");
  var VCVALUE = 22500;
  //multipliers are set to 1 by default,
  var deldMult = 1;
  var spiritMult = 1;
  var damaskMult = 1;
  var elonianMult = 1;
  var vcMult = 1;

  //If unchecked, update multiplier
  var checkboxes = document.getElementsByName("Ascended");
  for (var i = 0; i < checkboxes.length; i++){
    if (!checkboxes[i].checked) {
      var name = checkboxes[i].value;
      switch (name){
        case "Deldrimor Steel Ingot":     deldMult = 0.85;        break;
        case "Spiritwood Plank":          spiritMult = 0.85;      break;
        case "Bolt of Damask":            damaskMult = 0.85;      break;
        case "Elonian Leather Square":    elonianMult = 0.85;     break;
        case "Vision Crystal":            vcMult = 0;             break;
        default: break;
      }
    }
  }

  var avgMatValue = (deld.sellPrice*deldMult + spirit.sellPrice*spiritMult +
    damask.sellPrice*damaskMult + elonian.sellPrice*elonianMult)/4;

  var result = VCVALUE*vcMult + 1.5*avgMatValue;

  return result;
}

function calcLegendaryChestValue() {
  var coin = findItemByName("Mystic Coin");
  var ecto = findItemByName("Glob of Ectoplasm");

  var cloverValue = 1/0.31 * (coin.sellPrice + ecto.sellPrice);

  //multipliers are set to 1 by default,
  var cloverMult = 1;

  //If unchecked, update multiplier
  var checkboxes = document.getElementsByName("Legendary");
  for (var i = 0; i < checkboxes.length; i++){
    if (!checkboxes[i].checked) {
      var name = checkboxes[i].value;
      switch (name){
        case "Mystic Clover":     cloverMult = 0;        break;
        default: break;
      }
    }
  }

  var result = 7 * cloverValue*cloverMult;

  return result;
}

function calcLaurelChestHeavyBagValue() {
  var NUMLAURELS = 20;

  var dust = findItemByName("Pile of Crystalline Dust");
  var blood = findItemByName("Vial of Powerful Blood");
  var venom = findItemByName("Powerful Venom Sac");
  var bone = findItemByName("Ancient Bone");
  var claw = findItemByName("Vicious Claw");
  var fang = findItemByName("Vicious Fang");
  var scale = findItemByName("Armored Scale");
  var totem = findItemByName("Elaborate Totem");

  //multipliers are set to 1 by default,
  var dustMult = 1;
  var bloodMult = 1;
  var venomMult = 1;
  var boneMult = 1;
  var clawMult = 1;
  var fangMult = 1;
  var scaleMult = 1;
  var totemMult = 1;

  //If unchecked, update multiplier
  var checkboxes = document.getElementsByName("T6 Fine Crafting Mats");
  for (var i = 0; i < checkboxes.length; i++){
    if (!checkboxes[i].checked) {
      var name = checkboxes[i].value;
      switch (name){
        case "Pile of Crystalline Dust":      dustMult = 0.85;         break;
        case "Vial of Powerful Blood":        bloodMult = 0.85;        break;
        case "Powerful Venom Sac":            venomMult = 0.85;        break;
        case "Ancient Bone":                  boneMult = 0.85;         break;
        case "Vicious Claw":                  clawMult = 0.85;         break;
        case "Vicious Fang":                  fangMult = 0.85;         break;
        case "Armored Scale":                 scaleMult = 0.85;        break;
        case "Elaborate Totem":               totemMult = 0.85;        break;
        default: break;
      }
    }
  }


  var avgMatValue = (dust.sellPrice*dustMult + blood.sellPrice*bloodMult +
    venom.sellPrice*venomMult + bone.sellPrice*boneMult + claw.sellPrice*clawMult +
    fang.sellPrice*fangMult + scale.sellPrice*scaleMult + totem.sellPrice*totemMult)/8;
  var heavyCraftBagValue = 3 * avgMatValue;
  var result = NUMLAURELS * heavyCraftBagValue;

  return result;
}

function calcLaurelChestMediumBagValue() {
  var NUMLAURELS = 20;

  var dust = findItemByName("Pile of Luminous Dust");
  var blood = findItemByName("Vial of Thick Blood");
  var venom = findItemByName("Full Venom Sac");
  var bone = findItemByName("Heavy Bone");
  var claw = findItemByName("Sharp Claw");
  var fang = findItemByName("Sharp Fang");
  var scale = findItemByName("Smooth Scale");
  var totem = findItemByName("Engraved Totem");

  //multipliers are set to 1 by default,
  var dustMult = 1;
  var bloodMult = 1;
  var venomMult = 1;
  var boneMult = 1;
  var clawMult = 1;
  var fangMult = 1;
  var scaleMult = 1;
  var totemMult = 1;

  //If unchecked, update multiplier
  var checkboxes = document.getElementsByName("T4 Fine Crafting Mats");
  for (var i = 0; i < checkboxes.length; i++){
    if (!checkboxes[i].checked) {
      var name = checkboxes[i].value;
      switch (name){
        case "Pile of Luminous Dust":      dustMult = 0.85;         break;
        case "Vial of Thick Blood":        bloodMult = 0.85;        break;
        case "Full Venom Sac":            venomMult = 0.85;        break;
        case "Heavy Bone":                  boneMult = 0.85;         break;
        case "Sharp Claw":                  clawMult = 0.85;         break;
        case "Sharp Fang":                  fangMult = 0.85;         break;
        case "Smooth Scale":                 scaleMult = 0.85;        break;
        case "Engraved Totem":               totemMult = 0.85;        break;
        default: break;
      }
    }
  }


  var avgMatValue = (dust.sellPrice*dustMult + blood.sellPrice*bloodMult +
    venom.sellPrice*venomMult + bone.sellPrice*boneMult + claw.sellPrice*clawMult +
    fang.sellPrice*fangMult + scale.sellPrice*scaleMult + totem.sellPrice*totemMult)/8;

  var mediumCraftBagValue = 5 * 3 * avgMatValue;
  var result = NUMLAURELS * mediumCraftBagValue;

  return result;
}
