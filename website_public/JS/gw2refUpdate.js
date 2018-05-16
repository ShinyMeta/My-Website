


$('#updateButton').click(() => {
  $.post('gw2refUpdate', {})
    .then((response) => {
      alert('Update started! Before issuing another request, restart the server or wait 5 minutes')
      // console.log(JSON.stringify(response))
    })
})
