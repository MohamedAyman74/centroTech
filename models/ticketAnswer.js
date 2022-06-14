const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TicketAnswerSchema = new Schema({
  reply: {
    type: String,
    required: true,
  },
  replyBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  replyByOAuth: {
    type: Schema.Types.ObjectId,
    ref: "OAuth",
  },
  replyByInstructor: {
    type: Schema.Types.ObjectId,
    ref: "Instructor",
  },
  replyByAdmin: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
  },
  date: {
    type: String,
    required: true,
  },
  ticket: {
    type: Schema.Types.ObjectId,
    ref: "Ticket",
  },
});

// CourseSchema.post("findOneAndDelete", async (doc) => {
//   if (doc) {
//     await Review.deleteMany({
//       _id: {
//         $in: doc.reviews,
//       },
//     });
//   }
// });

module.exports = mongoose.model("TicketAnswer", TicketAnswerSchema);
