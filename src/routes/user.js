const express = require("express");
const router = express.Router();
const Playlist = require("../models/Playlist");
const User = require("../models/User");
const validateJWT = require("../middleware/validateJWT");
const { Error } = require("mongoose");


// get username and users public playlists by id
router.get("/:userId", validateJWT, async (req, res) => {
    let JWT = req.headers.authorization.split(" ")[1];
    const currentUser = await User.findOne({ JWT: JWT });
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId})
    try {
        if (!currentUser) {
            throw new Error(
                "Error token was not provided. Please login first."
            );
        }
        
        const userDetails = {
            username: user.username,
            followers: user.followers,
            following: user.following,
        }

        // Pagination and sorting
        // const options = {
        //   limit: parseInt(limit),
        //   skip: (page - 1) * limit,
        //   sort: { createdAt: -1 }
        // };

        // Fetch playlists
        let playlists = null;
        if (user) {
            playlists = await Playlist.find({
                $and: [{ creator: user }, {isPublic: true}],
            });
        } else {
            throw new Error(
                "User Not Found"
            )
        }

        res.json({
            userDetails,
            playlists
        });
    } catch (error) {
        console.error("User retrieval error:", error);
        res.status(500).json({
            message: "Error retrieving user",
            error: error.message,
        });
    }
});

// follow and unfollow user by id

router.post('/:userId/follow', validateJWT, async (req, res) => {
    let JWT = req.headers.authorization.split(' ')[1]

    const currentUser = await User.findOne({JWT: JWT})
    console.log(currentUser.id)
  try {
    const { userId } = req.params;

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is current user
    if (currentUser.toString() == user.toString()) {
      return res.status(403).json({ message: 'You cannot follow yourself!' });
    }

    const followerIndex = user.followers.indexOf(currentUser._id)
    const followingIndex = currentUser.following.indexOf(user._id)

    // Toggle follow
    if (followerIndex > -1) {
      user.followers.splice(followerIndex, 1);
      currentUser.following.splice(followingIndex, 1)
    } else {
      user.followers.push(currentUser);
      currentUser.following.push(user);
    }

    // Save updated users
    await user.save();
    await currentUser.save()

    res.json({
      message: followerIndex > -1 ? 'User unfollowed' : 'User followed',
      followerCount: user.followers.length,
    });
  } catch (error) {
    console.error('User follow error:', error);
    res.status(500).json({ 
      message: 'Error following user', 
      error: error.message 
    });
  }
});

// get following by id
router.get("/:userId/following", validateJWT, async (req, res) => {
    let JWT = req.headers.authorization.split(" ")[1];
    const currentUser = await User.findOne({ JWT: JWT });
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId})
    try {
        if (!currentUser) {
            throw new Error(
                "Error token was not provided. Please login first."
            );
        }
        
        const username = user.username

        // Pagination and sorting
        // const options = {
        //   limit: parseInt(limit),
        //   skip: (page - 1) * limit,
        //   sort: { createdAt: -1 }
        // };

        // Fetch following
        let following = null
        if (user) {
            following = await User.find({ '_id': {$in: user.following}}).select({password:0, email:0, JWT:0})
        } else {
            throw new Error(
                "User Not Found"
            )
        }

        res.json({
            username,
            following
        });
    } catch (error) {
        console.error("Following retrieval error:", error);
        res.status(500).json({
            message: "Error retrieving user following",
            error: error.message,
        });
    }
});

module.exports = router;
