const express = require("express");
const router = express.Router();
const { User, Notification } = require("../models/User");
const validateJWT = require("../middleware/validateJWT");
const { Error } = require("mongoose");

router.get("/", validateJWT, async (req, res) => {
    let JWT = req.headers.authorization.split(" ")[1];
    const currentUser = await User.findOne({ JWT: JWT });
        try {
            if (!currentUser) {
                throw new Error(
                    "Error token was not provided. Please login first."
                );
            }

            currentUser.deleteOldNotifications()
            let notifications = await currentUser.getUnreadNotifications()

    
            res.json({
                notifications
            });
        } catch (error) {
            console.error("Notification retrieval error:", error);
            res.status(500).json({
                message: "Error retrieving Notifications",
                error: error.message,
            });
        }
})

module.exports = router