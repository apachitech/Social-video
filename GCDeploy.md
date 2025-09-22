# Production Deployment Guide for Vidora on Google Cloud Platform (GCP)

This guide provides a comprehensive, step-by-step walkthrough for deploying the Vidora application from a local prototype to a scalable, secure, and production-ready state on Google Cloud Platform (GCP).

---

### **Overview: The Production Architecture on GCP**

We will map the application's components to specific, recommended GCP services for a robust and manageable deployment:

*   **Frontend (React):** Deployed on **Firebase Hosting**, which provides a global CDN, free SSL, and simple, fast deployments.
*   **Backend (Node.js/Express):** Deployed as a container on **Cloud Run**, a fully managed, serverless platform that automatically scales with traffic (even to zero).
*   **Database (MongoDB):** We'll use **MongoDB Atlas deployed on Google Cloud** for a fully managed, scalable database experience, keeping it within the GCP ecosystem.
*   **File Storage:** Videos, avatars, and other user-generated content will be stored in **Google Cloud Storage**, a highly durable and cost-effective object storage solution.
*   **Security:** We'll manage all our secrets (API keys, database URLs) securely using **Secret Manager**.

---

### **Step 1: GCP Project & CLI Setup (The Foundation)**

First, let's set up your Google Cloud workspace.

