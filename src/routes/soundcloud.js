const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validateJWT = require('../middleware/validateJWT');

router.get("/soundcloud", validateJWT, (req, res) => {
    
})

module.exports = router