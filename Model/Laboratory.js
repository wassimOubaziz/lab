const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const laboratorySchema = new Schema({
  owner: {
    type: { type: Schema.Types.ObjectId, ref: "User", unique: true },
  },
  name: {
    type: String,
    required: [true, "laboratory must have a name"],
    unique: false,
  },
  address: {
    type: String,
    required: [true, "laboratory must have an address"],
    unique: false,
  },
  avgRating: {
    type: Number,
    default: 0,
  },
  numRates: {
    type: Number,
    default: 0,
  },
  workers: [
    {
      type: {
        is: {
          type: String,
          enum: ["receptionist", "nurse", "auditor"],
        },
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      },
    },
  ],
});

laboratorySchema.index({ name: 1, address: 1 }, { unique: true });

laboratorySchema.pre("save", function (next) {
  const self = this;
  this.constructor.findOne(
    { name: this.name, address: this.address },
    function (err, doc) {
      if (err) {
        return next(err);
      } else if (doc && !doc._id.equals(self._id)) {
        // A document with this name and surname already exists, and it's not the same document being saved
        const error = new Error("Name and address must be unique together");
        return next(error);
      } else {
        // No document with this name and surname exists, or the existing document is the same as the one being saved
        return next();
      }
    }
  );
});

module.exports = mongoose.model("Laboratory", laboratorySchema);
