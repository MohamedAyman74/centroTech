$("#courseSearch").submit(function (e) {
  e.preventDefault();
});

$("#searchInput").on("keyup change paste", function (event) {
  const searched = $(this).serialize();
  $.post("/courses", searched, (data) => {
    if (data.courses.length > 0) {
      $("div.course-list").empty();
      data.courses.forEach((course) => {
        const isAdmin = data.isAdmin;
        const isInstructor = data.isInstructor;
        const user = data.user;
        $("div.course-list").append(`
        <div class="course-card">
                    <img src="/images/teacherimg.jpg" alt="">
                    <h3>
                        ${course.name}
                    </h3>
                    <h5>
                        ${course.instructor.fullname}
                    </h5>
                    <div class="card-price">
                        <p>
                            ${course.price} L.E
                        </p>
                          ${
                            !isAdmin &&
                            !isInstructor &&
                            !user.courses.includes(course._id)
                              ? `
                            <form style="height: 5px; margin-bottom: 15px;"
                                action="/courses/wishlist/${course._id}?_method=PUT" method="POST">
                                <button type="submit"><i class="fa fa-solid fa-heart"></i></button>
                            </form>
                            <form style="height: 5px; margin-bottom: 15px;" action="/courses/cart/${course._id}"
                                method="POST">
                                <button type="submit"><i class="fa fa-solid fa-cart-arrow-down"></i></button>
                            </form>`
                              : ``
                          }
                          <a href="/courses/show/${
                            course._id
                          }"><button>View Course</button></a>
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
