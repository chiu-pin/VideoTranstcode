Assignment 1 - Web Server - Response to Criteria
================================================

Instructions
------------------------------------------------
- Keep this file named A2_response_to_criteria.md, do not change the name
- Upload this file along with your code in the root directory of your project
- Upload this file in the current Markdown format (.md extension)
- Do not delete or rearrange sections.  If you did not attempt a criterion, leave it blank
- Text inside [ ] like [eg. S3 ] are examples and should be removed


Overview
------------------------------------------------

- **Name:**PinChieh CHIU
- **Student number:**N 11532360
- **Partner name (if applicable):**
- **Application name:**PCU video website
- **Two line description:** This application allows users to upload video files, select a target format, and transcode videos using a web-based interface. The transcoded videos can then be downloaded for local use.

- **EC2 instance name or ID:** i-0bc8f15e5529dad2a(n11532360)

Core criteria
------------------------------------------------

### Core - First data persistence service

- **AWS service name:**  S3
- **What data is being stored?:**  video files
- **Why is this service suited to this data?:**large files are best suited to blob storage due to size restrictions on other services
- **Why is are the other services used not suitable for this data?:**  Services like DynamoDB and RDS are designed for structured data and have size limitations, making them less efficient for storing large unstructured files such as videos.
- **Bucket/instance/table name:**n11532360-test 
- **Video timestamp:** 0:38
- **Relevant files:** assignment\apitest\routes\videos.js
    -

### Core - Second data persistence service

- **AWS service name:**  DynamoDB
- **What data is being stored?:** video meta-data 
- **Why is this service suited to this data?:** DynamoDB is well-suited for handling large volumes of small, structured data with low-latency performance, ideal for metadata storage.
- **Why is are the other services used not suitable for this data?:** S3 is designed for storing large unstructured data and doesn't provide the indexing or querying capabilities needed for structured metadata. RDS would be overkill for the lightweight, non-relational data needs.
- **Bucket/instance/table name:** N11532360-Videos
- **Video timestamp:** 0:47
- **Relevant files:** assignment\apitest\routes\videos.js
    -

### Third data service

- **AWS service name:**  RDS
- **What data is being stored?:** user data
- **Why is this service suited to this data?:** RDS provides a robust, scalable solution for structured data storage, ideal for user information where relationships, queries, and transactions are needed.
- **Why is are the other services used not suitable for this data?:** S3 lacks the capabilities for relational database operations, and DynamoDB’s NoSQL structure isn’t optimal for complex queries and transactions that user data management requires.
- **Bucket/instance/table name:** n11532360-test
- **Video timestamp:** 3:33
- **Relevant files:** assignment\apitest\routes\auth.js
    -

### S3 Pre-signed URLs

- **S3 Bucket names:** n11532360-test 
- **Video timestamp:** 1:31
- **Relevant files:** assignment\apitest\routes\videos.js
    -

### In-memory cache

- **ElastiCache instance name:** None
- **What data is being cached?:** 
- **Why is this data likely to be accessed frequently?:** 
- **Video timestamp:**
- **Relevant files:**
    -

### Core - Statelessness

- **What data is stored within your application that is not stored in cloud data services?:**  intermediate video files that have been transcoded and stored in S3
- **Why is this data not considered persistent state?:** Intermediate files can be recreated from the source if lost, and the final file is stored in cloud storage, so persistence is not required for the intermediate versions.
- **How does your application ensure data consistency if the app suddenly stops?:** user can restart the website by themselves
- **Relevant files:** assignment\apitest\routes\videos.js
    -

### Graceful handling of persistent connections

- **Type of persistent connection and use:** None
- **Method for handling lost connections:**
- **Relevant files:**
    -


### Core - Authentication with Cognito

- **User pool name:** n11532360-cognito-prac
- **How are authentication tokens handled by the client?:** Response to login request 
- **Video timestamp:** 2:18
- **Relevant files:** \assignment\apitest\routes\auth.js
    -

### Cognito multi-factor authentication

- **What factors are used for authentication:** None
- **Video timestamp:**
- **Relevant files:**
    -

### Cognito federated identities

- **Identity providers used:** None
- **Video timestamp:**
- **Relevant files:**
    -

### Cognito groups

- **How are groups used to set permissions?:** 'admin' users can delete other user's video
- **Video timestamp:** 4:20
- **Relevant files:** assignment\apitest\routes\admin.js
    -

### Core - DNS with Route53

- **Subdomain**:  n11532360pc.cab432.com
- **Video timestamp:** 1.25


### Custom security groups

- **Security group names:** sg-0e60130f865ff294d - n11532360-www-dev
- **Services/instances using security groups:** EC2  
- **Video timestamp:** 5:49
- **Relevant files:** in AWS
    -

### Parameter store

- **Parameter names:** /n11532360/demo_parameter
- **Video timestamp:** 5:24
- **Relevant files:** assignment\apitest\index.js
    -

### Secrets manager

- **Secrets names:** rds!db-da15b437-e7d6-464e-9ced-cf8580ecbd9f
- **Video timestamp:** 4:12
- **Relevant files:** rds!db-da15b437-e7d6-464e-9ced-cf8580ecbd9f
    -

### Infrastructure as code

- **Technology used:** None
- **Services deployed:**
- **Video timestamp:**
- **Relevant files:**
    -

### Other (with prior approval only)

- **Description:** None
- **Video timestamp:**
- **Relevant files:**
    -

### Other (with prior permission only)

- **Description:** None
- **Video timestamp:**
- **Relevant files:**
    -