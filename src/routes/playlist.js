const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const User = require('../models/User');
const validateJWT = require("../middleware/validateJWT");
const { Error } = require('mongoose');


// Create a new playlist
router.post('/', validateJWT, async (req, res) => {
    let JWT = req.headers.authorization.split(' ')[1]
    const user2 = await User.findOne({JWT: JWT})
    console.log(user2)
  try {
    const { title, description, tracks, isPublic, tags, genres } = req.body;

    // Create new playlist
    const newPlaylist = new Playlist({
      title,
      description,
      creator: user2.id,
      tracks: tracks || [],
      isPublic: isPublic || false,
      tags: tags || [],
      genres: genres || []
    });

    // Save playlist
    const savedPlaylist = await newPlaylist.save();
    user2.playlists.push(savedPlaylist)
    user2.save()


    res.status(201).json({
      message: 'Playlist created successfully',
      playlist: savedPlaylist
    });
  } catch (error) {
    console.error('Playlist creation error:', error);
    res.status(500).json({ 
      message: 'Error creating playlist', 
      error: error.message 
    });
  }
});

// Get user's playlists
router.get('/', validateJWT, async (req, res) => {
    let JWT = req.headers.authorization.split(' ')[1]
    const user2 = await User.findOne({JWT: JWT})
  try {
    if (!user2) {
        throw new Error('Error token was not provided. Please login first.')
    }

    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      genre, 
      publicOnly = false,
      id
    } = req.query;

    console.log(req.query)
    console.log(id)

    // Build query
    const query = {
      creator: user2,
      ...(publicOnly && { isPublic: true }),
      ...(genre && { genres: genre }),
      ...(search && { 
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      })
    };

    // Pagination and sorting
    // const options = {
    //   limit: parseInt(limit),
    //   skip: (page - 1) * limit,
    //   sort: { createdAt: -1 }
    // };

    // Fetch playlists
    const playlists = await Playlist.find({_id: id} || query);
    const total = await Playlist.countDocuments(query);

    res.json({
      playlists,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Playlist retrieval error:', error);
    res.status(500).json({ 
      message: 'Error retrieving playlists', 
      error: error.message 
    });
  }
});

// Update a playlist
router.put('/:playlistId', validateJWT, async (req, res) => {
    let JWT = req.headers.authorization.split(' ')[1]
  try {
    const { playlistId } = req.params;
    const { title, description, tracks, isPublic, tags, genres } = req.body;

    // Find the playlist and ensure user is the creator
    const playlist = await Playlist.findOne({ 
      _id: playlistId, 
      creator: await User.findOne({JWT: JWT}._id) 
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Update playlist fields
    playlist.title = title || playlist.title;
    playlist.description = description || playlist.description;
    playlist.tracks = tracks || playlist.tracks;
    playlist.isPublic = isPublic !== undefined ? isPublic : playlist.isPublic;
    playlist.tags = tags || playlist.tags;
    playlist.genres = genres || playlist.genres;

    // Save updated playlist
    const updatedPlaylist = await playlist.save();

    res.json({
      message: 'Playlist updated successfully',
      playlist: updatedPlaylist
    });
  } catch (error) {
    console.error('Playlist update error:', error);
    res.status(500).json({ 
      message: 'Error updating playlist', 
      error: error.message 
    });
  }
});

// Delete a playlist
router.delete('/:playlistId', validateJWT, async (req, res) => {
    let JWT = req.headers.authorization.split(' ')[1]
  try {
    const { playlistId } = req.params;

    // Find and delete playlist
    const deletedPlaylist = await Playlist.findOneAndDelete({ 
      _id: playlistId, 
      creator: await User.findOne({JWT: JWT}._id) 
    });

    if (!deletedPlaylist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.json({
      message: 'Playlist deleted successfully',
      playlist: deletedPlaylist
    });
  } catch (error) {
    console.error('Playlist deletion error:', error);
    res.status(500).json({ 
      message: 'Error deleting playlist', 
      error: error.message 
    });
  }
});

// Like/Unlike a playlist
router.post('/:playlistId/like', validateJWT, async (req, res) => {
    let JWT = req.headers.authorization.split(' ')[1]

    const userid = await User.findOne({JWT: JWT})._id
  try {
    const { playlistId } = req.params;

    // Find the playlist
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if playlist is public or user's own playlist
    if (!playlist.isPublic && playlist.creator.toString() !== userid.toString()) {
      return res.status(403).json({ message: 'Cannot like private playlist' });
    }

    const userIndex = playlist.likes.findIndex(
      id => id.toString() === userid.toString()
    );

    // Toggle like
    if (userIndex > -1) {
      playlist.likes.splice(userIndex, 1);
    } else {
      playlist.likes.push(userid);
    }

    // Save updated playlist
    await playlist.save();

    res.json({
      message: userIndex > -1 ? 'Playlist unliked' : 'Playlist liked',
      likeCount: playlist.likes.length
    });
  } catch (error) {
    console.error('Playlist like error:', error);
    res.status(500).json({ 
      message: 'Error liking playlist', 
      error: error.message 
    });
  }
});

module.exports = router;