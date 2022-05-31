$("#courseSearch").submit(function (e) {
  e.preventDefault();
});

$("#searchInput").on("keyup change paste", function (event) {
  const searched = $(this).serialize();
  $.post("/courses", searched, (data) => {
    if (data.length > 0) {
      $("div.course-list").empty();
      data.forEach((course) => {
        $("div.course-list").append(`
        <div class="course-card">
                    <img src="teacherimg.jpg" alt="">
                    <h3>
                        ${course.name}
                    </h3>
                    <h5>
                        ${course.instructor.fullname}
                    </h5>
                    <div class="card-price">
                        <p>
                            ${course.price}
                        </p>
                        <button>Enroll Now</button>
                    </div>
                </div>
                `);
      });
    } else {
      $("div.course-list").empty();
      $("div.course-list").append("<h1>NO COURSES FOUND</h1>");
    }
  });
});
