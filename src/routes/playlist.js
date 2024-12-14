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
      username: user2.username,
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
      searchQuery, 
      genre, 
      publicOnly = false,
      id,
      all
    } = req.query;


    // Build query
    const query = {
      isPublic: all === 'true',
    };

    // Pagination and sorting
    // const options = {
    //   limit: parseInt(limit),
    //   skip: (page - 1) * limit,
    //   sort: { createdAt: -1 }
    // };

    // Fetch playlists
    let playlists = null
    if (!id && !searchQuery) {
      // if there is no id in url show all playlists
      playlists = await Playlist.find({$or: [{creator: user2}, {likes: user2._id}, query]});
    }else if (searchQuery) {
      playlists = await Playlist.aggregate([
        {
          $search: {
            index: "playlist",
            text: {
              query: searchQuery,
              path: "title",
              fuzzy: {
                maxEdits: 2,
                prefixLength: 0,
                maxExpansions: 50
              }
            }
          }
        }
      ])
    } else {
      // if is show one playlist
      playlists = await Playlist.find({_id: id})
    }


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
    console.log(req.body)

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

    const user = await User.findOne({JWT: JWT})
    console.log(user.id)
  try {
    const { playlistId } = req.params;

    // Find the playlist
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if playlist is public or user's own playlist
    if (!playlist.isPublic && playlist.creator.toString() !== user.toString()) {
      return res.status(403).json({ message: 'Cannot like private playlist' });
    }

    const userIndex = playlist.likes.indexOf(user._id)


    console.log(userIndex)
    // Toggle like
    if (userIndex > -1) {
      playlist.likes.splice(userIndex, 1);
    } else {
      playlist.likes.push(user);
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
