const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuizSchema = new Schema({
  instructor: {
    type: Schema.Types.ObjectId,
    ref: "Instructor",
    required: true,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "Course",
  },
  questions: [{ type: Schema.Types.ObjectId, ref: "QuizQuestion" }],
  totalGrade: {
    type: Number,
    // required: true,
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

module.exports = mongoose.model("Quiz", QuizSchema);
