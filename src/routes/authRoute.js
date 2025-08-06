import express from "express";
import { query } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import verifyUser from "../middleware/verifyUser.js";
import env from "dotenv";

import { sendVerificationCode } from "../utils/mailer.js";

env.config();

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

    // Generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    await query(
      `UPDATE user_tbl SET user_otp = $1, user_otp_expiry = $2 WHERE user_id = $3`,
      [otp, otpExpiry, user.user_id]
    );

    await sendVerificationCode(user.user_email, otp);

    res.json({
      message: "OTP sent to your email",
      user_id: user.user_id,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/verify-2fa", async (req, res) => {
  const { user_id, code } = req.body;

  try {
    const { rows } = await query("SELECT * FROM user_tbl WHERE user_id = $1", [
      user_id,
    ]);
    const user = rows[0];

    if (!user || !user.user_otp || !user.user_otp_expiry) {
      return res
        .status(400)
        .json({ error: "No OTP found. Please login again." });
    }

    if (new Date() > new Date(user.user_otp_expiry)) {
      return res.status(400).json({ error: "OTP has expired." });
    }

    if (user.user_otp !== code) {
      return res.status(401).json({ error: "Invalid OTP." });
    }

    // Mark user as verified and clear OTP
    await query(
      `UPDATE user_tbl SET user_is_verified = true, user_otp = NULL, user_otp_expiry = NULL WHERE user_id = $1`,
      [user_id]
    );

    const token = jwt.sign(
      {
        user_id: user.user_id,
        user_role: user.user_role,
        user_fname: user.user_fname,
        user_mname: user.user_mname,
        user_lname: user.user_lname,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // change to true in production with HTTPS
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // For logging user login activity
    // await query(
    //   `INSERT INTO user_log_tbl (user_log_action, user_log_type, user_ip_address, user_id, user_fullname, user_profile) VALUES ('Login', 'User Log', $1, $2, $3, $4)`,
    //   [
    //     req.ip,
    //     user.user_id,
    //     `${user.user_fname} ${user.user_mname} ${user.user_lname}`,
    //     user.user_profile,
    //   ]
    // );

    delete user.user_password;

    res.json({ user });
  } catch (err) {
    console.error("2FA verify error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Resend OTP Route
router.post("/resend-otp", async (req, res) => {
  const { user_id } = req.body;

  try {
    const { rows } = await query("SELECT * FROM user_tbl WHERE user_id = $1", [
      user_id,
    ]);
    const user = rows[0];

    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await query(
      `UPDATE user_tbl SET user_otp = $1, user_otp_expiry = $2 WHERE user_id = $3`,
      [otp, otpExpiry, user_id]
    );

    await sendVerificationCode(user.user_email, otp);

    res.json({ message: "A new OTP has been sent to your email." });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// VERIFY SESSION ROUTE
// Session Check Route
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
    // Optional: Logging user logout activity
    // await query(
    //   `INSERT INTO user_log_tbl (user_log_action, user_log_type, user_ip_address, user_id, user_fullname, user_profile)
    //    VALUES ('Logout', 'User Log', $1, $2, $3, $4)`,
    //   [
    //     req.ip,
    //     req.user.user_id,
    //     `${req.user.user_fname} ${req.user.user_mname} ${req.user.user_lname}`,
    //     req.user.user_profile,
    //   ]
    // );

    // ✅ Mark user as not verified
    await query(
      `UPDATE user_tbl SET user_is_verified = false WHERE user_id = $1`,
      [req.user.user_id]
    );

    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout log error:", err);
    // Don't block logout if logging fails
  }

  // ✅ Clear cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
  });

  return res.json({ message: "Logged out with logging error" });
}
);

export default router;
