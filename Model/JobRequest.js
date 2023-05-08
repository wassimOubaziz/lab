const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const jobRequestSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "job request must have worker"],
  },
  announcementId: {
    type: Schema.Types.ObjectId,
    ref: "Announcement",
    required: [true, "job request must have Announcement"],
  },
  cv: {
    type: String,
    required: [true, "job request must have cv"],
    validator: [validator.isURL, "plz provide a valide url"],
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

jobRequestSchema.index({ user: 1, announcementId: 1 }, { unique: true });

jobRequestSchema.pre("save", function (next) {
  const self = this;
  this.constructor.findOne(
    { user: this.user, announcementId: this.announcementId },
    function (err, doc) {
      if (err) {
        return next(err);
      } else if (doc && !doc._id.equals(self._id)) {
        // A document with this user and announcementId already exists, and it's not the same document being saved
        const error = new Error(
          "user and announcementId must be unique together"
        );
        return next(error);
      } else {
        // No document with this user and announcementId exists, or the existing document is the same as the one being saved
        next();
      }
    }
  );
});

const jobRequest = mongoose.model("JobRequest", jobRequestSchema);

module.exports = jobRequest;
