# Part-B-Server

music-integration-backend/
│
├── config/
│   ├── database.js
│   └── passport.js
│
├── controllers/
│   ├── authController.js
│   ├── playlistController.js
│   ├── youtubeController.js
│   └── soundcloudController.js
│
├── middleware/
│   ├── authMiddleware.js
│   └── errorMiddleware.js
│
├── models/
│   ├── User.js
│   ├── Playlist.js
│   └── Track.js
│
├── routes/
│   ├── authRoutes.js
│   ├── playlistRoutes.js
│   ├── youtubeRoutes.js
│   └── soundcloudRoutes.js
│
├── services/
│   ├── youtubeService.js
│   └── soundcloudService.js
│
├── utils/
│   ├── validationSchemas.js
│   └── tokenGenerator.js
│
├── .env
├── .gitignore
├── server.js
└── package.json