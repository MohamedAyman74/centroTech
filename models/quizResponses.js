const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuizResponses = new Schema({
  submittedAnswers: [{ type: String }],
  finalGrade: { type: Number },
  quiz: {
    type: Schema.Types.ObjectId,
    ref: "Quiz",
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  studentOAuth: {
    type: Schema.Types.ObjectId,
    ref: "OAuth",
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

module.exports = mongoose.model("QuizResponses", QuizResponses);
