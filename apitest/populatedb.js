const mongoose = require("mongoose");

// Use the MongoDB connection string provided in the environment variable, or use a default value (for testing)
const mongoDB =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/video_database";

// Connect to MongoDB
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

// Log an error if there's a problem connecting to MongoDB
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Log a success message once connected to MongoDB
db.once("open", function () {
  console.log("Connected to MongoDB");
});

// Define the Video model using Mongoose's Schema
const Schema = mongoose.Schema;

const VideoSchema = new Schema({
  videoId: { type: String }, // The ID of the video (stored as a string)
  videoTitle: { type: String, required: true }, // The title of the video (required)
  videoCreateDate: { type: Date, default: Date.now }, // The date the video was created (default is current date)
  videoLocation: { type: String, required: true }, // The file path where the video is stored (required)
  videoType: { type: String, required: true }, // The type/format of the video (e.g., mp4) (required)
  userId: { type: Number, required: true }, // The ID of the user who uploaded the video (required)
});

// Create the Video model from the schema
const Video = mongoose.model("Video", VideoSchema);

module.exports = Video;

// Function to create and insert video data into the database
async function createVideos() {
  // Sample video data to be inserted
  const videos = [
    {
      videoId: "1",
      videoTitle: "song1",
      videoLocation: "/videos/song1.mp4",
      videoType: "mp4",
      userId: 1,
    },
    {
      videoId: "2",
      videoTitle: "song2",
      videoLocation: "/videos/song2.mp4",
      videoType: "mp4",
      userId: 2,
    },
    {
      videoId: "3",
      videoTitle: "song3",
      videoLocation: "/videos/song3.mp4",
      videoType: "mp4",
      userId: 1,
    },
    {
      videoId: "4",
      videoTitle: "song4.mov",
      videoLocation: "/videos/song2.mov",
      videoType: "mp4",
      userId: 1,
    },
  ];

  try {
    // Insert the video data into the MongoDB collection
    await Video.insertMany(videos);
    console.log("Video data inserted successfully");
  } catch (err) {
    // Log an error if the insertion fails
    console.error("Error inserting video data:", err);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
}

// Call the function to create and insert video data
createVideos();
