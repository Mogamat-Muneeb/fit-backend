const mongoose = require("mongoose");

const { Schema } = mongoose;

const postSchema = new Schema(
  {
    publisher_name: {
      type: String,
      required: true,
    },
    publisher_id: {
      type: String,
      required: true,
    },
    publisher_profile_picture: {
      type: String,
      required: false,
    },
    post_image: {
      type: String,
      required: true,
    },
    post_heading: {
      type: String,
      required: true,
    },
    post_description: {
      type: String,
      required: false,
    },
    post_date_posted: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Post || mongoose.model("Post", postSchema);
