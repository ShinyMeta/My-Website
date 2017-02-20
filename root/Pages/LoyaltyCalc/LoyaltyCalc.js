

var APIURL = "https://api.guildwars2.com/v2/commerce/prices";
var IDParameters = "?ids=46738,46736,46741,46739,19976,19721,24277,24295,24283,24358,24351,24357,24289,24300";

var text = document.getElementById("Text");


/*
Item ID Table

--ID--/----Name----
46738-Deldrimor-Steel-Ingot
46736-Spiritwood-Plank
46741-Bolt-of-Damask
46739-Elonian-Leather-Square

19976-Mystic-Coin
19721-Glob-of-Ectoplasm

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

function itemToString(item){
  return "The item named " + item.name + " can be sold for " +
   (item.sellPrice/10000) + " gold.";
}

var items = [
  new Item("Deldrimor Steel Ingot"),
  new Item("Spiritwood Plank"),
  new Item("Bolt of Damask"),
  new Item("Elonian Leather Square"),

  new Item("Mystic Coin"),
  new Item("Glob of Ectoplasm"),

  new Item("Pile of Crystalline Dust"),
  new Item("Vial of Powerful Blood"),
  new Item("Powerful Venom Sac"),
  new Item("Ancient Bone"),
  new Item("Vicious Claw"),
  new Item("Vicious Fang"),
  new Item("Armored Scale"),
  new Item("Elaborate Totem")
];

function findItemByName(name){
  for (var i = 0; i < items.length; i++){
    if (items[i].name == name)
      return items[i];
  }
}


function calcAscendedChestValue() {
  var VCVALUE = 22500;
  var deld = findItemByName("Deldrimor Steel Ingot");
  var spirit = findItemByName("Spiritwood Plank");
  var damask = findItemByName("Bolt of Damask");
  var elonian = findItemByName("Elonian Leather Square");

  var avgMatValue = (deld.sellPrice + spirit.sellPrice + damask.sellPrice + elonian.sellPrice)/4;

  var result = VCVALUE + 1.5*avgMatValue;

  return result;
}

function calcLegendaryChestValue() {
  var coin = findItemByName("Mystic Coin");
  var ecto = findItemByName("Glob of Ectoplasm");

  result = 3 * (coin.sellPrice + ecto.sellPrice);

  return result;
}


function calcLaurelChestValue() {
  var NUMLAURELS = 20;

  var dust = findItemByName("Pile of Crystalline Dust");
  var blood = findItemByName("Vial of Powerful Blood");
  var venom = findItemByName("Powerful Venom Sac");
  var bone = findItemByName("Ancient Bone");
  var claw = findItemByName("Vicious Claw");
  var fang = findItemByName("Vicious Fang");
  var scale = findItemByName("Armored Scale");
  var totem = findItemByName("Elaborate Totem");

  var avgMatValue = (dust.sellPrice + blood.sellPrice + venom.sellPrice + bone.sellPrice +
    claw.sellPrice + fang.sellPrice + scale.sellPrice + totem.sellPrice)/8;
  var heavyCraftBagValue = 3 * avgMatValue;
  var result = NUMLAURELS * heavyCraftBagValue;

  return result;
}

//var  = findItemByName("");


var xmlhttp = new XMLHttpRequest();
xmlhttp.open("GET", APIURL + IDParameters, true);
xmlhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    itemInfo = JSON.parse(this.response);

    var newText = "";

    for (var i = 0; i < itemInfo.length; i++){
      //extracts sellprice from request
      items[i].setSellPrice(itemInfo[i].sells.unit_price);
      //displays the data all prettylike
      newText += itemToString(items[i]) + "<br>";
    }

    newText += "<br><br>";
    var ascChest = new Item ("Ascended Chest");
    ascChest.setSellPrice(calcAscendedChestValue());
    newText += itemToString(ascChest) + "<br>";
    var legChest = new Item ("Legendary Chest");
    legChest.setSellPrice(calcLegendaryChestValue());
    newText += itemToString(legChest) + "<br>";
    var laurelChest = new Item ("Laurels Chest");
    laurelChest.setSellPrice(calcLaurelChestValue());
    newText += itemToString(laurelChest) + "<br>";

    text.innerHTML = newText;
  }
};
xmlhttp.send();
