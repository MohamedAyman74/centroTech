let profileImg = document.querySelector("#profile-img");
let navPopup = document.querySelector(".nav-popup");

if (profileImg) {
  profileImg.addEventListener("click", () => {
    navPopup.classList.toggle("show-nav");
  });
}
