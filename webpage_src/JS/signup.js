

$(document).ready(() => {
  $('#password, #password2').keyup(checkPasswordMatch)
  $('#apikey').keyup(apikeyEdit)
  $('#verifyAPIKeyButton').click(verifyAPIKey)
})





let signupConditions = {
  passwordsMatch: false,
  apikeyVerified: false,
}

function setCondition(conditionName, value) {
  signupConditions[conditionName] = value

  if (signupConditions.passwordsMatch && signupConditions.apikeyVerified) {
    // enable submit button
    $('#signupButton').prop('disabled', false)
  }
  else {
    //disable button
    $('#signupButton').prop('disabled', true)
  }

}







function checkPasswordMatch() {
  let p1 = $('#password').val()
  let p2 = $('#password2').val()

  if (p1 == p2) {
    //passwords match
    $('#passwordMatchMessage').html('<b>OK</b>').css('color', 'green')
    setCondition('passwordsMatch', true)
  }
  else {
    //passwords do not match
    $('#passwordMatchMessage').html('Passwords do not match').css('color', 'red')
    setCondition('passwordsMatch', false)
  }
}


function verifyAPIKey() {
  let apikey = $('#apikey').val()
  //set text to waiting for verification
  $('#apikeyVerifiedMessage').html('Verifying...').css('color', 'gray')
  //send request to wallet and inventories
  return Promise.all([
    $.get('https://api.guildwars2.com/v2/account/wallet?access_token=' + apikey),
    $.get('https://api.guildwars2.com/v2/account/bank?access_token=' + apikey)
  ])
    .then(([wallet_res, bank_res]) => {
      //if both are ok, then set condition true and update the text
      setCondition('apikeyVerified', true)
      $('#apikeyVerifiedMessage').html('<b>VERIFIED</b>').css('color', 'green')
    })
    .catch((err) => {
      //if API returns an error, then display an error message
      $('#apikeyVerifiedMessage').html(err.responseJSON.text).css('color', 'red')
    })


}

//if the api key is edited, then clear any verification
function apikeyEdit() {
  setCondition('apikeyVerified', false)
  //also blank out the api key verification message
  $('#apikeyVerifiedMessage').html('')
}
