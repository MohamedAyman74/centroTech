const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

const VideoSchema = new Schema({
  url: String,
  filename: String,
});

const CourseSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  images: [ImageSchema],
  videos: [VideoSchema],
  price: {
    type: Number,
    required: true,
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: "Instructor",
  },
  enrolled: {
    type: Number,
    default: 0,
  },
  reviews: [{ type: Schema.Types.ObjectId, ref: "CourseReview" }],
  //   reviews: [
  //     {
  //       type: Schema.Types.ObjectId,
  //       ref: "Review",
  //     },
  //   ],
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

module.exports = mongoose.model("Course", CourseSchema);
