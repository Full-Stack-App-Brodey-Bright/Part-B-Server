require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { connectDB } = require('./config/database');

const app = express();


// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());

var corsOptions = {
  origin: 'http://127.0.0.1:5173'
}

// Connect to Database
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/auth', require('./routes/youtube'))
const playlistRoutes = require('./routes/playlist');
app.use('/api/playlists', playlistRoutes);
const queueRoutes = require('./routes/queue');
app.use('/api/queue', queueRoutes);
app.use('/api/user', require('./routes/user'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});