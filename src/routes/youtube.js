const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const validateJWT = require("../middleware/validateJWT");

// router.get("/youtube", validateJWT, async (req, res) => {});

// Gets and Stores the youtube access token to the database
router.post("/youtubeauth", validateJWT, async (req, res) => {
    let JWT = req.headers.authorization.split(' ')[1]
    let accessToken = req.body.accessToken;
    User.collection.updateOne({JWT: JWT}, {$set: {YoutubeToken: {accessToken: accessToken}}})
    res.status(200).json({
        message: "Youtube Connection Success! Storing Keys"
    })
});
module.exports = router;
