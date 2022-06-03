const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuizQuestionSchema = new Schema({
  question: {
    type: String,
    required: true,
  },
  answer1: {
    type: String,
    required: true,
  },
  answer2: {
    type: String,
    required: true,
  },
  answer3: {
    type: String,
    required: true,
  },
  answer4: {
    type: String,
    required: true,
  },
  grade: {
    type: Number,
    required: true,
  },
  correctAnswers: [{ type: String }],
  quiz: {
    type: Schema.Types.ObjectId,
    ref: "Quiz",
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

module.exports = mongoose.model("QuizQuestion", QuizQuestionSchema);
