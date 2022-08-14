const popupQuerySelector = ".popup";
const popup = document.querySelector(popupQuerySelector);
const popupBtn = document.querySelector("#new-topic");
popupBtn.addEventListener("click", () => {
  setTimeout(() => {
    if (!popup.classList.contains("show")) {
      // Add class `show` to filterList element
      popup.classList.add("show");
    }
  }, 150);
});

document.addEventListener("click", (e) => {
  const isClosest = e.target.closest(popupQuerySelector);
  console.log(isClosest);
  if (!isClosest && popup.classList.contains("show")) {
    popup.classList.remove("show");
  }
});
