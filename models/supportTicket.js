const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  askedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  askedByOAuth: {
    type: Schema.Types.ObjectId,
    ref: "OAuth",
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

module.exports = mongoose.model("Question", QuestionSchema);