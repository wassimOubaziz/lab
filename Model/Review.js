const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, "Review must have rating"],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Review must belong to a user"],
    unique: false,
  },
  laboratory: {
    type: Schema.Types.ObjectId,
    ref: "Laboratory",
    required: [true, "Review must belong to a laboratory"],
    unique: false,
  },
});

//make that you can not add two reviews in same laboratory
reviewSchema.index({ user: 1, laboratory: 1 }, { unique: true });
reviewSchema.pre("save", function (next) {
  const self = this;
  this.constructor.findOne(
    { user: this.user, laboratory: this.laboratory },
    function (err, doc) {
      if (err) {
        return next(err);
      } else if (doc && !doc._id.equals(self._id)) {
        // A document with this name and surname already exists, and it's not the same document being saved
        const error = new Error("you can give only one rate for single lab");
        return next(error);
      } else {
        // No document with this name and surname exists, or the existing document is the same as the one being saved
        return next();
      }
    }
  );
});

//make on every create (update the reveiw)
reviewSchema.post(["remove", "save"], async function (doc, next) {
  try {
    // find all reviews that belong to the same laboratory as the current review
    const reviews = await this.model("Review").find({
      laboratory: doc.laboratory,
    });
    // calculate the new average rating and update the laboratory document
    const avgRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    await this.model("Laboratory").findByIdAndUpdate(
      doc.laboratory,
      { avgRating, numRates: reviews.length },
      { new: true }
    );

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Review", reviewSchema);
