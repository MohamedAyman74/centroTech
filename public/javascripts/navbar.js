let profileImg = document.querySelector('#profile-img')
let navPopup = document.querySelector('.nav-popup')

profileImg.addEventListener('click', () => {
navPopup.classList.toggle('show-nav')
})