const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const laboratorySchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "laboratory must have owner"],
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
  tests: [
    {
      testType: {
        type: String,
        required: true,
        uppercase: true,
      },
      reference: {
        max: {
          type: Number,
          required: true,
        },
        min: {
          type: Number,
          required: true,
        },
        unit: {
          type: String,
          required: [true, "test must have an unit"],
        },
        description: {
          type: String,
          required: [true, "must have a description"],
        },
        lowAdvice: {
          type: String,
          required: true,
        },
        highAdvice: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    },
  ],
  img: {
    type: String,
    default: `/images/no-image.png`,
  },
  patients: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  workers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
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
        // A document with this name and address already exists, and it's not the same document being saved
        const error = new Error("Name and address must be unique together");
        return next(error);
      } else {
        // No document with this name and address exists, or the existing document is the same as the one being saved
        return next();
      }
    }
  );
});

module.exports = mongoose.model("Laboratory", laboratorySchema);
