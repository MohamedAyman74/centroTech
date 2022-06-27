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
        $("div.course-list").append(
          `<div class="course-card">
          ${
            course.image
              ? `<div class="default-img-container">
          <img src="${course.image.url}" alt="">
      </div>`
              : `<div class="default-img-container">
      <img src="https://res.cloudinary.com/dd36t4xod/image/upload/v1656188369/CentroTech/courses/Image_upload-pana_ol1co3.png"
          alt="">
  </div>`
          }
          <div class="course-card-flex">
              ${
                user &&
                !isAdmin &&
                !isInstructor &&
                !user.courses.includes(course._id)
                  ? `<div class="cart-wish">
                      <form action="/courses/wishlist/${course._id}?_method=PUT" method="POST">
                          <button type="submit"><i class="fa fa-solid fa-heart"></i></button>
                      </form>
                  </div>`
                  : ``
              }
                      <div>
                          <h3>
                              ${course.name}
                          </h3>
                          <h5>
                              ${course.instructor.fullname}
                          </h5>
                      </div>
                      ${
                        user &&
                        !isAdmin &&
                        !isInstructor &&
                        !user.courses.includes(course._id)
                          ? `<div class="cart-wish">
                              <form action="/courses/cart/${course._id}" method="POST">
                                  <button type="submit"><i
                                          class="fa fa-solid fa-cart-arrow-down"></i></button>
                              </form>
                          </div>`
                          : ``
                      }
          </div>

          <div class="card-price">
              <p>
                  ${course.price} L.E
              </p>
              ${
                user &&
                !isAdmin &&
                !isInstructor &&
                !user.courses.includes(course._id)
                  ? ``
                  : ``
              }
                      <a href="/courses/show/${
                        course._id
                      }"><button>View Course</button></a>
          </div>

      </div>`
        );
      });
    } else {
      $("div.course-list").empty();
      $("div.course-list").append("<h1>NO COURSES FOUND</h1>");
    }
  });
});
