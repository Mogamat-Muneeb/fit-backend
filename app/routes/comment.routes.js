const express = require("express");
const dotenv = require("dotenv");
const authenticateUser = require("../middleware/auth.jwt");
const Comment = require("../models/Comment");

dotenv.config();
const router = express.Router();

router.get("/:postId/comment", async (req, res) => {
  try {
    const postId = req.params.postId;

    // Fetch all comments for the specified postId
    const comments = await Comment.find({ postId });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});

router.get("/:postId/comment/:commentId", async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    // Find the comment by ID and postId
    const comment = await Comment.findOne({ _id: commentId, postId });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json(comment);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});

router.post("/:postId/comment", authenticateUser, async (req, res) => {
  try {
    const { commenter_name, comment_text } = req.body;
    const postId = req.params.postId;
    console.log("🚀 ~ router.post ~ postId:", postId);

    // Create a new comment
    const newComment = new Comment({
      postId,
      commenter_name,
      comment_text,
    });

    await newComment.save();

    res.status(201).json({ message: "Comment added successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});

// Route to update a comment
router.put(
  "/:postId/comment/:commentId",
  authenticateUser,
  async (req, res) => {
    try {
      const { comment_text } = req.body;
      const { postId, commentId } = req.params;

      // Find the comment by ID and update its text
      await Comment.findOneAndUpdate(
        { _id: commentId, postId },
        { comment_text },
        { new: true }
      );

      res.json({ message: "Comment updated successfully" });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  }
);

router.delete(
  "/:postId/comment/:commentId",
  authenticateUser,
  async (req, res) => {
    try {
      const { postId, commentId } = req.params;

      // Check if the user is an admin
      if (!req.userRole) {
        // If the user is not an admin, check if the comment belongs to the user
        const comment = await Comment.findOne({
          _id: commentId,
          postId,
          userId: req.userId,
        });
        if (!comment) {
          return res
            .status(403)
            .json({ message: "You are not authorized to delete this comment" });
        }
      }

      // Find the comment by ID and remove it
      await Comment.findOneAndDelete({ _id: commentId, postId });

      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  }
);

module.exports = router;
