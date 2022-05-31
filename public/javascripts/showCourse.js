const popup = document.querySelector(".popup");
const publishBtn = document.querySelector("#quiz-btn");

publishBtn.addEventListener("click", function () {
  popup.classList.toggle("show");
});

$(".lectures").click(function (e) {
  e.preventDefault();
  // console.log()
  const videoUrl = $(this).find(".lecture-link").attr("href");
  console.log(videoUrl);
  $("#video-player").attr("src", videoUrl);
});
