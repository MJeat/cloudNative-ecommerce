// import "../config/env.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const authRegister = async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email: email });

  if (existingUser) {
    return res.status(409).json({
      message: "Email already registered",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = new User({
    name,
    email,
    password: hashedPassword,
    role
  });

  await user.save();

  res.json({
    message: "User Registered Succesfully",
    user: {
      name: user.name,
      email: user.email,
    },
  });
};

export const authLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(401).json({
        message: "User or password not found",
      });
    }

    const compared = await bcrypt.compare(password, existingUser.password);

    if (!compared) {
      return res.status(401).json({
        message: "User or password not found",
      });
    }

    const payload = {
      sub: existingUser._id,
      email: existingUser.email,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.EXPIRED_ACCESS_TOKEN,
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.EXPIRED_REFRESH_TOKEN,
    });

    const hashRefreshToken = await bcrypt.hash(refreshToken, 12);

    existingUser.refreshToken = hashRefreshToken;

    await existingUser.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        name: existingUser.name,
        email: existingUser.email,
        description: existingUser.description,
        phone: existingUser.phone,
        address: existingUser.address,
        role: existingUser.role,
      },
      accessToken,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const user = await User.findById(decoded.sub).select("refreshToken");

  if (!user) {
    return res.status(401).json({ message: "No user found" });
  }

  const isMatch = await bcrypt.compare(token, user.refreshToken);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const accessToken = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRED_ACCESS_TOKEN,
  });

  res.json({
    accessToken,
  });
};

export const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user.sub).select(
    " -password -refreshToken ",
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  res.json({
    user,
  });
};

export const authLogout = async (req, res) => {
  await User.findByIdAndUpdate(req.user.sub, {
    refreshToken: null,
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    message: "Logged out successfully",
  });
};

export const updateUserById = async (req, res) => {
  const { description, address, phone, image } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user.sub,
      {
        description: description,
        address: address,
        phone: phone,
        image: image,
      },
      { new: true, runValidators: true },
    );

    if (!user) {
      res.status(404).json({ message: "no user found" });
    }

    res.status(200).json({
      message: "succesfully updated",
      user: {
        name: user.name,
        email: user.email,
        description: user.description,
        phone: user.phone,
        address: user.address,
        image: user.image,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "server error", error: err.message });
  }
};
