const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },

    email: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true, 
      lowercase: true 
    },

    password: { 
      type: String, 
      required: false   // not required for Google OAuth users
    },

    googleId: {
      type: String      // for Google OAuth users
    },

    profileImage: {
      type: String,
      default: ""       // data URL or external image URL
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
