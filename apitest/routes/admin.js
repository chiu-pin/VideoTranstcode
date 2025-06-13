const express = require("express");
const router = express.Router();
const JWT = require("../jwt.js");
const { S3Client, DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { DynamoDBClient, GetItemCommand, ScanCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// config s3 client
const s3Client = new S3Client({ region: "ap-southeast-2" });
const bucketName = "n11532360-test"; // change your s3 name

// config DynamoDB 
const dynamoDBClient = new DynamoDBClient({ region: process.env.AWS_REGION });

// API to fetch all videos and generate presigned URLs for S3 videos
router.get("/all-videos", JWT.authenticateToken, async (req, res) => {
  try {
    // query all record
    const params = {
      TableName: 'N11532360-Videos', 
    };
    const videoData = await dynamoDBClient.send(new ScanCommand(params));

    if (!videoData.Items || videoData.Items.length === 0) {
      return res.status(404).json({ message: "No videos found" });
    }

    // for video to produce  pre-url
    for (const video of videoData.Items) {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: video.videoLocation.S, 
      });

      const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      video.videoLocation = { S: presignedUrl }; // videoLocation change to pre URL
    }

    res.json(videoData.Items); 
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).send("Error fetching videos"); // Handle errors and send a 500 status
  }
});

// API to delete temporary transcoded video files from S3
router.delete("/delete-temporary-files", JWT.authenticateToken, async (req, res) => {
  try {
    const listParams = {
      Bucket: bucketName,
      Prefix: "transcoded_videos/",
    };

    const listedObjects = await s3Client.send(new ListObjectsV2Command(listParams));

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      return res.status(404).json({ message: "No temporary transcoded files found" });
    }

    const deletePromises = listedObjects.Contents.map((object) => {
      const deleteParams = {
        Bucket: bucketName,
        Key: object.Key,
      };

      return s3Client.send(new DeleteObjectCommand(deleteParams))
        .then(() => {
          console.log(`Deleted file from S3: ${object.Key}`);
        })
        .catch((err) => {
          console.error(`Error deleting file ${object.Key}:`, err);
        });
    });

    await Promise.all(deletePromises);

    res.json({ message: "Temporary files deleted successfully" });
  } catch (error) {
    console.error("Error deleting temporary files from S3:", error);
    res.status(500).json({ message: "Error deleting temporary files from S3" });
  }
});

router.delete("/delete-video/:videoId", JWT.authenticateToken, async (req, res) => {
  const videoId = req.params.videoId;

  try {

    const params = {
      TableName: 'N11532360-Videos', 
      Key: {
        'qut-username': { S: 'n11532360@qut.edu.au' }, 
        videoId: { S: videoId.toString() } 
      }
    };
    
    const videoData = await dynamoDBClient.send(new GetItemCommand(params));

    if (!videoData.Item) {
      return res.status(404).json({ message: "Video not found" });
    }

   
    const s3Params = {
      Bucket: bucketName,
      Key: videoData.Item.videoLocation.S,
    };

    await s3Client.send(new DeleteObjectCommand(s3Params));
    console.log(`Video file deleted from S3: ${videoData.Item.videoLocation.S}`);

    await dynamoDBClient.send(new DeleteItemCommand(params));
    console.log(`Video record deleted from DynamoDB: ${videoId}`);

    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ message: "Error deleting video" });
  }
});

module.exports = router;
