
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  password: "postgres",
  host: "localhost",
  port: 5432,
  database: "ratemytoilet",
});

const addReview = (review) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO reviews(username, bathroom_id, cleanliness, poopability, overall_rating, peacefulness, additional_comments) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *';
    const params = [review.username, review.bathroom_id, review.cleanliness, review.poopability, review.overall_rating, review.peacefulness, review.additional_comments];

    pool.query(query, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results.rows);
      }
    });
  });
};

const viewReviews = (buildingName) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM reviews WHERE building_name = $1';
    const params = [buildingName];

    pool.query(query, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results.rows);
      }
    });
  });
};

const highestReviewByOverallRating = (buildingName) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM reviews WHERE building_name = $1 ORDER BY overall_rating DESC LIMIT 1';
    const params = [buildingName];

    pool.query(query, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results.rows[0]);
      }
    });
  });
};

const highestReviewByPoopability = (buildingName) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM reviews WHERE building_name = $1 ORDER BY poopability DESC LIMIT 1';
    const params = [buildingName];

    pool.query(query, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results.rows[0]);
      }
    });
  });
};

const highestReviewByCryability = (buildingName) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM reviews WHERE building_name = $1 ORDER BY peacefulness DESC LIMIT 1';
    const params = [buildingName];

    pool.query(query, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results.rows[0]);
      }
    });
  });
};

const viewBathroomsByFilter = (gender, floorNumber, buildingName) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM bathroom WHERE gender = $1 AND floor_number = $2 AND building_name = $3';
    const params = [gender, floorNumber, buildingName];

    pool.query(query, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results.rows);
      }
    });
  });
};

const topReviewers = () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT username, COUNT(*) as review_count FROM reviews GROUP BY username ORDER BY review_count DESC LIMIT 1';
    
    pool.query(query, [], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results.rows);
      }
    });
  });
};

module.exports = {
  addReview,
  viewReviews,
  highestReviewByOverallRating,
  highestReviewByPoopability,
  highestReviewByCryability,
  viewBathroomsByFilter,
  topReviewers
};
