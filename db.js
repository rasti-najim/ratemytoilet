const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    password: "postgres",
    host: "localhost",
    port: 5432,
    database: "ratemytoilet",
});

const addReview = async (review) => {
    const query = `INSERT INTO reviews (username, bathroom_id, cleanliness, poopability, overall_rating, peacefulness, additional_comments)
                   VALUES ($1, $2, $3, $4, $5, $6, $7)`;
    const values = [review.username, review.bathroom_id, review.cleanliness, review.poopability, review.overall_rating, review.peacefulness, review.additional_comments];
    await pool.query(query, values);
};

const viewReviews = async (buildingName) => {
    const query = `
        SELECT r.*, b.building_name, b.floor_number, b.gender
        FROM reviews r
        JOIN bathroom b ON r.bathroom_id = b.bathroom_id
        WHERE b.building_name = $1
    `;
    const { rows } = await pool.query(query, [buildingName]);
    return rows;
};

const highestReviewByOverallRating = async (buildingName) => {
    const query = `
        SELECT r.*, b.building_name, b.floor_number, b.gender
        FROM reviews r
        JOIN bathroom b ON r.bathroom_id = b.bathroom_id
        WHERE b.building_name = $1
        ORDER BY r.overall_rating DESC
        LIMIT 1
    `;
    const { rows } = await pool.query(query, [buildingName]);
    return rows[0];
};

const highestReviewByPoopability = async (buildingName) => {
    const query = `
        SELECT r.*, b.building_name, b.floor_number, b.gender
        FROM reviews r
        JOIN bathroom b ON r.bathroom_id = b.bathroom_id
        WHERE b.building_name = $1
        ORDER BY r.poopability DESC
        LIMIT 1
    `;
    const { rows } = await pool.query(query, [buildingName]);
    return rows[0];
};

const highestReviewByPeacefulness = async (buildingName) => {
    const query = `
        SELECT r.*, b.building_name, b.floor_number, b.gender
        FROM reviews r
        JOIN bathroom b ON r.bathroom_id = b.bathroom_id
        WHERE b.building_name = $1
        ORDER BY r.peacefulness DESC
        LIMIT 1
    `;
    const { rows } = await pool.query(query, [buildingName]);
    return rows[0];
};

const viewBathroomsByFilter = async (gender, floorNumber, buildingName) => {
    const query = `
        SELECT * FROM bathroom
        WHERE gender = $1 AND floor_number = $2 AND building_name = $3
    `;
    const { rows } = await pool.query(query, [gender, floorNumber, buildingName]);
    return rows;
};

const topReviewers = async () => {
    const query = `
        SELECT username, COUNT(review_id) as review_count
        FROM reviews
        GROUP BY username
        ORDER BY review_count DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
};

module.exports = {
    addReview,
    viewReviews,
    highestReviewByOverallRating,
    highestReviewByPoopability,
    highestReviewByPeacefulness,
    viewBathroomsByFilter,
    topReviewers
};