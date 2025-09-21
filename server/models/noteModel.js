import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    // id: {
    //   type: String,
    //   required: true,
    //   unique: true,
    // },
    url: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 1,
      maxlength: 40, // Reasonable URL length limit
    },
    content: {
      type: String,
      default: "",
    },
    password_hash: {
      type: String,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    expires_at: {
      type: Date,
    },
    // NEW: User association
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Allow anonymous notes
    },
    views: { type: Number, default: 0 },
    readOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

noteSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// TTL index for auto-expiration
noteSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export const Note = mongoose.model("Note", noteSchema);
