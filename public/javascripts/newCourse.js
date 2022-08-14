const popupQuerySelector = ".popup";
const popup = document.querySelector(popupQuerySelector);
const popupBtn = document.querySelector("#popup-btn");
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
  if (!isClosest && popup.classList.contains("show")) {
    popup.classList.remove("show");
  }
});

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
          `
          <div class="course-card">
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
                    <h3>
                        ${course.name}
                    </h3>
                    <h5>
                        ${course.instructor.fullname}
                    </h5>
                    <p>
                        ${course.price} L.E
                    </p>
                    <div class="card-btns">
                        <form action="/courses/delete/${
                          course._id
                        }?_method=DELETE" method="POST">
                            <button onclick="return confirm('Would you like to delete this course?')">Delete</button>
                        </form>
                        <a href="/courses/${course._id}"><button>Edit</button></a>
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
