# PCU Video Website

This cloud-based web application allows users to upload video files, transcode them into different formats, and download the converted versions. It integrates various AWS services such as S3, DynamoDB, RDS, Cognito, and Route53 for a fully serverless and secure experience.

## Table of Contents

- [Purpose](#purpose)
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Dependencies](#dependencies)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [Reporting Issues](#reporting-issues)
- [License](#license)

## Purpose

The purpose of this project is to demonstrate a scalable, secure cloud-based video management system using AWS services. Users can:

- Upload raw video files
- Transcode them into selectable formats
- View and download converted results
- Authenticate securely via AWS Cognito
- Store metadata and user info across DynamoDB and RDS

## Installation

1. Install dependencies:

   ```bash
   cd assignment/apitest
   npm install
   ```

2. Configure environment variables:

   - AWS access credentials
   - Cognito pool IDs
   - RDS connection strings

3. Start the application:
   ```bash
   npm run dev
   ```

## Usage

1. Register or log in using the web interface.
2. Upload a video file.
3. Select the target format (e.g., MP4, AVI).
4. View job status and download the transcoded file once completed.
5. Admin users can manage all uploaded content.

## Features

- User authentication with AWS Cognito
- Upload and download videos using Amazon S3
- Transcode videos into different formats
- Store metadata with DynamoDB
- Manage user info and permissions with RDS
- Use custom domain via Route53
- Secrets managed with AWS Parameter Store and Secrets Manager

## Dependencies

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- AWS SDK packages:
  - @aws-sdk/client-s3
  - @aws-sdk/client-dynamodb
  - @aws-sdk/client-rds
  - amazon-cognito-identity-js

## Architecture

```
[User] → [React Frontend] → [Node.js Server (Express)]
   ↓              ↓
[Cognito]      [Video Upload to S3]
                ↓
            [Metadata → DynamoDB]
            [User data → RDS]
                ↓
       [Processed Video → S3]
```

- **S3** for storing original and converted videos
- **DynamoDB** for video metadata
- **RDS** for user and login info
- **Cognito** for authentication and group-based access control
- **Route53** for DNS routing (n11532360pc.cab432.com)

## Contributing

Contributions are welcome. Please fork the repository and submit a pull request. For major changes, please open an issue to discuss your idea first.

## Reporting Issues

If you encounter bugs or deployment issues, please open a GitHub issue with detailed steps to reproduce.

## License

This project is for academic purposes as part of IFB104 Cloud Computing. It uses open source dependencies listed in [licenses.json](news/licenses.json).
