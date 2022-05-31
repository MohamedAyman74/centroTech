// const popupQuerySelector = ".popup";
// const popup = document.querySelector(popupQuerySelector);
// const popupBtn = document.querySelector("#popup-btn");

// const acceptPopupQuerySelector = ".accept-popup";
// const acceptPopup = document.querySelector(acceptPopupQuerySelector);
// const acceptBtn = document.querySelector("#accept-btn");

$(".infobtn").on("click", function () {
  const habd = $(this).parent().siblings().children();
  setTimeout(() => {
    console.log($(this).parent().siblings().children());
    habd.toggle("show");
    // if (!habd.classList.contains("show")) {
    //   // Add class `show` to filterList element
    //   habd.classList.add("show");
    // }
  }, 150);
});

document.addEventListener("click", function (e) {
  // const isClosest = e.target.closest(popupQuerySelector);
  // const isClosestAccept = e.target.closest(acceptPopupQuerySelector);
  // console.log(isClosest);
  // if (!isClosest && popup.classList.contains("show")) {
  //   popup.classList.remove("show");
  // }
  // if (!isClosestAccept && acceptPopup.classList.contains("show")) {
  //   acceptPopup.classList.remove("show");
  // }
  // $(".popup").css("display", "none");
  // e.stopPropagation();
  const target = $(e.target);
  if (target.is(".popup")) {
    $(".popup").fadeOut();
  }
  // ev.stopPropagation()
  // console.log($(".popup"));
});

// acceptBtn.on("click", () => {
//   setTimeout(() => {
//     if (!acceptPopup.classList.contains("show")) {
//       // Add class `show` to filterList element
//       acceptPopup.classList.add("show");
//       popup.classList.remove("show");
//     }
//   }, 150);
// });
