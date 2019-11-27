
function GetApiKeyAndRunTool() {

    $("#resultsTbody").children().remove();

    let apiKey = $("#apiKeyInput").val();

    gw2api.authenticate(apiKey)

    gw2api.account().bank().get().then((bank) => {

        let itemsToCheckRarity = new Set();
        let equipUpgrades = {};
        const ectoItemId = 19721;

        let itemIDtoDetailsDictionary = {};

        let itemsToCheckTP = [];

        itemsToCheckTP.push(ectoItemId);

        bank.forEach(item => {
            if (itemIsTradableWithUpgrades(item)) {
                itemsToCheckRarity.add(item.id);
                itemsToCheckRarity.add(item.upgrades[0]);
            };
        });

        gw2api.items().many(Array.from(itemsToCheckRarity)).then((itemDetails) => {

            itemDetails.forEach(item => {
                if (!itemIsUpgradeComponent(item) && itemIsExotic(item)) {
                    itemsToCheckTP.push(item.id);
                    itemsToCheckTP.push(item.details.suffix_item_id);
                    equipUpgrades[item.id] = item.details.suffix_item_id;
                };

                itemIDtoDetailsDictionary[item.id] = item;
            });

            return gw2api.commerce().prices().many(itemsToCheckTP)
                .then((priceInfo) => {
                    return {
                        priceInfo,
                        itemIDtoDetailsDictionary,
                    };
                });

        }).then(({ priceInfo, itemIDtoDetailsDictionary }) => {

            let priceInfoDictionary = {};

            priceInfo.forEach(priceInfoItem => {
                priceInfoDictionary[priceInfoItem.id] = priceInfoItem;
            });

            let priceCompareData = [];

            Object.keys(equipUpgrades).forEach(equipId => {
                let upgradeId = equipUpgrades[equipId];
                let newCompareData = {
                    equip: itemIDtoDetailsDictionary[equipId],

                    upgrade: itemIDtoDetailsDictionary[upgradeId],

                    sellToTP: {
                        buyPrice: priceInfoDictionary[equipId].buys.unit_price,
                        sellPrice: priceInfoDictionary[equipId].sells.unit_price,
                    },

                    extractUpgradeThenSalvage: {
                        buyPrice: priceInfoDictionary[upgradeId].buys.unit_price + (priceInfoDictionary[ectoItemId].buys.unit_price * 1.2),
                        sellPrice: priceInfoDictionary[upgradeId].sells.unit_price + (priceInfoDictionary[ectoItemId].sells.unit_price * 1.2),
                    },

                    blackLionSalvage: {
                        buyPrice: priceInfoDictionary[upgradeId].buys.unit_price + (priceInfoDictionary[ectoItemId].buys.unit_price * 1.66),
                        sellPrice: priceInfoDictionary[upgradeId].sells.unit_price + (priceInfoDictionary[ectoItemId].sells.unit_price * 1.66),
                    },
                };

                priceCompareData.push(newCompareData);
            });
            displayResultsToTable(priceCompareData)
        });

    });
}

function itemIsTradableWithUpgrades(item) {
    return (item && !item.binding && item.upgrades);
}

function itemIsExotic(item) {
    return (item.rarity === "Exotic");
}

function itemIsUpgradeComponent(item) {
    return (item.type === "UpgradeComponent");
}





