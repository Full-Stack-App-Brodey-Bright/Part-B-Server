const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  playlist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist',
    required: true
  },
  currentTrack: {
    type: Object,
    default: null
  },
  tracks: [{
    type: Object,
    required: true
  }],
  playbackState: {
    type: String,
    enum: ['playing', 'paused', 'stopped'],
    default: 'stopped'
  },
  playbackMode: {
    type: String,
    enum: ['normal', 'repeat', 'repeat_one', 'shuffle'],
    default: 'normal'
  },
  progress: {
    type: Number,
    default: 0 // Current track progress in seconds
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Static method to create or update queue
queueSchema.statics.createOrUpdateQueue = async function(userId, playlistId, tracks) {
  // Find existing queue or create new one
  let queue = await this.findOne({ user: userId });

  if (queue) {
    // Update existing queue
    queue.playlist = playlistId;
    queue.tracks = tracks;
    queue.currentTrack = tracks[0] || null;
    queue.playbackState = 'stopped';
  } else {
    // Create new queue
    queue = new this({
      user: userId,
      playlist: playlistId,
      tracks: tracks,
      currentTrack: tracks[0] || null
    });
  }

  return queue.save();
};

// Method to get next track based on playback mode
queueSchema.methods.getNextTrack = function() {
  // If no tracks, return null
  if (this.tracks.length === 0) return null;

  // Find current track index
  const currentIndex = this.tracks.findIndex(
    track => track._id.toString() === this.currentTrack._id.toString()
  );

  // Handle different playback modes
  switch (this.playbackMode) {
    case 'repeat_one':
      // Repeat the current track
      return this.currentTrack;

    case 'shuffle':
      // Random track
      return this.tracks[Math.floor(Math.random() * this.tracks.length)];

    case 'repeat':
      // Cycle through tracks, loop back to start
      if (currentIndex === this.tracks.length - 1) {
        return this.tracks[0];
      }
      return this.tracks[currentIndex + 1];

    default: // normal mode
      // Move to next track, stop if at end
      return currentIndex < this.tracks.length - 1 
        ? this.tracks[currentIndex + 1] 
        : null;
  }
};

const Queue = mongoose.model('Queue', queueSchema);