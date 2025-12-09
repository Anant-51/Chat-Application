import { Router } from "express";
const router = Router();
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import upload from "../utils/multer.util.js";
import cloudinary from "../lib/cloudinary.config.js";
import authMiddleware from "../middleware/auth.middleware.js";
import fs from "fs";

router.post("/signup", upload.single("file"), async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const { username, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "user already exists" });
    }
    let fileUrl = null;
    if (req.file) {
      const localpath = req.file.path;
      const result = await cloudinary.uploader.upload(localpath, {
        resource_type: "auto",
        folder: "chat_app/profile_pics",
      });
      fileUrl = result.secure_url;
      fs.unlinkSync(localpath);
    }
    const newUser = new User({
      username,
      email,
      password,
      profile: req.file ? fileUrl : null,
    });
    await newUser.save();
    const token = jwt.sign(
      { id: newUser._id, username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });
    res.status(200).json({
      message: "User created successfully",
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        profile: newUser.profile,
      },
    });
  } catch (err) {
    console.log("error in signingup", err);
    res
      .status(500)
      .json({ message: "internal server error", error: err.message });
  }
});
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "user not exists" });
    }
    const correct = await user.comparepassword(password);
    if (!correct) {
      return res.status(400).json({ message: "error during signin" });
    }
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });
    res.status(200).json({
      message: "Signed in succesful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
      },
    });
  } catch (err) {
    console.log("error signing in", err);
    res.status(500).json({ message: "error signing in", error: err.message });
  }
});

router.post("/signout", async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Signed out successfully" });
  } catch (err) {
    console.log("error signing out", err);
    res.status(500).json({ message: "error signing out" });
  }
});
router.get("/userProfile", async (req, res) => {
  const userId = req.query.userId;
  try {
    const user = await User.findById(userId).select("-password");

    res.status(200).json({ user });
  } catch (err) {
    console.log("error in getting profile", err);
    res.status(500).json({ message: "error in getting profile" });
  }
});
router.post(
  "/editUserDetails",
  upload.single("file"),
  authMiddleware,
  async (req, res) => {
    const { username, statusMessage, userId } = req.body;
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "auto",
          folder: "chat_app/profile_pics",
        });
        user.profile = result.secure_url;
      }
      user.username = username;
      user.statusMessage = statusMessage;
      await user.save();
      const updatedUser = await User.findById(userId).select("-password");
      res
        .status(200)
        .json({
          message: "User details updated successfully",
          user: updatedUser,
        });
    } catch (err) {
      console.log("error in updating profile", err);
      res.status(500).json({ message: "error in updating profile" });
    }
  }
);
export default router;
