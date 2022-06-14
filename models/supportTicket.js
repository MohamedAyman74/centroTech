const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TicketSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  sentBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  sentByOAuth: {
    type: Schema.Types.ObjectId,
    ref: "OAuth",
  },
  sentByInstructor: {
    type: Schema.Types.ObjectId,
    ref: "Instructor",
  },
  date: {
    type: String,
    required: true,
  },
  isLocked: { type: Boolean, default: false },
  replies: [
    {
      type: Schema.Types.ObjectId,
      ref: "Answer",
    },
  ],
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

module.exports = mongoose.model("Ticket", TicketSchema);
