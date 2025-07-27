import express from "express";
import { query } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import verifyUser from "../middleware/verifyUser.js";

const router = express.Router();

// ✅ LOGIN ROUTE
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { rows } = await query(
      "SELECT * FROM user_tbl WHERE user_email = $1",
      [email]
    );
    const user = rows[0];

    if (!user) return res.status(401).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.user_password);
    if (!isMatch) return res.status(401).json({ error: "Incorrect password" });

    const token = jwt.sign(
      {
        user_id: user.user_id,
        user_role: user.user_role,
        user_fname: user.user_fname,
        user_mname: user.user_mname,
        user_lname: user.user_lname,
      },
      "jwt-secret-key",
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // change to true in production with HTTPS
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Log user login activity
    await query(
      `INSERT INTO user_log_tbl (
        user_log_action,
        user_log_type,
        user_ip_address,
        user_id,
        user_fullname,
        user_profile
      ) VALUES ('Login', 'User Log', $1, $2, $3, $4)`,
      [
        req.ip,
        user.user_id,
        `${user.user_fname} ${user.user_mname} ${user.user_lname}`,
        user.user_profile,
      ]
    );

    delete user.user_password;

    res.json({ user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ VERIFY SESSION ROUTE
router.get("/verify", verifyUser, async (req, res) => {
  try {
    const { rows } = await query("SELECT * FROM user_tbl WHERE user_id = $1", [
      req.user.user_id,
    ]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    delete user.user_password;

    res.json({
      status: "success",
      user,
    });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ LOGOUT ROUTE
router.post("/logout", verifyUser, async (req, res) => {
  try {
    // Log user logout activity
    await query(
      `INSERT INTO user_log_tbl (
        user_log_action,
        user_log_type,
        user_ip_address,
        user_id,
        user_fullname,
        user_profile
      ) VALUES ('Logout', 'User Log', $1, $2, $3, $4)`,
      [
        req.ip,
        req.user.user_id,
        `${req.user.user_fname} ${req.user.user_mname} ${req.user.user_lname}`,
        req.user.user_profile,
      ]
    );

    // Clear cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });

    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout log error:", err);

    // Still clear cookie even if logging fails
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });

    return res.json({ message: "Logged out with logging error" });
  }
});

export default router;
