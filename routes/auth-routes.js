import express from "express";
import pool from "../db/config.js";
import bcrypt from "bcrypt";
import { jwtTokens } from "../utils/jwt-tokens.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { user_name, user_email, user_password } = req.body;
    const hashedPassword = await bcrypt.hash(user_password, 10);

    const userExists = await pool.query(
      "SELECT * FROM users WHERE user_email = $1",
      [user_email]
    );

    if (userExists.rows.length > 0) {
      res.status(400).json({ message: "Email already registered!" });
    }

    const newUser = await pool.query(
      "INSERT INTO users (user_name, user_email, user_password) VALUES ($1, $2, $3) RETURNING *",
      [user_name, user_email, hashedPassword]
    );
    res.json(jwtTokens(newUser.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [
      email,
    ]);
    const user_password = user.rows[0].user_password;
    const correctPassword = await bcrypt.compare(password, user_password);
    if (!correctPassword)
      return res.status(401).json({ message: "Incorrect password!" });

    let tokens = jwtTokens(user.rows[0]);
    res.cookie("refresh_token", tokens.refreshToken, {
      ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN }),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
