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

jobRequestSchema.index({ worker: 1, laboratory: 1 }, { unique: true });

jobRequestSchema.pre("save", function (next) {
  const self = this;
  this.constructor.findOne(
    { worker: this.worker, laboratory: this.laboratory },
    function (err, doc) {
      if (err) {
        return next(err);
      } else if (doc && !doc._id.equals(self._id)) {
        // A document with this worker and laboratory already exists, and it's not the same document being saved
        const error = new Error(
          "worker and laboratory must be unique together"
        );
        return next(error);
      } else {
        // No document with this worker and laboratory exists, or the existing document is the same as the one being saved
        next();
      }
    }
  );
});

const jobRequest = mongoose.model("JobRequest", jobRequestSchema);

module.exports = jobRequest;
