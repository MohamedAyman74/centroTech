const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const QuizQuestion = require("./quizQuestion");
const QuizResponses = require("./quizResponses");

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

QuizSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    await QuizQuestion.deleteMany({
      quiz: doc._id,
    });
    await QuizResponses.deleteMany({
      quiz: doc._id,
    });
  }
});

module.exports = mongoose.model("Quiz", QuizSchema);
