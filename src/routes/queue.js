const express = require('express');
const router = express.Router();
const Queue = require('../models/Queue');
const Playlist = require('../models/Playlist');
const User = require('../models/User');
const validateJWT = require("../middleware/validateJWT");

// Middleware to verify authentication


// Create or Update Queue
router.post('/', validateJWT, async (req, res) => {
  try {
    let JWT = req.headers.authorization.split(' ')[1]
    const user2 = await User.findOne({JWT: JWT})
    const { playlistId } = req.body;
    // Fetch playlist and validate
    const playlist = await Playlist.findOne({_id: playlistId});
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Ensure user has access to playlist
    if (!playlist.isPublic && 
        playlist.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized playlist access' });
    }

    // Create or update queue
    const queue = await Queue.createOrUpdateQueue(
      user2.id, 
      playlistId, 
      playlist.tracks
    );

    res.status(201).json({
      message: 'Queue created/updated successfully',
      queue: {
        currentTrack: queue.currentTrack,
        tracks: queue.tracks,
        playbackState: queue.playbackState
      }
    });
  } catch (error) {
    console.error('Queue creation error:', error);
    res.status(500).json({ 
      message: 'Error creating queue', 
      error: error.message 
    });
  }
});

// Update Playback State
router.patch('/state', validateJWT, async (req, res) => {
  try {
    let JWT = req.headers.authorization.split(' ')[1]
    const user2 = await User.findOne({JWT: JWT})
    const { playbackState, progress, currentTrack } = req.body;

    // Find user's queue
    const queue = await Queue.findOne({ user: user2.id });
    if (!queue) {
      return res.status(404).json({ message: 'No active queue found' });
    }

    // Update queue state
    queue.playbackState = playbackState || queue.playbackState;
    queue.progress = progress !== undefined ? progress : queue.progress;
    queue.currentTrack = currentTrack || queue.currentTrack;

    await queue.save();

    res.json({
      message: 'Queue state updated',
      queue: {
        playbackState: queue.playbackState,
        progress: queue.progress,
        currentTrack: queue.currentTrack
      }
    });
  } catch (error) {
    console.error('Queue state update error:', error);
    res.status(500).json({ 
      message: 'Error updating queue state', 
      error: error.message 
    });
  }
});

// Get Next Track
router.get('/next', validateJWT, async (req, res) => {
  try {
    let JWT = req.headers.authorization.split(' ')[1]
    const user2 = await User.findOne({JWT: JWT})
    const queue = await Queue.findOne({ user: user2.id });
    if (!queue) {
      return res.status(404).json({ message: 'No active queue found' });
    }

    // Get next track based on playback mode
    const nextTrack = queue.getNextTrack();

    if (!nextTrack) {
      return res.status(200).json({ 
        message: 'No more tracks in queue',
        nextTrack: null 
      });
    }

    // Update current track
    queue.currentTrack = nextTrack;
    queue.progress = 0;
    await queue.save();

    res.json({
      message: 'Next track retrieved',
      nextTrack,
      playbackMode: queue.playbackMode
    });
  } catch (error) {
    console.error('Next track retrieval error:', error);
    res.status(500).json({ 
      message: 'Error getting next track', 
      error: error.message 
    });
  }
});

// Change Playback Mode
router.patch('/mode', validateJWT, async (req, res) => {
  try {
    const { playbackMode } = req.body;

    // Validate playback mode
    const validModes = ['normal', 'repeat', 'repeat_one', 'shuffle'];
    if (!validModes.includes(playbackMode)) {
      return res.status(400).json({ message: 'Invalid playback mode' });
    }

    // Find and update queue
    const queue = await Queue.findOne({ user: req.user._id });
    if (!queue) {
      return res.status(404).json({ message: 'No active queue found' });
    }

    queue.playbackMode = playbackMode;
    await queue.save();

    res.json({
      message: 'Playback mode updated',
      playbackMode: queue.playbackMode
    });
  } catch (error) {
    console.error('Playback mode update error:', error);
    res.status(500).json({ 
      message: 'Error updating playback mode', 
      error: error.message 
    });
  }
});

module.exports = router;