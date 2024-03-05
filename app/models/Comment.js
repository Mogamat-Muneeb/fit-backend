const mongoose = require("mongoose");

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    commenter_name: {
      type: String,
      required: true,
    },
    comment_text: {
      type: String,
      required: true,
    },
    comment_date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Comment || mongoose.model("Comment", commentSchema);
