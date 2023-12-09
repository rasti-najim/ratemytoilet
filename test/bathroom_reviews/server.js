const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Database setup
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ratemytoilet',
  password: 'postgres',
  port: 5432,
});

app.use(bodyParser.json());
app.use(express.static('public'));  // Serve static files from the public directory


app.post('/reviews', async (req, res) => {
  const { username, building_name, floor, gender, cleanliness, poopability, overall_rating, peacefulness, additional_comments } = req.body;

  // Insert the user if they don't exist
  await pool.query(`INSERT INTO userTable(username, grade) VALUES ($1, floor(random() * 4 + 1)::integer) ON CONFLICT (username) DO NOTHING;`, [username]);

  // Fetch bathroom_id
  let result = await pool.query(`SELECT bathroom_id FROM bathroom WHERE building_name=$1 AND floor_number=$2 AND gender=$3;`, [building_name, floor, gender]);

  let bathroom_id;
  if (result.rowCount === 0) {
      // If bathroom doesn't exist, insert a new one and get its ID
      const insertBathroomResult = await pool.query(`INSERT INTO bathroom(building_name, floor_number, gender) VALUES ($1, $2, $3) RETURNING bathroom_id;`, [building_name, floor, gender]);
      bathroom_id = insertBathroomResult.rows[0].bathroom_id;
  } else {
      bathroom_id = result.rows[0].bathroom_id;
  }

  // Insert the review
  await pool.query(`INSERT INTO reviews(username, bathroom_id, cleanliness, poopability, overall_rating, peacefulness, additional_comments) VALUES ($1, $2, $3, $4, $5, $6, $7);`, [username, bathroom_id, cleanliness, poopability, overall_rating, peacefulness, additional_comments]);

  res.json({ message: "Review added successfully!" });
});




app.get('/reviews', async (req, res) => {
  let queryText = `
    SELECT rs.review_id, rs.username, rs.cleanliness, rs.poopability, rs.overall_rating, rs.peacefulness, rs.additional_comments, rs.like_count, b.building_name, b.floor_number, b.gender
    FROM reviews rs
    JOIN bathroom b ON rs.bathroom_id = b.bathroom_id
`;


  try {
      const result = await pool.query(queryText);
      res.json(result.rows);
  } catch (error) {
      console.error("Database error:", error);
      res.status(500).send("Internal server error.");
  }
});


app.get('/reviews/search', async (req, res) => {
  const { building_name, floor, gender } = req.query;

  const result = await pool.query(`
      SELECT r.review_id, r.username, r.cleanliness, r.poopability, r.overall_rating, r.peacefulness, r.additional_comments, r.like_count, b.building_name, b.floor_number, b.gender
      FROM reviews r
      JOIN bathroom b ON r.bathroom_id = b.bathroom_id
      WHERE LOWER(b.building_name)=LOWER($1) AND b.floor_number=$2 AND LOWER(b.gender)=LOWER($3);
  `, [building_name, floor, gender]);

  res.json(result.rows);
});


//get the top 10 most liked reviews:
app.get('/reviews/top_liked', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.review_id, r.username, r.cleanliness, r.poopability, r.overall_rating, 
             r.peacefulness, r.additional_comments, r.like_count, b.building_name, 
             b.floor_number, b.gender
      FROM reviews r
      JOIN bathroom b ON r.bathroom_id = b.bathroom_id
      ORDER BY r.like_count DESC
      LIMIT 10;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).send("Internal server error.");
  }
});


app.get('/reviews/most_by_user', async (req, res) => {
  const result = await pool.query(`SELECT username, COUNT(*) as review_count FROM reviews GROUP BY username ORDER BY review_count DESC LIMIT 1;`);
  res.json(result.rows[0]);
});

app.get('/reviews/searchByCategory', async (req, res) => {
  const { category, rating } = req.query;

  // Check if the category is valid
  const validCategories = ['cleanliness', 'poopability', 'overall_rating', 'peacefulness'];
  if (!validCategories.includes(category)) {
    return res.status(400).send("Invalid category");
  }

  try {
    const result = await pool.query(`
      SELECT r.review_id, r.username, r.cleanliness, r.poopability, r.overall_rating, r.peacefulness, r.additional_comments, r.like_count, b.building_name, b.floor_number, b.gender
      FROM reviews r
      JOIN bathroom b ON r.bathroom_id = b.bathroom_id
      WHERE r.${category} = $1;
    `, [rating]);

    res.json(result.rows);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).send("Internal server error.");
  }
});


// allow users to like reviews
app.post('/reviews/like', async (req, res) => {
  const { review_id } = req.body;
  console.log(review_id);

  try {
    const result = await pool.query(`UPDATE reviews SET like_count = like_count + 1 WHERE review_id = $1 RETURNING like_count`, [review_id]);
    if (result.rows.length > 0) {
      const newLikeCount = result.rows[0].like_count;
      res.json({ like_count: newLikeCount });
    } else {
      res.status(404).send("Review not found.");
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).send("Internal server error.");
  }
});


app.get('/reviews/top_grades', async (req, res) => {
  const result = await pool.query(`
      SELECT u.grade, 
             CASE u.grade
               WHEN 1 THEN 'Freshman'
               WHEN 2 THEN 'Sophomore'
               WHEN 3 THEN 'Junior'
               WHEN 4 THEN 'Senior'
               ELSE 'Unknown'
             END as grade_name,
             COUNT(*) as review_count 
      FROM reviews r 
      JOIN userTable u ON r.username = u.username 
      GROUP BY u.grade, grade_name 
      ORDER BY u.grade ASC;
  `);
  res.json(result.rows);
});

// randomly generate a bathroom that users can try
app.get('/random-review', async (req, res) => {
  try {
      const result = await pool.query(`
          SELECT r.*, b.building_name, b.floor_number, b.gender 
          FROM reviews r
          JOIN bathroom b ON r.bathroom_id = b.bathroom_id
          ORDER BY RANDOM()
          LIMIT 1;
      `);
      res.json(result.rows[0]);
  } catch (error) {
      res.status(500).send('Error fetching random review');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});




