const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    _id: { type: Schema.Types.ObjectId },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tracks: [{
      title: {
        type: String,
        required: true,
        trim: true
      },
      artist: {
        type: String,
        required: true,
        trim: true
      },
      album: {
        type: String,
        trim: true
      },
      duration: {
        type: Number, // Duration in seconds
        min: 0
      },
      url: {
        type: String,
        trim: true
      }
    }],
    isPublic: {
      type: Boolean,
      default: false
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    genres: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  }, {
    timestamps: true
  });
  
// Compound index for efficient querying
playlistSchema.index({ creator: 1, isPublic: 1 });

// Static method to find playlists by user
playlistSchema.statics.findByUser = function(userId) {
  return this.find({ creator: userId });
};

// Virtual to get total playlist duration
playlistSchema.virtual('totalDuration').get(function() {
  return this.tracks.reduce((total, track) => total + (track.duration || 0), 0);
});

// Virtual to get track count
playlistSchema.virtual('trackCount').get(function() {
  return this.tracks.length;
});

// Method to add a track to playlist
playlistSchema.methods.addTrack = function(track) {
  this.tracks.push(track);
  return this.save();
};

// Method to remove a track from playlist
playlistSchema.methods.removeTrack = function(trackId) {
  this.tracks = this.tracks.filter(track => track._id.toString() !== trackId);
  return this.save();
};

module.exports = mongoose.model('Playlist', playlistSchema);