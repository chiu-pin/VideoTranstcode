require("dotenv").config();
const express = require("express");
const Memcached = require('memcached');
const util = require('util');
const {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} = require("@aws-sdk/client-dynamodb");
const { SecretsManager } = require("@aws-sdk/client-secrets-manager"); // Import SecretsManager
const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm"); // Import SSM to get parameters from Parameter Store
const mysql = require("mysql"); // Import mysql
const cors = require("cors");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({  }));

// Initialize AWS DynamoDB Client
const dynamoDBClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN, // Include session token if using temporary credentials
  },
});

// Initialize AWS SecretsManager Client
const secretsManager = new SecretsManager({ region: "ap-southeast-2" });

// Initialize AWS SSM Client (for Parameter Store)
const ssmClient = new SSMClient({ region: "ap-southeast-2" });

let connection; // Define connection in the global scope

console.log("Connected to DynamoDB");

// Function to create the table if it doesn't exist
async function createVideoTable() {
  const tableName = "N11532360-Videos"; // Table name

  try {
    // First check if the table already exists
    const describeCommand = new DescribeTableCommand({ TableName: tableName });
    await dynamoDBClient.send(describeCommand);
    console.log(`Table ${tableName} already exists. No need to create.`);
  } catch (err) {
    // If the table does not exist, create it
    if (err.name === "ResourceNotFoundException") {
      console.log(`Table ${tableName} not found. Creating it now...`);

      const params = {
        TableName: tableName,
        AttributeDefinitions: [
          { AttributeName: "qut-username", AttributeType: "S" }, // qut-username is of type String
          { AttributeName: "videoId", AttributeType: "S" }, // videoId is of type String
        ],
        KeySchema: [
          { AttributeName: "qut-username", KeyType: "HASH" }, // partition key
          { AttributeName: "videoId", KeyType: "RANGE" }, // sort key
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
      };

      const command = new CreateTableCommand(params);
      const data = await dynamoDBClient.send(command);
      console.log("Table created successfully:", data);
    } else {
      console.error(
        "Error describing or creating table:",
        err.name,
        err.message,
        err
      ); // More detailed error message
    }
  }
}

// Function to get RDS host from Parameter Store
async function getRDSHost() {
  const parameterName = "/n11532360/demo_parameter"; // Parameter name
  try {
    const command = new GetParameterCommand({ Name: parameterName });
    const response = await ssmClient.send(command);
    return response.Parameter.Value; // Return parameter value
  } catch (err) {
    console.error("Error fetching RDS host from Parameter Store:", err);
    throw err;
  }
}

// Function to initialize the RDS connection
async function createRDSConnection() {
  const secretName = "rds!db-da15b437-e7d6-464e-9ced-cf8580ecbd9f"; // Replace with the key name where RDS credentials are stored

  try {
    // Get RDS hostname from Parameter Store
    const host = await getRDSHost();

    // Get RDS credentials from Secrets Manager
    const data = await secretsManager.getSecretValue({ SecretId: secretName });
    if (data.SecretString) {
      const secret = JSON.parse(data.SecretString);

      connection = mysql.createConnection({
        host, // RDS hostname from Parameter Store
        user: secret.username, // RDS username from Secrets Manager
        password: secret.password, // RDS password from Secrets Manager
        database: "my_database", // Replace with your database name
      });

      // Confirm successful connection to RDS
      return new Promise((resolve, reject) => {
        connection.connect((err) => {
          if (err) {
            console.error("Error connecting to RDS:", err);
            reject(err);
          } else {
            console.log("Connected to RDS successfully!");
            resolve();
          }
        });
      });
    }
  } catch (err) {
    console.error(
      "Error retrieving secrets from Secrets Manager or Parameter Store:",
      err
    );
    throw err;
  }
}

const memcachedname = "11532360cache.km2jzi.cfg.apse2.cache.amazonaws.com:11211";
async function creatmemcached() {
  const memcached = new Memcached(memcachedname);
  memcached.on("failure", (details) => {
    console.log("Memcached server failure: ", details);
  });

  // Promisify the get and set functions for easier use with async/await
  memcached.aGet = util.promisify(memcached.get);
  memcached.aSet = util.promisify(memcached.set);

  // Store the memcached instance globally for use in routes
  app.locals.memcached = memcached;

  console.log("Memcached initialized successfully");
}

// Call the function to create the table and connect to RDS, then start the server
async function startServer() {
  try {
    await createVideoTable();
    await createRDSConnection(); // Ensure successful RDS connection
    await creatmemcached();

    app.use((req, res, next) => {
      console.log(`Incoming request: ${req.method} ${req.path}`);
      next(); // Continue to subsequent routes
    });

    // Import routes
    const authRouter = require("./routes/auth")(connection);
    const videosRouter = require("./routes/videos");
    const adminRouter = require("./routes/admin");

    // Use routes
    app.use("/auth", authRouter);
    app.use("/videos", videosRouter);
    app.use("/admin", adminRouter);

    app.listen(port, () => {
      console.log(`Server listening on port ${port}.`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
}

// Start the server only after the table and RDS connection are set up
startServer();