$("div.topic-container:first").addClass("active");
$("button.show-more").on("click", function (e) {
  e.preventDefault();
  const $rows = $(".topic-container");
  const lastActiveIndex = $rows.filter(".active:last").index();
  $rows.filter(":lt(" + (lastActiveIndex + 3) + ")").addClass("active");
  $(this).toggle($rows.filter(":hidden").length !== 0);
});
