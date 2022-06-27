$(".infobtn").on("click", function () {
  const habd = $(this).parent().siblings().children();
  setTimeout(() => {
    console.log($(this).parent().siblings().children());
    habd.toggle("show");
  }, 150);
});

document.addEventListener("click", function (e) {
  const target = $(e.target);
  if (target.is(".popup")) {
    $(".popup").fadeOut();
  }
});

$("#search").submit(function (e) {
  e.preventDefault();
});

// $("button").mouseover(searchInput.blur());

$("#searchInput").on("keyup change paste", function (event) {
  const searched = $(this).serialize();
  $.post("/admins/appmanagement", searched, (data) => {
    if (data.length > 0) {
      $("tbody").empty();
      data.forEach((app) => {
        $("tbody").append(`
        <tr class="data">
                            <td class="info">
                                <div class="popup">
                                    <h2>
                                        ${app.fullname}'s Application
                                    </h2>
                                    <div>
                                        <p>Fullname:</p>
                                        <p>
                                            ${app.fullname}
                                        </p>
                                    </div>
                                    <div>
                                        <p>Email:</p>
                                        <p>
                                            ${app.email}
                                        </p>
                                    </div>
                                    <div>
                                        <p>Mobile Number:</p>
                                        <p>
                                            ${app.phone}
                                        </p>
                                    </div>
                                    <div>
                                        <p>Speciality:</p>
                                        <p>
                                            ${app.specialization}
                                        </p>
                                    </div>
                                    <p id="textarea">
                                        ${app.appReason}
                                    </p>

                                    <div id="accept-popup">
                                        <form action="/admins/appmanagement/accept" method="POST">
                                            <label for="text">Enter password</label>
                                            <input type="text" name="password" id="pass-input">
                                            <input type="hidden" name="email" value="${app.email}">
                                            <input type="hidden" name="id" value="${app._id}">
                                            <input type="hidden" name="fullname" value="${app.fullname}">
                                            <input type="hidden" name="phone" value="${app.phone}">
                                            <input type="hidden" name="specialization"
                                                value="${app.specialization}">
                                            <button id="accept-btn">Accept & Send Mail</button>
                                        </form>

                                        <form action="/admins/appmanagement/reject/${app._id}?_method=PUT"
                                            method="POST" id="reject-form">
                                            <input type="hidden" name="email" value="${app.email}">
                                            <label for="">Enter Reason</label>
                                            <input type="text" name="rejectReason">
                                            <button id="reject-btn">Reject</button>
                                        </form>
                                        <form action="/admins/appmanagement/delete/${app._id}?_method=DELETE"
                                            method="POST">
                                            <button id="reject-btn">Delete</button>
                                        </form>
                                    </div>
                                </div>
                            </td>
                            <td>
                                ${app.fullname}
                            </td>
                            <td>
                                ${app.email}
                            </td>
                            <td>
                                ${app.phone}
                            </td>
                            <td>
                                ${app.specialization}
                            </td>
                            <td>
                                <button class="infobtn" id="popup-btn">View Application</button>
                            </td>
                        </tr>
          `);
      });
    } else {
      $("tbody").empty();
      $("tbody").append("<h1>NO APPLICATIONS FOUND</h1>");
    }
  });
});
