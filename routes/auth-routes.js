import express from "express";
import pool from "../db/config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtTokens } from "../utils/jwt-tokens.js";

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { user_name, user_email, user_password } = req.body;
    const hashedPassword = await bcrypt.hash(user_password, 10);
    const userExists = await pool.query(
      "SELECT * FROM users WHERE user_email = $1",
      [user_email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered!" });
    }
    const newUser = await pool.query(
      "INSERT INTO users (user_name, user_email, user_password) VALUES ($1, $2, $3) RETURNING *",
      [user_name, user_email, hashedPassword]
    );
    const tokens = jwtTokens(newUser.rows[0]);

    res.cookie("refresh_token", tokens.refreshToken, {
      ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN }),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.json({ accessToken: tokens.accessToken, user: newUser.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Email not found!" });
    }
    const correctPassword = await bcrypt.compare(
      password,
      user.rows[0].user_password
    );
    if (!correctPassword) {
      return res.status(401).json({ message: "Incorrect password!" });
    }

    const tokens = jwtTokens(user.rows[0]);

    res.cookie("refresh_token", tokens.refreshToken, {
      ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN }),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.json({ accessToken: tokens.accessToken, user: user.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Refresh – cookie based
router.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken)
    return res.status(401).json({ message: "No refresh token" });

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    res.json({ accessToken });
  });
});

// Logout
router.delete("/logout", (req, res) => {
  res.clearCookie("refresh_token", {
    ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN }),
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  res.json({ message: "Logged out successfully" });
});

export default router;
