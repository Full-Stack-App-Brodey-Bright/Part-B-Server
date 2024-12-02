
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const validateJWT = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            res.status(401).json({
                message: "Error token was not provided. Please login first."
            })
        }
        const token = req.headers.authorization.split(' ')[1]
        if (!token) {
            res.status(401).json({
                message: "Error token was not provided. Please login first."
            })
        } else {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
            res.json({
                login: true,
                data: decodedToken
            })
        }
    next();
    } catch(err) {
        res.json({
            Error: err,
            message: err.message
        })
    }
    

}

module.exports = validateJWT