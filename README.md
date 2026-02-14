# Simple Leave Management System

A full-stack web application for managing employee leave requests. Built with React, Node.js, Express, and MongoDB.

## Features

### Employee
- Sign up and Log in
- Apply for leave (Casual, Sick, Annual, etc.)
- View leave history and status
- Delete pending leave requests

### Employer
- Sign up and Log in
- View all leave requests
- Filter requests by status (Pending, Approved, Rejected)
- Approve or Reject leave requests

## Tech Stack

- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB Atlas account (or local MongoDB)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the backend directory with the following content:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   NODE_ENV=development
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Leaves
- `POST /api/leaves` - Create leave request (Employee)
- `GET /api/leaves/my-leaves` - Get employee's leaves
- `GET /api/leaves` - Get all leaves (Employer)
- `PUT /api/leaves/:id` - Update leave status (Employer)
- `DELETE /api/leaves/:id` - Delete leave request (Employee)

## deployment

### Frontend (AWS S3)
1. Build the frontend: `npm run build`
2. Upload the `dist` folder contents to an S3 bucket configured for static website hosting.

### Backend (AWS EC2)
1. Launch an EC2 instance.
2. Install Docker.
3. Build the Docker image: `docker build -t leave-api .`
4. Run the container: `docker run -p 5000:5000 -d leave-api`
