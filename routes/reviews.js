const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/:gender", async (req, res) => {
  try {
    const gender = req.params.gender;
    const result = await pool.query(
      "SELECT * FROM bathroom_reviews WHERE gender = $1",
      [gender]
    );
    res.send(result.rows);
  } catch (error) {
    console.log(error);
  }
});

router.post("/addReview", async (req, res) => {
  try {
    const {
      timestamp,
      username,
      building_name,
      floor_number,
      gender,
      cleanliness,
      poopability,
      cryability,
      peacefulness,
      overall_rating,
      additional_comments,
    } = req.body;

    const query = `
          INSERT INTO bathroom_reviews(
            timestamp,
            username,
            building_name,
            floor_number,
            gender,
            cleanliness,
            poopability,
            cryability,
            peacefulness,
            overall_rating,
            additional_comments
          )
          VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *;`;

    const values = [
      timestamp,
      username,
      building_name,
      floor_number,
      gender,
      cleanliness,
      poopability,
      cryability,
      peacefulness,
      overall_rating,
      additional_comments,
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
