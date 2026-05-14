# AgriSmart - Comprehensive Mobile Farm Management System

## Overview
AgriSmart is a complete agricultural management mobile application built to digitize and streamline farm operations. From land and soil tracking to inventory, labor, task, and financial management, AgriSmart provides a centralized hub for modern farmers to optimize their agricultural workflows.

## Author
- Developed by: **Anushika Kananayakkara**

## Project Links & Deployment Details
- **GitHub Repository:** https://github.com/Anushika123456789/agrismart-mobile-app
- **Backend URL:** (If deployed, add your backend URL here)

## Technology Stack

### Frontend (Mobile App)
- **Framework:** React Native managed by Expo
- **Navigation:** React Navigation (Stack & Bottom Tabs)
- **Networking:** Axios for asynchronous HTTP requests
- **Maps & Geolocation:** `react-native-maps` and `expo-location` for precise land plot GPS mapping
- **Media & File System:** `expo-image-picker` for profile photo uploads and `expo-file-system`
- **Form Handling:** `react-hook-form`

### Backend (RESTful API)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB configured with Mongoose ODM
- **Security & Authentication:** JSON Web Tokens (JWT) and `bcryptjs`
- **Middleware:** `cors` and `dotenv`

## Core Features

- Manage farms and land plots with rich location and soil data
- Track inputs like seeds, fertilizers, pesticides, and inventory stock
- Register machinery and maintenance records
- Create and manage farming tasks, assign labor, and track progress
- Log revenue and expenses with transaction categories and land-level financial data
- Maintain laborer profiles and payroll-related information

## Installation & Setup Guide

### Prerequisites
- Node.js (v16+)
- npm
- Expo CLI installed locally via `npm install -g expo-cli`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npm start
   ```
4. Scan the QR code with Expo Go or open the app in a simulator.

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### Local Testing
- If running the backend locally, update the API base URL in `frontend/src/services/api.js` to your local backend address.

---
This repository contains individual work by **Anushika Kananayakkara**.