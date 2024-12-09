const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};

async function dbDrop() {
    await mongoose.connection.db.dropDatabase();
}

async function disconnectDB() {
    await mongoose.connection.close();
}


module.exports = {
    connectDB,
    dbDrop,
    disconnectDB,
};
