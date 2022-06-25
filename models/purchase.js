const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PurchaseSchema = new Schema({
  purchasedCourses: [
    {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  date: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  purchasedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  purchasedByOAuth: {
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

module.exports = mongoose.model("Purchase", PurchaseSchema);
