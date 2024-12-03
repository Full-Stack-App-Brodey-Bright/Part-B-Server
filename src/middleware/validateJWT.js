
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const validateJWT = (req, res, next) => {
    try {
        // checks for header
        if (!req.headers.authorization) {
            throw new Error('Error token was not provided. Please login first.')
        }
        // checks for jwt token in header
        const token = req.headers.authorization.split(' ')[1]
        if (!token) {
            throw new Error('Error token was not provided. Please login first.')
        } else {
            next();
        }
    next();
    } catch(err) {
        res.json({
            Error: err
        })
    }
    

}

module.exports = validateJWT