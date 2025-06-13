const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const JWT = require('../jwt.js');
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient, GetItemCommand, ScanCommand, PutItemCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const os = require('os');

// Initialize S3 and DynamoDB clients
const s3Client = new S3Client({ region: 'ap-southeast-2' });
const dynamoDBClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const bucketName = 'n11532360-test'; // Replace with your S3 bucket name
const qutUsername = 'n11532360@qut.edu.au'; // Fixed qut-username

// Set up local storage path and filename for video uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../videos'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Upload video API
router.post('/upload-video', JWT.authenticateToken, upload.single('video'), async (req, res) => {
    const userId = req.user.cognitoId;
    if (!userId) {
        console.error('User ID is missing');
        return res.status(400).json({ message: 'User ID is missing' });
    }

    const videoTitle = req.body.videoTitle;
    const videoType = req.body.videoType;

    try {
        // Get the previous video's videoId and generate a new videoId
        const lastVideo = await dynamoDBClient.send(new ScanCommand({ TableName: 'N11532360-Videos' }));
        const videoId = lastVideo.Items && lastVideo.Items.length ? (lastVideo.Items.length + 1).toString() : "1";

        // Define the filename for uploading to S3
        const objectKey = `videos/${Date.now()}-${req.file.originalname}`;
        const videoCreateDate = new Date();

        // Upload video to S3
        const uploadParams = {
            Bucket: bucketName,
            Key: objectKey,
            Body: fs.createReadStream(req.file.path),
            ContentType: req.file.mimetype,
        };

        console.log('Uploading video to S3 with key:', objectKey);
        await s3Client.send(new PutObjectCommand(uploadParams));

        // Save video metadata to DynamoDB
        const videoParams = {
            TableName: 'N11532360-Videos',
            Item: {
                'qut-username': { S: qutUsername },
                videoId: { S: videoId },
                videoTitle: { S: videoTitle },
                videoCreateDate: { S: videoCreateDate.toISOString() },
                videoLocation: { S: objectKey },
                videoType: { S: videoType },
                userId: { S: userId.toString() }
            }
        };

        console.log('Saving video metadata to DynamoDB:', videoParams.Item);
        await dynamoDBClient.send(new PutItemCommand(videoParams));

        // Delete local cache file
        fs.unlinkSync(req.file.path);
        console.log('Local file deleted:', req.file.path);

        res.json({ message: 'Video uploaded to S3 successfully', video: videoParams.Item });
    } catch (error) {
        console.error('Error occurred while uploading video:', error);
        res.status(500).json({ message: 'Error saving video to S3', error: error.message });
    }
});

// Get user videos API (with caching)
router.get("/my-videos", JWT.authenticateToken, async (req, res) => {
    const userId = req.user.cognitoId;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is missing' });
    }

    const cacheKey = `videos_${userId}`;
    const memcached = req.app.locals.memcached;

    try {
        // Check cache
        const cachedData = await memcached.aGet(cacheKey);
        if (cachedData) {
            console.log("Cache hit");
            return res.json(JSON.parse(cachedData));
        }

        console.log("Cache miss");

        // Get video list from DynamoDB
        const scanParams = {
            TableName: 'N11532360-Videos',
            FilterExpression: 'userId = :userId AND #username = :username',
            ExpressionAttributeNames: {
                '#username': 'qut-username'
            },
            ExpressionAttributeValues: {
                ':userId': { S: userId.toString() },
                ':username': { S: qutUsername }
            }
        };

        const videoData = await dynamoDBClient.send(new ScanCommand(scanParams));

        if (!videoData.Items || videoData.Items.length === 0) {
            return res.status(404).json({ message: "No videos found" });
        }

        // Generate presigned URLs for each video
        for (const video of videoData.Items) {
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: video.videoLocation.S
            });
            const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            video.videoLocation = presignedUrl;
        }

        // Cache the video data for 60 seconds
        await memcached.aSet(cacheKey, JSON.stringify(videoData.Items), 60);

        res.json(videoData.Items);
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).send('Error fetching videos');
    }
});

