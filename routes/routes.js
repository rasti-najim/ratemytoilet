
const express = require('express');
const router = express.Router();
const db = require('../db');  // Assume a db.js file for database operations

// 1) Add Reviews
router.post('/addReview', (req, res) => {
    const review = req.body;
    db.addReview(review).then(() => {
        res.status(200).send("Review added successfully");
    }).catch(err => {
        res.status(500).send(err.message);
    });
});

// 2) View Reviews for a building_name
router.get('/viewReviews/:buildingName', (req, res) => {
    const buildingName = req.params.buildingName;
    db.viewReviews(buildingName).then(reviews => {
        res.status(200).json(reviews);
    }).catch(err => {
        res.status(500).send(err.message);
    });
});

// 3) View highest review in building by overall_rating
router.get('/highestReview/:buildingName', (req, res) => {
    const buildingName = req.params.buildingName;
    db.highestReviewByOverallRating(buildingName).then(review => {
        res.status(200).json(review);
    }).catch(err => {
        res.status(500).send(err.message);
    });
});

// 4) View highest review in building by poopability
router.get('/highestPoopabilityReview/:buildingName', (req, res) => {
    const buildingName = req.params.buildingName;
    db.highestReviewByPoopability(buildingName).then(review => {
        res.status(200).json(review);
    }).catch(err => {
        res.status(500).send(err.message);
    });
});

// 5) View highest review in building by cryability (assuming this is peacefulness)
router.get('/highestCryabilityReview/:buildingName', (req, res) => {
    const buildingName = req.params.buildingName;
    db.highestReviewByCryability(buildingName).then(review => {
        res.status(200).json(review);
    }).catch(err => {
        res.status(500).send(err.message);
    });
});

// 6) View bathrooms by gender, floor_number, and building_name
router.get('/viewBathrooms', (req, res) => {
    const { gender, floorNumber, buildingName } = req.query;
    db.viewBathroomsByFilter(gender, floorNumber, buildingName).then(bathrooms => {
        res.status(200).json(bathrooms);
    }).catch(err => {
        res.status(500).send(err.message);
    });
});

// 7) View users who have the highest number of ratings written
router.get('/topReviewers', (req, res) => {
    db.topReviewers().then(users => {
        res.status(200).json(users);
    }).catch(err => {
        res.status(500).send(err.message);
    });
});

module.exports = router;
