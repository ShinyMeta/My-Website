
let activeDropdown = null

function dropdownClick(e) {
  if (activeDropdown && activeDropdown != e.nextSibling.nextSibling) {
    activeDropdown.classList.toggle('show')
  }
  activeDropdown = e.nextSibling.nextSibling
  activeDropdown.classList.toggle('show')
}

window.onclick = (e) => {
  if (!event.target.matches('.dropdownButton')) {
    activeDropdown = null
    let dropdowns = document.getElementsByClassName('dropdownContent');
    for (let i = 0; i < dropdowns.length; i++) {
      let openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}
