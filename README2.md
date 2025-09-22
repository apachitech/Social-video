# Vidora - Social Video & Live-Streaming Platform

This repository contains the frontend prototype for Vidora, a modern social video platform featuring a rich, fully-featured Admin Dashboard for comprehensive application management.

## Core Features Implemented

- **Modern UI/UX**: A sleek, mobile-first design for the main app and a professional, data-driven interface for the admin panel.
- **Video Feed**: A vertical, swipeable feed of short-form videos with interactions like likes, comments, and shares.
- **Live Streaming**: A discovery view for active streams, a viewer interface with real-time chat and virtual gifts, and a broadcaster mode.
- **Admin Dashboard**: A secure panel for administrators with:
  - **Dashboard Overview**: Real-time analytics, revenue charts, and key metrics.
  - **User Management**: A searchable, paginated table to manage all users with status updates, verification, and direct messaging.
  - **Content Management**: A table to view, approve, or remove user-uploaded videos.
  - **Financials & Payouts**: A system for reviewing and processing creator payout requests.
- **Role-Based Access Control (RBAC)**: The "Admin Panel" is only accessible to users with an `admin` role.

---

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Prisma
- **Database**: MongoDB (via MongoDB Atlas)
- **Live Streaming**: LiveKit

---

# Road to Production: From Prototype to Profit

This guide outlines the critical steps to evolve the Vidora prototype into a production-ready, monetizable application. The current setup uses mock data and free-tier services. The following steps will transition it to a scalable and secure architecture.

## 1. Backend & Database Integration (Activating Your Data)

Your data's destination is a production-grade database. The current backend is structured with Prisma but uses in-memory mock data. The first step is to connect it to your live MongoDB Atlas database.

**Where the data goes:** All application data (user profiles, video metadata, comments, transactions, wallet balances) must be stored in your MongoDB Atlas database, managed through the Prisma client.

#### Action Steps:

1.  **Connect Prisma to MongoDB:** Ensure your `DATABASE_URL` in the Render environment variables is correctly pointing to your MongoDB Atlas cluster.

2.  **Sync Your Schema:** Run the following Prisma command locally to push your schema to the database. For a production environment, it is recommended to use migrations.
    ```bash
    # Push the schema directly (good for initial setup)
    npx prisma db push

    # Or, for production workflows, use migrations
    npx prisma migrate deploy
    ```

3.  **Replace Mock Controllers with Prisma Queries:** Every file in `backend/src/controllers/` needs to be updated to use the Prisma client for database operations instead of the mock data from `backend/src/data.ts`.

    **Example: Updating `video.controller.ts`**
    ```typescript
    // BEFORE (using mock data)
    import { mockVideos } from '../data';
    export const getFeed = async (req, res) => {
      res.status(200).json({ videos: mockVideos });
    };

    // AFTER (using Prisma)
    import { PrismaClient } from '@prisma/client';
    const prisma = new PrismaClient();
    export const getFeed = async (req, res) => {
      try {
        const videos = await prisma.video.findMany({
          where: { status: 'approved' },
          orderBy: { uploadDate: 'desc' },
          include: { user: true }, // Include author details
        });
        res.status(200).json({ videos });
      } catch (error) {
        res.status(500).json({ msg: 'Error fetching feed.' });
      }
    };
    ```
    This pattern must be applied to all controllers for users, videos, comments, etc.

4.  **Secure Database Access:** In MongoDB Atlas, update **Network Access** to replace "Allow Access from Anywhere" (`0.0.0.0/0`) with the static outbound IP addresses of your Render backend service.

## 2. Secure Authentication (Protecting Users)

The current authentication is a placeholder. You must implement a secure JSON Web Token (JWT) system.

#### Action Steps:

1.  **Implement Password Hashing:** In `auth.controller.ts`, use `bcryptjs` to hash user passwords before saving them to the database during registration.
    ```typescript
    import bcrypt from 'bcryptjs';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // ... save user with hashedPassword
    ```

2.  **Generate JWTs:** On successful registration or login, generate a JWT using the `jsonwebtoken` library and your `JWT_SECRET` environment variable.

3.  **Create Auth Middleware:** Implement an authentication middleware that verifies the JWT from the `Authorization` header on protected API routes. The project already has placeholders for this.
    ```typescript
    // Example: backend/src/middleware/auth.ts
    import jwt from 'jsonwebtoken';

    export const authMiddleware = (req, res, next) => {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // Add user payload to the request
        next();
      } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
      }
    };
    ```
4.  **Apply Middleware:** Uncomment and apply the `authMiddleware` in the route files (e.g., `video.routes.ts`, `user.routes.ts`).

