$("#quizSearch").submit(function (e) {
  e.preventDefault();
});

$("#searchInput").on("keyup change paste", function (event) {
  const searched = $(this).serialize();
  $.post("/quizzes", searched, (data) => {
    console.log(data);
    if (data.quizzes.length > 0) {
      $("div.course-list").empty();
      data.quizzes.forEach((quiz) => {
        $("div.course-list").append(
          `<div class="course-card">
          <img src="/images/teacherimg.jpg" alt="">
          <h3>
              ${quiz.course.name}
          </h3>
          <h5>
              ${quiz.instructor.fullname}
          </h5>
          <div class="card-price">

              <a href="/quiz/${quiz._id}"><button>Take Quiz</button></a>
          </div>
      </div>`
        );
      });
    } else {
      $("div.course-list").empty();
      $("div.course-list").append("<h1>NO QUIZZES FOUND</h1>");
    }
  });
});
