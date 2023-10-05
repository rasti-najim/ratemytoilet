
const express = require('express');
const router = express.Router();
const db = require('../db');

// 1) Add Reviews
router.post('/addReview', async (req, res) => {
    try {
        const review = req.body;
        await db.addReview(review);
        res.status(200).send("Review added successfully");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 2) View Reviews for a building_name
router.get('/viewReviews/:buildingName', async (req, res) => {
    try {
        const buildingName = req.params.buildingName;
        const reviews = await db.viewReviews(buildingName);
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 3) View highest review in building by overall_rating
router.get('/highestReview/overall/:buildingName', async (req, res) => {
    try {
        const buildingName = req.params.buildingName;
        const review = await db.highestReviewByOverallRating(buildingName);
        res.status(200).json(review);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 4) View highest review in building by poopability
router.get('/highestReview/poopability/:buildingName', async (req, res) => {
    try {
        const buildingName = req.params.buildingName;
        const review = await db.highestReviewByPoopability(buildingName);
        res.status(200).json(review);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 5) View highest review in building by cryability (assuming this is peacefulness)
router.get('/highestReview/cryability/:buildingName', async (req, res) => {
    try {
        const buildingName = req.params.buildingName;
        const review = await db.highestReviewByCryability(buildingName);
        res.status(200).json(review);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 6) View bathrooms by gender, floor_number, and building_name
router.get('/viewBathrooms', async (req, res) => {
    try {
        const { gender, floorNumber, buildingName } = req.query;
        const bathrooms = await db.viewBathroomsByFilter(gender, floorNumber, buildingName);
        res.status(200).json(bathrooms);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 7) View users who have the highest number of ratings written
router.get('/topReviewers', async (req, res) => {
    try {
        const users = await db.topReviewers();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
