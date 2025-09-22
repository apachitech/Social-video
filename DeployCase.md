# Deployment Case: Deploying Vidora with Vercel & Render

This guide provides a practical, step-by-step process for deploying the Vidora application using a recommended "best-in-class" stack of free-tier services. This combination offers an excellent developer experience, high performance, and scalability without any initial cost.

### Our Chosen Stack

*   **Frontend:** **Vercel** – For its fast, seamless deployments from GitHub, global CDN, and automatic SSL.
*   **Backend:** **Render** – For its simple, modern Heroku-like experience and free web service tier.
*   **Database:** **MongoDB Atlas** – The official, fully managed service for our MongoDB database.
*   **File Storage:** **Cloudinary** – A powerful, all-in-one media platform perfect for handling video uploads, transformations, and delivery.

---

## Step-by-Step Deployment Guide

### Prerequisites

1.  **Create Free Accounts:** Before you start, sign up for an account on each of the following platforms:
    *   [GitHub](https://github.com/)
    *   [Vercel](https://vercel.com/)
    *   [Render](https://render.com/)
    *   [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
    *   [Cloudinary](https://cloudinary.com/)
2.  **Push to GitHub:** Ensure your entire project, with the `frontend` and `backend` folders, is pushed to a single GitHub repository.

### Step 1: Set Up the Database (MongoDB Atlas)

1.  Log in to MongoDB Atlas and create a new project.
2.  **Create a Cluster:** Choose the **M0 (Free)** shared cluster, select a cloud provider (like GCP or AWS), and pick a region.
3.  **Configure Network Access:** Navigate to the **"Network Access"** tab. Click **"Add IP Address"** and select **"Allow Access from Anywhere"** (`0.0.0.0/0`).
    *   *Note: For a real production app, you would restrict this to your backend's specific IP address for better security.*
4.  **Create a Database User:** Navigate to the **"Database Access"** tab. Create a new user with a secure password and save the password somewhere safe.
5.  **Get the Connection String (URI):**
    *   Go to your cluster's **"Overview"** and click **"Connect"**.
    *   Choose **"Drivers"** as the connection method.
    *   Copy the **Connection String**.
    *   Replace `<password>` in the string with the password for the database user you just created. Keep this URI handy.

### Step 2: Set Up File Storage (Cloudinary)

1.  Log in to your Cloudinary account.
2.  Your **Dashboard** will immediately display your **Cloud Name**, **API Key**, and **API Secret**.
3.  Copy these three values. You will need them for your backend's environment variables.

### Step 3: Deploy the Backend on Render

1.  Log in to your Render dashboard.
2.  Click **"New +"** and select **"Web Service"**.
3.  Connect the GitHub repository containing your Vidora project.
4.  Configure the service with the following settings:
    *   **Name:** `vidora-backend` (or your preferred name)
    *   **Root Directory:** `backend` (This is crucial; it tells Render where to find the backend code.)
    *   **Build Command:** `npm install && npm run build`
    *   **Start Command:** `npm start`
    *   **Instance Type:** `Free`
5.  Scroll down to **"Environment"** and add your secret variables:
    *   `DATABASE_URL`: The full connection string from MongoDB Atlas.
    *   `JWT_SECRET`: A long, random string you create (e.g., from a password generator).
    *   `CLOUDINARY_CLOUD_NAME`: From your Cloudinary dashboard.
    *   `CLOUDINARY_API_KEY`: From your Cloudinary dashboard.
    *   `CLOUDINARY_API_SECRET`: From your Cloudinary dashboard.
6.  Click **"Create Web Service"**. Render will begin building and deploying your backend.
7.  Once the deployment is complete, Render will provide you with a public URL (e.g., `https://vidora-backend.onrender.com`). **Copy this URL.**

### Step 4: Deploy the Frontend on Vercel

1.  Log in to your Vercel dashboard.
2.  Click **"Add New... -> Project"**.
3.  Import your Vidora GitHub repository.
4.  Vercel will automatically detect that it's a Vite project. The default settings are typically correct.
5.  Expand the **"Environment Variables"** section and add the following:
    *   **Name:** `VITE_API_BASE_URL`
    *   **Value:** The backend URL you copied from Render, including the API path (e.g., `https://vidora-backend.onrender.com/api/v1`).
6.  Click **"Deploy"**. Vercel will build and deploy your frontend.
7.  Once complete, Vercel will provide you with your live frontend URL (e.g., `https://vidora.vercel.app`). **Copy this URL.**

### Step 5: Final Configuration (CORS)

Your frontend and backend are on different domains, so you must explicitly tell the backend to accept requests from the frontend.

1.  Go back to your backend service on **Render**.
2.  Navigate to the **"Environment"** tab.
3.  Add one final environment variable:
    *   **Name:** `CORS_ORIGIN`
    *   **Value:** Your live frontend URL from Vercel (e.g., `https://vidora.vercel.app`).
4.  Save the changes. Render will automatically redeploy your backend with the new setting.

---

### You're Live!

Your Vidora application is now fully deployed on a robust, scalable, and completely free stack. You can visit your Vercel URL to see the live application.