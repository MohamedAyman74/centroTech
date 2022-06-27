const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
  reply: {
    type: String,
    required: true,
  },
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  postedByOAuth: {
    type: Schema.Types.ObjectId,
    ref: "OAuth",
  },
  postedByInstructor: {
    type: Schema.Types.ObjectId,
    ref: "Instructor",
  },
  postedByAdmin: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
  },
  date: {
    type: String,
    required: true,
  },
  question: {
    type: Schema.Types.ObjectId,
    ref: "Question",
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

module.exports = mongoose.model("Answer", AnswerSchema);