function displayResultsToTable(priceCompareData) {

    priceCompareData.forEach((resultRow) => {
        let newRow = $("<tr>");
        let tpTax = .85;

        newRow.append($("<td>", {
            html: `<div class="detailBox"><img class="equipImg" src="${resultRow.equip.icon}"/> <img class="upgradeImg" src="${resultRow.upgrade.icon}"/>
            <div class="itemText"><div>${resultRow.equip.name}</div><div>${resultRow.upgrade.name}</div></div></div>`
        }))
        newRow.append($("<td>", {
            html: `<div class="price">
                <div class="buyPrice">Buy: ${GetCoinString(resultRow.sellToTP.buyPrice * tpTax)}</div>
                <div class="sellPrice">Sell: ${GetCoinString(resultRow.sellToTP.sellPrice * tpTax)}</div>
                </div>`
        }))
        newRow.append($("<td>", {
            html: `<div class="price">
                <div class="buyPrice">Buy: ${GetCoinString(resultRow.extractUpgradeThenSalvage.buyPrice * tpTax)} &nbsp;
                    (${GetComparisonCoinString((resultRow.extractUpgradeThenSalvage.buyPrice * tpTax)- (resultRow.sellToTP.buyPrice * tpTax))})</div>
                <div class="sellPrice">Sell: ${GetCoinString(resultRow.extractUpgradeThenSalvage.sellPrice * tpTax)} &nbsp;
                    (${GetComparisonCoinString((resultRow.extractUpgradeThenSalvage.sellPrice * tpTax) - (resultRow.sellToTP.sellPrice * tpTax))})</div>
                </div>`
        }))
        newRow.append($("<td>", {
            html: `<div class="price">
                <div class="buyPrice">Buy: ${GetCoinString(resultRow.blackLionSalvage.buyPrice * tpTax)} 
                    (${GetComparisonCoinString((resultRow.blackLionSalvage.buyPrice * tpTax) - (resultRow.sellToTP.buyPrice * tpTax))})</div>
                <div class="sellPrice">Sell: ${GetCoinString(resultRow.blackLionSalvage.sellPrice * tpTax)} 
                    (${GetComparisonCoinString((resultRow.blackLionSalvage.sellPrice * tpTax) - (resultRow.sellToTP.sellPrice * tpTax))})</div>
                </div>`
        }))

        $("#resultsTbody").append(newRow);
    });
};

function OnBuySellToggle() {
    if ($('#BuyCheckbox').is(":checked")) {
        $(".buyPrice").show()
    }
    else {
        $(".buyPrice").hide()
    }

    if ($('#SellCheckbox').is(":checked")) {
        $(".sellPrice").show()
    }
    else {
        $(".sellPrice").hide()
    }
}

function GetCoinString(amountInCopper) {
    amountInCopper = Math.floor(amountInCopper);

    let copper = amountInCopper % 100;

    let amountInSilver = (amountInCopper - copper) / 100;

    let silver = amountInSilver % 100;

    let gold = (amountInSilver - silver) / 100;

    let result = ""

    if (gold > 0) {
        result += `${gold} <img class="coin" src="https://render.guildwars2.com/file/090A980A96D39FD36FBB004903644C6DBEFB1FFB/156904.png">`
    }
    if (silver > 0 || gold > 0) {
        result += `${silver} <img class="coin" src="https://render.guildwars2.com/file/E5A2197D78ECE4AE0349C8B3710D033D22DB0DA6/156907.png">`
    }
    result += `${copper} <img class="coin" src="https://render.guildwars2.com/file/6CF8F96A3299CFC75D5CC90617C3C70331A1EF0E/156902.png">`

    return result;
}

function GetComparisonCoinString(priceInCopper) {
    // let positive = (priceInCopper >= 0);

    let pricedifference = GetCoinString(Math.abs(priceInCopper));

    if (priceInCopper <= 0) {
        pricedifference = '<span class="negative" title="Less profitable than selling to TP directly"> -' + pricedifference + '</span>';
    }
    else if (priceInCopper > 0 && priceInCopper <=1000){
        pricedifference = '<span class="lessThan10Silver" title="More profitable than selling to TP directly"> -' + pricedifference + '</span>'
    }
    else if (priceInCopper > 1000 && priceInCopper <= 2000){
        pricedifference = '<span class="lessThan20Silver" title="More profitable than selling to TP directly"> -' + pricedifference + '</span>'
    }
    else {
        pricedifference = '<span class="moreThan20Silver" title="More profitable than selling to TP directly"> +' + pricedifference + '</span>';
    }

    return pricedifference;
}