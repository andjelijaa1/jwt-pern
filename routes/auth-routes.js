import express from "express";
import pool from "../db/config.js";

const router = express.Router();

// sign up
router.post("/signup", async (req, res) => {
  try {
    console.log(req.body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
