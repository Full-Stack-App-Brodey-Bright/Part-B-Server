const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  _id: { type: Schema.Types.ObjectId },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  youtubeToken: {
    accessToken: String,
    refreshToken: String,
    expiryDate: Date
  },
  soundcloudToken: {
    accessToken: String,
    refreshToken: String,
    expiryDate: Date
  },
  JWT: {
    type: String,
  },
  playlists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist'
  }]
}, { 
  timestamps: true,
});


module.exports = mongoose.model('User', UserSchema);