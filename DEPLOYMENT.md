# Deployment Guide (AWS Free Tier)

This guide explains how to deploy the Leave Management System using AWS S3 for the frontend and AWS EC2 for the backend.

## 1. Backend Deployment (AWS EC2)

### Prerequisites:
- An AWS account.
- An EC2 instance (t2.micro is recommended for Free Tier) running Ubuntu.
- Docker and Docker Compose installed on the EC2 instance.
- MongoDB Atlas account (Free Tier) to host the database (recommended over running Mongo on EC2).

### Steps:
1. **Connect to your EC2 instance** via SSH.
2. **Clone the repository**:
   ```bash
   git clone https://github.com/Ashitha0409/Leave-Management-System.git
   cd Leave-Management-System/backend
   ```
3. **Create a `.env` file** in the `backend` folder:
   ```bash
   nano .env
   ```
   Add your production variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secret_key
   ```
4. **Build and run the Backend** using Docker:
   ```bash
   sudo docker build -t leave-backend .
   sudo docker run -d -p 80:5000 --env-file .env leave-backend
   ```
   *(Mapping to port 80 allows accessing the API without specifying a port in the URL)*.

## 2. Frontend Deployment (AWS S3)

### Steps:
1. **Prepare the build**:
   Modify your local `frontend/.env` file (or create one) to point to your EC2 Public IP/Domain:
   ```env
   VITE_API_URL=http://your-ec2-ip-or-domain/api
   ```
2. **Build the project**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
   This will create a `dist` folder.
3. **AWS S3 Setup**:
   - Create an S3 bucket (e.g., `leave-management-frontend`).
   - Enable **Static Website Hosting** in the bucket settings.
   - Set the index document to `index.html`.
4. **Permissions**:
   - Uncheck "Block all public access" (only for the public website bucket).
   - Add a Bucket Policy to allow public read access to objects:
     ```json
     {
         "Version": "2012-10-17",
         "Statement": [
             {
                 "Sid": "PublicReadGetObject",
                 "Effect": "Allow",
                 "Principal": "*",
                 "Action": "s3:GetObject",
                 "Resource": "arn:aws:s3:::your-bucket-name/*"
             }
         ]
     }
     ```
5. **Upload**:
   - Upload all files from the `frontend/dist` folder into the S3 bucket.
6. **Access**:
   - Your website will be live at the S3 Website Endpoint (e.g., `http://your-bucket-name.s3-website-us-east-1.amazonaws.com`).

---

## Important Security Notes:
- **CORS**: Ensure the backend allows requests from your S3 bucket's domain.
- **Secrets**: Never commit your real `.env` files to GitHub.
- **Port 80**: On AWS, make sure to open Port 80 in your EC2 Security Group.
