const express = require("express");
const router = express.Router();
const pool = require("../db");

// router.get("/", async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT * FROM friends JOIN users ON friends.friend_id = users.id WHERE user_id = $1",
//       [req.user.id]
//     );
//     res.send(result.rows);
//   } catch (error) {
//     console.log(error);
//   }
// });