// Download video to server local storage
async function downloadVideoFromS3(inputKey, localPath) {
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: inputKey
    });

    const data = await s3Client.send(command);
    const writeStream = fs.createWriteStream(localPath);

    return new Promise((resolve, reject) => {
        data.Body.pipe(writeStream);
        data.Body.on('error', reject);
        writeStream.on('close', resolve);
    });
}

// Transcode video using ffmpeg
async function transcodeVideoFromS3(inputKey, targetFormat) {
    return new Promise(async (resolve, reject) => {
        try {
            const tempDir = os.tmpdir();
            const localInputPath = path.join(tempDir, `input-${Date.now()}.mp4`);
            const localOutputPath = path.join(tempDir, `transcoded-${Date.now()}.${targetFormat}`);

            // Download video from S3 to local
            await downloadVideoFromS3(inputKey, localInputPath);

            // Transcode using ffmpeg
            ffmpeg(localInputPath)
                .toFormat(targetFormat)
                .on('end', async () => {
                    try {
                        const uploadParams = {
                            Bucket: bucketName,
                            Key: `transcoded_videos/${path.basename(localOutputPath)}`,
                            Body: fs.createReadStream(localOutputPath),
                            ContentType: `video/${targetFormat}`,
                        };
                        await s3Client.send(new PutObjectCommand(uploadParams));

                        // Delete local cache files after successful upload
                        fs.unlinkSync(localInputPath);
                        fs.unlinkSync(localOutputPath);

                        resolve(`transcoded_videos/${path.basename(localOutputPath)}`);
                    } catch (uploadError) {
                        // Handle errors during upload
                        fs.unlinkSync(localInputPath);
                        if (fs.existsSync(localOutputPath)) {
                            fs.unlinkSync(localOutputPath);
                        }
                        reject(uploadError);
                    }
                })
                .on('error', (err) => {
                    // Delete local files on ffmpeg error
                    fs.unlinkSync(localInputPath);
                    if (fs.existsSync(localOutputPath)) {
                        fs.unlinkSync(localOutputPath);
                    }
                    reject(err);
                })
                .save(localOutputPath);

        } catch (error) {
            reject(error);
        }
    });
}

// Transcode API
router.post('/transcode', JWT.authenticateToken, async (req, res) => {
    const { videoId, targetFormat } = req.body;

    try {
        const getParams = {
            TableName: 'N11532360-Videos',
            Key: {
                'qut-username': { S: qutUsername },
                videoId: { S: videoId.toString() }
            }
        };
        const videoData = await dynamoDBClient.send(new GetItemCommand(getParams));

        if (!videoData.Item) {
            return res.status(404).json({ message: 'Video not found' });
        }

        const transcodedVideoKey = await transcodeVideoFromS3(videoData.Item.videoLocation.S, targetFormat);

        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: transcodedVideoKey
        });
        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        res.json({ message: 'Transcoding completed', downloadUrl: presignedUrl });
    } catch (error) {
        console.error('Error transcoding video:', error);
        res.status(500).json({ message: 'Error transcoding video' });
    }
});

// Delete video API
router.delete('/delete-video/:videoId', JWT.authenticateToken, async (req, res) => {
    const videoId = req.params.videoId;

    try {
        const getParams = {
            TableName: 'N11532360-Videos',
            Key: {
                'qut-username': { S: qutUsername },
                videoId: { S: videoId.toString() }
            }
        };
        const videoData = await dynamoDBClient.send(new GetItemCommand(getParams));

        if (!videoData.Item) {
            return res.status(404).json({ message: "Video not found" });
        }

        // Delete video from S3
        const deleteParams = {
            Bucket: bucketName,
            Key: videoData.Item.videoLocation.S
        };
        await s3Client.send(new DeleteObjectCommand(deleteParams));

        // Delete record from DynamoDB
        const deleteDbParams = {
            TableName: 'N11532360-Videos',
            Key: {
                'qut-username': { S: qutUsername },
                videoId: { S: videoId.toString() }
            }
        };
        await dynamoDBClient.send(new DeleteItemCommand(deleteDbParams));

        res.json({ message: "Video deleted successfully from S3 and DynamoDB" });
    } catch (error) {
        console.error("Error deleting video:", error);
        res.status(500).json({ message: "Error deleting video from S3" });
    }
});

module.exports = router;