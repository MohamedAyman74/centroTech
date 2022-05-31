// const suspend = document.querySelector("#suspend");
// const popup = document.querySelector(".popup");
const suspendbtn = document.querySelector("#suspend-btn");
const searchInput = document.querySelector("#searchInput");
// const nextSibling = currentNode.nextElementSibling;

// suspend.addEventListener("click", function () {
//   popup.classList.toggle("none");
//   if (suspend.innerText === "Suspend") {
//     suspend.innerText = "Activate";
//   } else if (suspend.innerText === "Activate") {
//     suspend.innerText = "Suspend";
//   }
// });

// $("#usersTable").on("click", ".suspended", function () {
//   //   $(this).parent().siblings(".edit-item-form").toggle();
//   console.log("habd");
//   //   console.log($(this));
// });

// suspendbtn.addEventListener("click", function () {
//   popup.classList.remove("none");
// });

// $("#suspend").click().$("div.popup").toggleClass("none");

$("#search").submit(function (e) {
  e.preventDefault();
});

// $("button").mouseover(searchInput.blur());

$("#searchInput").on("keyup change paste", function (event) {
  const searched = $(this).serialize();
  $.post("/admins/usersmanagement", searched, (data) => {
    if (data.length > 0) {
      $("tbody").empty();
      data.forEach((user) => {
        $("tbody").append(`
        <tr class="data">
            <td id="userId">
                ${user._id}
            </td>
            <td>
                ${user.fullname}
            </td>
            <td>
                ${user.email}
            </td>
            <td>
                ${user.phone}
            </td>
            <td>
                ${user.parentPhone}
            </td>
            ${
              user.isSuspended
                ? `<td>
            <button id="unsuspendbtn">Unsuspend</button></td>
            <td>`
                : `<td>
                <button id="suspendbtn">Suspend</button></td>`
            } 
                            <td id="delete">
                                <button type="submit" id="deletebtn">Delete</button>
                            </td>
                            <td id="pop"><div class="popup" id="${user._id}">
                            <form action="/admins/usersmanagement/${
                              user._id
                            }?_method=PUT" method="POST">
                                <label for="suspendReason">Reason of suspension</label>
                                <input type="text" name="suspendReason">
                                <button id="suspend-btn">Suspend</button>
                            </form>
                        </div></td>
        </tr>
        `);
      });
    } else {
      $("tbody").empty();
      $("tbody").append("<h1>NO USERS FOUND</h1>");
    }
  });
});

// $("tbody").on("submit", ".deleteForm", function (e) {
//   e.preventDefault();
//   const confirmResponse = confirm("Are you sure?");
//   if (confirmResponse) {
//     const actionUrl = $(this).attr("action");
//     const $itemToDelete = $(this).closest("tr");
//     $.ajax({
//       url: actionUrl,
//       type: "DELETE",
//       itemToDelete: $itemToDelete,
//       success: function (data) {
//         this.itemToDelete.remove();
//       },
//     });
//   }
// });

$(document).on("click", "#unsuspendbtn", function (e) {
  const id = $(this).parent().siblings("#userId").html().trim();
  const actionUrl = `/admins/usersmanagement/${id}`;
  $.ajax({
    url: actionUrl,
    type: "PUT",
    data: { isSuspended: false, suspendReason: "" },
    success: function (data) {
      // console.log(data);
      window.location = "/admins/usersmanagement";
    },
  });
});

$(document).on("click", "#suspendbtn", function (e) {
  // console.log($("#deletebtn"));
  const id = $(this).parent().siblings("#userId").html().trim();
  // console.log(id);
  // console.log(
  $(this).parent().siblings("#pop").children(".popup").toggle("none");
  // );
  // const confirmResponse = confirm("Are you sure?");
  // if (confirmResponse) {
  //   const actionUrl = `/admins/usersmanagement/${id}`;
  //   const $itemToDelete = $(this).closest("tr");
  //   $.ajax({
  //     url: actionUrl,
  //     type: "DELETE",
  //     itemToDelete: $itemToDelete,
  //     success: function (data) {
  //       this.itemToDelete.remove();
  //     },
  //   });
  // }
});

$(document).on("click", "#deletebtn", function (e) {
  // console.log($("#deletebtn"));
  const id = $(this).parent().siblings("#userId").html().trim();
  console.log();
  const confirmResponse = confirm("Are you sure?");
  if (confirmResponse) {
    const actionUrl = `/admins/usersmanagement/${id}`;
    const $itemToDelete = $(this).closest("tr");
    $.ajax({
      url: actionUrl,
      type: "DELETE",
      itemToDelete: $itemToDelete,
      success: function (data) {
        this.itemToDelete.remove();
      },
    });
  }
});

// $(".deleteForm2").on("submit", function (e) {
//   e.preventDefault();
//   debugger;
//   const confirmResponse = confirm("Are you sure?");
//   if (confirmResponse) {
//     const actionUrl = $(this).attr("action");
//     const $itemToDelete = $(this).closest("tr");
//     $.ajax({
//       url: actionUrl,
//       type: "DELETE",
//       itemToDelete: $itemToDelete,
//       success: function (data) {
//         this.itemToDelete.remove();
//       },
//     });
//   }
// });

// $("tbody").on("submit", ".deleteForm", function (e) {
//   e.preventDefault();
//   const confirmResponse = confirm("Are you sure?");
//   if (confirmResponse) {
//     const actionUrl = $(this).attr("action");
//     const $itemToDelete = $(this).closest("tr");
//     console.log($itemToDelete);
//     $.ajax({
//       url: actionUrl,
//       type: "DELETE",
//       itemToDelete: $itemToDelete,
//       success: function (data) {
//         $itemToDelete.remove();
//       },
//     });
//   }
// });