1.  **Create a GCP Project:** Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a new project (e.g., `vidora-production`). Note your **Project ID**.
2.  **Enable Billing:** Ensure billing is enabled for your project. Many services have a generous free tier, but billing is required to use them.
3.  **Install the `gcloud` CLI:** Follow the official instructions to [install the Google Cloud CLI](https://cloud.google.com/sdk/docs/install) on your local machine. This is essential for managing your resources from the command line.
4.  **Configure the CLI:** Authenticate and set your newly created project as the default.
    ```bash
    # Log in to your Google Account
    gcloud auth login

    # Set your project ID
    gcloud config set project [YOUR_PROJECT_ID]
    ```

### **Step 2: Production Database (MongoDB Atlas on GCP)**

A managed database service is strongly recommended for production to handle backups, scaling, and security automatically.

1.  **Create an Atlas Cluster:** Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a new cluster.
2.  **Select Google Cloud:** When prompted for a cloud provider, **choose Google Cloud** and select a region close to your primary user base (e.g., `us-central1`).
3.  **Configure Security (VPC Peering):** For production, a secure, private connection between your backend and database is crucial.
    *   In the Atlas console, navigate to **Network Access** > **VPC Peering**.
    *   Follow the instructions to set up a peering connection with your GCP project's default VPC network. This ensures your database is not exposed to the public internet. For simpler setups or testing, you can temporarily allow access from anywhere (`0.0.0.0/0`), but this is **not recommended for production**.
4.  **Create a Database User:** In **Database Access**, create a user with a strong, auto-generated password.
5.  **Get Your Connection String:** Go to your cluster's "Connect" tab, select "Drivers," and copy the connection string URI. Replace `<password>` with the password you just created. **Save this string for later.**

### **Step 3: Scalable File Storage (Google Cloud Storage)**

1.  **Enable the API:** In the GCP Console, search for and enable the "Cloud Storage API".
2.  **Create a Bucket:**
    *   Navigate to **Cloud Storage** in the console.
    *   Click **"Create Bucket"**. Give it a globally unique name (e.g., `vidora-prod-media`).
    *   Choose a region and the "Standard" storage class.
    *   For **Access control**, choose "Fine-grained".
3.  **Make Files Publicly Readable:** To allow users to view uploaded videos, the objects in the bucket need to be public.
    *   After creating the bucket, go to the **"Permissions"** tab.
    *   Click **"Grant Access"**. For "New principals", add `allUsers`. For "Role", select `Storage Object Viewer`.

### **Step 4: Backend Deployment (Cloud Run)**

We will containerize the backend and deploy it to Cloud Run for serverless scaling.

1.  **Create a `Dockerfile`:** In your `backend/` directory, create a file named `Dockerfile`. This tells Google Cloud how to build your application.

    ```dockerfile
    # Use an official Node.js runtime as a parent image
    FROM node:18-slim

    # Set the working directory in the container
    WORKDIR /usr/src/app

    # Copy package.json, package-lock.json, and prisma schema
    COPY package*.json ./
    COPY prisma ./prisma/

    # Install app dependencies
    RUN npm install --production

    # Run Prisma generate to create the client
    RUN npx prisma generate

    # Copy the rest of the built application code
    # Assumes you have already run `npm run build` locally or in a CI/CD step
    COPY dist ./dist/

    # Your app binds to a port, expose it
    EXPOSE 8080

    # Define the command to run your app
    CMD [ "node", "dist/server.js" ]
    ```

2.  **Store Your Secrets:** Never hard-code secrets.
    *   In the GCP Console, go to **Secret Manager**.
    *   Create secrets for each of your environment variables: `DATABASE_URL`, `JWT_SECRET`, etc.

3.  **Build and Push the Container Image:**
    *   Enable the **Artifact Registry API** in the GCP Console.
    *   Create a Docker repository to store your image:
        ```bash
        gcloud artifacts repositories create vidora-backend --repository-format=docker --location=us-central1
        ```
    *   Build and push your image (replace `[PROJECT_ID]`):
        ```bash
        # First, build your TypeScript code to Javascript
        npm run build --prefix backend

        # Build the container image
        docker build -t us-central1-docker.pkg.dev/[PROJECT_ID]/vidora-backend/api:latest ./backend

        # Configure Docker to authenticate with Artifact Registry
        gcloud auth configure-docker us-central1-docker.pkg.dev

        # Push the image to the registry
        docker push us-central1-docker.pkg.dev/[PROJECT_ID]/vidora-backend/api:latest
        ```

4.  **Deploy to Cloud Run:**
    *   Deploy the service using the `gcloud` command. This powerful command links the secrets and configures the service.
        ```bash
        gcloud run deploy vidora-api \
          --image=us-central1-docker.pkg.dev/[PROJECT_ID]/vidora-backend/api:latest \
          --platform=managed \
          --region=us-central1 \
          --allow-unauthenticated \
          --set-secrets="DATABASE_URL=[SECRET_NAME]:latest,JWT_SECRET=[SECRET_NAME]:latest" # Add other secrets
        ```
    *   After deployment, Cloud Run will give you a public URL for your API. **Copy this URL.**

### **Step 5: Frontend Deployment (Firebase Hosting)**

Firebase Hosting is the easiest and fastest way to deploy modern web apps.

1.  **Set up Firebase:**
    *   Go to the [Firebase Console](https://console.firebase.google.com/) and click "Add project", selecting your existing GCP project.
    *   On your local machine, install the Firebase CLI: `npm install -g firebase-tools`.
2.  **Initialize Firebase in Your Project:**
    *   Run `firebase login`.
    *   In the **root directory** of your project, run `firebase init hosting`.
    *   Follow the prompts:
        *   `Use an existing project` -> Select your `vidora-production` project.
        *   `What do you want to use as your public directory?` -> Enter `dist`.
        *   `Configure as a single-page app (rewrite all urls to /index.html)?` -> **Yes**.
        *   `Set up automatic builds and deploys with GitHub?` -> No (for now).
3.  **Configure API URL:** Create a file named `.env.production` in your project's root with your backend's URL:
    ```
    VITE_API_BASE_URL=https://your-cloud-run-api-url.a.run.app/api/v1
    ```
4.  **Build and Deploy:**
    ```bash
    # Build the production version of your React app
    npm run build

    # Deploy to Firebase Hosting
    firebase deploy --only hosting
    ```
    Firebase will give you a URL for your live frontend (e.g., `vidora-production.web.app`).

### **Step 6: Final Configuration**

1.  **Update CORS:** Go back to your **Cloud Run** service in the GCP Console. In the "Variables & Secrets" tab, add an environment variable `CORS_ORIGIN` and set its value to your Firebase Hosting URL (`https://vidora-production.web.app`). This will redeploy your backend service with the correct cross-origin policy.
2.  **Custom Domain:** In the Firebase Hosting console, you can easily add a custom domain. Firebase will guide you through the process of updating your DNS records.

You now have a production-ready, scalable version of Vidora running entirely on Google Cloud!
