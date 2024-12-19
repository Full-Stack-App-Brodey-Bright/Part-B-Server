const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Notification Schema
const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    type: {
        type: String,
        required: true,
        enum: ["follow", "like", "playlist"],
    },
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
});

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
            minlength: [3, "Username must be at least 3 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please provide a valid email",
            ],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
        },
        youtubeToken: {
            accessToken: String,
            refreshToken: String,
            expiryDate: Date,
        },
        soundcloudToken: {
            accessToken: String,
            refreshToken: String,
            expiryDate: Date,
        },
        JWT: {
            type: String,
        },
        playlists: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Playlist",
            },
        ],
        followers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        following: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        notifications: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Notification",
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Create notification function
UserSchema.methods.createNotification = async function (type, actor) {
    const notification = await Notification.create({
        recipient: this._id,
        type,
        actor,
        read: false,
    });

    this.notifications.push(notification._id);
    await this.save();

    return notification;
};

UserSchema.methods.getUnreadNotifications = async function () {
    return await Notification.find({
        recipient: this._id,
        read: false,
    })
        .populate("actor", "username avatar")
        .sort("-createdAt");
};

// Mark notifications as read
UserSchema.methods.markNotificationsAsRead = async function() {
    await Notification.updateMany(
      { recipient: this._id, read: false },
      { read: true }
    );
  };

  // Delete old notifications (e.g., older than 30 days)
UserSchema.methods.deleteOldNotifications = async function(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    await Notification.deleteMany({
      recipient: this._id,
      createdAt: { $lt: cutoffDate }
    });
  };

const Notification = mongoose.model('Notification', notificationSchema);
const User = mongoose.model('User', UserSchema);


module.exports = { User, Notification }
