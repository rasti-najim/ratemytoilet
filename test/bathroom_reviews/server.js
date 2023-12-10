// setup for Express app, body-parser middleware, and PostgreSQL connection pool
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Database setup and configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ratemytoilet',
  password: 'postgres',
  port: 5432,
});

// configure the middleware to parse JSON and serve static files from 'public' directory
app.use(bodyParser.json());
app.use(express.static('public'));  

// endpoint to handle POST request for adding a new review
app.post('/reviews', async (req, res) => {
  const { username, building_name, floor, gender, grade, cleanliness, poopability, overall_rating, peacefulness, additional_comments} = req.body;

  // insert the user if they don't exist
  await pool.query(`INSERT INTO userTable(username, grade) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING;`, [username, grade]);

  // fetch bathroom_id
  let result = await pool.query(`SELECT bathroom_id FROM bathroom WHERE building_name=$1 AND floor_number=$2 AND gender=$3;`, [building_name, floor, gender]);

  let bathroom_id;
  if (result.rowCount === 0) {
      // if bathroom doesn't exist, insert a new one and get its ID
      const insertBathroomResult = await pool.query(`INSERT INTO bathroom(building_name, floor_number, gender) VALUES ($1, $2, $3) RETURNING bathroom_id;`, [building_name, floor, gender]);
      bathroom_id = insertBathroomResult.rows[0].bathroom_id;
  } else {
      bathroom_id = result.rows[0].bathroom_id;
  }

  // insert the review
  await pool.query(`INSERT INTO reviews(username, bathroom_id, cleanliness, poopability, overall_rating, peacefulness, additional_comments) VALUES ($1, $2, $3, $4, $5, $6, $7);`, [username, bathroom_id, cleanliness, poopability, overall_rating, peacefulness, additional_comments]);

  res.json({ message: "Review added successfully!" });
});



// endpoint to handle GET request for getting all the reviews submitted by user
app.get('/reviews', async (req, res) => {
  let queryText = `
    SELECT rs.review_id, rs.username, rs.cleanliness, rs.poopability, rs.overall_rating, rs.peacefulness, rs.additional_comments, rs.like_count, b.building_name, b.floor_number, b.gender
    FROM reviews rs
    JOIN bathroom b ON rs.bathroom_id = b.bathroom_id
`;
  // error handling
  try {
      const result = await pool.query(queryText);
      // json file
      res.json(result.rows);
  } catch (error) {
      // display error
      console.error("Database error:", error);
      res.status(500).send("Internal server error.");
  }
});

// endpoint to handle GET request for searching reviews based on building name, floor, and gender
app.get('/reviews/search', async (req, res) => {
  const { building_name, floor, gender } = req.query;

  // get the SQL query results
  const result = await pool.query(`
      SELECT r.review_id, r.username, r.cleanliness, r.poopability, r.overall_rating, r.peacefulness, r.additional_comments, r.like_count, b.building_name, b.floor_number, b.gender
      FROM reviews r
      JOIN bathroom b ON r.bathroom_id = b.bathroom_id
      WHERE LOWER(b.building_name)=LOWER($1) AND b.floor_number=$2 AND LOWER(b.gender)=LOWER($3);
  `, [building_name, floor, gender]);

  res.json(result.rows);
});


// get the top 10 most liked reviews:
app.get('/reviews/top_liked', async (req, res) => {
  // error handling for endpoint
  try {
    // SQL query results stored in result
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

// endpoint to fetch the user with the highest number of reviews
app.get('/reviews/most_by_user', async (req, res) => {
  const result = await pool.query(`SELECT username, COUNT(*) as review_count FROM reviews GROUP BY username ORDER BY review_count DESC LIMIT 1;`);
  res.json(result.rows[0]);
});

// endpoint for getting reviews by a specific category and rating
// Includes validation for different categories
app.get('/reviews/searchByCategory', async (req, res) => {
  const { category, rating } = req.query;

  // check if the category is valid
  const validCategories = ['cleanliness', 'poopability', 'overall_rating', 'peacefulness'];
  if (!validCategories.includes(category)) {
    return res.status(400).send("Invalid category");
  }

  // error handling for this endpoint, similar to previous steps
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


// endpoint for users to like reviews on the review card
// Increments like count for a given review
app.post('/reviews/like', async (req, res) => {
  const { review_id } = req.body;
  console.log(review_id);

  try {
    // update the database
    const result = await pool.query(`UPDATE reviews SET like_count = like_count + 1 WHERE review_id = $1 RETURNING like_count`, [review_id]);
    if (result.rows.length > 0) {
      const newLikeCount = result.rows[0].like_count;
      res.json({ like_count: newLikeCount });
    } else {
      res.status(404).send("Review not found.");
    }
  } catch (error) {
    // display error
    console.error("Database error:", error);
    res.status(500).send("Internal server error.");
  }
});


// endpoint to fetch data on top grades that have contributed to the platform
app.get('/reviews/top_grades', async (req, res) => {
  // fetch SQL data
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


// endpoint to randomly generate a bathroom that users can try
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


// starts the server and listens on the specified port
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});




