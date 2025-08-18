import express from "express";
import pool from "../db/config.js";
import { authenticateToken } from "../middleware/authorization.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await pool.query("SELECT * FROM users");
    res.json({ users: users.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/me", authenticateToken, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:name", async (req, res) => {
  const { name } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM users WHERE user_name = $1 RETURNING *",
      [name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted", deletedUsers: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
