const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validateJWT = require('../middleware/validateJWT');

router.get("/youtube", validateJWT, async (req, res) => {
    const data = await fetch('')
    const result = await data.json()
    res.json({
        data: result
    })
})
router.post("/youtubeauth", validateJWT, (req, res) => {
    const youtubeToken = req.originalUrl
    console.log(youtubeToken)
    res.json({
        youtubeToken
    })
})
module.exports = router