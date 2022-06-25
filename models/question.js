const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Answer = require("./answer");

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
  replies: [
    {
      type: Schema.Types.ObjectId,
      ref: "Answer",
    },
  ],
  isLocked: { type: Boolean, default: false },
});

QuestionSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    await Answer.deleteMany({
      _id: {
        $in: doc.replies,
      },
    });
  }
});

module.exports = mongoose.model("Question", QuestionSchema);
