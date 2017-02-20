

var APIURL = "https://api.guildwars2.com/v2/commerce/prices";


var test = document.getElementById("Test");

test.innerHTML = "changed, bitch!";

var xmlhttp = new XMLHttpRequest();
xmlhttp.open("GET", APIURL + "/46741", true);
xmlhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    //yay it worked!
    //ok, get a grip,
    //display in the test text
    //test.innerHTML = this.response;
    var boltDamask = JSON.parse(this.response);
    var newtext = "Bolts of Damask can be bought for " + (boltDamask.buys.unit_price/10000) +
        " gold, and sold for " + (boltDamask.sells.unit_price/10000) + "gold.";
    test.innerHTML = newtext;

  }
};
xmlhttp.send();