## 3. Scalable File Storage (Handling Uploads)

Video and image files cannot be stored on the backend server's filesystem, as it is ephemeral and not scalable.

**Where the data goes:** All user-generated media (videos, thumbnails, avatars, chat images) must be uploaded to a dedicated cloud storage service like **AWS S3**, **Google Cloud Storage**, or **Cloudinary**.

#### Action Steps:

1.  **Set Up Cloud Storage:** Create a bucket in your chosen service (e.g., AWS S3). Configure it for public read access.

2.  **Update Upload Logic:** In `video.controller.ts`, modify the `uploadVideo` function.
    -   Use a middleware like `multer` to handle the `multipart/form-data` from the frontend.
    -   Instead of saving locally, use the cloud provider's SDK (e.g., `aws-sdk`) to stream the file directly to your storage bucket.
    -   After a successful upload, the SDK will return a public URL for the file.
    -   Save this **URL** (not the file itself) in your `Video` model in the database.

3.  **Secure with Environment Variables:** Add your cloud storage credentials (e.g., `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`) to your Render environment variables.

## 4. Real-Time Live Streaming (Securing Streams)

LiveKit streams must be secured. Currently, the frontend connects directly. In production, the backend must authorize users by issuing tokens.

#### Action Steps:

1.  **Create a Token Endpoint:** Add a new route on your backend, e.g., `POST /api/v1/livestreams/token`.
2.  **Generate LiveKit Tokens:** In the controller for this new route, use the **LiveKit Server SDK** (`livekit-server-sdk`) along with your `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` to generate a time-limited join token. The token should contain the user's ID and the room name they are allowed to join.
3.  **Update Frontend:** Before a user starts or joins a stream, the frontend must first call this backend endpoint to fetch a token. The token is then used to connect to your LiveKit instance.

## 5. Monetization (Making Money)

To process payments for coins and handle creator payouts, you need to integrate a payment provider. **Stripe** is a powerful and common choice.

#### Action Steps for Coin Purchases:

1.  **Backend Payment Intent Route:** Create a route like `POST /api/v1/payments/create-payment-intent`. This route will use the Stripe Node.js SDK to:
    -   Create a `PaymentIntent` with the amount and currency for the selected coin pack.
    -   Return the `client_secret` from the PaymentIntent to the frontend.

2.  **Frontend Checkout:** In `PurchaseCoinsView.tsx`, use `@stripe/react-stripe-js` to create a secure checkout form. Use the `client_secret` to confirm the payment with Stripe. This ensures no sensitive card details ever touch your server.

3.  **Backend Webhook for Fulfillment:**
    -   **This is the most critical step.** Create a webhook endpoint on your backend (e.g., `/api/v1/webhooks/stripe`).
    -   Configure this webhook URL in your Stripe dashboard to listen for the `payment_intent.succeeded` event.
    -   When Stripe sends an event to this endpoint, verify its authenticity and **only then** update the user's coin balance in your database. This prevents fraud and ensures users only get coins for completed payments.

#### Action Steps for Creator Payouts:

1.  **Onboarding with Stripe Connect / PayPal Payouts:** Creator payouts involve legal and financial compliance (KYC - Know Your Customer). Use a dedicated service like **Stripe Connect** to handle creator onboarding, identity verification, and fund transfers.
2.  **Admin Panel Integration:** In the `FinancialsView` of the admin panel, when an admin clicks "Approve," your backend should make an API call to the chosen payout service to initiate the transfer to the creator's connected account.

---

## Production Environment Variables Summary

You will need to add the following secrets to your hosting providers.

#### Backend (Render)
```
# Database
DATABASE_URL="mongodb+srv://..."

# Security
JWT_SECRET="your_super_long_random_secret_string"
CORS_ORIGIN="https://your-app-name.vercel.app"

# LiveKit
LIVEKIT_API_KEY="key_from_livekit_cloud"
LIVEKIT_API_SECRET="secret_from_livekit_cloud"

# File Storage (Example for AWS S3)
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
S3_BUCKET_NAME="your_s3_bucket_name"
AWS_REGION="your_s3_bucket_region"

# Monetization (Stripe)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

#### Frontend (Vercel)
```
# Note: All frontend variables must be prefixed with VITE_
VITE_API_BASE_URL="https://your_backend_url.onrender.com/api/v1"
VITE_LIVEKIT_HOST_URL="wss://your-project.livekit.cloud"
VITE_STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

By following this roadmap, you can systematically transition the Vidora prototype from a demonstration into a robust, scalable, and monetizable social video platform.