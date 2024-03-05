const express = require("express");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ResetToken = require("../models/ResetToken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Post = require("../models/Post");
const authenticateUser = require("../middleware/auth.jwt");

dotenv.config();
const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    const posts = await Post.find({});
    res.json(posts);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});

router.get("/post/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});

router.post("/create", authenticateUser, async (req, res) => {
  try {
    const {
      publisher_name,
      publisher_profile_picture,
      post_image,
      post_heading,
      post_description,
    } = req.body;
    const post_date_posted = new Date();
    const publisher_id = req.userId;

    const newPost = new Post({
      publisher_name,
      publisher_id,
      publisher_profile_picture,
      post_image,
      post_heading,
      post_description,
      post_date_posted,
    });
    await newPost.save();
    res.status(201).json({ message: "Post created successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});

router.put("/update/:postId", authenticateUser, async (req, res) => {
  try {
    const postId = req.params.postId;
    const {
      publisher_name,
      publisher_id,
      publisher_profile_picture,
      post_image,
      post_heading,
      post_description,
    } = req.body;

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        publisher_name,
        publisher_id,
        publisher_profile_picture,
        post_image,
        post_heading,
        post_description,
      },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});

router.delete("/delete/:postId", authenticateUser, async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    console.log("🚀 ~ router.delete ~ post:", post);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    console.log("user id", req);

    // Check if the user is the creator of the post or an admin
    if (post.publisher_id !== req.userId && req.userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this post" });
    }

    await Post.findByIdAndDelete(postId);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});

module.exports = router;
