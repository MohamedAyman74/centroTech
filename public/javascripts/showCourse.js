let lectureNumber = 1;
$("#lecture-number").text(`${lectureNumber}`);

$(".lectures").click(function (e) {
  if ($(e.target).closest(".lecture-video").length) {
    return;
  } else {
    e.preventDefault();
    const Number = $(this).find(".lec-number").text();
    $("#lecture-number").text(`${Number}`);
    // console.log()
    const videoUrl = $(this).find(".lecture-link").attr("href");
    $("#video-player").attr("src", videoUrl);
  }
});

const popup = document.querySelector(".popup");
const publishBtn = document.querySelector("#quiz-btn");

publishBtn.addEventListener("click", function () {
  popup.classList.toggle("show");
});
