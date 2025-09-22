# BuzzCast - Social Video & Live-Streaming Platform

This repository contains the frontend prototype for BuzzCast, a modern social video platform featuring a rich, fully-featured Admin Dashboard for comprehensive application management.

## Core Features Implemented

- **Modern UI/UX**: A sleek, mobile-first design for the main app and a professional, data-driven interface for the admin panel.
- **Admin Dashboard**: A separate, secure panel for administrators.
  - **Dashboard Overview**: Real-time analytics, revenue charts, and key metrics.
  - **User Management**: A searchable, paginated table to view, filter, and manage all users with status indicators and quick actions.
  - **Content Management**: A table to view, approve, or remove user-uploaded videos.
- **Role-Based Access Control (RBAC)**: The "Admin Panel" is only accessible to users with an `admin` role.
- **Component Placeholders**: Scalable structure with placeholder pages for Financials, Moderation, Gift Management, and Settings, making future expansion straightforward.

---

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend (Structure)**: Node.js, Express, Prisma (though the current version uses a mock API)
- **Database**: MongoDB (via MongoDB Atlas)
- **Live Streaming**: LiveKit

---

## Deployment Guide

This guide will walk you through deploying the BuzzCast application to the cloud using free-tier services.

### Prerequisites

Before you begin, make sure you have accounts for the following services:
- [GitHub](https://github.com/)
- [Vercel](https://vercel.com/) (for Frontend)
- [Render](https://render.com/) (for Backend)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (for Database)
- [LiveKit Cloud](https://cloud.livekit.io/) (for Live Streaming)

### Step 1: Push Code to GitHub

1.  **Create a new repository** on your GitHub account.
2.  Clone this project's code or fork it to your account.
3.  Connect your local repository to the new GitHub repository and push the code:
    ```bash
    git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
    git branch -M main
    git push -u origin main
    ```

### Step 2: Set Up the Database on MongoDB Atlas

1.  Log in to [MongoDB Atlas](https://cloud.mongodb.com/v2/6290075841975e591783e74c#/clusters) and create a new project.
2.  **Create a new cluster**: Choose the **M0 (Free)** shared cluster. Select a cloud provider and region.
3.  **Configure Security**:
    -   Under **Network Access**, click **"Add IP Address"** and select **"Allow Access from Anywhere"** (`0.0.0.0/0`). This is for simplicity; for production, you would restrict this to your backend service's IP.
    -   Under **Database Access**, create a new database user. Remember the username and password.
4.  **Get Connection String**:
    -   Go to your cluster's **"Overview"** tab and click **"Connect"**.
    -   Choose **"Drivers"** and copy the **Connection String (URI)**.
    -   Replace `<password>` in the string with the password for the database user you just created.
    -   Keep this URI safe; it will be your `DATABASE_URL` environment variable.

### Step 3: Set Up Live Streaming with LiveKit

1.  Log in to [LiveKit Cloud](https://cloud.livekit.io/) and create a new project.
2.  Once the project is created, navigate to **Settings**.
3.  You will find your **API Key**, **API Secret**, and **Host URL** (e.g., `wss://your-project.livekit.cloud`).
4.  Copy these three values. You will need them for your environment variables.

### Step 4: Deploy the Backend on Render

1.  Log in to [Render](https://dashboard.render.com/) and go to your dashboard.
2.  Click **"New +"** and select **"Web Service"**.
3.  Connect your GitHub repository.
4.  Configure the service:
    -   **Name**: `buzzcast-backend` (or your choice)
    -   **Root Directory**: `backend`
    -   **Build Command**: `npm install && npm run build`
    -   **Start Command**: `npm start`
    -   **Instance Type**: Free
5.  **Add Environment Variables**:
    -   `DATABASE_URL`: The connection string from MongoDB Atlas.
    -   `JWT_SECRET`: A long, random, and secure string for signing tokens (e.g., generate one with `openssl rand -hex 32`).
    -   `LIVEKIT_API_KEY`: Your API key from LiveKit.
    -   `LIVEKIT_API_SECRET`: Your API secret from LiveKit.
    -   `CORS_ORIGIN`: Leave this blank for now. We'll add it after deploying the frontend.
6.  Click **"Create Web Service"**. Render will build and deploy your backend.
7.  Once deployed, copy the service URL (e.g., `https://buzzcast-backend.onrender.com`).

### Step 5: Deploy the Frontend on Vercel

1.  Log in to [Vercel](https://vercel.com/dashboard) and click **"Add New... -> Project"**.
2.  Import your GitHub repository.
3.  Vercel should automatically detect the project as a Vite app. The default build settings are usually correct.
4.  **Configure Environment Variables**:
    -   `VITE_API_BASE_URL`: The backend URL you copied from Render.
    -   `VITE_LIVEKIT_HOST_URL`: The Host URL you copied from LiveKit.
5.  Click **"Deploy"**.
6.  After deployment, Vercel will provide you with a URL for your live frontend. Copy this URL.

### Step 6: Final Configuration

1.  Go back to your backend service on **Render**.
2.  Navigate to the **"Environment"** tab.
3.  Add or update the `CORS_ORIGIN` environment variable with the frontend URL from Vercel (e.g., `https://your-app-name.vercel.app`).
4.  Save the changes. This will trigger a new deployment of your backend with the updated settings.

Your application is now fully deployed!

### Step 7: Accessing the Admin Panel

1.  Open your deployed Vercel frontend URL in your browser.
2.  The application uses mocked authentication, so you can log in with any credentials.
3.  The default user (`@react_dev`) is configured with the `admin` role.
4.  After logging in, navigate to the **Profile** page using the bottom navigation bar.
5.  You will see an **"Admin Panel"** button. Click it to access the full administrative dashboard.